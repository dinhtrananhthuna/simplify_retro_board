import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponse } from 'next';
import { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from '@/types/socket';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const ioHandler = async (req: Request, res: NextApiResponse) => {
  if (!res.socket.server.io) {
    const httpServer: NetServer = res.socket.server as any;
    const io = new SocketIOServer<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
    >(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_BASE_URL,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // Middleware để xác thực session
    io.use(async (socket, next) => {
      try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
          return next(new Error('Unauthorized'));
        }

        // Lấy role của user từ database
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { role: true },
        });

        if (!user) {
          return next(new Error('User not found'));
        }

        socket.data = {
          email: session.user.email,
          role: user.role,
        };

        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });

    // Xử lý connection
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.data.email);

      // Xử lý join board
      socket.on('presence:join', async ({ boardId }) => {
        try {
          // Kiểm tra quyền truy cập board
          const member = await prisma.boardMember.findUnique({
            where: {
              boardId_email: {
                boardId,
                email: socket.data.email,
              },
            },
          });

          if (!member) {
            socket.emit('error', { message: 'Unauthorized access to board' });
            return;
          }

          // Join room
          socket.join(boardId);
          socket.data.boardId = boardId;

          // Cập nhật presence trong database
          await prisma.boardPresence.upsert({
            where: {
              boardId_email: {
                boardId,
                email: socket.data.email,
              },
            },
            update: {
              online: true,
              lastSeen: new Date(),
            },
            create: {
              boardId,
              email: socket.data.email,
              role: socket.data.role,
              online: true,
              lastSeen: new Date(),
            },
          });

          // Broadcast cho các thành viên khác
          socket.to(boardId).emit('presence:joined', {
            email: socket.data.email,
            role: socket.data.role,
          });

          // Gửi danh sách thành viên cho user mới
          const members = await prisma.boardPresence.findMany({
            where: { boardId },
            select: { email: true, role: true, online: true },
          });

          socket.emit('presence:list', { members });
        } catch (error) {
          console.error('Error joining board:', error);
          socket.emit('error', { message: 'Failed to join board' });
        }
      });

      // Xử lý leave board
      socket.on('presence:leave', async ({ boardId }) => {
        try {
          socket.leave(boardId);
          socket.data.boardId = undefined;

          // Cập nhật presence trong database
          await prisma.boardPresence.update({
            where: {
              boardId_email: {
                boardId,
                email: socket.data.email,
              },
            },
            data: {
              online: false,
              lastSeen: new Date(),
            },
          });

          // Broadcast cho các thành viên khác
          socket.to(boardId).emit('presence:left', {
            email: socket.data.email,
          });
        } catch (error) {
          console.error('Error leaving board:', error);
          socket.emit('error', { message: 'Failed to leave board' });
        }
      });

      // Xử lý disconnect
      socket.on('disconnect', async () => {
        console.log('Client disconnected:', socket.data.email);
        if (socket.data.boardId) {
          try {
            // Cập nhật presence trong database
            await prisma.boardPresence.update({
              where: {
                boardId_email: {
                  boardId: socket.data.boardId,
                  email: socket.data.email,
                },
              },
              data: {
                online: false,
                lastSeen: new Date(),
              },
            });

            // Broadcast cho các thành viên khác
            socket.to(socket.data.boardId).emit('presence:left', {
              email: socket.data.email,
            });
          } catch (error) {
            console.error('Error handling disconnect:', error);
          }
        }
      });
    });

    res.socket.server.io = io;
  }

  res.end();
};

export { ioHandler as GET, ioHandler as POST }; 