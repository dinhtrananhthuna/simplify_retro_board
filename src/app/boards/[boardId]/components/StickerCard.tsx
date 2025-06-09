import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import CommentSection from "./CommentSection";
import { Sticker, Vote } from "@/types/board";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
        <motion.form 
          onSubmit={handleEdit} 
          className="space-y-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex gap-2">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Avatar className="w-7 h-7 bg-gradient-to-br from-green-500 to-emerald-600 text-white text-[10px] flex-shrink-0 mt-1 ring-2 ring-white shadow-sm">
                <AvatarFallback>
                  {session?.user?.email?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Cập nhật nội dung sticker..."
                  className="min-h-[80px] text-sm resize-none border-green-200 focus:border-green-400 transition-all duration-200"
                  disabled={loading}
                  maxLength={300}
                  autoFocus
                />
              </motion.div>
              <motion.div 
                className="flex justify-between items-center mt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="text-[10px] text-gray-500">
                  {content.length}/300
                </span>
                <div className="flex gap-1">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-3 text-[10px] border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                      onClick={() => setEditing(false)}
                      disabled={loading}
                    >
                      <XCircle size={10} className="mr-1" />
                      Hủy
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      size="sm"
                      className="h-7 px-3 text-[10px] bg-green-600 hover:bg-green-700 text-white transition-all duration-200"
                      disabled={loading || !content.trim()}
                    >
                      <motion.div
                        animate={loading ? { 
                          rotate: [0, 360],
                          scale: [1, 1.1, 1] 
                        } : { rotate: 0, scale: 1 }}
                        transition={{ 
                          duration: loading ? 0.8 : 0.2,
                          repeat: loading ? Infinity : 0,
                          ease: "easeInOut"
                        }}
                      >
                        <CheckCircle size={10} className="mr-1" />
                      </motion.div>
                      {loading ? "Đang cập nhật..." : "Cập nhật"}
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.form>
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