import React, { useState } from "react";
import { X, Image, Video } from "lucide-react";
import { createPost, uploadMedia } from "../api/api";

export default function PostCreationModal({ academyId, onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let image = "";
      let video = "";

      // Upload media if file is selected
      if (file) {
        const uploaded = await uploadMedia(file);
        if (uploaded.secure_url) {
          if (file.type.startsWith("video")) video = uploaded.secure_url;
          else image = uploaded.secure_url;
        }
      }

      // Prepare post data
      const postData = { title, caption, image, video };
      const res = await createPost(academyId, postData, token);

      if (res._id || res.success) {
        onSubmit(res);
        onClose();
      } else {
        alert(res.message || "Failed to create post");
      }
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Error while creating post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[2000]">
      <div className="bg-[#1E293B] text-gray-100 rounded-2xl w-11/12 max-w-lg p-6 relative shadow-2xl border border-gray-700">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-700"
        >
          <X size={18} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-center">
          Create a New Post
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Enter post title..."
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg p-2.5 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <textarea
              placeholder="Write your caption..."
              rows={3}
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg p-2.5 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              required
            ></textarea>
          </div>

          {/* File input */}
          <div className="flex items-center justify-between bg-[#0f172a] border border-gray-600 rounded-lg px-3 py-2">
            <label className="flex items-center gap-2 text-gray-400 cursor-pointer hover:text-sky-400 transition">
              <Image size={18} />
              <span className="text-sm">Image</span>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <label className="flex items-center gap-2 text-gray-400 cursor-pointer hover:text-sky-400 transition">
              <Video size={18} />
              <span className="text-sm">Video</span>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Preview */}
          {preview && (
            <div className="mt-3">
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
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-semibold shadow transition-all focus:ring-2 focus:ring-sky-400 disabled:opacity-60"
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </form>
      </div>
    </div>
  );
}
