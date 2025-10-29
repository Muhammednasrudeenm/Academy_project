import React, { useState } from "react";
import { Heart, MessageCircle } from "lucide-react";

export default function PostCard({ post }) {
  const [liked, setLiked] = useState(false);
  const [showFullCaption, setShowFullCaption] = useState(false);

  const toggleLike = () => setLiked(!liked);
  const toggleCaption = () => setShowFullCaption(!showFullCaption);

  const captionTooLong = post.caption.length > 120;
  const displayedCaption =
    captionTooLong && !showFullCaption
      ? post.caption.slice(0, 120) + "..."
      : post.caption;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 mb-5 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md hover:border-sky-400">
      {/* USER INFO */}
      <div className="flex items-center gap-3 mb-3">
        <img
          src={post.user.profilePic}
          alt={post.user.name}
          className="w-9 h-9 rounded-full object-cover border border-gray-300 dark:border-gray-600"
        />
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {post.user.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{post.date}</p>
        </div>
      </div>

      {/* POST CONTENT */}
      <div className="mb-3">
        {post.title && (
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {post.title}
          </h2>
        )}
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {displayedCaption}
          {captionTooLong && (
            <button
              onClick={toggleCaption}
              className="ml-1 text-sky-500 hover:underline text-sm"
            >
              {showFullCaption ? "Show less" : "Show more"}
            </button>
          )}
        </p>
      </div>

      {/* IMAGE OR VIDEO */}
      {post.image && (
        <img
          src={post.image}
          alt="Post"
          className="rounded-lg w-full object-cover max-h-80 mb-3"
        />
      )}
      {post.video && (
        <video
          controls
          className="rounded-lg w-full object-cover max-h-80 mb-3"
        >
          <source src={post.video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      {/* ACTIONS */}
      <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
        <button
          onClick={toggleLike}
          className="flex items-center gap-1 hover:text-sky-500"
        >
          <Heart
            size={18}
            className={liked ? "fill-sky-500 text-sky-500" : ""}
          />
          {liked ? post.likes + 1 : post.likes}
        </button>
        <div className="flex items-center gap-1 hover:text-sky-500">
          <MessageCircle size={18} />
          {post.comments}
        </div>
      </div>
    </div>
  );
}
