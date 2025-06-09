import StickerForm from "./StickerForm";
import StickerCard from "./StickerCard";
import { motion, AnimatePresence } from "framer-motion";
import { Sticker } from "@/types/board";

// Animation variants for stickers
const stickerVariants = {
  initial: { 
    opacity: 0, 
    scale: 0.8,
    y: -20,
    rotateX: -15
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      duration: 0.5
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    y: 20,
    rotateX: 15,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

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
    <motion.div
      className="bg-muted rounded-lg p-4 min-h-[300px] flex flex-col gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="font-semibold text-lg mb-2">{label}</h2>
      <StickerForm boardId={boardId} stickerType={type} onCreated={onStickerChanged} />
      <motion.div 
        className="flex flex-col gap-2 mt-2"
        variants={containerVariants}
        animate="animate"
      >
        {loading ? (
          Array.from({ length: 2 }).map((_, idx) => (
            <motion.div 
              key={idx} 
              className="bg-gray-200 animate-pulse h-16 rounded"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            />
          ))
        ) : (
          <AnimatePresence mode="popLayout">
            {stickers
              .slice()
              .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
              .map((sticker, index) => (
                <motion.div
                  key={sticker.id}
                  variants={stickerVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  layout
                  custom={index}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  style={{ 
                    transformOrigin: "center",
                    transformStyle: "preserve-3d"
                  }}
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
                </motion.div>
              ))}
          </AnimatePresence>
        )}
      </motion.div>
    </motion.div>
  );
} 