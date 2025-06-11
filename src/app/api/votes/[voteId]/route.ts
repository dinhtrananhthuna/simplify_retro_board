import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { broadcastToBoard } from "../../../../../lib/ably";

export async function DELETE(req: Request, context: { params: Promise<{ voteId: string }> }) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  
  const vote = await prisma.vote.findUnique({ 
    where: { id: params.voteId },
    include: {
      sticker: {
        select: { boardId: true }
      }
    }
  });
  
  if (!vote) {
    return NextResponse.json({ message: "Vote not found" }, { status: 404 });
  }
  if (vote.email !== session.user.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  
  await prisma.vote.delete({ where: { id: params.voteId } });

  // Emit Ably event cho tất cả users trong board
  await broadcastToBoard(vote.sticker.boardId, {
    type: 'vote:removed',
    data: { stickerId: vote.stickerId, email: vote.email }
  });

  return NextResponse.json({ message: "Vote deleted" });
} 