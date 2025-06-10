import StickerForm from "./StickerForm";
import StickerCard from "./StickerCard";
import { Sticker } from "@/types/board";
import { useState, useEffect, useMemo, useRef } from "react";

export default function StickerColumn({
  type,
  label,
  stickers,
  boardId,
  onStickerChanged,
  onVoteAdd,
  onVoteRemove,
  onCommentAdd,
  onCommentUpdate,
  onCommentDelete,
  loading = false,
}: {
  type: string;
  label: string;
  stickers: Sticker[];
  boardId: string;
  onStickerChanged: () => void;
  onVoteAdd: (stickerId: string) => void;
  onVoteRemove: (stickerId: string) => void;
  onCommentAdd: (stickerId: string, content: string) => void;
  onCommentUpdate: (commentId: string, content: string) => void;
  onCommentDelete: (commentId: string) => void;
  loading?: boolean;
}) {
  const [newStickers, setNewStickers] = useState<Set<string>>(new Set());
  const previousStickerIdsRef = useRef<Set<string>>(new Set());

  // Create stable stickerIds to avoid infinite loops
  const stickerIds = useMemo(() => stickers.map(s => s.id), [stickers]);

  // Track new stickers for animation using ref to avoid dependency issues
  useEffect(() => {
    if (stickers.length === 0) {
      previousStickerIdsRef.current = new Set();
      return;
    }

    const currentIds = new Set(stickerIds);
    const previousIds = previousStickerIdsRef.current;
    
    // Chỉ tìm stickers thực sự mới (không có trong previous)
    if (previousIds.size > 0) {
      const addedIds = new Set([...currentIds].filter(id => !previousIds.has(id)));
      
      if (addedIds.size > 0) {
        setNewStickers(addedIds);
        
        // Clear animation class sau khi animation hoàn thành
        const timer = setTimeout(() => {
          setNewStickers(new Set());
        }, 650); // Slightly longer than animation duration
        
        // Update ref for next comparison
        previousStickerIdsRef.current = currentIds;
        
        return () => clearTimeout(timer);
      }
    }
    
    // Update ref for next comparison
    previousStickerIdsRef.current = currentIds;
  }, [stickerIds, stickers.length]); // Clean dependencies without ref

  // Reset khi component unmount
  useEffect(() => {
    return () => {
      setNewStickers(new Set());
      previousStickerIdsRef.current = new Set();
    };
  }, []);
  return (
    <div className="bg-muted rounded-lg p-4 min-h-[300px] flex flex-col gap-4">
      <h2 className="font-semibold text-lg mb-2">{label}</h2>
      <StickerForm boardId={boardId} stickerType={type} onCreated={onStickerChanged} />
      <div className="sticker-list">
        {loading ? (
          Array.from({ length: 2 }).map((_, idx) => (
            <div 
              key={idx} 
              className="bg-gray-200 animate-pulse h-16 rounded"
            />
          ))
        ) : (
          stickers
            .slice()
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
            .map((sticker) => {
              const isNew = newStickers.has(sticker.id);
              
              return (
                <div 
                  key={sticker.id} 
                  className={`sticker-card ${isNew ? 'sticker-entering' : ''}`}
                >
                  <StickerCard 
                    sticker={sticker} 
                    onChanged={onStickerChanged}
                    onVoteAdd={onVoteAdd}
                    onVoteRemove={onVoteRemove}
                    onCommentAdd={onCommentAdd}
                    onCommentUpdate={onCommentUpdate}
                    onCommentDelete={onCommentDelete}
                  />
                </div>
              );
            })
        )}
      </div>
    </div>
  );
} 