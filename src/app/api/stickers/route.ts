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
  const { content, stickerType, x, y, boardId } = await req.json();
  if (!content || !stickerType || !boardId) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }
  const sticker = await prisma.sticker.create({
    data: {
      content,
      stickerType,
      x: x ?? 0,
      y: y ?? 0,
      boardId,
      createdBy: session.user.email,
    },
  });
  return NextResponse.json(sticker);
} 