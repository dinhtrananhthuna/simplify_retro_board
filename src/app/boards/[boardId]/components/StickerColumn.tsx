import StickerForm from "./StickerForm";
import StickerCard from "./StickerCard";

export default function StickerColumn({
  type,
  label,
  stickers,
  boardId,
  onStickerAdded,
}: {
  type: string;
  label: string;
  stickers: any[];
  boardId: string;
  onStickerAdded: () => void;
}) {
  return (
    <div className="bg-muted rounded-lg p-4 min-h-[300px] flex flex-col gap-4">
      <h2 className="font-semibold text-lg mb-2">{label}</h2>
      <StickerForm boardId={boardId} stickerType={type} onCreated={onStickerAdded} />
      <div className="flex flex-col gap-2 mt-2">
        {stickers.map((sticker) => (
          <StickerCard key={sticker.id} sticker={sticker} />
        ))}
      </div>
    </div>
  );
} 