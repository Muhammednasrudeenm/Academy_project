import React, { useState, useEffect } from "react";
import AcademySidebar from "../components/sidebar/AcademySidebar";

export default function Communities() {
  const [selected, setSelected] = useState(null);
  const [joined, setJoined] = useState({});
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [communities, setCommunities] = useState([]); // ✅ now from backend

  useEffect(() => {
    document.body.style.overflow = "auto";
  }, []);

  // ✅ Fetch academies from backend (same structure as AcademySidebar)
  useEffect(() => {
    const fetchAcademies = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/academies");
        const data = await res.json();

        if (data.success && Array.isArray(data.data)) {
          setCommunities(data.data);
        } else {
          console.error("Failed to fetch academies:", data.message);
        }
      } catch (error) {
        console.error("Error fetching academies:", error);
      }
    };

    fetchAcademies();
  }, []);

  const handleJoin = (id) => {
    setJoined((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ✅ Generate dynamic categories from fetched data
  const categories = ["All", ...new Set(communities.map((c) => c.category || "Uncategorized"))];

  // ✅ Filter + Search logic
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

      {/* ===== OVERLAY ===== */}
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
                placeholder="Search academy..."
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

          {/* ===== Academy Cards ===== */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map((academy) => (
              <div
                key={academy._id}
                className="bg-gray-900 p-5 rounded-xl shadow hover:shadow-md transition"
              >
                <div className="flex items-center gap-4 mb-3">
                  <img
                    src={academy.logo}
                    alt={academy.name}
                    className="w-12 h-12 rounded-full object-cover bg-gray-700 p-1"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-white">{academy.name}</h3>
                    <p className="text-sm text-gray-400">
                      {academy.category || "Uncategorized"}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-300 mb-4 line-clamp-3">
                  {academy.description || "No description provided."}
                </p>
                <button
                  onClick={() => handleJoin(academy._id)}
                  className={`w-full py-2 rounded-md text-sm font-medium border transition ${
                    joined[academy._id]
                      ? "border-green-600 text-green-400 hover:bg-green-900/30"
                      : "border-indigo-600 text-indigo-400 hover:bg-indigo-900/30"
                  }`}
                >
                  {joined[academy._id] ? "Joined" : "Join"}
                </button>
              </div>
            ))}
          </div>

          {filteredCommunities.length === 0 && (
            <p className="text-center text-gray-400 py-6">No academies found.</p>
          )}
        </div>
      </main>
    </div>
  );
}
