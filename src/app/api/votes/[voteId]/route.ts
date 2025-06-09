import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(req: Request, { params }: { params: { voteId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const vote = await prisma.vote.findUnique({ where: { id: params.voteId } });
  if (!vote) {
    return NextResponse.json({ message: "Vote not found" }, { status: 404 });
  }
  if (vote.email !== session.user.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  await prisma.vote.delete({ where: { id: params.voteId } });
  return NextResponse.json({ message: "Vote deleted" });
} 