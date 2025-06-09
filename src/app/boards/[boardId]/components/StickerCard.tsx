import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import CommentSection from "./CommentSection";
import { Sticker, Vote } from "@/types/board";
import { motion } from "framer-motion";

function truncateEmail(email: string, max = 18) {
  if (!email) return "";
  return email.length > max ? email.slice(0, max) + "..." : email;
}

export default function StickerCard({ 
  sticker, 
  onChanged, 
  onVoteAdd, 
  onVoteRemove,
  onCommentAdd,
  onCommentUpdate,
  onCommentDelete
}: { 
  sticker: Sticker;
  onChanged: () => void;
  onVoteAdd: (stickerId: string) => void;
  onVoteRemove: (stickerId: string) => void;
  onCommentAdd: (stickerId: string, content: string) => void;
  onCommentUpdate: (commentId: string, content: string) => void;
  onCommentDelete: (commentId: string) => void;
}) {
  const { data: session } = useSession();
  const isOwner = session?.user?.email === sticker.createdBy;
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(sticker.content);
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // Thông tin vote/comment từ sticker data
  const votes = sticker.votes || [];
  const voteCount = votes.length;
  const comments = sticker.comments || [];
  const commentCount = comments.length;
  
  // Animation states for real-time updates
  const [isUpdated, setIsUpdated] = useState(false);
  const [prevVoteCount, setPrevVoteCount] = useState(voteCount);
  const [prevCommentCount, setPrevCommentCount] = useState(commentCount);
  
  // Kiểm tra user hiện tại đã vote chưa
  const currentUserEmail = session?.user?.email;
  const hasVoted = votes.some((vote: Vote) => vote.email === currentUserEmail);

  // Detect real-time changes and trigger animations
  useEffect(() => {
    if (voteCount !== prevVoteCount || commentCount !== prevCommentCount) {
      setIsUpdated(true);
      const timer = setTimeout(() => setIsUpdated(false), 1000);
      
      setPrevVoteCount(voteCount);
      setPrevCommentCount(commentCount);
      
      return () => clearTimeout(timer);
    }
  }, [voteCount, commentCount, prevVoteCount, prevCommentCount]);

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

  const handleVote = () => {
    if (!currentUserEmail) return;
    
    if (hasVoted) {
      onVoteRemove(sticker.id);
    } else {
      onVoteAdd(sticker.id);
    }
  };

  const handleCommentToggle = () => {
    setShowComments(!showComments);
  };

  const handleCommentAdd = (content: string) => {
    console.log("[StickerCard] Adding comment to sticker:", sticker.id, "content:", content);
    onCommentAdd(sticker.id, content);
  };

  return (
    <motion.div
      className="relative bg-gray-50 rounded-lg shadow p-3 text-sm flex flex-col gap-2 border border-gray-200 group min-h-[90px] cursor-pointer"
      animate={{
        scale: isUpdated ? [1, 1.02, 1] : 1,
        borderColor: isUpdated ? ["#e5e7eb", "#3b82f6", "#e5e7eb"] : "#e5e7eb",
        boxShadow: isUpdated 
          ? ["0 1px 3px 0 rgb(0 0 0 / 0.1)", "0 10px 15px -3px rgb(0 0 0 / 0.1)", "0 1px 3px 0 rgb(0 0 0 / 0.1)"]
          : "0 1px 3px 0 rgb(0 0 0 / 0.1)"
      }}
      transition={{ 
        duration: 0.6,
        ease: "easeInOut"
      }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
        transition: { duration: 0.2 }
      }}
    >
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
              <motion.button
                onClick={handleVote}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                  hasVoted 
                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={hasVoted ? 'Bỏ vote' : 'Vote cho sticker này'}
                disabled={!currentUserEmail}
                whileTap={{ scale: 0.95 }}
                animate={hasVoted ? {
                  scale: [1, 1.1, 1],
                  backgroundColor: hasVoted ? ["#dbeafe", "#3b82f6", "#dbeafe"] : "#f3f4f6"
                } : {}}
                transition={{ duration: 0.3 }}
              >
                <motion.span
                  animate={{ rotate: hasVoted ? [0, 15, 0] : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  👍
                </motion.span>
                <motion.span
                  key={voteCount} // Re-animate when count changes
                  initial={{ scale: 1.2, color: "#3b82f6" }}
                  animate={{ scale: 1, color: hasVoted ? "#3b82f6" : "#6b7280" }}
                  transition={{ duration: 0.4 }}
                >
                  {voteCount}
                </motion.span>
              </motion.button>
              <motion.button
                onClick={handleCommentToggle}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                  showComments 
                    ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={showComments ? 'Ẩn comments' : 'Hiển thị comments'}
                whileTap={{ scale: 0.95 }}
                animate={showComments ? {
                  backgroundColor: ["#dcfce7", "#16a34a", "#dcfce7"]
                } : {}}
                transition={{ duration: 0.3 }}
              >
                <motion.span
                  animate={{ rotate: showComments ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  💬
                </motion.span>
                <motion.span
                  key={commentCount} // Re-animate when count changes
                  initial={{ scale: 1.2, color: "#16a34a" }}
                  animate={{ scale: 1, color: showComments ? "#16a34a" : "#6b7280" }}
                  transition={{ duration: 0.4 }}
                >
                  {commentCount}
                </motion.span>
              </motion.button>
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
      
      <CommentSection
        comments={comments}
        onCommentAdd={handleCommentAdd}
        onCommentUpdate={onCommentUpdate}
        onCommentDelete={onCommentDelete}
        isOpen={showComments}
      />
    </motion.div>
  );
} 