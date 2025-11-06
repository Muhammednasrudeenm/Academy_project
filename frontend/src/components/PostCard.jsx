import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import { Heart, MessageCircle, X, Send, Trash2 } from "lucide-react";
import { toggleLikePost, fetchPostComments, createComment, deleteComment, deletePost } from "../api/api";
import ExpandableText from "./ExpandableText";
import { useToast } from "../contexts/ToastContext";

const PostCard = memo(function PostCard({ post, onPostUpdate, onPostDelete }) {
  const { showError, showSuccess } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [justLiked, setJustLiked] = useState(false);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const lastTapRef = useRef(0);

  // Memoize user to prevent re-parsing on every render
  const user = useMemo(() => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (e) {
      return null;
    }
  }, []);

  // Initialize state from post prop
  useEffect(() => {
    // Set likes count from post
    const initialLikesCount = post.likes || 0;
    setLikesCount(initialLikesCount);
    
    // Check if user has liked this post
    if (user && post.likedBy && Array.isArray(post.likedBy)) {
      const userLiked = post.likedBy.some((id) => {
        const likeId = typeof id === 'object' ? (id._id || id.toString()) : id.toString();
        const userId = user._id?.toString() || user._id;
        return likeId === userId || likeId.toString() === userId;
      });
      setIsLiked(userLiked);
    } else {
      setIsLiked(false);
    }
  }, [post, user]);

  // Fetch comments when showing comments
  useEffect(() => {
    if (showComments && comments.length === 0) {
      loadComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showComments]);

  const loadComments = async () => {
    setCommentsLoading(true);
    try {
      const fetchedComments = await fetchPostComments(post._id);
      setComments(fetchedComments);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      showError("Please login to comment");
      return;
    }

    if (!commentText.trim()) {
      return;
    }

    if (commentText.length > 5000) {
      showError("Comment cannot exceed 5000 characters");
      return;
    }

    setCommentLoading(true);
    try {
      const newComment = await createComment(post._id, {
        text: commentText,
        userId: user._id,
      });
      setComments([...comments, newComment]);
      setCommentText("");
      showSuccess("Comment added successfully!");
      // Update comment count (optimistic update)
      if (post) {
        post.comments = (post.comments || 0) + 1;
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      showError(error.message || "Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!user) return;

    try {
      await deleteComment(commentId, user._id);
      setComments(comments.filter((c) => c._id !== commentId));
      showSuccess("Comment deleted successfully");
      // Update comment count
      if (post) {
        post.comments = Math.max(0, (post.comments || 0) - 1);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      showError(error.message || "Failed to delete comment");
    }
  };

  const handleDeletePost = async () => {
    if (!user || !onPostDelete) return;

    setDeleting(true);
    try {
      await deletePost(post._id, user._id);
      showSuccess("Post deleted successfully");
      setShowDeleteConfirm(false);
      onPostDelete(post._id);
    } catch (error) {
      console.error("Error deleting post:", error);
      showError(error.message || "Failed to delete post");
    } finally {
      setDeleting(false);
    }
  };

  const handleLike = async (showDoubleTapAnimation = false) => {
    if (!user) {
      showError("Please login to like posts");
      return;
    }

    // Store previous state for potential rollback
    const previousLiked = isLiked;
    const previousCount = likesCount;

    // Optimistic update - immediately update UI
    if (isLiked) {
      // Unlike: reduce count
      setIsLiked(false);
      setLikesCount(Math.max(0, likesCount - 1));
    } else {
      // Like: increase count
      if (showDoubleTapAnimation) {
        setShowDoubleTapHeart(true);
        setTimeout(() => setShowDoubleTapHeart(false), 1000);
      }
      setIsLiked(true);
      setLikesCount(likesCount + 1);
      setJustLiked(true);
      setTimeout(() => setJustLiked(false), 600);
    }

    setLoading(true);
    try {
      const result = await toggleLikePost(post._id, user._id);
      
      // Update with server response (source of truth)
      setIsLiked(result.liked);
      setLikesCount(result.likes);
      
      // Update parent component if callback provided
      if (onPostUpdate) {
        // Update the likedBy array based on the result
        const updatedLikedBy = result.liked 
          ? [...(post.likedBy || []), user._id] 
          : (post.likedBy || []).filter(id => {
              const likeId = typeof id === 'object' ? (id._id || id.toString()) : id.toString();
              return likeId !== user._id && likeId.toString() !== user._id;
            });
        
        onPostUpdate(post._id, {
          likes: result.likes,
          liked: result.liked,
          likedBy: updatedLikedBy
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert optimistic update on error
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
      showError(error.message || `Failed to ${previousLiked ? "unlike" : "like"} post`);
    } finally {
      setLoading(false);
    }
  };

  // Double tap to like (Instagram style)
  const handleDoubleTap = (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapRef.current;
    
    if (tapLength < 300 && tapLength > 0) {
      // Double tap detected
      e.preventDefault();
      if (!isLiked && user) {
        handleLike(true);
      }
    }
    lastTapRef.current = currentTime;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <article className="relative bg-black border-b border-[#2f3336] px-4 py-3 hover:bg-[#181818] transition-colors w-full">
      <div className="relative z-10">
        {/* Header - Twitter Style */}
        <div className="flex items-start gap-3 mb-2">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-[#1d9bf0] flex items-center justify-center text-white font-bold text-[15px] leading-normal">
              {post.user?.name?.[0]?.toUpperCase() || "U"}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-bold text-white text-[15px] truncate leading-normal">
                  {post.user?.name || "Anonymous"}
                </h3>
                <span className="text-[#71767a]">·</span>
                <span className="text-[#71767a] text-[15px] leading-normal">{formatDate(post.createdAt)}</span>
              </div>
              {/* Delete Button - Only for post owner */}
              {user && post.user?._id && (post.user._id.toString() === user._id?.toString() || post.user._id === user._id) && onPostDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                  }}
                  className="p-1.5 rounded-full hover:bg-[#181818] text-[#71767a] hover:text-[#f4212e] transition-colors"
                  aria-label="Delete post"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Section - Twitter Style */}
        <div className="mb-3">
          {/* Title */}
          {post.title && (
            <h4 className="text-[15px] font-bold text-white mb-2 leading-normal">
              {post.title}
            </h4>
          )}

          {/* Caption */}
          {post.caption && (
            <div className="text-[15px] text-white leading-normal whitespace-pre-wrap break-words">
              {post.caption && post.caption.length > 500 ? (
                <ExpandableText 
                  key={`expandable-caption-${post._id}`}
                  text={String(post.caption)} 
                  maxLength={500} 
                />
              ) : (
                <span>{post.caption}</span>
              )}
            </div>
          )}
        </div>

        {/* Media - Twitter Style */}
        {post.image && (
          <div className="mb-3 rounded-2xl overflow-hidden w-full max-w-full group/media relative">
            <img
              src={post.image}
              alt={post.title || "Post image"}
              className="w-full h-auto max-h-[600px] object-cover rounded-2xl max-w-full cursor-pointer"
              style={{ maxWidth: '100%', height: 'auto', display: 'block', width: '100%' }}
              onDoubleClick={handleDoubleTap}
            />
            {/* Double Tap Heart Animation */}
            {showDoubleTapHeart && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <Heart 
                  size={100} 
                  className="text-red-500 fill-current animate-double-tap-heart drop-shadow-2xl" 
                />
              </div>
            )}
          </div>
        )}
        {post.video && (
          <div className="mb-3 rounded-2xl overflow-hidden w-full max-w-full relative">
            <video
              src={post.video}
              controls
              className="w-full h-auto max-h-[600px] object-cover rounded-2xl max-w-full cursor-pointer"
              style={{ maxWidth: '100%', height: 'auto', display: 'block', width: '100%' }}
              onDoubleClick={handleDoubleTap}
            />
            {/* Double Tap Heart Animation */}
            {showDoubleTapHeart && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <Heart 
                  size={100} 
                  className="text-red-500 fill-current animate-double-tap-heart drop-shadow-2xl" 
                />
              </div>
            )}
          </div>
        )}

        {/* Actions - Twitter Style */}
        <div className="flex items-center justify-between max-w-[425px] mt-3">
          <button
            onClick={() => {
              setShowComments(!showComments);
              if (!showComments) {
                loadComments();
              }
            }}
            className="group/comment flex items-center gap-2 text-[#71767a] hover:text-[#1d9bf0] transition-colors"
          >
            <div className="p-2 rounded-full group-hover/comment:bg-[#1d9bf0]/10 transition-colors">
              <MessageCircle size={20} className={showComments ? "text-[#1d9bf0]" : ""} />
            </div>
            <span className={`text-[13px] ${showComments ? "text-[#1d9bf0]" : ""}`}>
              {post.comments || 0}
            </span>
          </button>

          <button
            onClick={handleLike}
            disabled={loading}
            className="group/like flex items-center gap-2 text-[#71767a] hover:text-[#f4212e] transition-colors disabled:opacity-50"
          >
            <div className="p-2 rounded-full group-hover/like:bg-[#f4212e]/10 transition-colors">
              <Heart 
                size={20} 
                className={`${isLiked ? "fill-current text-[#f4212e]" : ""} ${justLiked ? "animate-heartbeat" : ""} transition-all`} 
              />
            </div>
            <span className={`text-[13px] ${isLiked ? "text-[#f4212e]" : ""}`}>{likesCount}</span>
          </button>
        </div>

        {/* Comments Section - Twitter Style */}
        {showComments && (
          <div className="mt-3 pt-3 border-t border-[#2f3336]">
            {/* Add Comment Form - Twitter Style */}
            {user && (
              <form onSubmit={handleAddComment} className="mb-4">
                <div className="flex gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[#1d9bf0] flex items-center justify-center text-white font-bold text-[15px] leading-normal">
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <textarea
                        value={commentText}
                        onChange={(e) => {
                          if (e.target.value.length <= 5000) {
                            setCommentText(e.target.value);
                          }
                        }}
                        placeholder="Tweet your reply"
                        rows={commentText.length > 100 ? 3 : 1}
                        className="flex-1 bg-transparent border-none rounded-lg px-2 py-2 text-[15px] text-white placeholder-[#71767a] focus:outline-none resize-none leading-normal"
                      />
                      <button
                        type="submit"
                        disabled={commentLoading || !commentText.trim() || commentText.length > 5000}
                        className="px-4 py-2 bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-bold text-[15px] leading-normal"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-[13px] leading-normal ${commentText.length > 5000 ? 'text-[#f4212e]' : 'text-[#71767a]'}`}>
                        {commentText.length > 0 && `${commentText.length} / 5000`}
                      </span>
                      {commentText.length > 5000 && (
                        <span className="text-[13px] leading-normal text-[#f4212e]">Character limit exceeded</span>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* Comments List - Twitter Style */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {commentsLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block w-6 h-6 border-2 border-[#1d9bf0] border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-[#71767a] text-[15px] leading-normal">Loading comments...</p>
                </div>
              ) : comments.length > 0 ? (
                comments.map((comment, index) => {
                  const isCommentOwner = user && comment.user?._id?.toString() === user._id;
                  return (
                    <div key={`comment-${comment._id}-${index}`} className="flex gap-3 pb-4 border-b border-[#2f3336] last:border-0">
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-[#1d9bf0] flex items-center justify-center text-white font-bold text-[15px] leading-normal">
                          {comment.user?.name?.[0]?.toUpperCase() || "U"}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[15px] font-bold text-white leading-normal">
                              {comment.user?.name || "Anonymous"}
                            </span>
                            <span className="text-[#71767a]">·</span>
                            <span className="text-[15px] text-[#71767a] leading-normal">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          {isCommentOwner && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="p-1.5 rounded-full text-[#71767a] hover:text-[#f4212e] hover:bg-[#f4212e]/10 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                        <div className="text-[15px] text-white leading-normal">
                          {comment.text && String(comment.text).trim().length > 300 ? (
                            <ExpandableText 
                              key={`expandable-comment-${comment._id}`}
                              text={String(comment.text)} 
                              maxLength={300}
                            />
                          ) : (
                            <span className="whitespace-pre-wrap break-words">{String(comment.text || "")}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#71767a] text-[15px] leading-normal">No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999]" 
          onClick={(e) => {
            if (e.target === e.currentTarget && !deleting) {
              setShowDeleteConfirm(false);
            }
          }}
        >
          <div 
            className="relative w-full max-w-md mx-4 flex flex-col animate-fadeIn bg-black/90 backdrop-blur-xl border border-[#2f3336]/50 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#f4212e]/10 via-transparent to-transparent opacity-50 pointer-events-none"></div>
            
            <div className="relative p-6 z-10">
              <h3 className="text-[20px] font-bold text-white mb-2 leading-tight">
                Delete post?
              </h3>
              <p className="text-[15px] text-[#71767a] mb-6 leading-normal">
                This can't be undone and it will be removed from the academy.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDeletePost}
                  disabled={deleting}
                  className="w-full py-3 rounded-full bg-[#f4212e] text-white font-bold text-[15px] leading-normal hover:bg-[#d91a26] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="w-full py-3 rounded-full bg-black/50 backdrop-blur-sm text-white border border-[#2f3336] font-bold text-[15px] leading-normal hover:bg-[#181818] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.15); }
          50% { transform: scale(1.1); }
          75% { transform: scale(1.15); }
        }
        .animate-heartbeat {
          animation: heartbeat 0.5s ease-in-out;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }
      `}</style>
    </article>
  );
});

export default PostCard;
