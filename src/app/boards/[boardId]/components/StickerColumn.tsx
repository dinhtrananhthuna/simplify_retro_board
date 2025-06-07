import StickerForm from "./StickerForm";
import StickerCard from "./StickerCard";
import { motion } from "framer-motion";

export default function StickerColumn({
  type,
  label,
  stickers,
  boardId,
  onStickerChanged,
  loading = false,
}: {
  type: string;
  label: string;
  stickers: any[];
  boardId: string;
  onStickerChanged: () => void;
  loading?: boolean;
}) {
  return (
    <motion.div
      className="bg-muted rounded-lg p-4 min-h-[300px] flex flex-col gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="font-semibold text-lg mb-2">{label}</h2>
      <StickerForm boardId={boardId} stickerType={type} onCreated={onStickerChanged} />
      <div className="flex flex-col gap-2 mt-2">
        {loading ? (
          Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="bg-gray-200 animate-pulse h-16 rounded" />
          ))
        ) : (
          stickers
            .slice()
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
            .map((sticker) => (
              <StickerCard key={sticker.id} sticker={sticker} onChanged={onStickerChanged} />
            ))
        )}
      </div>
    </motion.div>
  );
} 