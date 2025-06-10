import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { ServerToClientEvents, ClientToServerEvents } from '@/types/socket';
import type { Comment } from '@prisma/client';

const SOCKET_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Socket singleton để tránh tạo nhiều connections  
let globalSocket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

interface UseSocketOptions {
  onPresenceList?: (data: { members: Array<{ email: string; role: string; online: boolean }> }) => void;
  onPresenceJoined?: (data: { email: string; role: string }) => void;
  onPresenceLeft?: (data: { email: string }) => void;
  onVoteAdded?: (data: { stickerId: string; email: string }) => void;
  onVoteRemoved?: (data: { stickerId: string; email: string }) => void;
  onCommentAdded?: (data: Comment) => void;
  onCommentUpdated?: (data: Comment) => void;
  onCommentDeleted?: (data: { id: string }) => void;
}

export function useSocket(
  boardId?: string,
  options?: UseSocketOptions
) {
  console.log('[useSocket] Hook called with:', { boardId, hasOptions: !!options });
  
  // Stable options reference để tránh re-subscription
  const optionsRef = useRef(options);
  
  // Chỉ update ref khi cần thiết, không trigger re-effect
  useEffect(() => {
    optionsRef.current = options;
  });
  
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Memoized socket actions để tránh re-creating functions
  const voteAdd = useCallback((stickerId: string) => {
    if (globalSocket?.connected) {
      globalSocket.emit('vote:add', { stickerId });
    }
  }, []);

  const voteRemove = useCallback((stickerId: string) => {
    if (globalSocket?.connected) {
      globalSocket.emit('vote:remove', { stickerId });
    }
  }, []);

  const commentAdd = useCallback((stickerId: string, content: string) => {
    console.log("[useSocket] commentAdd called:", { stickerId, content, connected: globalSocket?.connected });
    if (globalSocket?.connected && content.trim()) {
      console.log("[useSocket] Emitting comment:add event");
      globalSocket.emit('comment:add', { stickerId, content: content.trim() });
    } else {
      console.warn("[useSocket] Cannot emit comment:add - socket not connected or content empty");
    }
  }, []);

  const commentUpdate = useCallback((id: string, content: string) => {
    if (globalSocket?.connected && content.trim()) {
      globalSocket.emit('comment:update', { id, content: content.trim() });
    }
  }, []);

  const commentDelete = useCallback((id: string) => {
    if (globalSocket?.connected) {
      globalSocket.emit('comment:delete', { id });
    }
  }, []);

  // Memoized socket actions object để tránh re-creating object
  const socketActions = useMemo(() => ({
    voteAdd,
    voteRemove,
    commentAdd,
    commentUpdate,
    commentDelete
  }), [voteAdd, voteRemove, commentAdd, commentUpdate, commentDelete]);

  useEffect(() => {
    if (!boardId) {
      console.log(`[useSocket] Missing boardId:`, { boardId });
      return;
    }
    
    console.log(`[useSocket] Setting up socket for board: ${boardId}, session:`, !!session?.user?.email);
    
    // Sử dụng singleton socket
    if (!globalSocket) {
      console.log(`[useSocket] Creating new socket connection to: ${SOCKET_URL}`);
      
      // Initialize socket server
      fetch('/api/socket').catch(() => {});
      
      globalSocket = io(SOCKET_URL, {
        path: '/api/socket',
        withCredentials: true,
        autoConnect: false,
        // Performance optimizations
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: false,
      });
    }
    
    const socket = globalSocket;
    
    // Connection handlers với debouncing
    let connectTimeout: NodeJS.Timeout | undefined;
    
    const handleConnection = () => {
      console.log(`[useSocket] Connected! Session available:`, !!session?.user?.email);
      // Chỉ join room nếu có session
      if (session?.user?.email) {
        console.log(`[useSocket] Emitting presence:join for board: ${boardId}`);
        socket.emit('presence:join', { boardId, email: session.user.email });
      } else {
        console.log(`[useSocket] Socket connected but no session available yet`);
      }
      setIsConnected(true);
      setIsConnecting(false);
    };

    const handleDisconnect = () => {
      console.log(`[useSocket] Socket disconnected`);
      setIsConnected(false);
      setIsConnecting(false);
    };

    const handleError = (error: Error) => {
      console.error(`[useSocket] Socket connection error:`, error);
      setIsConnected(false);
      setIsConnecting(false);
    };

    // Connect if not already connected
    if (!socket.connected) {
      console.log(`[useSocket] Connecting socket...`);
      setIsConnecting(true);
      socket.connect();
    } else {
      handleConnection();
    }

    // Join room nếu socket đã connected và có session
    if (socket.connected && session?.user?.email) {
      console.log(`[useSocket] Socket already connected, joining room for board: ${boardId}`);
      socket.emit('presence:join', { boardId, email: session.user.email });
    }

    // Event listeners với cleanup
    socket.on('connect', handleConnection);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleError);

    // Board-specific event listeners với memoized handlers
    const currentOptions = optionsRef.current;
    
    if (currentOptions?.onPresenceList) {
      socket.on('presence:list', currentOptions.onPresenceList);
    }
    if (currentOptions?.onPresenceJoined) {
      socket.on('presence:joined', currentOptions.onPresenceJoined);
    }
    if (currentOptions?.onPresenceLeft) {
      socket.on('presence:left', currentOptions.onPresenceLeft);
    }
    if (currentOptions?.onVoteAdded) {
      socket.on('vote:added', currentOptions.onVoteAdded);
    }
    if (currentOptions?.onVoteRemoved) {
      socket.on('vote:removed', currentOptions.onVoteRemoved);
    }
    if (currentOptions?.onCommentAdded) {
      socket.on('comment:added', currentOptions.onCommentAdded);
    }
    if (currentOptions?.onCommentUpdated) {
      socket.on('comment:updated', currentOptions.onCommentUpdated);
    }
    if (currentOptions?.onCommentDeleted) {
      socket.on('comment:deleted', currentOptions.onCommentDeleted);
    }

    // Cleanup function với proper event removal
    return () => {
      console.log(`[useSocket] Cleaning up socket for board: ${boardId}`);
      
      if (connectTimeout) {
        clearTimeout(connectTimeout);
      }
      
      // Leave board room
      socket.emit('presence:leave', { boardId });
      
      // Remove event listeners
      socket.off('connect', handleConnection);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleError);
      
      if (currentOptions?.onPresenceList) {
        socket.off('presence:list', currentOptions.onPresenceList);
      }
      if (currentOptions?.onPresenceJoined) {
        socket.off('presence:joined', currentOptions.onPresenceJoined);
      }
      if (currentOptions?.onPresenceLeft) {
        socket.off('presence:left', currentOptions.onPresenceLeft);
      }
      if (currentOptions?.onVoteAdded) {
        socket.off('vote:added', currentOptions.onVoteAdded);
      }
      if (currentOptions?.onVoteRemoved) {
        socket.off('vote:removed', currentOptions.onVoteRemoved);
      }
      if (currentOptions?.onCommentAdded) {
        socket.off('comment:added', currentOptions.onCommentAdded);
      }
      if (currentOptions?.onCommentUpdated) {
        socket.off('comment:updated', currentOptions.onCommentUpdated);
      }
      if (currentOptions?.onCommentDeleted) {
        socket.off('comment:deleted', currentOptions.onCommentDeleted);
      }
    };
  }, [boardId]); // Chỉ phụ thuộc vào boardId để tránh infinite re-subscription

  // Separate effect để handle session change
  useEffect(() => {
    if (!boardId || !session?.user?.email || !globalSocket?.connected) {
      return;
    }
    
    console.log(`[useSocket] Session available, joining room for board: ${boardId}`);
    globalSocket.emit('presence:join', { boardId, email: session.user.email });
  }, [boardId, session?.user?.email, isConnected]);

  return {
    socket: globalSocket,
    isConnected,
    isConnecting,
    ...socketActions
  };
} 