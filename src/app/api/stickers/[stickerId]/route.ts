import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { broadcastToBoard } from "../../../../../lib/ably";

// PATCH /api/stickers/[stickerId] - Cập nhật sticker
export async function PATCH(
  req: Request,
  context: { params: Promise<{ stickerId: string }> }
) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { content, stickerType, x, y, position } = await req.json();
  
  const sticker = await prisma.sticker.findUnique({ 
    where: { id: params.stickerId } 
  });
  
  if (!sticker) {
    return NextResponse.json({ message: "Sticker not found" }, { status: 404 });
  }
  
  const board = await prisma.board.findUnique({ 
    where: { id: sticker.boardId } 
  });
  
  if (sticker.createdBy !== session.user.email && session.user.email !== board?.createdBy) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  
  const updated = await prisma.sticker.update({
    where: { id: params.stickerId },
    data: {
      ...(content !== undefined ? { content } : {}),
      ...(stickerType !== undefined ? { stickerType } : {}),
      ...(x !== undefined ? { x } : {}),
      ...(y !== undefined ? { y } : {}),
      ...(position !== undefined ? { position } : {}),
    },
    include: {
      votes: true,
      comments: {
        orderBy: { createdAt: "asc" }
      }
    }
  });

  // Emit Ably event cho tất cả users trong board
  await broadcastToBoard(sticker.boardId, {
    type: "sticker:updated",
    data: updated
  });

  return NextResponse.json(updated);
}

// DELETE /api/stickers/[stickerId] - Xóa sticker
export async function DELETE(
  req: Request,
  context: { params: Promise<{ stickerId: string }> }
) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  
  const sticker = await prisma.sticker.findUnique({ 
    where: { id: params.stickerId } 
  });
  
  if (!sticker) {
    return NextResponse.json({ message: "Sticker not found" }, { status: 404 });
  }
  
  if (sticker.createdBy !== session.user.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const boardId = sticker.boardId; // Lưu boardId trước khi delete
  await prisma.sticker.delete({ where: { id: params.stickerId } });

  // Emit Ably event cho tất cả users trong board
  await broadcastToBoard(boardId, {
    type: "sticker:deleted",
    data: { id: params.stickerId, boardId }
  });

  return NextResponse.json({ message: "Sticker deleted" });
} 