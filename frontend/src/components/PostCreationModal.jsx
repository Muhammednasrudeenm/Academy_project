import React, { useState } from "react";
import { X, Image, Video } from "lucide-react";
import { createPost, uploadMedia } from "../api/api";

export default function PostCreationModal({ academyId, onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to create posts");
      return;
    }

    setLoading(true);
    try {
      let image = "";
      let video = "";

      // Upload media if file is selected
      if (file) {
        try {
          const uploaded = await uploadMedia(file);
          if (uploaded.secure_url) {
            if (file.type.startsWith("video")) {
              video = uploaded.secure_url;
            } else {
              image = uploaded.secure_url;
            }
          } else {
            throw new Error("Upload failed: No URL returned");
          }
        } catch (uploadError) {
          console.error("Upload error:", uploadError);
          alert(`Failed to upload media: ${uploadError.message}`);
          setLoading(false);
          return;
        }
      }

      // Prepare post data
      const postData = {
        title: title || undefined,
        caption,
        image,
        video,
        userId: user._id,
      };

      const newPost = await createPost(academyId, postData);

      if (newPost._id) {
        // Reset form
        setTitle("");
        setCaption("");
        setFile(null);
        setPreview(null);
        onSubmit(newPost);
        onClose();
      }
    } catch (err) {
      console.error("Error creating post:", err);
      alert(err.message || "Error while creating post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      {/* --- Modal Container --- */}
      <div
        className="
          bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg
          mx-3 sm:mx-auto relative flex flex-col
          transition-all duration-300
          sm:translate-y-0 sm:rounded-2xl
          animate-slideUp sm:animate-fadeIn
        "
        style={{
          maxHeight: "90vh",
        }}
      >
        {/* --- Header --- */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Create Post
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* --- Body --- */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col px-4 py-3 overflow-y-auto space-y-3"
        >
          <input
            type="text"
            placeholder="Post title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#0f172a] border border-gray-600 rounded-lg p-2.5 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What's happening?"
            className="
              w-full resize-none bg-[#0f172a] border border-gray-600 text-gray-200
              placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm
              rounded-lg p-2.5 min-h-[100px]
            "
            required
          />

          {/* --- Media Preview --- */}
          {preview && (
            <div className="mt-2">
              {file.type.startsWith("video") ? (
                <video
                  controls
                  src={preview}
                  className="rounded-lg w-full max-h-64 object-cover"
                />
              ) : (
                <img
                  src={preview}
                  alt="Preview"
                  className="rounded-lg w-full max-h-64 object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                className="mt-2 text-sm text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
          )}

          {/* --- Action Bar --- */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700">
            <div className="flex items-center gap-4">
              <label className="cursor-pointer flex items-center gap-2 text-gray-400 hover:text-sky-400 transition">
                <Image size={20} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              <label className="cursor-pointer flex items-center gap-2 text-gray-400 hover:text-sky-400 transition">
                <Video size={20} />
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="
                flex items-center gap-2 bg-sky-500 hover:bg-sky-600
                text-white px-6 py-2 rounded-full font-medium
                transition duration-200 active:scale-95 disabled:opacity-50
              "
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
