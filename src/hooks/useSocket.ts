import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ServerToClientEvents, ClientToServerEvents } from '@/types/socket';

const SOCKET_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export function useSocket(boardId?: string) {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  useEffect(() => {
    if (!boardId) return;
    // Khởi tạo socket chỉ một lần
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        path: '/api/socket',
        withCredentials: true,
        autoConnect: false,
      });
    }
    const socket = socketRef.current;
    if (!socket.connected) socket.connect();

    // Tham gia board khi mount
    socket.emit('presence:join', { boardId });

    // Rời board khi unmount
    return () => {
      socket.emit('presence:leave', { boardId });
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  return socketRef.current;
} 