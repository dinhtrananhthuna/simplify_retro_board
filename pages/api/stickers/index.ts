import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { boardId } = req.query;
    if (!boardId) {
      return res.status(400).json({ message: 'Missing boardId' });
    }
    const stickers = await prisma.sticker.findMany({
      where: { boardId },
      orderBy: { createdAt: 'asc' },
    });
    return res.status(200).json(stickers);
  }
  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { content, stickerType, x, y, boardId, position } = req.body;
    if (!content || !stickerType || !boardId) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    let finalPosition = position;
    if (finalPosition === undefined) {
      finalPosition = await prisma.sticker.count({ where: { boardId, stickerType } });
    }
    const sticker = await prisma.sticker.create({
      data: {
        content,
        stickerType,
        x: x ?? 0,
        y: y ?? 0,
        boardId,
        createdBy: session.user.email,
        position: finalPosition,
      },
    });
    // Emit socket event nếu có io
    if (res.socket?.server?.io) {
      res.socket.server.io.emit('sticker:created', sticker);
    }
    return res.status(200).json(sticker);
  }
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 