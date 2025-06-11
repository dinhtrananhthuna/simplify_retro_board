import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Ably from 'ably';
import ably from '../../lib/ably';

interface AblyMessage {
  name: string;
  data: any;
}

interface UseAblyOptions {
  onPresenceList?: (data: { members: Array<{ email: string; role: string; online: boolean }> }) => void;
  onPresenceJoined?: (data: { email: string; role: string }) => void;
  onPresenceLeft?: (data: { email: string }) => void;
  onVoteAdded?: (data: { stickerId: string; email: string }) => void;
  onVoteRemoved?: (data: { stickerId: string; email: string }) => void;
  onCommentAdded?: (data: any) => void;
  onCommentUpdated?: (data: any) => void;
  onCommentDeleted?: (data: { id: string }) => void;
  onStickerCreated?: (data: any) => void;
  onStickerUpdated?: (data: any) => void;
  onStickerDeleted?: (data: { id: string }) => void;
  onTimerStart?: (data: any) => void;
  onTimerPause?: (data: any) => void;
  onTimerResume?: (data: any) => void;
  onTimerStop?: (data: any) => void;
}

export function useAbly(boardId?: string, options?: UseAblyOptions) {
  console.log('[useAbly] Hook called with:', { boardId, hasOptions: !!options });
  
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);
  const optionsRef = useRef(options);
  
  // Update options ref when needed
  useEffect(() => {
    optionsRef.current = options;
  });

  // Stable actions for client-side operations
  const actions = useMemo(() => ({
    voteAdd: async (stickerId: string) => {
      if (!session?.user?.email) return;
      console.log('[useAbly] 🗳️ Adding vote for sticker:', stickerId, 'user:', session.user.email);
      try {
        const response = await fetch('/api/votes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stickerId })
        });
        console.log('[useAbly] 🗳️ Vote add response:', response.status, response.ok);
      } catch (error) {
        console.error('[useAbly] Error adding vote:', error);
      }
    },

    voteRemove: async (stickerId: string) => {
      if (!session?.user?.email) return;
      console.log('[useAbly] 🗳️ Removing vote for sticker:', stickerId, 'user:', session.user.email);
      try {
        // Find the vote to remove
        const votesResponse = await fetch(`/api/votes?stickerId=${stickerId}`);
        const votes = await votesResponse.json();
        console.log('[useAbly] 🗳️ Found votes for sticker:', votes.length);
        const userVote = votes.find((v: any) => v.email === session.user!.email);
        console.log('[useAbly] 🗳️ User vote found:', !!userVote, userVote?.id);
        
        if (userVote) {
          const deleteResponse = await fetch(`/api/votes/${userVote.id}`, {
            method: 'DELETE'
          });
          console.log('[useAbly] 🗳️ Vote remove response:', deleteResponse.status, deleteResponse.ok);
        }
      } catch (error) {
        console.error('[useAbly] Error removing vote:', error);
      }
    },

    commentAdd: async (stickerId: string, content: string) => {
      if (!session?.user?.email || !content.trim()) return;
      try {
        await fetch('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stickerId, content: content.trim() })
        });
      } catch (error) {
        console.error('[useAbly] Error adding comment:', error);
      }
    },

    commentUpdate: async (id: string, content: string) => {
      if (!session?.user?.email || !content.trim()) return;
      try {
        await fetch(`/api/comments/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: content.trim() })
        });
      } catch (error) {
        console.error('[useAbly] Error updating comment:', error);
      }
    },

    commentDelete: async (id: string) => {
      if (!session?.user?.email) return;
      try {
        await fetch(`/api/comments/${id}`, {
          method: 'DELETE'
        });
      } catch (error) {
        console.error('[useAbly] Error deleting comment:', error);
      }
    },

    // Timer broadcast functions
    timerBroadcastStart: async (timerData: any) => {
      const channel = channelRef.current;
      if (!channel || !session?.user?.email) return;
      console.log('[useAbly] ⏱️ Broadcasting timer start:', timerData);
      try {
        await channel.publish('timer:start', {
          ...timerData,
          createdBy: session.user.email
        });
      } catch (error) {
        console.error('[useAbly] Error broadcasting timer start:', error);
      }
    },

    timerBroadcastPause: async (timerData: any) => {
      const channel = channelRef.current;
      if (!channel || !session?.user?.email) return;
      console.log('[useAbly] ⏱️ Broadcasting timer pause:', timerData);
      try {
        await channel.publish('timer:pause', {
          ...timerData,
          pausedBy: session.user.email
        });
      } catch (error) {
        console.error('[useAbly] Error broadcasting timer pause:', error);
      }
    },

    timerBroadcastResume: async (timerData: any) => {
      const channel = channelRef.current;
      if (!channel || !session?.user?.email) return;
      console.log('[useAbly] ⏱️ Broadcasting timer resume:', timerData);
      try {
        await channel.publish('timer:resume', {
          ...timerData,
          resumedBy: session.user.email
        });
      } catch (error) {
        console.error('[useAbly] Error broadcasting timer resume:', error);
      }
    },

    timerBroadcastStop: async (timerData: any) => {
      const channel = channelRef.current;
      if (!channel || !session?.user?.email) return;
      console.log('[useAbly] ⏱️ Broadcasting timer stop:', timerData);
      try {
        await channel.publish('timer:stop', {
          ...timerData,
          stoppedBy: session.user.email
        });
      } catch (error) {
        console.error('[useAbly] Error broadcasting timer stop:', error);
      }
    }
  }), [session?.user?.email]);

  // Ably Connection effect
  useEffect(() => {
    if (!boardId || !session?.user?.email || !ably) {
      console.log('[useAbly] Missing boardId, session, or ably:', { boardId, hasSession: !!session?.user?.email, hasAbly: !!ably });
      return;
    }

    console.log('[useAbly] Setting up Ably connection for board:', boardId, 'user:', session.user.email);
    setIsConnecting(true);

    const channelName = `board:${boardId}`;
    console.log('[useAbly] Creating channel:', channelName);
    
    const channel = ably!.channels.get(channelName);
    channelRef.current = channel;

    // Connection state handling
    const handleConnectionStateChange = (stateChange: Ably.ConnectionStateChange) => {
      console.log('[useAbly] Connection state changed:', stateChange.current);
      setIsConnected(stateChange.current === 'connected');
      setIsConnecting(stateChange.current === 'connecting');
    };

    ably!.connection.on(handleConnectionStateChange);

    // Initial connection state
    setIsConnected(ably!.connection.state === 'connected');

    // Subscribe to all board events
    const messageHandler = (message: Ably.Message) => {
      console.log('[useAbly] 📨 Received message:', message.name, message.data);

      const currentOptions = optionsRef.current;
      
      switch (message.name) {
        case 'connection':
          console.log('[useAbly] Connected to board:', message.data.boardId);
          break;
        case 'presence:list':
          currentOptions?.onPresenceList?.(message.data);
          break;
        case 'presence:joined':
          currentOptions?.onPresenceJoined?.(message.data);
          break;
        case 'presence:left':
          currentOptions?.onPresenceLeft?.(message.data);
          break;
        case 'vote:added':
          currentOptions?.onVoteAdded?.(message.data);
          break;
        case 'vote:removed':
          currentOptions?.onVoteRemoved?.(message.data);
          break;
        case 'comment:added':
          currentOptions?.onCommentAdded?.(message.data);
          break;
        case 'comment:updated':
          currentOptions?.onCommentUpdated?.(message.data);
          break;
        case 'comment:deleted':
          currentOptions?.onCommentDeleted?.(message.data);
          break;
        case 'sticker:created':
          currentOptions?.onStickerCreated?.(message.data);
          break;
        case 'sticker:updated':
          currentOptions?.onStickerUpdated?.(message.data);
          break;
        case 'sticker:deleted':
          currentOptions?.onStickerDeleted?.(message.data);
          break;
        case 'timer:start':
          currentOptions?.onTimerStart?.(message.data);
          break;
        case 'timer:pause':
          currentOptions?.onTimerPause?.(message.data);
          break;
        case 'timer:resume':
          currentOptions?.onTimerResume?.(message.data);
          break;
        case 'timer:stop':
          currentOptions?.onTimerStop?.(message.data);
          break;
        default:
          console.log('[useAbly] Unknown message type:', message.name);
      }
    };

    // Subscribe to channel messages
    channel.subscribe(messageHandler);

    // Enter presence for user tracking
    channel.presence.enter({
      email: session.user.email,
      role: 'member' // You can customize this based on user role
    }).then(() => {
      console.log('[useAbly] ✅ Entered presence for board:', boardId);
    }).catch((err) => {
      console.error('[useAbly] ❌ Failed to enter presence:', err);
    });

    // Handle presence events
    channel.presence.subscribe((presenceMessage) => {
      console.log('[useAbly] 👥 Presence event:', presenceMessage.action, presenceMessage.data);
      
      const currentOptions = optionsRef.current;
      
      switch (presenceMessage.action) {
        case 'enter':
        case 'update':
          currentOptions?.onPresenceJoined?.(presenceMessage.data);
          break;
        case 'leave':
          currentOptions?.onPresenceLeft?.(presenceMessage.data);
          break;
      }
    });

    // Cleanup function
    return () => {
      console.log('[useAbly] 🧹 Cleaning up Ably connection for board:', boardId);
      
      if (channel) {
        channel.presence.leave().catch(console.error);
        channel.unsubscribe();
      }
      
      if (ably) {
        ably.connection.off(handleConnectionStateChange);
      }
      setIsConnected(false);
      setIsConnecting(false);
    };
  }, [boardId, session?.user?.email]);

  return {
    ...actions,
    isConnected,
    isConnecting,
    channel: channelRef.current
  };
} 