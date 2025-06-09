"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Pencil, Trash2, CheckCircle, XCircle, Send, MessageCircle, Sparkles } from "lucide-react";
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

// Animation variants
const containerVariants = {
  hidden: { 
    opacity: 0, 
    height: 0, 
    scale: 0.95 
  },
  visible: { 
    opacity: 1, 
    height: "auto", 
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  },
  exit: { 
    opacity: 0, 
    height: 0, 
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const commentVariants = {
  hidden: { 
    opacity: 0, 
    y: 20, 
    scale: 0.9,
    rotateX: -15
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    rotateX: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
      duration: 0.5
    }
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    scale: 0.9,
    rotateX: 15,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const formVariants = {
  hidden: { 
    opacity: 0, 
    y: 20, 
    scale: 0.95 
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      duration: 0.6
    }
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    scale: 0.95,
    transition: {
      duration: 0.3
    }
  }
};

const buttonVariants = {
  idle: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { duration: 0.2 }
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

const iconVariants = {
  idle: { rotate: 0 },
  hover: { 
    rotate: 5,
    transition: { duration: 0.2 }
  },
  active: { 
    rotate: 360,
    transition: { duration: 0.5, ease: "easeInOut" }
  }
};

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
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUserEmail = session?.user?.email;

  // Reset just added state after animation
  useEffect(() => {
    if (justAdded) {
      const timer = setTimeout(() => setJustAdded(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [justAdded]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    console.log("[CommentSection] Adding comment:", newComment.trim());
    setLoading(true);
    setIsSubmitting(true);
    try {
      await onCommentAdd(newComment.trim());
      console.log("[CommentSection] Comment add request sent");
      setJustAdded(Date.now().toString()); // Temporary ID for animation
      setNewComment("");
      setIsAddingComment(false);
    } catch (error) {
      console.error("[CommentSection] Failed to add comment:", error);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
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
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="mt-2 border-t border-gray-200 pt-2 overflow-hidden"
    >
      <motion.div className="space-y-2 max-h-48 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              variants={commentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              custom={index}
              className={`bg-gray-50 rounded-lg p-3 text-xs border transition-all duration-300 ${
                justAdded === comment.id ? 'ring-2 ring-green-400 bg-green-50' : 'border-gray-100'
              }`}
              style={{
                transformOrigin: "top center"
              }}
            >
              <div className="flex items-start gap-2">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 20,
                    delay: index * 0.05
                  }}
                >
                  <Avatar className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 text-white text-[9px] ring-2 ring-white shadow-sm">
                    <AvatarFallback>
                      {comment.email?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <motion.div 
                    className="flex items-center justify-between mb-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 + 0.1 }}
                  >
                    <span className="font-medium text-gray-700 truncate max-w-[100px]" title={comment.email}>
                      {truncateEmail(comment.email)}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500 text-[10px]">
                        {formatTime(comment.createdAt)}
                      </span>
                      {currentUserEmail === comment.email && (
                        <motion.div 
                          className="flex gap-1"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 + 0.2 }}
                        >
                          <motion.button
                            variants={buttonVariants}
                            initial="idle"
                            whileHover="hover"
                            whileTap="tap"
                            onClick={() => startEdit(comment)}
                            className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-md transition-colors duration-200"
                            title="Edit"
                            disabled={loading}
                          >
                            <motion.div variants={iconVariants}>
                              <Pencil size={10} />
                            </motion.div>
                          </motion.button>
                          <motion.button
                            variants={buttonVariants}
                            initial="idle"
                            whileHover="hover"
                            whileTap="tap"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition-colors duration-200"
                            title="Delete"
                            disabled={loading}
                          >
                            <motion.div variants={iconVariants}>
                              <Trash2 size={10} />
                            </motion.div>
                          </motion.button>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                  
                  <AnimatePresence mode="wait">
                    {editingId === comment.id ? (
                      <motion.form
                        key="edit-form"
                        variants={formVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onSubmit={handleEditComment}
                        className="space-y-2"
                      >
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-[60px] text-xs resize-none border-blue-200 focus:border-blue-400 transition-colors duration-200"
                            placeholder="Cập nhật comment..."
                            disabled={loading}
                            autoFocus
                          />
                        </motion.div>
                        <motion.div 
                          className="flex gap-1"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                              type="submit"
                              size="sm"
                              className="h-7 px-3 text-[10px] bg-green-600 hover:bg-green-700 text-white transition-all duration-200"
                              disabled={loading || !editContent.trim()}
                            >
                              <motion.div
                                animate={loading ? { rotate: 360 } : { rotate: 0 }}
                                transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
                              >
                                <CheckCircle size={10} className="mr-1" />
                              </motion.div>
                              {loading ? "Đang cập nhật..." : "Cập nhật"}
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 px-3 text-[10px] border-gray-300 text-gray-700 hover:bg-gray-100 transition-all duration-200"
                              onClick={cancelEdit}
                              disabled={loading}
                            >
                              <XCircle size={10} className="mr-1" />
                              Hủy
                            </Button>
                          </motion.div>
                        </motion.div>
                      </motion.form>
                    ) : (
                      <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-gray-800 break-words whitespace-pre-line leading-relaxed"
                      >
                        {comment.content}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        <AnimatePresence>
          {comments.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="text-center text-gray-500 text-xs py-6 border-2 border-dashed border-gray-200 rounded-lg"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              >
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              </motion.div>
              <div>Chưa có comment nào. Hãy là người đầu tiên!</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Add Comment Form */}
      <motion.div 
        className="mt-3 pt-3 border-t border-gray-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <AnimatePresence mode="wait">
          {!isAddingComment ? (
            <motion.div
              key="add-button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex gap-2 items-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
              >
                <Avatar className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-[9px] flex-shrink-0 ring-2 ring-white shadow-sm">
                  <AvatarFallback>
                    {currentUserEmail?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <motion.div
                className="flex-1"
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
              >
                <Button
                  onClick={handleStartAdd}
                  variant="outline"
                  size="sm"
                  className="h-8 px-4 text-xs flex-1 w-full justify-start border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-800 hover:border-gray-400 transition-all duration-200"
                  disabled={!currentUserEmail}
                >
                  <motion.div
                    initial={{ opacity: 0.7 }}
                    whileHover={{ opacity: 1 }}
                    className="flex items-center"
                  >
                    <Sparkles size={12} className="mr-2 text-blue-500" />
                    Thêm comment...
                  </motion.div>
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.form
              key="add-form"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleAddComment}
            >
              <div className="flex gap-2">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Avatar className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-[9px] flex-shrink-0 mt-1 ring-2 ring-white shadow-sm">
                    <AvatarFallback>
                      {currentUserEmail?.[0]?.toUpperCase() || "?"}
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
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Thêm comment..."
                      className="min-h-[70px] text-xs resize-none border-blue-200 focus:border-blue-400 transition-all duration-200"
                      disabled={loading || !currentUserEmail}
                      maxLength={500}
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
                      {newComment.length}/500
                    </span>
                    <div className="flex gap-1">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 px-3 text-[10px] border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                          onClick={handleCancelAdd}
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
                          className="h-7 px-3 text-[10px] bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
                          disabled={loading || !newComment.trim() || !currentUserEmail}
                        >
                          <motion.div
                            animate={isSubmitting ? { 
                              rotate: [0, 360],
                              scale: [1, 1.1, 1] 
                            } : { rotate: 0, scale: 1 }}
                            transition={{ 
                              duration: isSubmitting ? 0.8 : 0.2,
                              repeat: isSubmitting ? Infinity : 0,
                              ease: "easeInOut"
                            }}
                          >
                            <Send size={10} className="mr-1" />
                          </motion.div>
                          {isSubmitting ? "Đang gửi..." : "Gửi"}
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
} 