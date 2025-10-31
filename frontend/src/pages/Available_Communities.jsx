import React, { useState, useEffect } from "react";
import AcademySidebar from "../components/sidebar/AcademySidebar";

export default function Communities() {
  const [selected, setSelected] = useState(null);
  const [joined, setJoined] = useState({});
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "auto";
  }, []);

  const communities = [
    {
      id: 1,
      name: "Kerala Football Fans",
      category: "Football",
      logo: "https://cdn-icons-png.flaticon.com/512/2784/2784065.png",
      description:
        "A passionate community of football fans from Kerala. We discuss matches, local clubs, and host screening events every weekend!and host screening",
    },
    {
      id: 2,
      name: "Fitness Freaks",
      category: "Health & Fitness",
      logo: "https://cdn-icons-png.flaticon.com/512/2964/2964514.png",
      description:
        "Join us for fitness tips, community workouts, and motivation to stay active together.",
    },
    {
      id: 3,
      name: "Thrissur Badminton Club",
      category: "Badminton",
      logo: "https://cdn-icons-png.flaticon.com/512/3229/3229727.png",
      description:
        "We’re a friendly group of badminton lovers from Thrissur who play every evening and organize small tournaments!",
    },
  ];

  const handleJoin = (id) => {
    setJoined((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const categories = ["All", ...new Set(communities.map((c) => c.category))];

  const filteredCommunities = communities.filter(
    (c) =>
      (filter === "All" || c.category === filter) &&
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-gray-900 text-white relative overflow-hidden">
      {/* ===== SIDEBAR ===== */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 border-r border-gray-700 z-[1000]
        transition-all duration-300 ease-in-out md:translate-x-0 md:opacity-100
        ${
          sidebarOpen
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "-translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        <AcademySidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* ===== OVERLAY (below sidebar but above main content) ===== */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 md:hidden z-[900]
        ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 ml-0 md:ml-[16.5rem] lg:ml-[18rem] p-4 sm:p-6 transition-all duration-300 w-full relative z-[100]">
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-4 md:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-white">Available Academies</h2>
        </div>

        {/* ===== Communities Section ===== */}
        <div className="w-full bg-gray-800 rounded-2xl shadow-lg overflow-hidden p-6 relative z-[90]">
          <div className="border-b border-gray-700 pb-4 mb-4 hidden md:block">
            <h2 className="text-2xl font-semibold text-white">Available Academies</h2>
            <p className="text-gray-400 text-sm mt-1">
              Explore sports Academies and connect with like-minded people.
            </p>
          </div>

          {/* Filter & Search */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-6">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="sm:w-1/4 w-full border border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search community..."
                className="w-full border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
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

          {/* ===== Community Cards ===== */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map((community) => (
              <div
                key={community.id}
                className="bg-gray-900 p-5 rounded-xl shadow hover:shadow-md transition"
              >
                <div className="flex items-center gap-4 mb-3">
                  <img
                    src={community.logo}
                    alt="logo"
                    className="w-12 h-12 rounded-full object-cover bg-gray-700 p-1"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {community.name}
                    </h3>
                    <p className="text-sm text-gray-400">{community.category}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300 mb-4 line-clamp-3">
                  {community.description}
                </p>
                <button
                  onClick={() => handleJoin(community.id)}
                  className={`w-full py-2 rounded-md text-sm font-medium border transition ${
                    joined[community.id]
                      ? "border-green-600 text-green-400 hover:bg-green-900/30"
                      : "border-indigo-600 text-indigo-400 hover:bg-indigo-900/30"
                  }`}
                >
                  {joined[community.id] ? "Joined" : "Join"}
                </button>
              </div>
            ))}
          </div>

          {filteredCommunities.length === 0 && (
            <p className="text-center text-gray-400 py-6">No communities found.</p>
          )}
        </div>
      </main>
    </div>
  );
}
