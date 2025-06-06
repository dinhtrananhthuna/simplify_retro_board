import { useState } from "react";

export default function StickerForm({ boardId, stickerType, onCreated }: {
  boardId: string;
  stickerType: string;
  onCreated: () => void;
}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/stickers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, stickerType, boardId }),
    });
    if (res.ok) {
      setContent("");
      onCreated();
    } else {
      setError("Tạo sticker thất bại");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <input
        className="flex-1 rounded border px-2 py-1 text-sm"
        placeholder="Add a sticker..."
        value={content}
        onChange={e => setContent(e.target.value)}
        disabled={loading}
      />
      <button type="submit" className="btn btn-primary" disabled={loading || !content.trim()}>
        {loading ? "Adding..." : "+"}
      </button>
      {error && <span className="text-red-500 text-xs ml-2">{error}</span>}
    </form>
  );
} 