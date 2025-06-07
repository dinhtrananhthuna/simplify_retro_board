import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const boards = await prisma.board.findMany({
    where: { createdBy: session.user.email },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(boards);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { title, description } = await req.json();
  if (!title || title.length < 2) {
    return NextResponse.json({ message: "Invalid board title" }, { status: 400 });
  }
  const board = await prisma.board.create({
    data: {
      title,
      description: description ?? "",
      createdBy: session.user.email,
    },
  });
  await prisma.boardMember.create({
    data: {
      boardId: board.id,
      email: session.user.email,
      role: "owner",
    },
  });
  return NextResponse.json(board);
} 