import React, { useState } from "react";
import { X, Image, Video, Send } from "lucide-react";

export default function PostCreationModal({ onClose, onSubmit }) {
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setMedia([...media, ...files]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ caption, media });
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
          className="flex-1 flex flex-col px-4 py-3 overflow-y-auto"
        >
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What’s happening?"
            className="
              w-full resize-none bg-transparent text-gray-900 dark:text-gray-100
              placeholder-gray-500 dark:placeholder-gray-400
              focus:outline-none text-base sm:text-lg
              min-h-[100px]
            "
          />

          {/* --- Media Preview --- */}
          {media.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {media.map((file, idx) => {
                const preview = URL.createObjectURL(file);
                return (
                  <div key={idx} className="relative">
                    {file.type.startsWith("image/") ? (
                      <img
                        src={preview}
                        alt="preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <video
                        src={preview}
                        controls
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* --- Action Bar --- */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  multiple
                />
                <Image
                  size={20}
                  className="text-sky-500 hover:text-sky-600 transition"
                />
              </label>

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileChange}
                  multiple
                />
                <Video
                  size={20}
                  className="text-sky-500 hover:text-sky-600 transition"
                />
              </label>
            </div>

            <button
              type="submit"
              className="
                flex items-center gap-2 bg-sky-500 hover:bg-sky-600
                text-white px-4 py-2 rounded-full font-medium
                transition duration-200 active:scale-95
              "
            >
              <Send size={18} />
              <span>Post</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
