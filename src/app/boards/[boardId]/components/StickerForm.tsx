import { useState } from "react";
import { useAppToast } from "@/hooks/useAppToast";
import { Loader2, Plus } from "lucide-react";
import { Sticker } from "@/types/board";
import { motion, AnimatePresence } from "framer-motion";

export default function StickerForm({ boardId, stickerType, onCreated }: {
  boardId: string;
  stickerType: string;
  onCreated: () => void;
}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [justCreated, setJustCreated] = useState(false);
  const toast = useAppToast?.();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError("");
    const resCount = await fetch(`/api/stickers?boardId=${boardId}`);
    let position = 0;
    if (resCount.ok) {
      const allStickers = await resCount.json();
      position = allStickers.filter((s: Sticker) => s.stickerType === stickerType).length;
    }
    const res = await fetch("/api/stickers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, stickerType, boardId, position }),
    });
    if (res.ok) {
      setContent("");
      setJustCreated(true);
      setTimeout(() => setJustCreated(false), 1000);
      onCreated();
      if (toast) toast.success("Tạo sticker thành công!");
      else window.alert("Tạo sticker thành công!");
    } else {
      setError("Tạo sticker thất bại");
      if (toast) toast.error("Tạo sticker thất bại!");
      else window.alert("Tạo sticker thất bại!");
    }
    setLoading(false);
  };

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="flex gap-2 items-center"
      animate={justCreated ? {
        scale: [1, 1.02, 1],
        boxShadow: ["0 0 0 0 rgba(34, 197, 94, 0)", "0 0 0 4px rgba(34, 197, 94, 0.3)", "0 0 0 0 rgba(34, 197, 94, 0)"]
      } : {}}
      transition={{ duration: 0.6 }}
    >
      <motion.input
        className="flex-1 rounded border px-2 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Add a sticker..."
        value={content}
        onChange={e => setContent(e.target.value)}
        disabled={loading}
        whileFocus={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      />
      <motion.button 
        type="submit" 
        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded flex items-center justify-center min-w-[40px] h-[32px]" 
        disabled={loading || !content.trim()}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        animate={loading ? { rotate: 360 } : { rotate: 0 }}
        transition={{ 
          rotate: { duration: 1, repeat: loading ? Infinity : 0, ease: "linear" },
          scale: { duration: 0.2 }
        }}
      >
        <motion.div
          initial={false}
          animate={{ 
            scale: loading ? 1 : justCreated ? [1, 1.2, 1] : 1,
            rotate: justCreated ? [0, 180, 360] : 0
          }}
          transition={{ duration: 0.3 }}
        >
          {loading ? (
            <Loader2 className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </motion.div>
      </motion.button>
      <AnimatePresence>
        {error && (
          <motion.span 
            className="text-red-500 text-xs ml-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.form>
  );
} 