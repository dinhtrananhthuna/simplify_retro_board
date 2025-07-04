import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { broadcastToBoard } from "../../../../../lib/ably";

export async function PATCH(req: Request, context: { params: Promise<{ commentId: string }> }) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { content } = await req.json();
  
  const comment = await prisma.comment.findUnique({ 
    where: { id: params.commentId },
    include: {
      sticker: {
        select: { boardId: true }
      }
    }
  });
  
  if (!comment) {
    return NextResponse.json({ message: "Comment not found" }, { status: 404 });
  }
  if (comment.email !== session.user.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  
  const updated = await prisma.comment.update({
    where: { id: params.commentId },
    data: { content },
  });

  // Emit Ably event cho tất cả users trong board
  await broadcastToBoard(comment.sticker.boardId, {
    type: 'comment:updated',
    data: updated
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: Request, context: { params: Promise<{ commentId: string }> }) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  
  const comment = await prisma.comment.findUnique({ 
    where: { id: params.commentId },
    include: {
      sticker: {
        select: { boardId: true }
      }
    }
  });
  
  if (!comment) {
    return NextResponse.json({ message: "Comment not found" }, { status: 404 });
  }
  if (comment.email !== session.user.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  
  await prisma.comment.delete({ where: { id: params.commentId } });

  // Emit Ably event cho tất cả users trong board
  await broadcastToBoard(comment.sticker.boardId, {
    type: 'comment:deleted',
    data: { id: params.commentId }
  });

  return NextResponse.json({ message: "Comment deleted" });
} 