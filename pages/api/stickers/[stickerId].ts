import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextApiRequest, NextApiResponse } from 'next';
import { broadcastToBoard } from '../../../lib/ably';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { stickerId } = req.query;
  if (typeof stickerId !== 'string') {
    return res.status(400).json({ message: 'Invalid stickerId' });
  }
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
      include: {
        votes: true,
        comments: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    // Emit Ably event cho tất cả users trong board
    await broadcastToBoard(sticker.boardId, {
      type: 'sticker:updated',
      data: updated
    });

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

    const boardId = sticker.boardId; // Lưu boardId trước khi delete
    await prisma.sticker.delete({ where: { id: stickerId } });

    // Emit Ably event cho tất cả users trong board
    await broadcastToBoard(boardId, {
      type: 'sticker:deleted',
      data: { id: stickerId, boardId }
    });

    return res.status(200).json({ message: 'Sticker deleted' });
  }
  res.setHeader('Allow', ['PATCH', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 