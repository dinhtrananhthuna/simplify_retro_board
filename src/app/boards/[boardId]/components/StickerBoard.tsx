"use client";
import { useEffect, useState, useCallback, useMemo, memo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useAppToast } from "@/hooks/useAppToast";
import { useSocket } from "@/hooks/useSocket";
import { Board, Sticker, PresenceMember, Comment } from "@/types/board";

// Direct imports để debug issue
import StickerColumn from "./StickerColumn";
import PresenceAvatars from "./PresenceAvatars";
import OnlineCounter from "./OnlineCounter";

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
  console.log('[StickerBoard] Component rendering with boardId:', boardId);
  
  const [board, setBoard] = useState<Board | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useAppToast();
  const [presenceMembers, setPresenceMembers] = useState<PresenceMember[]>([]);

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
      // Sử dụng optional chaining thay vì dependency
      if (toast?.error) {
        toast.error('Không thể tải board');
      }
    }
  }, [boardId]); // Chỉ boardId dependency

  const fetchStickers = useCallback(async () => {
    try {
      const res = await fetch(`/api/stickers?boardId=${boardId}`);
      if (res.ok) {
        const data = await res.json();
        setStickers(data);
      }
    } catch (error) {
      console.error('Error fetching stickers:', error);
      // Sử dụng optional chaining thay vì dependency  
      if (toast?.error) {
        toast.error('Không thể tải stickers');
      }
    }
  }, [boardId]); // Chỉ boardId dependency

  // Initial data loading với stable fetch functions
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchBoard(), fetchStickers()]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [fetchBoard, fetchStickers]); // Sử dụng stable fetch functions

     // Memoized socket event handlers với stable references
   const socketHandlers = useMemo(() => ({
     onPresenceList: (data: { members: PresenceMember[] }) => {
       console.log('Received presence list:', data);
       setPresenceMembers(data.members);
     },
     onPresenceJoined: (data: { email: string; role: string }) => {
       console.log('Member joined:', data);
       setPresenceMembers((prev) => {
         const exists = prev.find((m) => m.email === data.email);
         if (exists) {
           return prev.map((m) => m.email === data.email ? { ...m, online: true } : m);
         }
         return [...prev, { ...data, online: true }];
       });
       // Sử dụng function thay vì dependency để tránh infinite loop
       if (toast?.success) {
         toast.success(`${data.email} vừa tham gia board!`);
       }
     },
    onPresenceLeft: (data: { email: string }) => {
      console.log('Member left:', data);
      setPresenceMembers((prev) => 
        prev.map((m) => m.email === data.email ? { ...m, online: false } : m)
      );
      if (toast?.info) {
        toast.info(`${data.email} vừa rời board!`);
      }
    },
    onVoteAdded: (data: { stickerId: string; email: string }) => {
      console.log('Vote added:', data);
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
      if (toast?.success) {
        toast.success(`${data.email} đã vote cho sticker!`);
      }
    },
    onVoteRemoved: (data: { stickerId: string; email: string }) => {
      console.log('Vote removed:', data);
      setStickers((prev) => prev.map((sticker) => {
        if (sticker.id === data.stickerId) {
          return { 
            ...sticker, 
            votes: (sticker.votes || []).filter((vote) => vote.email !== data.email) 
          };
        }
        return sticker;
      }));
      if (toast?.info) {
        toast.info(`${data.email} đã bỏ vote cho sticker!`);
      }
    },
         onCommentAdded: (data: Comment) => {
      console.log('[StickerBoard] Comment added event received:', data);
      setStickers((prev) => {
        const updated = prev.map((sticker) => {
          if (sticker.id === data.stickerId) {
            console.log('[StickerBoard] Adding comment to sticker:', sticker.id);
            return { ...sticker, comments: [...(sticker.comments || []), data] };
          }
          return sticker;
        });
        console.log('[StickerBoard] Updated stickers after comment add:', updated);
        return updated;
      });
      if (toast?.success) {
        toast.success(`${data.email} đã thêm comment!`);
      }
    },
         onCommentUpdated: (data: Comment) => {
      console.log('Comment updated:', data);
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
      if (toast?.info) {
        toast.info(`${data.email} đã cập nhật comment!`);
      }
    },
    onCommentDeleted: (data: { id: string }) => {
      console.log('Comment deleted:', data);
      setStickers((prev) => prev.map((sticker) => {
        const updatedComments = (sticker.comments || []).filter((comment) => comment.id !== data.id);
        if (updatedComments.length !== (sticker.comments || []).length) {
          return { ...sticker, comments: updatedComments };
        }
        return sticker;
      }));
      if (toast?.info) {
        toast.info(`Comment đã được xóa!`);
      }
    },
  }), []); // Loại bỏ toast dependency để tránh infinite loop

  // Socket setup với optimized handlers
  const { socket: socketInstance, voteAdd, voteRemove, commentAdd, commentUpdate, commentDelete } = useSocket(
    boardId,
    socketHandlers
  );

  // Memoized socket sticker listeners để tránh re-subscribing
  useEffect(() => {
    if (!socketInstance) return;
    
    console.log('Setting up socket sticker listeners');
    
    const handleCreated = (data: Sticker) => {
      console.log('Sticker created:', data);
      setStickers((prev) => [...prev, data]);
    };
    
    const handleUpdated = (data: Sticker) => {
      console.log('Sticker updated:', data);
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
    };
    
    const handleDeleted = (data: { id: string }) => {
      console.log('Sticker deleted:', data);
      setStickers((prev) => prev.filter((s) => s.id !== data.id));
    };

    socketInstance.on("sticker:created", handleCreated);
    socketInstance.on("sticker:updated", handleUpdated);
    socketInstance.on("sticker:deleted", handleDeleted);
    
    return () => {
      socketInstance.off("sticker:created", handleCreated);
      socketInstance.off("sticker:updated", handleUpdated);
      socketInstance.off("sticker:deleted", handleDeleted);
    };
  }, [socketInstance]);

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
      {/* Header với optimized rendering */}
      <div className="flex justify-between items-center mb-6">
                 <div>
           <h1 className="text-2xl font-bold">{board.name}</h1>
           {board.description && (
             <p className="text-gray-600 mt-1">{board.description}</p>
           )}
         </div>
        
        <div className="flex items-center gap-4">
          <OnlineCounter 
            onlineCount={presenceMembers.filter(m => m.online).length}
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