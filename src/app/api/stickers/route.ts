import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// Lấy danh sách sticker theo boardId
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url!);
  const boardId = searchParams.get("boardId");
  if (!boardId) {
    return NextResponse.json({ message: "Missing boardId" }, { status: 400 });
  }
  const stickers = await prisma.sticker.findMany({
    where: { boardId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(stickers);
}

// Tạo sticker mới
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
    // Đếm số lượng sticker cùng column
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
  });
  // Emit socket event nếu có io
  try {
    const io = globalThis.io || (globalThis as any).io || (typeof res !== 'undefined' && res.socket && res.socket.server && res.socket.server.io);
    if (io) {
      io.emit('sticker:created', sticker);
    }
  } catch (e) { /* ignore */ }
  return NextResponse.json(sticker);
} 