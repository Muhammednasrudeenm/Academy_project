import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DefaultAcademyLogo from "../components/DefaultAcademyLogo";
import DefaultAcademyBanner from "../components/DefaultAcademyBanner";
import { toggleJoinAcademy, deleteAcademy, fetchAcademies } from "../api/api";

export default function Available_Communities() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [communities, setCommunities] = useState([]);
  const [joined, setJoined] = useState({});
  const [loading, setLoading] = useState({});
  const navigate = useNavigate();
  
  // Memoize user to prevent re-parsing on every render
  const user = useMemo(() => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (e) {
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadAcademies = async () => {
      try {
        const data = await fetchAcademies();
        if (isMounted && data.success && Array.isArray(data.data)) {
          setCommunities(data.data);
          // Initialize joined state from backend
          const joinedMap = {};
          data.data.forEach((academy) => {
            if (user && academy.members?.some((m) => {
              const memberId = m.userId?._id || m.userId;
              return memberId?.toString() === user._id || memberId === user._id;
            })) {
              joinedMap[academy._id] = true;
            }
          });
          setJoined(joinedMap);
        }
      } catch (error) {
        console.error("Error fetching academies:", error);
      }
    };
    loadAcademies();
    return () => { isMounted = false; };
  }, [user?._id]); // Only depend on user ID, not the whole user object

  const handleJoin = useCallback(async (academy) => {
    if (!user) {
      alert("Please login to join academies");
      return;
    }

    const id = academy._id;
    setLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const result = await toggleJoinAcademy(id, user._id);
      setJoined((prev) => ({ ...prev, [id]: !prev[id] }));
      // Refresh communities to get updated member count
      const data = await fetchAcademies();
      if (data.success && Array.isArray(data.data)) {
        setCommunities(data.data);
      }
      // Trigger event for sidebar update
      window.dispatchEvent(new CustomEvent('academyMembershipChanged'));
    } catch (error) {
      console.error("Error joining academy:", error);
      alert("Failed to join/leave academy");
    } finally {
      setLoading((prev) => ({ ...prev, [id]: false }));
    }
  }, [user]);

  const handleDelete = useCallback(async (academyId, e) => {
    e.stopPropagation();
    if (!user) return;
    
    if (!window.confirm("Are you sure you want to delete this academy? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteAcademy(academyId, user._id);
      setCommunities((prev) => prev.filter((a) => a._id !== academyId));
      setJoined((prev) => {
        const updated = { ...prev };
        delete updated[academyId];
        return updated;
      });
      // Trigger event for sidebar update
      window.dispatchEvent(new CustomEvent('academyMembershipChanged'));
      alert("Academy deleted successfully");
    } catch (error) {
      console.error("Error deleting academy:", error);
      alert(error.message || "Failed to delete academy");
    }
  }, [user]);

  // Memoize categories to prevent recalculation on every render
  const categories = useMemo(() => {
    return ["All", ...new Set(communities.map((c) => c.category || "Uncategorized"))];
  }, [communities]);

  // Memoize filtered results
  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase();
    return communities.filter(
      (c) =>
        (filter === "All" || c.category === filter) &&
        c.name.toLowerCase().includes(searchLower)
    );
  }, [communities, filter, search]);

  return (
    <div className="w-full relative z-[90] overflow-x-hidden" style={{ width: '100%', maxWidth: '100%' }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-sky-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Premium Header Section */}
        <div className="relative mb-8 pb-6 border-b border-gray-700/50 animate-fadeIn">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 via-purple-500/5 to-sky-500/5 blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-sky-500/30 to-purple-500/30 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Available Academies
              </h2>
            </div>
            <p className="text-gray-400 text-sm sm:text-base ml-11">
              Explore sports academies and connect with like-minded people
            </p>
          </div>
        </div>

        {/* Premium Filters Section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-fadeIn delay-100">
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full sm:w-auto min-w-[180px] border-2 border-gray-700/50 rounded-xl px-4 py-3 text-sm bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300 hover:border-gray-600"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-gray-800">{c}</option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 group">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search academy by name..."
              className="w-full border-2 border-gray-700/50 rounded-xl pl-11 pr-4 py-3 text-sm bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all duration-300 hover:border-gray-600"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sky-400 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
              />
            </svg>
          </div>
        </div>

        {/* Premium Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 w-full">
          {filtered.map((a, index) => {
            // Handle both populated and non-populated createdBy
            const createdById = a.createdBy?._id || a.createdBy;
            const isCreator = user && (
              createdById?.toString() === user._id || 
              createdById === user._id
            );
            const isJoined = joined[a._id];
            const memberCount = a.members?.length || 0;
            const maxCapacity = 50; // Default capacity, you can adjust this
            
            return (
              <div
                key={a._id}
                className="relative w-full rounded-3xl overflow-hidden cursor-pointer shadow-2xl hover:shadow-sky-500/20 transition-all duration-500 group transform hover:scale-[1.02] animate-fadeIn"
                style={{ 
                  minHeight: '320px', 
                  maxHeight: '400px',
                  animationDelay: `${index * 0.05}s`
                }}
                onClick={() => navigate(`/community/${a._id}`)}
              >
                {/* Background Image - Enhanced with Animation */}
                {a.banner && a.banner.trim() !== '' ? (
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{
                      backgroundImage: `url(${a.banner})`
                    }}
                  />
                ) : (
                  <div className="absolute inset-0">
                    <DefaultAcademyBanner className="h-full" />
                  </div>
                )}
                
                {/* Premium Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/75 to-black/40 group-hover:from-black/90 group-hover:via-black/65 group-hover:to-black/30 transition-all duration-500" />
                
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                
                {/* Delete button for creator */}
                {isCreator && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(a._id, e);
                    }}
                    className="absolute top-4 right-4 p-2 transition-all z-20 hover:scale-110 transform"
                    title="Delete Academy"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              
                {/* Content - All at Bottom - Premium */}
                <div className="absolute bottom-0 left-0 right-0 z-10 p-4 sm:p-5 md:p-6">
                  {/* Profile Picture and Title Section - Enhanced */}
                  <div className="flex items-end gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="relative group/logo">
                      <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-purple-500 rounded-full blur-md opacity-0 group-hover/logo:opacity-50 transition-opacity"></div>
                      {a.logo && a.logo.trim() !== '' ? (
                        <img
                          src={a.logo}
                          alt={a.name}
                          className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full object-cover border-4 border-white/90 shadow-2xl flex-shrink-0 transition-transform group-hover/logo:scale-110"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.querySelector('div').style.display = 'flex';
                          }}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : null}
                      <div style={{ display: a.logo && a.logo.trim() !== '' ? 'none' : 'flex' }}>
                        <DefaultAcademyLogo size="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18" className="rounded-full border-4 border-white/90 shadow-2xl transition-transform group-hover/logo:scale-110" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-3 border-white shadow-lg"></div>
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-1.5 drop-shadow-2xl leading-tight group-hover:text-sky-100 transition-colors">
                        {a.name}
                      </h3>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-sky-500/20 to-purple-500/20 border border-sky-400/30 backdrop-blur-sm">
                        <span className="text-xs sm:text-sm text-sky-300 font-semibold uppercase tracking-wide">
                          {a.category || "Uncategorized"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Statistics Row - Only Members */}
                  <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                    {/* Members Count - Enhanced */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 hover:bg-blue-500/30 transition-all">
                      <div className="p-1 rounded-lg bg-gradient-to-br from-blue-500/40 to-blue-600/30">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-white whitespace-nowrap drop-shadow-lg">
                        {memberCount} / {maxCapacity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-16 animate-fadeIn">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-gray-800/50 to-gray-900/50 mb-4 border border-gray-700/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-xl font-bold text-gray-300 mb-2">No academies found</p>
            <p className="text-sm text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Custom CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
