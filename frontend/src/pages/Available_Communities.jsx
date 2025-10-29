import React, { useState } from "react";
import AcademySidebar from "../components/sidebar/AcademySidebar"; // Adjust path if needed

export default function Communities() {
  const [selected, setSelected] = useState(null);
  const [joined, setJoined] = useState({});
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const communities = [
    {
      id: 1,
      name: "Kerala Football Fans",
      category: "Football",
      logo: "https://cdn-icons-png.flaticon.com/512/2784/2784065.png",
      banner:
        "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=1000",
      description:
        "A passionate community of football fans from Kerala. We discuss matches, local clubs, and host screening events every weekend!",
    },
    {
      id: 2,
      name: "Fitness Freaks",
      category: "Health & Fitness",
      logo: "https://cdn-icons-png.flaticon.com/512/2964/2964514.png",
      banner:
        "https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=1000",
      description:
        "Join us for fitness tips, community workouts, and motivation to stay active together.",
    },
    {
      id: 3,
      name: "Thrissur Badminton Club",
      category: "Badminton",
      logo: "https://cdn-icons-png.flaticon.com/512/3229/3229727.png",
      banner:
        "https://images.unsplash.com/photo-1599058917212-d750089bc07d?w=1000",
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
    <div className="min-h-screen flex flex-col md:flex-row bg-green-100 dark:bg-gray-900">
      {/* Sidebar Section */}
      <div className="w-full md:w-64 lg:w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 md:fixed md:h-screen md:overflow-y-auto">
        <AcademySidebar />
      </div>

      {/* Main Content Section */}
      <div className="flex-1 md:ml-64 lg:ml-72 flex justify-center p-3 sm:p-6 transition-all duration-300">
        <div className="w-full max-w-3xl bg-white dark:bg-gray-800 dark:text-gray-100 rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Available Academies
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Explore sports Academies and connect with like-minded people.
            </p>
          </div>

          {/* Filter & Search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              {/* Filter Dropdown */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="sm:w-1/3 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              {/* Search Bar */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search community..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 absolute left-3 top-3.5 text-gray-400 dark:text-gray-400"
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
          </div>

          {/* Community Cards */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredCommunities.map((community) => (
              <div
                key={community.id}
                className="transition hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                onClick={() =>
                  setSelected(selected === community.id ? null : community.id)
                }
              >
                {/* Compact Card */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5">
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <img
                      src={community.logo}
                      alt="logo"
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover bg-gray-100 dark:bg-gray-700 p-1 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h3
                        className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 truncate max-w-[180px] sm:max-w-[250px] md:max-w-[300px]"
                        title={community.name}
                      >
                        {community.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {community.category}
                      </p>
                    </div>
                  </div>

                  {/* Join Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoin(community.id);
                    }}
                    className={`w-full sm:w-auto px-4 py-1.5 rounded-md text-sm font-medium border transition text-center ${
                      joined[community.id]
                        ? "border-green-600 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30"
                        : "border-indigo-600 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                    }`}
                  >
                    {joined[community.id] ? "Joined" : "Join"}
                  </button>
                </div>

                {/* Expanded Details */}
                {selected === community.id && (
                  <div className="px-4 sm:px-5 pb-5 space-y-3">
                    {community.banner && (
                      <img
                        src={community.banner}
                        alt="banner"
                        className="w-full h-40 sm:h-48 object-cover rounded-xl"
                      />
                    )}
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {community.description}
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoin(community.id);
                        }}
                        className={`w-full py-2 rounded-md text-sm font-medium border transition ${
                          joined[community.id]
                            ? "border-green-600 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30"
                            : "border-indigo-600 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                        }`}
                      >
                        {joined[community.id] ? "Joined" : "Join Community"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredCommunities.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-6">
                No communities found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
