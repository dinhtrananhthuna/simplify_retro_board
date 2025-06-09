import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { boardId } = req.query;
    if (!boardId || typeof boardId !== 'string') {
      return res.status(400).json({ message: 'Missing or invalid boardId' });
    }

    // Kiểm tra xem user có quyền truy cập board này không
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        members: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const isMember = board.members.some((member: any) => member.email === session.user?.email) || 
                     board.createdBy === session.user?.email;
    
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const stickers = await prisma.sticker.findMany({
      where: { boardId: boardId },
      include: {
        votes: true,
        comments: true,
      },
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