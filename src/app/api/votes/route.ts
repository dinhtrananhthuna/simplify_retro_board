import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

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
  const vote = await prisma.vote.create({
    data: {
      stickerId,
      email: session.user.email,
    },
  });
  return NextResponse.json(vote);
} 