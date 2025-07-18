import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { broadcastToBoard } from "../../../../lib/ably";

// Lấy danh sách vote theo stickerId
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url!);
  const stickerId = searchParams.get("stickerId");
  if (!stickerId) {
    return NextResponse.json({ message: "Missing stickerId" }, { status: 400 });
  }
  const votes = await prisma.vote.findMany({
    where: { stickerId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(votes);
}

// Vote (mỗi user chỉ được vote 1 lần cho 1 sticker)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { stickerId } = await req.json();
  if (!stickerId) {
    return NextResponse.json({ message: "Missing stickerId" }, { status: 400 });
  }
  
  // Kiểm tra đã vote chưa
  const existing = await prisma.vote.findUnique({
    where: { stickerId_email: { stickerId, email: session.user.email } },
  });
  if (existing) {
    return NextResponse.json({ message: "Already voted" }, { status: 400 });
  }
  
  // Lấy sticker để biết boardId
  const sticker = await prisma.sticker.findUnique({
    where: { id: stickerId },
    select: { boardId: true }
  });
  
  if (!sticker) {
    return NextResponse.json({ message: "Sticker not found" }, { status: 404 });
  }
  
  const vote = await prisma.vote.create({
    data: {
      stickerId,
      email: session.user.email,
    },
  });

      // Emit Ably event cho tất cả users trong board
    await broadcastToBoard(sticker.boardId, {
      type: 'vote:added',
      data: { stickerId, email: session.user.email }
    });

  return NextResponse.json(vote);
} 