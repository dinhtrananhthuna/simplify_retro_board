"use client";
import { useEffect, useState } from "react";
import StickerColumn from "./StickerColumn";
import StickerForm from "./StickerForm";
import Link from "next/link";

const STICKER_TYPES = [
  { key: "went-well", label: "Went Well" },
  { key: "to-improve", label: "To Improve" },
  { key: "action-items", label: "Action Items" },
];

export default function StickerBoard({ boardId }: { boardId: string }) {
  const [board, setBoard] = useState<any>(null);
  const [stickers, setStickers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div>Loading...</div>;
  if (!board) return <div>Board not found</div>;

  return (
    <div>
      <div className="mb-2">
        <Link href="/dashboard" className="text-blue-500 hover:underline text-sm">← Back to Boards</Link>
      </div>
      <h1 className="text-2xl font-bold mb-4">{board.title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STICKER_TYPES.map((col) => (
          <StickerColumn
            key={col.key}
            type={col.key}
            label={col.label}
            stickers={stickers.filter((s) => s.stickerType === col.key)}
            boardId={boardId}
            onStickerChanged={handleStickerChanged}
          />
        ))}
      </div>
    </div>
  );
} 