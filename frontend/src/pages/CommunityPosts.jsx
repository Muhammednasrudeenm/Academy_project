import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MoreVertical, Plus, X } from "lucide-react";
import PostCard from "../components/PostCard";
import AcademySidebar from "../components/sidebar/AcademySidebar";
import PostCreationModal from "../components/PostCreationModal";
import { fetchAcademyById, fetchPostsByAcademy } from "../api/api"; // ✅ fixed import

export default function CommunityPosts() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [showAddButton, setShowAddButton] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);

  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);

  // ✅ Hide + button on scroll
  useEffect(() => {
    let lastScroll = 0;
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setShowAddButton(currentScroll < lastScroll);
      lastScroll = currentScroll;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Fetch community & posts from backend
  useEffect(() => {
    const loadCommunityData = async () => {
      try {
        const groupData = await fetchAcademyById(communityId);
        setCommunity(groupData);

        const postData = await fetchPostsByAcademy(communityId); // ✅ fixed name
        setPosts(postData);
      } catch (err) {
        console.error("Error loading community data:", err);
      }
    };

    loadCommunityData();
  }, [communityId]);

  const isLongDescription =
    community && community.description && community.description.length > 100;
  const displayDescription =
    isLongDescription && !showFullDesc
      ? community.description.slice(0, 50) + "..."
      : community?.description || "";

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-gray-100 overflow-hidden">
      {/* --- SIDEBAR --- */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-[#15202B] border-r border-gray-700 z-[1000]
        transition-all duration-300 ease-in-out md:translate-x-0 md:opacity-100
        ${
          sidebarOpen
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "-translate-x-full opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto md:translate-x-0"
        }`}
      >
        <AcademySidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* --- OVERLAY (mobile close) --- */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden z-[900]
        ${
          sidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col md:ml-72 transition-all duration-300 overflow-x-hidden">
        {/* --- TOP BAR --- */}
        <div className="flex justify-between items-center px-6 py-3 bg-[#1E293B] border-b border-gray-700 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-700"
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
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>

            {/* Logo + Info */}
            {community && (
              <>
                <img
                  src={community.logo}
                  alt={community.name}
                  className="w-14 h-14 rounded-full object-cover cursor-pointer border border-gray-500 hover:scale-105 transition-transform"
                  onClick={() => setShowCommunityModal(true)}
                />
                <div className="flex flex-col justify-center">
                  <h2 className="text-2xl md:text-3xl font-bold">
                    {community.name}
                  </h2>
                  <p className="hidden md:block text-xs text-gray-400 max-w-md leading-snug">
                    {displayDescription}
                    {isLongDescription && (
                      <button
                        onClick={() => setShowFullDesc(!showFullDesc)}
                        className="ml-1 text-sky-400 hover:underline text-xs"
                      >
                        {showFullDesc ? "Show less" : "Show more"}
                      </button>
                    )}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-full hover:bg-gray-700"
            >
              <MoreVertical size={18} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-10 bg-[#1E293B] border border-gray-600 rounded-lg shadow-lg w-36 text-sm">
                <button
                  onClick={() => alert("You left the community.")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-red-400"
                >
                  Leave Community
                </button>
              </div>
            )}
          </div>
        </div>

        {/* --- POSTS SECTION --- */}
        <div className="flex-1 flex justify-center p-6">
          <div className="w-full max-w-2xl space-y-6">
            {posts.length > 0 ? (
              posts.map((post) => <PostCard key={post._id} post={post} />)
            ) : (
              <p className="text-center text-gray-400 mt-10">
                No posts available yet.
              </p>
            )}
          </div>
        </div>
      </main>

      {/* --- FLOATING + BUTTON --- */}
      {showAddButton && (
        <button
          onClick={() => setShowPostModal(true)}
          className="fixed bottom-8 right-6 bg-sky-500 hover:bg-sky-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 z-50 active:scale-95"
        >
          <Plus size={22} />
        </button>
      )}

      {/* --- COMMUNITY MODAL --- */}
      {showCommunityModal && community && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1E293B] rounded-2xl w-11/12 max-w-md p-5 relative shadow-2xl">
            <button
              onClick={() => setShowCommunityModal(false)}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-700"
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
                <p className="text-sm text-gray-400">
                  {community.members?.length || 0} members
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-300">
              {community.description || "No description available."}
            </p>
          </div>
        </div>
      )}

      {/* --- POST CREATION MODAL --- */}
      {showPostModal && (
        <PostCreationModal
          onClose={() => setShowPostModal(false)}
          onSubmit={() => {
            console.log("Post submitted");
            setShowPostModal(false);
          }}
        />
      )}
    </div>
  );
}
