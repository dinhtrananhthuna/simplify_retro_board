import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: { commentId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { content } = await req.json();
  const comment = await prisma.comment.findUnique({ where: { id: params.commentId } });
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
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: { commentId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const comment = await prisma.comment.findUnique({ where: { id: params.commentId } });
  if (!comment) {
    return NextResponse.json({ message: "Comment not found" }, { status: 404 });
  }
  if (comment.email !== session.user.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  await prisma.comment.delete({ where: { id: params.commentId } });
  return NextResponse.json({ message: "Comment deleted" });
} 