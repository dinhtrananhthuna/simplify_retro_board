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

  // Lấy danh sách thành viên
  const members: { email: string; role: string }[] = board.members || [];

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
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    <div className="font-semibold">{m.email}</div>
                    <div className="mt-1">
                      <span className={m.role === "owner" ? "text-yellow-600 font-bold" : "text-gray-600"}>
                        {m.role === "owner" ? "Owner" : "Member"}
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