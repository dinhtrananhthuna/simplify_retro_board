"use client";
import { useEffect, useState } from "react";
import StickerColumn from "./StickerColumn";
import StickerForm from "./StickerForm";
import Link from "next/link";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

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

  // Drag & Drop handler
  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;
    // Optimistic UI: cập nhật state stickers ngay
    setStickers((prev) => {
      const next = [...prev];
      const moved = next.find((s) => s.id === draggableId);
      if (!moved) return prev;
      const fromIdx = next.findIndex((s) => s.id === draggableId);
      next.splice(fromIdx, 1);
      moved.stickerType = destination.droppableId;
      next.splice(destination.index, 0, moved);
      // Cập nhật lại position cho tất cả sticker trong column mới
      let pos = 0;
      for (const s of next) {
        if (s.stickerType === destination.droppableId) {
          s.position = pos++;
        }
      }
      return next;
    });
    // Cập nhật lại position cho tất cả sticker trong column đích lên server
    const newColumnStickers = stickers
      .filter((s) =>
        s.id === draggableId
          ? destination.droppableId
          : s.stickerType
        === destination.droppableId)
      .map((s) =>
        s.id === draggableId
          ? { ...s, stickerType: destination.droppableId }
          : s
      );
    // Sắp xếp lại theo vị trí mới
    newColumnStickers.splice(source.index, 1);
    newColumnStickers.splice(destination.index, 0, {
      ...stickers.find((s) => s.id === draggableId),
      stickerType: destination.droppableId,
    });
    // PATCH từng sticker với position mới
    await Promise.all(
      newColumnStickers.map((s, idx) =>
        fetch(`/api/stickers/${s.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stickerType: destination.droppableId,
            position: idx,
          }),
        })
      )
    );
    // Có thể fetch lại để đồng bộ nếu muốn
    // await fetchStickers();
  };

  if (loading) return <div>Loading...</div>;
  if (!board) return <div>Board not found</div>;

  // Chuẩn bị dữ liệu cho từng column
  const columnStickers = STICKER_TYPES.reduce((acc, col) => {
    acc[col.key] = stickers.filter((s) => s.stickerType === col.key);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div>
      <div className="mb-2">
        <Link href="/dashboard" className="text-blue-500 hover:underline text-sm">← Back to Boards</Link>
      </div>
      <h1 className="text-2xl font-bold mb-4">{board.title}</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STICKER_TYPES.map((col) => (
            <Droppable droppableId={col.key} key={col.key}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="min-w-[320px] w-full">
                  <StickerColumn
                    type={col.key}
                    label={col.label}
                    stickers={columnStickers[col.key]}
                    boardId={boardId}
                    onStickerChanged={handleStickerChanged}
                    Draggable={Draggable}
                  />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
} 