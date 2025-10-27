export default function GroupFeed({ posts }) {
  return (
    <div className="space-y-3">
      {posts.map((p) => (
        <div key={p._id} className="p-4 bg-white rounded-xl shadow">
          <p className="text-gray-800">{p.content}</p>
          <p className="text-xs text-gray-400 mt-1">{new Date(p.createdAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
