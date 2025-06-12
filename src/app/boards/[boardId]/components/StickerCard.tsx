import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import CommentSection from "./CommentSection";
import { Sticker, Vote } from "@/types/board";
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
  const [isDeleting, setIsDeleting] = useState(false);

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
      const timer = setTimeout(() => setIsUpdated(false), 800);
      
      setPrevVoteCount(voteCount);
      setPrevCommentCount(commentCount);
      
      return () => clearTimeout(timer);
    }
  }, [voteCount, commentCount, prevVoteCount, prevCommentCount]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this sticker?")) return;

    try {
      const response = await fetch(`/api/stickers/${sticker.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        onChanged();
      }
    } catch (error) {
      console.error('Error deleting sticker:', error);
    }
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
    
    console.log('[StickerCard] 🗳️ Vote action:', { 
      stickerId: sticker.id, 
      hasVoted, 
      action: hasVoted ? 'remove' : 'add',
      userEmail: currentUserEmail 
    });
    
    if (hasVoted) {
      console.log('[StickerCard] 🗳️ Calling onVoteRemove for sticker:', sticker.id);
      onVoteRemove(sticker.id);
    } else {
      console.log('[StickerCard] 🗳️ Calling onVoteAdd for sticker:', sticker.id);
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
    <div
      className={`relative bg-gray-50 rounded-lg shadow-sm p-3 text-sm flex flex-col gap-2 border border-gray-200 group min-h-[90px] cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:scale-[1.02] ${
        isUpdated ? 'sticker-updated' : ''
      } ${isDeleting ? 'sticker-exiting' : ''}`}
    >
      {/* Nút Edit/Delete */}
      {isOwner && !editing && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button 
            className="p-1 text-blue-500 hover:bg-blue-100 rounded transition-colors duration-150" 
            onClick={() => setEditing(true)} 
            title="Edit"
          >
            <Pencil size={16} />
          </button>
          <button 
            className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors duration-150" 
            onClick={handleDelete} 
            disabled={loading || isDeleting} 
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
      
      {editing ? (
        <form onSubmit={handleEdit} className="space-y-2">
          <div className="flex gap-2">
            <Avatar className="w-7 h-7 text-[10px] flex-shrink-0 mt-1 shadow-sm">
              <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                {session?.user?.email?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Update sticker content..."
                className="min-h-[80px] text-sm resize-none border-green-200 focus:border-green-400 transition-all duration-200"
                disabled={loading}
                maxLength={300}
                autoFocus
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-[10px] text-gray-500">
                  {content.length}/300
                </span>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-[10px] border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                    onClick={() => setEditing(false)}
                    disabled={loading}
                  >
                    <XCircle size={10} className="mr-1" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="h-7 px-3 text-[10px] bg-green-600 hover:bg-green-700 text-white transition-all duration-200"
                    disabled={loading || content.trim() === ""}
                  >
                    <CheckCircle size={10} className="mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <>
          {/* Nội dung sticker */}
          <div className="flex gap-2">
            <Avatar className="w-7 h-7 text-[10px] flex-shrink-0 mt-1 shadow-sm">
              <AvatarFallback className={`text-white ${
                isOwner 
                  ? "bg-gradient-to-br from-orange-500 to-red-600" 
                  : "bg-gradient-to-br from-blue-500 to-purple-600"
              }`}>
                {sticker.createdBy?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-[10px] text-gray-500 mb-1">
                {truncateEmail(sticker.createdBy || "")}
              </div>
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                {sticker.content}
              </p>
            </div>
          </div>

          {/* Vote và Comment buttons */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <button
                onClick={handleVote}
                disabled={!currentUserEmail}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all duration-200 ${
                  hasVoted
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                } ${!currentUserEmail ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                title={hasVoted ? "Remove vote" : "Vote"}
              >
                👍 {voteCount}
              </button>
              
              <button
                onClick={handleCommentToggle}
                className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200"
                title="Comments"
              >
                💬 {commentCount}
              </button>
            </div>
          </div>

          {/* Comment Section */}
          {showComments && (
            <div className="mt-3 pt-3 border-t border-gray-200 animate-in slide-in-from-top-2 duration-300">
              <CommentSection
                comments={comments}
                onCommentAdd={handleCommentAdd}
                onCommentUpdate={onCommentUpdate}
                onCommentDelete={onCommentDelete}
                isOpen={showComments}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
} 