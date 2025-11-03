import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import { Heart, MessageCircle, X, Send } from "lucide-react";
import { toggleLikePost, fetchPostComments, createComment, deleteComment } from "../api/api";

const PostCard = memo(function PostCard({ post, onPostUpdate }) {
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
      alert("Please login to comment");
      return;
    }

    if (!commentText.trim()) {
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
      // Update comment count (optimistic update)
      if (post) {
        post.comments = (post.comments || 0) + 1;
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!user) return;

    try {
      await deleteComment(commentId, user._id);
      setComments(comments.filter((c) => c._id !== commentId));
      // Update comment count
      if (post) {
        post.comments = Math.max(0, (post.comments || 0) - 1);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment");
    }
  };

  const handleLike = async (showDoubleTapAnimation = false) => {
    if (!user) {
      alert("Please login to like posts");
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
      alert("Failed to " + (previousLiked ? "unlike" : "like") + " post");
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
    <article className="relative bg-gradient-to-br from-[#1E293B]/95 via-[#15202B]/95 to-[#1E293B]/95 backdrop-blur-sm rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-gray-700/50 hover:border-gray-600/80 hover:shadow-sky-500/20 transition-all duration-500 w-full max-w-full overflow-hidden group" style={{ boxSizing: 'border-box' }}>
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
      
      <div className="relative z-10">
        {/* Header - Premium */}
        <div className="flex items-center gap-4 mb-5 sm:mb-6 pb-4 border-b border-gray-700/50">
          <div className="relative group/avatar">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-purple-500 rounded-full blur-lg opacity-0 group-hover/avatar:opacity-50 transition-opacity"></div>
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg ring-2 ring-sky-500/30 transition-transform group-hover/avatar:scale-110">
              {post.user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-[#1E293B] shadow-lg"></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-white text-base sm:text-lg md:text-xl truncate">
                {post.user?.name || "Anonymous"}
              </h3>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm sm:text-base text-gray-400 flex items-center gap-2">
              <span>{formatDate(post.createdAt)}</span>
              <span className="text-gray-600">•</span>
              <span className="text-xs text-gray-500">Community Post</span>
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="mb-5 sm:mb-6 space-y-4">
          {/* Title */}
          {post.title && (
            <h4 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {post.title}
            </h4>
          )}

          {/* Caption */}
          {post.caption && (
            <p className="text-base sm:text-lg md:text-xl text-gray-300 whitespace-pre-wrap break-words leading-relaxed overflow-wrap-anywhere">
              {post.caption}
            </p>
          )}
        </div>

        {/* Media - Premium with Double Tap to Like */}
        {post.image && (
          <div className="mb-5 sm:mb-6 rounded-2xl overflow-hidden w-full max-w-full border-2 border-gray-700/50 shadow-xl bg-gray-800/30 group/media relative">
            <img
              src={post.image}
              alt={post.title || "Post image"}
              className="w-full h-auto max-h-[600px] object-contain rounded-2xl max-w-full transition-transform duration-500 group-hover/media:scale-[1.02] cursor-pointer"
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
          <div className="mb-5 sm:mb-6 rounded-2xl overflow-hidden w-full max-w-full border-2 border-gray-700/50 shadow-xl bg-gray-800/30 relative">
            <video
              src={post.video}
              controls
              className="w-full h-auto max-h-[600px] object-contain rounded-2xl max-w-full cursor-pointer"
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

        {/* Actions - Premium */}
        <div className="flex items-center gap-3 sm:gap-4 pt-5 border-t border-gray-700/50">
          <button
            onClick={handleLike}
            disabled={loading}
            className="group/like flex items-center gap-2.5 px-2 py-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
          >
            <Heart 
              size={20} 
              className={`${isLiked ? "fill-current text-red-500" : "text-gray-300"} ${justLiked ? "animate-heartbeat" : ""} group-hover/like:scale-110 transition-all duration-200`} 
            />
            <span className={`text-sm sm:text-base font-bold ${isLiked ? "text-red-500" : "text-gray-300"}`}>{likesCount}</span>
          </button>

          <button
            onClick={() => {
              setShowComments(!showComments);
              if (!showComments) {
                loadComments();
              }
            }}
            className="group/comment flex items-center gap-2.5 px-2 py-2 transition-all duration-300 transform hover:scale-105"
          >
            <MessageCircle size={20} className={`${showComments ? "text-sky-400" : "text-gray-300"} group-hover/comment:scale-110 transition-transform`} />
            <span className={`text-sm sm:text-base font-bold ${showComments ? "text-sky-400" : "text-gray-300"}`}>
              {post.comments || 0}
            </span>
          </button>
        </div>

        {/* Comments Section - Premium */}
        {showComments && (
          <div className="mt-5 pt-5 border-t border-gray-700/50 animate-slideDown">
            {/* Add Comment Form - Premium */}
            {user && (
              <form onSubmit={handleAddComment} className="mb-5">
                <div className="flex gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-sky-500/30">
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border-2 border-gray-700/50 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all duration-300"
                    />
                    <button
                      type="submit"
                      disabled={commentLoading || !commentText.trim()}
                      className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-sky-500/50 transform hover:scale-105"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Comments List - Premium */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {commentsLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mb-2"></div>
                  <p className="text-gray-400 text-sm">Loading comments...</p>
                </div>
              ) : comments.length > 0 ? (
                comments.map((comment) => {
                  const isCommentOwner = user && comment.user?._id?.toString() === user._id;
                  return (
                    <div key={comment._id} className="flex gap-3 animate-fadeIn">
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-sky-500/30">
                          {comment.user?.name?.[0]?.toUpperCase() || "U"}
                        </div>
                      </div>
                      <div className="flex-1 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-3.5 border border-gray-700/30 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">
                              {comment.user?.name || "Anonymous"}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          {isCommentOwner && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">{comment.text}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 rounded-xl bg-gray-800/30 border border-gray-700/30">
                  <p className="text-gray-400 text-sm">No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

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
