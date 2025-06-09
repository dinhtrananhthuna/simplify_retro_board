"use client";
import { useEffect, useState } from "react";
import StickerColumn from "./StickerColumn";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useAppToast } from "@/hooks/useAppToast";
import { useSocket } from "@/hooks/useSocket";
import { Board, Sticker, PresenceMember } from "@/types/board";
import PresenceAvatars from "./PresenceAvatars";
import OnlineCounter from "./OnlineCounter";

const STICKER_TYPES = [
  { key: "went-well", label: "Went Well" },
  { key: "to-improve", label: "To Improve" },
  { key: "action-items", label: "Action Items" },
];

export default function StickerBoard({ boardId }: { boardId: string }) {
  const [board, setBoard] = useState<Board | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useAppToast?.();
  // State realtime presence
  const [presenceMembers, setPresenceMembers] = useState<PresenceMember[]>([]);

  const fetchBoard = async () => {
    const res = await fetch(`/api/boards/${boardId}`);
    if (res.ok) {
      setBoard(await res.json());
    }
  };
  const fetchStickers = async () => {
    const res = await fetch(`/api/stickers?boardId=${boardId}`);
    if (res.ok) {
      setStickers(await res.json());
    }
  };
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchBoard(), fetchStickers()]).finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [boardId]);

  // --- SOCKET REALTIME với PRESENCE, VOTE và COMMENT ---
  const { socket: socketInstance, voteAdd, voteRemove, commentAdd, commentUpdate, commentDelete } = useSocket(
    boardId,
    {
      onPresenceList: (data) => {
        console.log('Received presence list:', data);
        setPresenceMembers(data.members);
      },
      onPresenceJoined: (data) => {
        console.log('Member joined:', data);
        setPresenceMembers((prev) => {
          // Nếu đã có thì update online, chưa có thì thêm mới
          const exists = prev.find((m) => m.email === data.email);
          if (exists) {
            return prev.map((m) => m.email === data.email ? { ...m, online: true } : m);
          }
          return [...prev, { ...data, online: true }];
        });
        if (toast) toast.success(`${data.email} vừa tham gia board!`);
      },
      onPresenceLeft: (data) => {
        console.log('Member left:', data);
        setPresenceMembers((prev) => prev.map((m) => m.email === data.email ? { ...m, online: false } : m));
        if (toast) toast.info(`${data.email} vừa rời board!`);
      },
      onVoteAdded: (data) => {
        console.log('Vote added:', data);
        // Tìm sticker và thêm vote mới
        setStickers((prev) => prev.map((sticker) => {
          if (sticker.id === data.stickerId) {
            const newVote = { id: `temp-${Date.now()}`, stickerId: data.stickerId, email: data.email, createdAt: new Date() };
            return { ...sticker, votes: [...(sticker.votes || []), newVote] };
          }
          return sticker;
        }));
        if (toast) toast.success(`${data.email} đã vote cho sticker!`);
      },
      onVoteRemoved: (data) => {
        console.log('Vote removed:', data);
        // Tìm sticker và xóa vote
        setStickers((prev) => prev.map((sticker) => {
          if (sticker.id === data.stickerId) {
            return { ...sticker, votes: (sticker.votes || []).filter((vote) => vote.email !== data.email) };
          }
          return sticker;
        }));
        if (toast) toast.info(`${data.email} đã bỏ vote cho sticker!`);
      },
      onCommentAdded: (data) => {
        console.log('[StickerBoard] Comment added event received:', data);
        // Tìm sticker và thêm comment mới
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
        if (toast) toast.success(`${data.email} đã thêm comment!`);
      },
      onCommentUpdated: (data) => {
        console.log('Comment updated:', data);
        // Tìm sticker và update comment
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
        if (toast) toast.info(`${data.email} đã cập nhật comment!`);
      },
      onCommentDeleted: (data) => {
        console.log('Comment deleted:', data);
        // Tìm sticker và xóa comment
        setStickers((prev) => prev.map((sticker) => {
          const updatedComments = (sticker.comments || []).filter((comment) => comment.id !== data.id);
          if (updatedComments.length !== (sticker.comments || []).length) {
            return { ...sticker, comments: updatedComments };
          }
          return sticker;
        }));
        if (toast) toast.info(`Comment đã được xóa!`);
      },
    }
  );

  // --- SOCKET REALTIME STICKERS ---
  useEffect(() => {
    if (!socketInstance) return;
    console.log('Setting up socket sticker listeners');
    // Khi có sticker mới
    const handleCreated = (data: Sticker) => {
      console.log('Sticker created:', data);
      setStickers((prev) => [...prev, data]);
    };
    // Khi sticker được cập nhật
    const handleUpdated = (data: Sticker) => {
      console.log('Sticker updated:', data);
      setStickers((prev) => prev.map((s) => s.id === data.id ? data : s));
    };
    // Khi sticker bị xóa
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

  // --- OVERRIDE handleStickerChanged để emit socket ---
  const handleStickerChanged = () => {
    fetchStickers();
  };

  const handleCopyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/boards/${boardId}/invite`;
    navigator.clipboard.writeText(inviteUrl);
    if (toast) toast.success("Invite link copied!");
    else window.alert("Invite link copied!");
  };

  if (loading) return <div>Loading...</div>;
  if (!board) return <div>Board not found</div>;

  // Chuẩn bị dữ liệu cho từng column
  const columnStickers = STICKER_TYPES.reduce((acc, col) => {
    acc[col.key] = stickers.filter((s) => s.stickerType === col.key);
    return acc;
  }, {} as Record<string, Sticker[]>);

  // Lấy danh sách thành viên (kết hợp từ board.members và presenceMembers để có đủ role và trạng thái online)
  const members: { email: string; role: string; online?: boolean }[] = (board.members || []).map((m) => {
    const presence = presenceMembers.find((p) => p.email === m.email);
    return { ...m, online: presence ? presence.online : false };
  });

  console.log('Board members:', board?.members);
  console.log('Presence members:', presenceMembers);
  console.log('Combined members:', members);

  const onlineCount = members.filter(m => m.online).length;
  const totalCount = members.length;

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-4">
        <Link href="/dashboard" className="text-blue-500 hover:underline text-sm">← Back to Boards</Link>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">{board.name}</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <PresenceAvatars members={members} maxVisible={5} />
                      <OnlineCounter
              onlineCount={onlineCount}
              totalCount={totalCount}
              members={members}
              className="relative z-20"
            />
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleCopyInviteLink}
            title="Copy invite link"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 overflow-hidden">
        {STICKER_TYPES.map((col) => (
          <StickerColumn
            key={col.key}
            type={col.key}
            label={col.label}
            stickers={columnStickers[col.key]}
            boardId={boardId}
            onStickerChanged={handleStickerChanged}
            onVoteAdd={voteAdd}
            onVoteRemove={voteRemove}
            onCommentAdd={commentAdd}
            onCommentUpdate={commentUpdate}
            onCommentDelete={commentDelete}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
} 