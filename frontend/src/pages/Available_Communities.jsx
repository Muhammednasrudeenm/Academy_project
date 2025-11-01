import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Available_Communities() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [communities, setCommunities] = useState([]);
  const [joined, setJoined] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAcademies = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/academies");
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) setCommunities(data.data);
      } catch (error) {
        console.error("Error fetching academies:", error);
      }
    };
    fetchAcademies();
  }, []);

  const handleJoin = (id) => setJoined((prev) => ({ ...prev, [id]: !prev[id] }));

  const categories = ["All", ...new Set(communities.map((c) => c.category || "Uncategorized"))];
  const filtered = communities.filter(
    (c) =>
      (filter === "All" || c.category === filter) &&
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full bg-gray-800 rounded-2xl shadow-lg overflow-hidden p-6 relative z-[90]">
      <div className="border-b border-gray-700 pb-4 mb-4 hidden md:block">
        <h2 className="text-2xl font-semibold text-white">Available Academies</h2>
        <p className="text-gray-400 text-sm mt-1">
          Explore sports academies and connect with like-minded people.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="sm:w-1/4 w-full border border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-900 text-white"
        >
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search academy..."
            className="w-full border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm bg-gray-900 text-white"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 absolute left-3 top-3.5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
            />
          </svg>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((a) => (
          <div
            key={a._id}
            onClick={() => navigate(`/community/${a._id}`)}
            className="bg-gray-900 p-5 rounded-xl shadow hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-3">
              <img
                src={a.logo}
                alt={a.name}
                className="w-12 h-12 rounded-full object-cover bg-gray-700 p-1"
              />
              <div>
                <h3 className="text-lg font-semibold text-white">{a.name}</h3>
                <p className="text-sm text-gray-400">{a.category || "Uncategorized"}</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-4 line-clamp-3">
              {a.description || "No description provided."}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleJoin(a._id);
              }}
              className={`w-full py-2 rounded-md text-sm font-medium border transition ${
                joined[a._id]
                  ? "border-green-600 text-green-400 hover:bg-green-900/30"
                  : "border-indigo-600 text-indigo-400 hover:bg-indigo-900/30"
              }`}
            >
              {joined[a._id] ? "Joined" : "Join"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
