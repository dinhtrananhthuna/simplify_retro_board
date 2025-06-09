import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { ServerToClientEvents, ClientToServerEvents } from '@/types/socket';

const SOCKET_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

interface UseSocketOptions {
  onPresenceList?: (data: { members: Array<{ email: string; role: string; online: boolean }> }) => void;
  onPresenceJoined?: (data: { email: string; role: string }) => void;
  onPresenceLeft?: (data: { email: string }) => void;
  onVoteAdded?: (data: { stickerId: string; email: string }) => void;
  onVoteRemoved?: (data: { stickerId: string; email: string }) => void;
}

export function useSocket(
  boardId?: string,
  options?: UseSocketOptions
) {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const { data: session } = useSession();

  const voteAdd = (stickerId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('vote:add', { stickerId });
    }
  };

  const voteRemove = (stickerId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('vote:remove', { stickerId });
    }
  };

  useEffect(() => {
    if (!boardId || !session?.user?.email) {
      console.log(`[useSocket] Missing boardId or session:`, { boardId, email: session?.user?.email });
      return;
    }
    console.log(`[useSocket] Setting up socket for board: ${boardId}`);
    
    // Khởi tạo socket chỉ một lần
    if (!socketRef.current) {
      console.log(`[useSocket] Creating new socket connection to: ${SOCKET_URL}`);
      
      // First, ping the API to initialize the socket server
      fetch('/api/socket').catch(() => {}); // Ignore errors, just trigger initialization
      
      socketRef.current = io(SOCKET_URL, {
        path: '/api/socket',
        withCredentials: true,
        autoConnect: false,
      });
    }
    const socket = socketRef.current;
    
    if (!socket.connected) {
      console.log(`[useSocket] Connecting socket...`);
      socket.connect();
    }

    // Wait for connection before emitting events
    const handleConnection = () => {
      console.log(`[useSocket] Connected! Emitting presence:join for board: ${boardId} with email: ${session.user?.email}`);
      socket.emit('presence:join', { boardId, email: session.user?.email || undefined });
    };

    if (socket.connected) {
      handleConnection();
    } else {
      socket.once('connect', handleConnection);
    }

    // Listen for connection events
    socket.on('connect', () => {
      console.log(`[useSocket] Socket connected successfully`);
    });

    socket.on('disconnect', () => {
      console.log(`[useSocket] Socket disconnected`);
    });

    socket.on('connect_error', (error: any) => {
      console.error(`[useSocket] Socket connection error:`, error);
    });

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

    // Lắng nghe các event vote
    if (options?.onVoteAdded) {
      socket.on('vote:added', options.onVoteAdded);
    }
    if (options?.onVoteRemoved) {
      socket.on('vote:removed', options.onVoteRemoved);
    }

    // Rời board khi unmount
    return () => {
      console.log(`[useSocket] Cleaning up socket for board: ${boardId}`);
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
      if (options?.onVoteAdded) {
        socket.off('vote:added', options.onVoteAdded);
      }
      if (options?.onVoteRemoved) {
        socket.off('vote:removed', options.onVoteRemoved);
      }
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      // Clean up the once listener if it wasn't triggered
      socket.removeAllListeners('connect');
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId, session?.user?.email]);

  return {
    socket: socketRef.current,
    voteAdd,
    voteRemove,
  };
} 