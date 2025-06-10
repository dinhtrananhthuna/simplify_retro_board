import StickerForm from "./StickerForm";
import StickerCard from "./StickerCard";
import { Sticker } from "@/types/board";

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
  return (
    <div className="bg-muted rounded-lg p-4 min-h-[300px] flex flex-col gap-4">
      <h2 className="font-semibold text-lg mb-2">{label}</h2>
      <StickerForm boardId={boardId} stickerType={type} onCreated={onStickerChanged} />
      <div className="flex flex-col gap-2 mt-2">
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
            .map((sticker) => (
              <div key={sticker.id} className="hover:scale-[1.02] transition-transform duration-200">
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
            ))
        )}
      </div>
    </div>
  );
} 