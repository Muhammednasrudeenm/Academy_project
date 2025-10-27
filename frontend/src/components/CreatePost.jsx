import { useState } from "react";

export default function CreatePost({ onSubmit }) {
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit({ content });
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-2xl p-4 flex flex-col space-y-2">
      <textarea
        placeholder="What's new in your academy?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="resize-none border-none focus:ring-0 outline-none text-gray-800"
      />
      <button type="submit" className="self-end bg-blue-500 text-white px-4 py-1 rounded-full">
        Post
      </button>
    </form>
  );
}
