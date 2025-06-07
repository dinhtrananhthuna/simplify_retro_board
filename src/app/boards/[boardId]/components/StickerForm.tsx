import { useState } from "react";
import { useAppToast } from "@/hooks/useAppToast";
import { Loader2 } from "lucide-react";

export default function StickerForm({ boardId, stickerType, onCreated }: {
  boardId: string;
  stickerType: string;
  onCreated: () => void;
}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
      position = allStickers.filter((s: any) => s.stickerType === stickerType).length;
    }
    const res = await fetch("/api/stickers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, stickerType, boardId, position }),
    });
    if (res.ok) {
      setContent("");
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
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <input
        className="flex-1 rounded border px-2 py-1 text-sm bg-background"
        placeholder="Add a sticker..."
        value={content}
        onChange={e => setContent(e.target.value)}
        disabled={loading}
      />
      <button type="submit" className="btn btn-primary flex items-center justify-center" disabled={loading || !content.trim()}>
        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "+"}
      </button>
      {error && <span className="text-red-500 text-xs ml-2">{error}</span>}
    </form>
  );
} 