import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request, context: { params: Promise<{ memberId: string }> }) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { role } = await req.json();
  const member = await prisma.boardMember.findUnique({ where: { id: params.memberId } });
  if (!member) {
    return NextResponse.json({ message: "Member not found" }, { status: 404 });
  }
  // Kiểm tra quyền owner
  const board = await prisma.board.findUnique({ where: { id: member.boardId } });
  if (!board || board.createdBy !== session.user.email) {
    return NextResponse.json({ message: "Only owner can update member" }, { status: 403 });
  }
  const updated = await prisma.boardMember.update({
    where: { id: params.memberId },
    data: { role },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, context: { params: Promise<{ memberId: string }> }) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const member = await prisma.boardMember.findUnique({ where: { id: params.memberId } });
  if (!member) {
    return NextResponse.json({ message: "Member not found" }, { status: 404 });
  }
  // Kiểm tra quyền owner
  const board = await prisma.board.findUnique({ where: { id: member.boardId } });
  if (!board || board.createdBy !== session.user.email) {
    return NextResponse.json({ message: "Only owner can delete member" }, { status: 403 });
  }
  await prisma.boardMember.delete({ where: { id: params.memberId } });
  return NextResponse.json({ message: "Member deleted" });
} 