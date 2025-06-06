import { useSession } from "next-auth/react";
import { useState } from "react";
import { Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";

function truncateEmail(email: string, max = 18) {
  if (!email) return "";
  return email.length > max ? email.slice(0, max) + "..." : email;
}

export default function StickerCard({ sticker, onChanged }: { sticker: any, onChanged: () => void }) {
  const { data: session } = useSession();
  const isOwner = session?.user?.email === sticker.createdBy;
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(sticker.content);
  const [loading, setLoading] = useState(false);

  // Giả lập số vote/comment (cần fetch thực tế nếu có API)
  const voteCount = sticker.votes?.length ?? 0;
  const commentCount = sticker.comments?.length ?? 0;

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xóa sticker này?")) return;
    setLoading(true);
    await fetch(`/api/stickers/${sticker.id}`, { method: "DELETE" });
    setLoading(false);
    onChanged();
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/stickers/${sticker.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, stickerType: sticker.stickerType }),
    });
    setLoading(false);
    setEditing(false);
    onChanged();
  };

  return (
    <div className="relative bg-gray-50 rounded-lg shadow p-3 text-sm flex flex-col gap-2 border border-gray-200 group min-h-[90px]">
      {/* Nút Edit/Delete */}
      {isOwner && !editing && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
          <button className="p-1 text-blue-500 hover:bg-blue-100 rounded" onClick={() => setEditing(true)} title="Edit">
            <Pencil size={16} />
          </button>
          <button className="p-1 text-red-500 hover:bg-red-100 rounded" onClick={handleDelete} disabled={loading} title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      )}
      {editing ? (
        <form onSubmit={handleEdit} className="flex flex-col gap-1">
          <textarea
            className="rounded border px-2 py-1 text-sm text-black"
            value={content}
            onChange={e => setContent(e.target.value)}
            disabled={loading}
            autoFocus
          />
          <div className="flex gap-2 mt-1">
            <button
              type="submit"
              className="p-1 text-green-600 hover:bg-green-100 rounded"
              title="Cập nhật"
              disabled={loading || !content.trim()}
            >
              <CheckCircle size={20} />
            </button>
            <button
              type="button"
              className="p-1 text-gray-500 hover:bg-gray-200 rounded"
              onClick={() => setEditing(false)}
              title="Hủy"
              disabled={loading}
            >
              <XCircle size={20} />
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="font-medium break-words whitespace-pre-line text-black">{sticker.content}</div>
          <div className="flex justify-between items-center text-xs mt-1 text-black">
            <div className="flex gap-3">
              <span className="flex items-center gap-1">👍 {voteCount}</span>
              <span className="flex items-center gap-1">💬 {commentCount}</span>
            </div>
            <span
              className="truncate max-w-[120px] block text-black cursor-pointer text-right"
              title={sticker.createdBy}
            >
              {truncateEmail(sticker.createdBy)}
            </span>
          </div>
        </>
      )}
    </div>
  );
} 