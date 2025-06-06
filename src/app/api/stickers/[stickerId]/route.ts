import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PATCH(req: Request, { params }: { params: { stickerId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { content, stickerType, x, y } = await req.json();
  const sticker = await prisma.sticker.findUnique({ where: { id: params.stickerId } });
  if (!sticker) {
    return NextResponse.json({ message: "Sticker not found" }, { status: 404 });
  }
  if (sticker.createdBy !== session.user.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const updated = await prisma.sticker.update({
    where: { id: params.stickerId },
    data: { content, stickerType, x, y },
  });
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
  return NextResponse.json({ message: "Sticker deleted" });
} 