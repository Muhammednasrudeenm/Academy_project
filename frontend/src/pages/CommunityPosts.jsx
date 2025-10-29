import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MoreVertical, Plus, X } from "lucide-react";
import PostCard from "../components/PostCard";
import AcademySidebar from "../components/sidebar/AcademySidebar";

export default function CommunityPosts() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [showAddButton, setShowAddButton] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Hide + button on scroll
  useEffect(() => {
    let lastScroll = 0;
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScroll) setShowAddButton(false);
      else setShowAddButton(true);
      lastScroll = currentScroll;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Dummy community data
  const community = {
    id: communityId,
    name: "Tech Learners Hub",
    logo: "https://img.icons8.com/color/96/000000/code.png",
    banner:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80",
    description:
      "A space for learners to share coding tips, tutorials, and experiences in software development. We focus on helping people grow through projects, feedback, and sharing useful resources daily.",
    members: 1243,
  };

  const [posts] = useState([
    {
      id: 1,
      title: "Training Day Highlights",
      caption:
        "Great teamwork today! 💪🔥 We learned new passing techniques and tried some new defensive drills that really worked well. Excited to see how we perform next match!",
      image: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1",
      date: "Oct 26, 2025",
      likes: 120,
      comments: 15,
      user: { name: "Alex Johnson", profilePic: "https://randomuser.me/api/portraits/men/32.jpg" },
    },
    {
      id: 2,
      title: "Match Victory!",
      caption:
        "We did it! 🏆 Our teamwork paid off. So proud of everyone on the field. Can't wait for the next challenge.",
      video: "https://cdn.pixabay.com/video/2019/10/14/28217-366456199_tiny.mp4",
      date: "Oct 25, 2025",
      likes: 340,
      comments: 42,
      user: { name: "Sophia Lee", profilePic: "https://randomuser.me/api/portraits/women/44.jpg" },
    },
    {
      id: 3,
      title: "Training Day Highlights",
      caption:
        "Great teamwork today! 💪🔥 We learned new passing techniques and tried some new defensive drills that really worked well. Excited to see how we perform next match!",
      image: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1",
      date: "Oct 26, 2025",
      likes: 120,
      comments: 15,
      user: { name: "Alex Johnson", profilePic: "https://randomuser.me/api/portraits/men/32.jpg" },
    },
  ]);

  const isLongDescription = community.description.length > 100;
  const displayDescription =
    isLongDescription && !showFullDesc
      ? community.description.slice(0, 50) + "..."
      : community.description;

  return (
    <div className="flex min-h-screen w-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
      {/* --- SIDEBAR --- */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-[1000]
        transition-all duration-300 ease-in-out md:translate-x-0 md:opacity-100
        ${
          sidebarOpen
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "-translate-x-full opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto md:translate-x-0"
        }`}
      >
        <AcademySidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* --- OVERLAY (click outside to close sidebar in mobile) --- */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden z-[900]
        ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 md:ml-64">
        {/* --- TOP BAR --- */}
        <div className="flex justify-between items-center px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 pl-10">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
  onClick={() => setSidebarOpen(!sidebarOpen)}
  className="md:hidden p-2 -ml-8 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    sidebarOpen
                      ? "M6 18L18 6M6 6l12 12" // X icon
                      : "M4 6h16M4 12h16M4 18h16" // Hamburger
                  }
                />
              </svg>
            </button>

            {/* Logo + Text */}
            <img
              src={community.logo}
              alt={community.name}
              className="w-15 h-15 rounded-full object-cover cursor-pointer border border-gray-300 dark:border-gray-600 hover:scale-105 transition-transform "
              onClick={() => setShowCommunityModal(true)}
            />
            <div className="flex flex-col justify-center leading-tight">
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100 leading-none">
  {community.name}
</h2>

              {/* Description hidden on mobile */}
              <p className="hidden md:block text-xs text-gray-500 dark:text-gray-400 max-w-md leading-snug">
                {displayDescription}
                {isLongDescription && (
                  <button
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    className="ml-1 text-sky-500 hover:underline text-xs"
                  >
                    {showFullDesc ? "Show less" : "Show more"}
                  </button>
                )}
              </p>
            </div>
          </div>

          {/* Top bar menu */}
          <div className="flex items-center gap-2 relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <MoreVertical size={18} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg w-36 text-sm">
                <button
                  onClick={() => alert("You left the community.")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
                >
                  Leave Community
                </button>
              </div>
            )}
          </div>
        </div>

        {/* --- POSTS SECTION --- */}
        <div className="flex-1 w-full min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center p-6">
          <div className="w-full max-w-3xl">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </div>

      {/* --- FLOATING + BUTTON --- */}
      {showAddButton && (
        <button
          onClick={() => navigate("/form")}
          className="fixed bottom-6 right-6 bg-sky-500 hover:bg-sky-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 z-50"
        >
          <Plus size={24} />
        </button>
      )}

      {/* --- COMMUNITY MODAL --- */}
      {showCommunityModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-11/12 max-w-md p-5 relative shadow-2xl">
            <button
              onClick={() => setShowCommunityModal(false)}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X size={18} />
            </button>

            <img
              src={community.banner}
              alt="Community Banner"
              className="w-full h-32 object-cover rounded-lg mb-4"
            />
            <div className="flex items-center gap-3 mb-2">
              <img
                src={community.logo}
                alt={community.name}
                className="w-12 h-12 rounded-full border-2 border-sky-500"
              />
              <div>
                <h2 className="text-lg font-semibold">{community.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {community.members.toLocaleString()} members
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {community.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
