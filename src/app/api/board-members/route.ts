import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Lấy danh sách thành viên theo boardId
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url!);
  const boardId = searchParams.get("boardId");
  if (!boardId) {
    return NextResponse.json({ message: "Missing boardId" }, { status: 400 });
  }
  const members = await prisma.boardMember.findMany({
    where: { boardId },
    orderBy: { joinedAt: "asc" },
  });
  return NextResponse.json(members);
}

// Thêm thành viên mới (chỉ owner mới được thêm)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { boardId, email, role } = await req.json();
  if (!boardId || !email || !role) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }
  // Kiểm tra quyền owner
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board || board.createdBy !== session.user.email) {
    return NextResponse.json({ message: "Only owner can add members" }, { status: 403 });
  }
  const member = await prisma.boardMember.create({
    data: {
      boardId,
      email,
      role,
    },
  });
  return NextResponse.json(member);
} 