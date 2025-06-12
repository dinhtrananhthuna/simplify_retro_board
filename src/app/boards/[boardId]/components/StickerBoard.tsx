"use client";
import { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useAppToast } from "@/hooks/useAppToast";
import { useAbly } from "@/hooks/useAbly";
import { useTimer } from "@/hooks/useTimer";
import { useSession } from "next-auth/react";
import { Board, Sticker, PresenceMember, Comment } from "@/types/board";

// Direct imports để debug issue
import StickerColumn from "./StickerColumn";
import PresenceAvatars from "./PresenceAvatars";
import OnlineCounter from "./OnlineCounter";
import TimerControls from "./TimerControls";
import TimerDisplay from "./TimerDisplay";

// Component loading fallback
const ComponentSkeleton = () => (
  <div className="animate-pulse bg-gray-200 rounded-lg h-32 w-full" />
);

const STICKER_TYPES = [
  { key: "went-well", label: "Went Well" },
  { key: "to-improve", label: "To Improve" },
  { key: "action-items", label: "Action Items" },
] as const;

interface StickerBoardProps {
  boardId: string;
}

// Memoized component để tránh unnecessary re-renders
const StickerBoard = memo(function StickerBoard({ boardId }: StickerBoardProps) {
  console.log('[StickerBoard] ===== COMPONENT RE-RENDER ===== boardId:', boardId);
  
  const [board, setBoard] = useState<Board | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useAppToast();
  console.log('[StickerBoard] toast object created:', !!toast);
  const toastRef = useRef(toast);
  const [presenceMembers, setPresenceMembers] = useState<PresenceMember[]>([]);
  
  // Session for owner check
  const { data: session } = useSession();
  const isOwner = board?.createdBy === session?.user?.email;
  
  // Timer hook
  const {
    timeLeft,
    isActive: timerIsActive,
    isPaused: timerIsPaused,
    formattedTime,
    progress,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    onTimerEvent,
    setBroadcastActions,
  } = useTimer(boardId);

  // Update toastRef when toast changes but don't use it as dependency
  useEffect(() => {
    console.log('[StickerBoard] toast useEffect triggered');
    toastRef.current = toast;
  }, [toast]);



  // Memoized fetch functions với stable dependencies
  const fetchBoard = useCallback(async () => {
    try {
      const res = await fetch(`/api/boards/${boardId}`);
      if (res.ok) {
        const data = await res.json();
        setBoard(data);
      }
    } catch (error) {
      console.error('Error fetching board:', error);
      // Use toastRef to avoid dependency
      toastRef.current?.error?.('Không thể tải board');
    }
  }, [boardId]); // Remove toast dependency

  const fetchStickers = useCallback(async () => {
    try {
      const res = await fetch(`/api/stickers?boardId=${boardId}`);
      if (res.ok) {
        const data = await res.json();
        setStickers(data);
      }
    } catch (error) {
      console.error('Error fetching stickers:', error);
      // Use toastRef to avoid dependency
      toastRef.current?.error?.('Không thể tải stickers');
    }
  }, [boardId]); // Remove toast dependency

  // Initial data loading với stable fetch functions
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // ✅ INLINE functions để tránh dependencies hoàn toàn  
        const [boardRes, stickersRes] = await Promise.all([
          fetch(`/api/boards/${boardId}`),
          fetch(`/api/stickers?boardId=${boardId}`)
        ]);
        
        if (boardRes.ok) {
          const boardData = await boardRes.json();
          setBoard(boardData);
        }
        
        if (stickersRes.ok) {
          const stickersData = await stickersRes.json();
          setStickers(stickersData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toastRef.current?.error?.('Không thể tải dữ liệu board');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [boardId]); // ✅ CHỈ DEPEND VÀO boardId, KHÔNG depend vào fetchBoard, fetchStickers

     // Stable SSE event handlers
   const socketHandlers = useMemo(() => ({
     onPresenceList: (data: { members: PresenceMember[] }) => {
       setPresenceMembers(data.members);
     },
     onPresenceJoined: (data: { email: string; role: string }) => {
       setPresenceMembers((prev) => {
         const exists = prev.find((m) => m.email === data.email);
         if (exists) {
           return prev.map((m) => m.email === data.email ? { ...m, online: true } : m);
         }
         return [...prev, { ...data, online: true }];
       });
       toastRef.current?.success?.(`${data.email} vừa tham gia board!`);
     },
    onPresenceLeft: (data: { email: string }) => {
      setPresenceMembers((prev) => 
        prev.map((m) => m.email === data.email ? { ...m, online: false } : m)
      );
      toastRef.current?.info?.(`${data.email} vừa rời board!`);
    },
    onVoteAdded: (data: { stickerId: string; email: string }) => {
      setStickers((prev) => prev.map((sticker) => {
        if (sticker.id === data.stickerId) {
          const newVote = { 
            id: `temp-${Date.now()}`, 
            stickerId: data.stickerId, 
            email: data.email, 
            createdAt: new Date() 
          };
          return { ...sticker, votes: [...(sticker.votes || []), newVote] };
        }
        return sticker;
      }));
    },
    onVoteRemoved: (data: { stickerId: string; email: string }) => {
      setStickers((prev) => prev.map((sticker) => {
        if (sticker.id === data.stickerId) {
          return { 
            ...sticker, 
            votes: (sticker.votes || []).filter((vote) => vote.email !== data.email) 
          };
        }
        return sticker;
      }));
    },
         onCommentAdded: (data: Comment) => {
      setStickers((prev) => prev.map((sticker) => {
        if (sticker.id === data.stickerId) {
          return { ...sticker, comments: [...(sticker.comments || []), data] };
        }
        return sticker;
      }));
    },
         onCommentUpdated: (data: Comment) => {
      setStickers((prev) => prev.map((sticker) => {
        if (sticker.id === data.stickerId) {
          return { 
            ...sticker, 
            comments: (sticker.comments || []).map((comment) => 
              comment.id === data.id ? data : comment
            ) 
          };
        }
        return sticker;
      }));
    },
    onCommentDeleted: (data: { id: string }) => {
      setStickers((prev) => prev.map((sticker) => {
        const updatedComments = (sticker.comments || []).filter((comment) => comment.id !== data.id);
        if (updatedComments.length !== (sticker.comments || []).length) {
          return { ...sticker, comments: updatedComments };
        }
        return sticker;
      }));
    },
  }), []); // ✅ NO DEPENDENCIES - COMPLETELY STABLE

  // ✅ Ably setup với optimized handlers - STABLE REFERENCE
  const { 
    voteAdd, 
    voteRemove, 
    commentAdd, 
    commentUpdate, 
    commentDelete, 
    isConnected, 
    isConnecting,
    timerBroadcastStart,
    timerBroadcastPause,
    timerBroadcastResume,
    timerBroadcastStop
  } = useAbly(
    boardId,
    useMemo(() => ({
      ...socketHandlers,
      onStickerCreated: (data: Sticker) => {
        setStickers((prev) => [data, ...prev]);
      },
      onStickerUpdated: (data: Sticker) => {
        setStickers((prev) => prev.map((s) => {
          if (s.id === data.id) {
            return {
              ...data,
              votes: data.votes && data.votes.length >= 0 ? data.votes : s.votes || [],
              comments: data.comments && data.comments.length >= 0 ? data.comments : s.comments || []
            };
          }
          return s;
        }));
      },
      onStickerDeleted: (data: { id: string }) => {
        console.log('[StickerBoard] 🗑️ STICKER DELETED EVENT RECEIVED:', data);
        setStickers((prev) => {
          const beforeCount = prev.length;
          const after = prev.filter((s) => s.id !== data.id);
          console.log('[StickerBoard] Stickers count:', beforeCount, '->', after.length);
          return after;
        });
        toastRef.current?.info?.(`Sticker has been deleted`);
      },
      // Timer event handlers
      onTimerStart: (data: any) => {
        console.log('[StickerBoard] ⏰ Timer start event received:', data);
        onTimerEvent({ type: 'timer:start', data });
      },
      onTimerPause: (data: any) => {
        console.log('[StickerBoard] ⏰ Timer pause event received:', data);
        onTimerEvent({ type: 'timer:pause', data });
      },
      onTimerResume: (data: any) => {
        console.log('[StickerBoard] ⏰ Timer resume event received:', data);
        onTimerEvent({ type: 'timer:resume', data });
      },
      onTimerStop: (data: any) => {
        console.log('[StickerBoard] ⏰ Timer stop event received:', data);
        onTimerEvent({ type: 'timer:stop', data });
      }
         }), [socketHandlers, onTimerEvent]) // ✅ Include onTimerEvent dependency
  );

  // Connect timer with Ably broadcast actions
  useEffect(() => {
    console.log('[StickerBoard] 🔗 Timer broadcast connection effect');
    console.log('[StickerBoard] setBroadcastActions available:', !!setBroadcastActions);
    console.log('[StickerBoard] timerBroadcastStart available:', !!timerBroadcastStart);
    
    if (setBroadcastActions) {
      console.log('[StickerBoard] 🚀 Connecting timer with Ably broadcast actions');
      setBroadcastActions({
        timerBroadcastStart,
        timerBroadcastPause,
        timerBroadcastResume,
        timerBroadcastStop,
      });
    } else {
      console.warn('[StickerBoard] ⚠️ setBroadcastActions not available');
    }
  }, [setBroadcastActions, timerBroadcastStart, timerBroadcastPause, timerBroadcastResume, timerBroadcastStop]);

  // SSE automatically handles sticker events through sseHandlers

  // Memoized sticker refresh để tránh unnecessary calls
  const handleStickerChanged = useCallback(async () => {
    try {
      const res = await fetch(`/api/stickers?boardId=${boardId}`);
      if (res.ok) {
        const data = await res.json();
        setStickers(data);
      }
    } catch (error) {
      console.error('Error refreshing stickers:', error);
    }
  }, [boardId]);

  // Memoized invite link handler
  const handleCopyInviteLink = useCallback(() => {
    const inviteUrl = `${window.location.origin}/boards/${boardId}/invite`;
    navigator.clipboard.writeText(inviteUrl);
    if (toast) toast.success("Invite link copied!");
    else window.alert("Invite link copied!");
  }, [boardId, toast]);

  // Memoized column data để tránh re-computing
  const columnStickers = useMemo(() => {
    return STICKER_TYPES.reduce((acc, col) => {
      acc[col.key] = stickers.filter((s) => s.stickerType === col.key);
      return acc;
    }, {} as Record<string, Sticker[]>);
  }, [stickers]);

  // Memoized members list với role và online status
  const membersWithStatus = useMemo(() => {
    if (!board?.members) return [];
    
    return board.members.map((member) => {
      const presenceMember = presenceMembers.find((p) => p.email === member.email);
      return {
        ...member,
        online: presenceMember?.online || false,
      };
    });
  }, [board?.members, presenceMembers]);

  // Early returns với loading states
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <ComponentSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (!board) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Board not found</p>
        <Link href="/dashboard">
          <Button variant="outline" className="mt-4">
            Quay lại Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header với optimized rendering - responsive layout */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        {/* Board name và description - canh trái */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
            {board.title}
          </h1>
          {board.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {board.description}
            </p>
          )}
        </div>
        
        {/* Control panel - canh phải */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Timer Display - visible to all */}
          <TimerDisplay
            isActive={timerIsActive}
            isPaused={timerIsPaused}
            formattedTime={formattedTime}
            progress={progress}
          />
          
          {/* Timer Controls - only visible to owner */}
          {isOwner && (
            <TimerControls
              boardId={boardId}
              isActive={timerIsActive}
              isPaused={timerIsPaused}
              onStart={startTimer}
              onPause={pauseTimer}
              onResume={resumeTimer}
              onStop={stopTimer}
            />
          )}
          
          <OnlineCounter 
            onlineCount={membersWithStatus.filter(m => m.online).length}
            totalCount={membersWithStatus.length}
            members={membersWithStatus}
          />
          
          <PresenceAvatars members={membersWithStatus} />
          
          <Button 
            onClick={handleCopyInviteLink}
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Invite
          </Button>
        </div>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STICKER_TYPES.map((stickerType) => (
          <StickerColumn
            key={stickerType.key}
            boardId={boardId}
            type={stickerType.key}
            label={stickerType.label}
            stickers={columnStickers[stickerType.key] || []}
            onStickerChanged={handleStickerChanged}
            onVoteAdd={voteAdd}
            onVoteRemove={voteRemove}
            onCommentAdd={commentAdd}
            onCommentUpdate={commentUpdate}
            onCommentDelete={commentDelete}
          />
        ))}
      </div>
    </div>
  );
});

export default StickerBoard; 