import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { broadcastToBoard } from "../../../../lib/ably";

// Lấy danh sách comment theo stickerId
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url!);
  const stickerId = searchParams.get("stickerId");
  if (!stickerId) {
    return NextResponse.json({ message: "Missing stickerId" }, { status: 400 });
  }
  const comments = await prisma.comment.findMany({
    where: { stickerId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(comments);
}

// Tạo comment mới
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { content, stickerId } = await req.json();
  if (!content || !stickerId) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  // Lấy sticker để biết boardId
  const sticker = await prisma.sticker.findUnique({
    where: { id: stickerId },
    select: { boardId: true }
  });
  
  if (!sticker) {
    return NextResponse.json({ message: "Sticker not found" }, { status: 404 });
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      stickerId,
      email: session.user.email,
    },
  });

      // Emit Ably event cho tất cả users trong board
    await broadcastToBoard(sticker.boardId, {
      type: 'comment:added',
      data: comment
    });

  return NextResponse.json(comment);
} 