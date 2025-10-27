import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

export default function GroupDetail() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/groups/${id}`)
      .then((res) => res.json())
      .then(setGroup);

    fetch(`http://localhost:5000/api/groups/${id}/posts`)
      .then((res) => res.json())
      .then(setPosts);
  }, [id]);

  if (!group) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto mt-6 bg-white rounded-2xl shadow">
      <img src={group.banner} alt="" className="w-full h-40 object-cover rounded-t-2xl" />
      <div className="p-4 -mt-10 flex items-center space-x-4">
        <img src={group.logo} alt="" className="w-20 h-20 rounded-full border-4 border-white" />
        <div>
          <h2 className="text-xl font-bold">{group.name}</h2>
          <p className="text-gray-500">{group.sport}</p>
          <p className="text-gray-400 text-sm">{group.description}</p>
        </div>
      </div>

      <div className="border-t px-4 py-2">
        <input
          placeholder="What’s happening in this group?"
          className="w-full border rounded-full px-4 py-2 focus:outline-none"
        />
        <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-full">Post</button>
      </div>

      <div className="divide-y">
        {posts.map((p) => (
          <div key={p._id} className="p-4 flex space-x-3">
            <img src={p.authorAvatar} alt="" className="w-10 h-10 rounded-full" />
            <div>
              <p className="font-semibold">@{p.authorName}</p>
              <p>{p.content}</p>
              <span className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
