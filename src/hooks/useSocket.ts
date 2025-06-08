import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ServerToClientEvents, ClientToServerEvents } from '@/types/socket';

const SOCKET_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

interface UseSocketOptions {
  onPresenceList?: (data: { members: Array<{ email: string; role: string; online: boolean }> }) => void;
  onPresenceJoined?: (data: { email: string; role: string }) => void;
  onPresenceLeft?: (data: { email: string }) => void;
}

export function useSocket(
  boardId?: string,
  options?: UseSocketOptions
) {
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

    // Lắng nghe các event presence
    if (options?.onPresenceList) {
      socket.on('presence:list', options.onPresenceList);
    }
    if (options?.onPresenceJoined) {
      socket.on('presence:joined', options.onPresenceJoined);
    }
    if (options?.onPresenceLeft) {
      socket.on('presence:left', options.onPresenceLeft);
    }

    // Rời board khi unmount
    return () => {
      socket.emit('presence:leave', { boardId });
      if (options?.onPresenceList) {
        socket.off('presence:list', options.onPresenceList);
      }
      if (options?.onPresenceJoined) {
        socket.off('presence:joined', options.onPresenceJoined);
      }
      if (options?.onPresenceLeft) {
        socket.off('presence:left', options.onPresenceLeft);
      }
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  return socketRef.current;
} 