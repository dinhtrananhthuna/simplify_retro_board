import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ boardId: string }> }
) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { title, description } = await req.json();
  if (!title || title.length < 2) {
    return NextResponse.json({ message: "Invalid board title" }, { status: 400 });
  }

  try {
    const board = await prisma.board.findUnique({
      where: { id: params.boardId },
    });

    if (!board) {
      return NextResponse.json({ message: "Board not found" }, { status: 404 });
    }

    if (board.createdBy !== session.user.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const updatedBoard = await prisma.board.update({
      where: { id: params.boardId },
      data: { title, description },
    });

    return NextResponse.json(updatedBoard);
  } catch (error) {
    console.error("Error updating board:", error);
    return NextResponse.json(
      { message: "Failed to update board" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ boardId: string }> }
) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const board = await prisma.board.findUnique({
      where: { id: params.boardId },
    });

    if (!board) {
      return NextResponse.json({ message: "Board not found" }, { status: 404 });
    }

    if (board.createdBy !== session.user.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await prisma.board.delete({
      where: { id: params.boardId },
    });

    return NextResponse.json({ message: "Board deleted successfully" });
  } catch (error) {
    console.error("Error deleting board:", error);
    return NextResponse.json(
      { message: "Failed to delete board" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  context: { params: Promise<{ boardId: string }> }
) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const board = await prisma.board.findUnique({
    where: { id: params.boardId },
    include: {
      members: {
        select: {
          email: true,
          role: true,
        },
      },
    },
  });
  
  if (!board) {
    return NextResponse.json({ message: "Board not found" }, { status: 404 });
  }

  // Kiểm tra xem user có quyền truy cập board này không
  const isMember = board.members.some((member: { email: string; role: string }) => member.email === session.user?.email) || 
                   board.createdBy === session.user?.email;
  
  if (!isMember) {
    return NextResponse.json({ message: "Access denied" }, { status: 403 });
  }

  return NextResponse.json(board);
} 