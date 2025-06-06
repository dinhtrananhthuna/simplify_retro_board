import StickerForm from "./StickerForm";
import StickerCard from "./StickerCard";

export default function StickerColumn({
  type,
  label,
  stickers,
  boardId,
  onStickerChanged,
  Draggable,
}: {
  type: string;
  label: string;
  stickers: any[];
  boardId: string;
  onStickerChanged: () => void;
  Draggable: any;
}) {
  return (
    <div className="bg-muted rounded-lg p-4 min-h-[300px] flex flex-col gap-4">
      <h2 className="font-semibold text-lg mb-2">{label}</h2>
      <StickerForm boardId={boardId} stickerType={type} onCreated={onStickerChanged} />
      <div className="flex flex-col gap-2 mt-2">
        {stickers
          .slice()
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
          .map((sticker, idx) => (
            <Draggable draggableId={sticker.id} index={idx} key={sticker.id}>
              {(provided: any) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                >
                  <StickerCard sticker={sticker} onChanged={onStickerChanged} />
                </div>
              )}
            </Draggable>
          ))}
      </div>
    </div>
  );
} 