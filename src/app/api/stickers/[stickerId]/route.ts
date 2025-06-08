import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PATCH(req: Request, { params }: { params: { stickerId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { content, stickerType, x, y, position } = await req.json();
  const sticker = await prisma.sticker.findUnique({ where: { id: params.stickerId } });
  if (!sticker) {
    return NextResponse.json({ message: "Sticker not found" }, { status: 404 });
  }
  const board = await prisma.board.findUnique({ where: { id: sticker.boardId } });
  if (sticker.createdBy !== session.user.email && session.user.email !== board?.createdBy) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const updated = await prisma.sticker.update({
    where: { id: params.stickerId },
    data: {
      ...(content !== undefined ? { content } : {}),
      ...(stickerType !== undefined ? { stickerType } : {}),
      ...(x !== undefined ? { x } : {}),
      ...(y !== undefined ? { y } : {}),
      ...(position !== undefined ? { position } : {}),
    },
  });
  // Emit socket event nếu có io
  try {
    const io = globalThis.io || (globalThis as any).io || (typeof res !== 'undefined' && res.socket && res.socket.server && res.socket.server.io);
    if (io) {
      io.emit('sticker:updated', updated);
    }
  } catch (e) { /* ignore */ }
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: { stickerId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const sticker = await prisma.sticker.findUnique({ where: { id: params.stickerId } });
  if (!sticker) {
    return NextResponse.json({ message: "Sticker not found" }, { status: 404 });
  }
  if (sticker.createdBy !== session.user.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  await prisma.sticker.delete({ where: { id: params.stickerId } });
  // Emit socket event nếu có io
  try {
    const io = globalThis.io || (globalThis as any).io || (typeof res !== 'undefined' && res.socket && res.socket.server && res.socket.server.io);
    console.log("io", io);
    if (io) {
      io.emit('sticker:deleted', { id: params.stickerId });
    }
  } catch (e) { /* ignore */ }
  return NextResponse.json({ message: "Sticker deleted" });
} 