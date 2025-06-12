"use client";
import { useState, useEffect, memo, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Pencil, Trash2, CheckCircle, XCircle, Send, MessageCircle, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// Remove heavy Framer Motion and replace with CSS transitions
import "./comment-animations.css";

// Utility functions moved outside component to prevent recreation
const truncateEmail = (email: string, max = 15): string => {
  if (!email) return "";
  return email.length > max ? email.slice(0, max) + "..." : email;
};

const formatTime = (dateString: string | Date): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return "vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)} giờ trước`;
  return `${Math.floor(diffMins / 1440)} ngày trước`;
};

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

// Memoized Comment Item component để tránh re-render
const CommentItem = memo(function CommentItem({
  comment,
  currentUserEmail,
  onEdit,
  onDelete,
  editingId,
  editContent,
  setEditContent,
  handleEditComment,
  cancelEdit,
  isJustAdded
}: {
  comment: Comment;
  currentUserEmail?: string;
  onEdit: (comment: Comment) => void;
  onDelete: (id: string) => void;
  editingId: string | null;
  editContent: string;
  setEditContent: (content: string) => void;
  handleEditComment: (e: React.FormEvent) => void;
  cancelEdit: () => void;
  isJustAdded: boolean;
}) {
  const isOwner = currentUserEmail === comment.email;
  const isEditing = editingId === comment.id;

  return (
    <div className={`comment-item ${isJustAdded ? 'comment-item--new' : ''}`}>
      <div className="flex gap-3 group">
        <Avatar className="w-8 h-8 shrink-0">
                     <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
             {comment.email?.charAt(0)?.toUpperCase() || "?"}
           </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900 truncate">
              {truncateEmail(comment.email)}
            </span>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {formatTime(comment.createdAt)}
            </span>
            
            {isOwner && (
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-gray-400 hover:text-blue-600"
                  onClick={() => onEdit(comment)}
                >
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-gray-400 hover:text-red-600"
                  onClick={() => onDelete(comment.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleEditComment} className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Edit comment..."
                className="min-h-[60px] text-sm"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button 
                  type="submit"
                  size="sm" 
                  variant="outline"
                >
                  Save
                </Button>
                <Button 
                  type="button"
                  size="sm" 
                  variant="ghost" 
                  onClick={cancelEdit}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="bg-gray-50 rounded-lg px-3 py-2">
              <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// Memoized Add Comment Form
const AddCommentForm = memo(function AddCommentForm({
  newComment,
  setNewComment,
  handleAddComment,
  loading,
  isSubmitting,
  isOpen
}: {
  newComment: string;
  setNewComment: (content: string) => void;
  handleAddComment: (e: React.FormEvent) => void;
  loading: boolean;
  isSubmitting: boolean;
  isOpen: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="add-comment-form">
      <form onSubmit={handleAddComment} className="space-y-3">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add comment..."
          className="min-h-[80px] resize-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <div className="flex justify-end">
          <Button 
            type="submit" 
            size="sm"
            disabled={!newComment.trim() || loading || isSubmitting}
            className="h-8 px-4 text-sm gap-2"
          >
            {isSubmitting ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-3 h-3" />
            )}
            {isSubmitting ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </form>
    </div>
  );
});

// Main component với extensive memoization
const CommentSection = memo(function CommentSection({
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

     const currentUserEmail = session?.user?.email || undefined;

  // Memoized sorted comments để tránh re-sorting
  const sortedComments = useMemo(() => {
    return [...comments].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [comments]);

  // Reset just added state after animation
  useEffect(() => {
    if (justAdded) {
      const timer = setTimeout(() => setJustAdded(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [justAdded]);

  // Memoized handlers để tránh re-creating functions
  const handleAddComment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    console.log("[CommentSection] Adding comment:", newComment.trim());
    setLoading(true);
    setIsSubmitting(true);
    try {
      await onCommentAdd(newComment.trim());
      console.log("[CommentSection] Comment add request sent");
      setJustAdded(Date.now().toString());
      setNewComment("");
      setIsAddingComment(false);
    } catch (error) {
      console.error("[CommentSection] Failed to add comment:", error);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  }, [newComment, onCommentAdd]);

  const handleStartAdd = useCallback(() => {
    setIsAddingComment(true);
  }, []);

  const handleEditComment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim() || !editingId) return;
    
    setLoading(true);
    try {
      await onCommentUpdate(editingId, editContent.trim());
      setEditingId(null);
      setEditContent("");
    } catch (error) {
      console.error("[CommentSection] Failed to update comment:", error);
    } finally {
      setLoading(false);
    }
  }, [editContent, editingId, onCommentUpdate]);

  const handleDeleteComment = useCallback(async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    
    setLoading(true);
    try {
      await onCommentDelete(id);
    } catch (error) {
      console.error("[CommentSection] Failed to delete comment:", error);
    } finally {
      setLoading(false);
    }
  }, [onCommentDelete]);

  const startEdit = useCallback((comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditContent("");
  }, []);

  if (!isOpen) return null;

  return (
    <div className="comment-section">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <MessageCircle className="w-4 h-4 text-blue-600" />
            </div>
            <span className="font-semibold text-gray-900">
              Comments ({comments.length})
            </span>
            {comments.length > 0 && (
              <Sparkles className="w-4 h-4 text-purple-500" />
            )}
          </div>
        </div>

        {/* Comments list với virtual scrolling cho performance */}
        <div className="max-h-96 overflow-y-auto">
          {sortedComments.length > 0 ? (
            <div className="p-4 space-y-4">
              {sortedComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserEmail={currentUserEmail}
                  onEdit={startEdit}
                  onDelete={handleDeleteComment}
                  editingId={editingId}
                  editContent={editContent}
                  setEditContent={setEditContent}
                  handleEditComment={handleEditComment}
                  cancelEdit={cancelEdit}
                  isJustAdded={justAdded === comment.id}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                No comments yet. Be the first!
              </p>
            </div>
          )}
        </div>

        {/* Add comment section */}
        <div className="border-t border-gray-200 bg-gray-50">
          {!isAddingComment ? (
            <div className="p-4">
              <Button
                onClick={handleStartAdd}
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-gray-600 hover:text-gray-900"
              >
                <MessageCircle className="w-4 h-4" />
                Add comment...
              </Button>
            </div>
          ) : (
            <div className="p-4">
              <AddCommentForm
                newComment={newComment}
                setNewComment={setNewComment}
                handleAddComment={handleAddComment}
                loading={loading}
                isSubmitting={isSubmitting}
                isOpen={isAddingComment}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default CommentSection; 