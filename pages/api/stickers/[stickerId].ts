import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function handler(req, res) {
  const { stickerId } = req.query;
  if (req.method === 'PATCH') {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { content, stickerType, x, y, position } = req.body;
    const sticker = await prisma.sticker.findUnique({ where: { id: stickerId } });
    if (!sticker) {
      return res.status(404).json({ message: 'Sticker not found' });
    }
    const board = await prisma.board.findUnique({ where: { id: sticker.boardId } });
    if (sticker.createdBy !== session.user.email && session.user.email !== board?.createdBy) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const updated = await prisma.sticker.update({
      where: { id: stickerId },
      data: {
        ...(content !== undefined ? { content } : {}),
        ...(stickerType !== undefined ? { stickerType } : {}),
        ...(x !== undefined ? { x } : {}),
        ...(y !== undefined ? { y } : {}),
        ...(position !== undefined ? { position } : {}),
      },
    });
    // Emit socket event nếu có io
    if (res.socket?.server?.io) {
      res.socket.server.io.emit('sticker:updated', updated);
    }
    return res.status(200).json(updated);
  }
  if (req.method === 'DELETE') {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const sticker = await prisma.sticker.findUnique({ where: { id: stickerId } });
    if (!sticker) {
      return res.status(404).json({ message: 'Sticker not found' });
    }
    if (sticker.createdBy !== session.user.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    await prisma.sticker.delete({ where: { id: stickerId } });
    // Emit socket event nếu có io
    if (res.socket?.server?.io) {
      res.socket.server.io.emit('sticker:deleted', { id: stickerId });
    }
    return res.status(200).json({ message: 'Sticker deleted' });
  }
  res.setHeader('Allow', ['PATCH', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 