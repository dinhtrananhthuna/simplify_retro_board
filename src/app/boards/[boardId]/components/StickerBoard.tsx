"use client";
import { useEffect, useState } from "react";
import StickerColumn from "./StickerColumn";
import StickerForm from "./StickerForm";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useAppToast } from "@/hooks/useAppToast";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSocket } from "@/hooks/useSocket";

const STICKER_TYPES = [
  { key: "went-well", label: "Went Well" },
  { key: "to-improve", label: "To Improve" },
  { key: "action-items", label: "Action Items" },
];

export default function StickerBoard({ boardId }: { boardId: string }) {
  const [board, setBoard] = useState<any>(null);
  const [stickers, setStickers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useAppToast?.();
  const socket = useSocket(boardId);
  // State realtime presence
  const [presenceMembers, setPresenceMembers] = useState<Array<{ email: string; role: string; online: boolean }>>([]);

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

  // --- SOCKET REALTIME ---
  useEffect(() => {
    if (!socket) return;
    // Khi có sticker mới
    const handleCreated = (data: any) => {
      setStickers((prev) => [...prev, data]);
    };
    // Khi sticker được cập nhật
    const handleUpdated = (data: any) => {
      setStickers((prev) => prev.map((s) => s.id === data.id ? data : s));
    };
    // Khi sticker bị xóa
    const handleDeleted = (data: { id: string }) => {
      setStickers((prev) => prev.filter((s) => s.id !== data.id));
    };
    socket.on("sticker:created", handleCreated);
    socket.on("sticker:updated", handleUpdated);
    socket.on("sticker:deleted", handleDeleted);
    return () => {
      socket.off("sticker:created", handleCreated);
      socket.off("sticker:updated", handleUpdated);
      socket.off("sticker:deleted", handleDeleted);
    };
  }, [socket]);

  // --- SOCKET REALTIME PRESENCE ---
  useSocket(
    boardId,
    {
      onPresenceList: (data) => {
        setPresenceMembers(data.members);
      },
      onPresenceJoined: (data) => {
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
        setPresenceMembers((prev) => prev.map((m) => m.email === data.email ? { ...m, online: false } : m));
        if (toast) toast.info(`${data.email} vừa rời board!`);
      },
    }
  );

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
  }, {} as Record<string, any[]>);

  // Lấy danh sách thành viên (kết hợp từ board.members và presenceMembers để có đủ role và trạng thái online)
  const members: { email: string; role: string; online?: boolean }[] = (board.members || []).map((m: any) => {
    const presence = presenceMembers.find((p) => p.email === m.email);
    return { ...m, online: presence ? presence.online : false };
  });

  // Hiển thị tối đa 5 avatar, còn lại gom vào +N
  const MAX_AVATAR = 5;
  const visibleMembers = members.slice(0, MAX_AVATAR);
  const extraMembers = members.length > MAX_AVATAR ? members.slice(MAX_AVATAR) : [];

  return (
    <div>
      <div className="mb-2">
        <Link href="/dashboard" className="text-blue-500 hover:underline text-sm">← Back to Boards</Link>
      </div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{board.title}</h1>
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <div className="flex items-center gap-1">
              {visibleMembers.map((m) => (
                <Tooltip key={m.email}>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <Avatar
                        className={
                          m.role === "owner"
                            ? "bg-yellow-400 text-black border border-yellow-500"
                            : "bg-gray-500 text-white border border-gray-400"
                        }
                      >
                        <AvatarFallback>
                          {m.email?.[0]?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      {/* Chấm trạng thái online/offline */}
                      <span
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${m.online ? "bg-green-500" : "bg-gray-400"}`}
                        title={m.online ? "Đang online" : "Đang offline"}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    <div className="font-semibold">{m.email}</div>
                    <div className="mt-1">
                      <span className={m.role === "owner" ? "text-yellow-600 font-bold" : "text-gray-600"}>
                        {m.role === "owner" ? "Owner" : "Member"}
                      </span>
                    </div>
                    <div className="mt-1">
                      <span className={m.online ? "text-green-600" : "text-gray-500"}>
                        {m.online ? "Đang online" : "Đang offline"}
                      </span>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
              {extraMembers.length > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="bg-gray-700 text-white border border-gray-400">
                      <AvatarFallback>+{extraMembers.length}</AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs max-w-[220px]">
                    <div className="font-semibold mb-1">Other members:</div>
                    <ul className="list-disc pl-4">
                      {extraMembers.map((m) => (
                        <li key={m.email}>
                          {m.email} <span className={m.role === "owner" ? "text-yellow-600 font-bold" : "text-gray-600"}>({m.role === "owner" ? "Owner" : "Member"})</span>
                          <span className={m.online ? "ml-2 text-green-600" : "ml-2 text-gray-500"}>{m.online ? "● online" : "● offline"}</span>
                        </li>
                      ))}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STICKER_TYPES.map((col) => (
          <StickerColumn
            key={col.key}
            type={col.key}
            label={col.label}
            stickers={columnStickers[col.key]}
            boardId={boardId}
            onStickerChanged={handleStickerChanged}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
} 