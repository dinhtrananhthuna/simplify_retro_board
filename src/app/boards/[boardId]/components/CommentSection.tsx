"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Pencil, Trash2, CheckCircle, XCircle, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";

function truncateEmail(email: string, max = 15) {
  if (!email) return "";
  return email.length > max ? email.slice(0, max) + "..." : email;
}

function formatTime(dateString: string | Date) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return "vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)} giờ trước`;
  return `${Math.floor(diffMins / 1440)} ngày trước`;
}

interface Comment {
  id: string;
  content: string;
  email: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface CommentSectionProps {
  comments: Comment[];
  onCommentAdd: (content: string) => void;
  onCommentUpdate: (id: string, content: string) => void;
  onCommentDelete: (id: string) => void;
  isOpen: boolean;
}

export default function CommentSection({
  comments,
  onCommentAdd,
  onCommentUpdate,
  onCommentDelete,
  isOpen,
}: CommentSectionProps) {
  const { data: session } = useSession();
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);

  const currentUserEmail = session?.user?.email;

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    console.log("[CommentSection] Adding comment:", newComment.trim());
    setLoading(true);
    try {
      await onCommentAdd(newComment.trim());
      console.log("[CommentSection] Comment add request sent");
      setNewComment("");
      setIsAddingComment(false);
    } catch (error) {
      console.error("[CommentSection] Failed to add comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAdd = () => {
    setNewComment("");
    setIsAddingComment(false);
  };

  const handleStartAdd = () => {
    setIsAddingComment(true);
  };

  const handleEditComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim() || !editingId) return;
    
    setLoading(true);
    try {
      await onCommentUpdate(editingId, editContent.trim());
      setEditingId(null);
      setEditContent("");
    } catch (error) {
      console.error("Failed to update comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa comment này?")) return;
    
    setLoading(true);
    try {
      await onCommentDelete(id);
    } catch (error) {
      console.error("Failed to delete comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="mt-2 border-t border-gray-200 pt-2"
    >
      <div className="space-y-2 max-h-48 overflow-y-auto">
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="bg-gray-50 rounded p-2 text-xs"
            >
              <div className="flex items-start gap-2">
                <Avatar className="w-5 h-5 bg-gray-400 text-white text-[8px]">
                  <AvatarFallback>
                    {comment.email?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-700 truncate max-w-[80px]" title={comment.email}>
                      {truncateEmail(comment.email)}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500 text-[10px]">
                        {formatTime(comment.createdAt)}
                      </span>
                      {currentUserEmail === comment.email && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEdit(comment)}
                            className="p-1 text-blue-500 hover:bg-blue-100 rounded"
                            title="Edit"
                            disabled={loading}
                          >
                            <Pencil size={10} />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-1 text-red-500 hover:bg-red-100 rounded"
                            title="Delete"
                            disabled={loading}
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {editingId === comment.id ? (
                    <form onSubmit={handleEditComment} className="space-y-1">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[60px] text-xs resize-none"
                        placeholder="Cập nhật comment..."
                        disabled={loading}
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <Button
                          type="submit"
                          size="sm"
                          className="h-6 px-2 text-[10px] bg-green-600 hover:bg-green-700 text-white"
                          disabled={loading || !editContent.trim()}
                        >
                          <CheckCircle size={10} className="mr-1" />
                          Cập nhật
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-[10px] border-gray-300 text-gray-700 hover:bg-gray-100"
                          onClick={cancelEdit}
                          disabled={loading}
                        >
                          <XCircle size={10} className="mr-1" />
                          Hủy
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="text-gray-800 break-words whitespace-pre-line">
                      {comment.content}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {comments.length === 0 && (
          <div className="text-center text-gray-500 text-xs py-4">
            Chưa có comment nào. Hãy là người đầu tiên!
          </div>
        )}
      </div>

      {/* Add Comment Form */}
      <div className="mt-2 pt-2 border-t border-gray-100">
        {!isAddingComment ? (
          <div className="flex gap-2 items-center">
            <Avatar className="w-5 h-5 bg-blue-500 text-white text-[8px] flex-shrink-0">
              <AvatarFallback>
                {currentUserEmail?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <Button
              onClick={handleStartAdd}
              variant="outline"
              size="sm"
              className="h-7 px-3 text-xs flex-1 justify-start border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              disabled={!currentUserEmail}
            >
              Thêm comment...
            </Button>
          </div>
        ) : (
          <form onSubmit={handleAddComment}>
            <div className="flex gap-2">
              <Avatar className="w-5 h-5 bg-blue-500 text-white text-[8px] flex-shrink-0 mt-1">
                <AvatarFallback>
                  {currentUserEmail?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Thêm comment..."
                  className="min-h-[60px] text-xs resize-none"
                  disabled={loading || !currentUserEmail}
                  maxLength={500}
                  autoFocus
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] text-gray-500">
                    {newComment.length}/500
                  </span>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-[10px] border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      onClick={handleCancelAdd}
                      disabled={loading}
                    >
                      <XCircle size={10} className="mr-1" />
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="h-6 px-2 text-[10px] bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={loading || !newComment.trim() || !currentUserEmail}
                    >
                      <Send size={10} className="mr-1" />
                      Gửi
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
} 