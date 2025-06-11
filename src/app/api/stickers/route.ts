import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { broadcastToBoard } from "../../../../lib/ably";

// GET /api/stickers?boardId=xxx - Lấy danh sách stickers theo boardId
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const boardId = searchParams.get("boardId");
  
  if (!boardId) {
    return NextResponse.json({ message: "Missing or invalid boardId" }, { status: 400 });
  }

  // Kiểm tra xem user có quyền truy cập board này không
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      members: {
        select: {
          email: true,
        },
      },
    },
  });

  if (!board) {
    return NextResponse.json({ message: "Board not found" }, { status: 404 });
  }

  const isMember = board.members.some((member: { email: string }) => member.email === session.user?.email) || 
                   board.createdBy === session.user?.email;
  
  if (!isMember) {
    return NextResponse.json({ message: "Access denied" }, { status: 403 });
  }

  const stickers = await prisma.sticker.findMany({
    where: { boardId: boardId },
    include: {
      votes: true,
      comments: true,
    },
    orderBy: { createdAt: "asc" },
  });
  
  return NextResponse.json(stickers);
}

// POST /api/stickers - Tạo sticker mới
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  
  const { content, stickerType, x, y, boardId, position } = await req.json();
  
  if (!content || !stickerType || !boardId) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }
  
  let finalPosition = position;
  if (finalPosition === undefined) {
    finalPosition = await prisma.sticker.count({ where: { boardId, stickerType } });
  }
  
  const sticker = await prisma.sticker.create({
    data: {
      content,
      stickerType,
      x: x ?? 0,
      y: y ?? 0,
      boardId,
      createdBy: session.user.email,
      position: finalPosition,
    },
    include: {
      votes: true,
      comments: true,
    },
  });

  // Emit Ably event cho tất cả users trong board
  await broadcastToBoard(boardId, {
    type: "sticker:created",
    data: sticker
  });

  return NextResponse.json(sticker);
} 