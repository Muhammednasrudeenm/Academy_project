export default function PostCard({ post }) {
  return (
    <div className="border rounded-2xl p-4">
      <div className="flex items-center space-x-3 mb-2">
        <img
          src={post.authorAvatar || "https://via.placeholder.com/40"}
          alt={post.author}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <h4 className="font-semibold">{post.author}</h4>
          <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
        </div>
      </div>
      <p className="text-gray-700">{post.content}</p>
    </div>
  );
}
