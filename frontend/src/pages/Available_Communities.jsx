import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import DefaultAcademyLogo from "../components/DefaultAcademyLogo";
import DefaultAcademyBanner from "../components/DefaultAcademyBanner";
import BottomNavigation from "../components/BottomNavigation";
import { toggleJoinAcademy, deleteAcademy, fetchAcademies, fetchJoinedAcademies, fetchMyAcademies } from "../api/api";
import { useToast } from "../contexts/ToastContext";

export default function Available_Communities() {
  const { showError, showSuccess, showWarning } = useToast();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [clickedCardId, setClickedCardId] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [joined, setJoined] = useState({});
  const [loading, setLoading] = useState({});
  const [isLoadingAcademies, setIsLoadingAcademies] = useState(true);
  const [showJoinedAcademiesModal, setShowJoinedAcademiesModal] = useState(false);
  const [joinedAcademies, setJoinedAcademies] = useState([]);
  const [showMyAcademiesModal, setShowMyAcademiesModal] = useState(false);
  const [myAcademies, setMyAcademies] = useState([]);
  const [joinedAcademyIds, setJoinedAcademyIds] = useState(new Set());
  const [createdAcademyIds, setCreatedAcademyIds] = useState(new Set());
  const [navigationDropdown, setNavigationDropdown] = useState("");
  const navigate = useNavigate();
  
  // Available categories
  const categories = ["Football", "Cricket", "Basketball", "Tennis", "Swimming", "Other"];
  
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
      setIsLoadingAcademies(true);
        try {
          // Try to use cached data first, but still show loading
          const data = await fetchAcademies(true); // Force refresh on page load
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
      } finally {
        if (isMounted) {
          setIsLoadingAcademies(false);
        }
      }
    };
    loadAcademies();
    return () => { isMounted = false; };
  }, [user?._id]); // Only depend on user ID, not the whole user object

  // Fetch joined and created academies to filter them out
  useEffect(() => {
    const fetchUserAcademies = async () => {
      if (user?._id) {
        try {
          // Fetch joined academies
          const joinedData = await fetchJoinedAcademies(user._id);
          if (joinedData.success && Array.isArray(joinedData.data)) {
            const joinedIds = new Set(joinedData.data.map(a => a._id || a.id));
            setJoinedAcademyIds(joinedIds);
            // Also set joined academies for modal
            setJoinedAcademies(joinedData.data || []);
          }
          
          // Fetch created academies
          const myData = await fetchMyAcademies(user._id);
          if (myData.success && Array.isArray(myData.data)) {
            const createdIds = new Set(myData.data.map(a => a._id || a.id));
            setCreatedAcademyIds(createdIds);
            // Also set my academies for modal
            setMyAcademies(myData.data || []);
          }
        } catch (error) {
          console.error("Error fetching user academies:", error);
        }
      }
    };
    fetchUserAcademies();
  }, [user?._id]);

  // Fetch joined academies when modal opens (for refresh)
  useEffect(() => {
    const fetchJoined = async () => {
      if (showJoinedAcademiesModal && user?._id) {
        try {
          const data = await fetchJoinedAcademies(user._id);
          if (data.success) {
            setJoinedAcademies(data.data || []);
            const joinedIds = new Set(data.data.map(a => a._id || a.id));
            setJoinedAcademyIds(joinedIds);
          }
        } catch (error) {
          console.error("Error fetching joined academies:", error);
        }
      }
    };
    fetchJoined();
  }, [showJoinedAcademiesModal, user?._id]);

  // Fetch my academies when modal opens (for refresh)
  useEffect(() => {
    const fetchMy = async () => {
      if (showMyAcademiesModal && user?._id) {
        try {
          const data = await fetchMyAcademies(user._id);
          if (data.success) {
            setMyAcademies(data.data || []);
            const createdIds = new Set(data.data.map(a => a._id || a.id));
            setCreatedAcademyIds(createdIds);
          }
        } catch (error) {
          console.error("Error fetching my academies:", error);
        }
      }
    };
    fetchMy();
  }, [showMyAcademiesModal, user?._id]);

  const handleJoin = useCallback(async (academy) => {
    if (!user) {
      showWarning("Please login to join academies");
      return;
    }

    if (!user._id) {
      showError("User ID not found. Please login again.");
      return;
    }

    const id = academy._id || academy.id;
    if (!id) {
      console.error("Academy ID not found:", academy);
      showError("Invalid academy");
      return;
    }

    setLoading((prev) => ({ ...prev, [id]: true }));
    
    // Optimistic update - update UI immediately
    const previousJoinedState = joined[id] || false;
    const previousMemberCount = academy.members?.length || 0;
    
    // Immediately update the UI
    setJoined((prev) => ({ ...prev, [id]: !prev[id] }));
    setCommunities((prev) => 
      prev.map((a) => {
        if (a._id === id || a.id === id) {
          const isJoining = !previousJoinedState;
          return {
            ...a,
            members: isJoining 
              ? [...(a.members || []), { userId: user._id }]
              : (a.members || []).filter((m) => {
                  const memberId = m.userId?._id || m.userId;
                  return String(memberId) !== String(user._id);
                }),
          };
        }
        return a;
      })
    );
    
    // Trigger event for sidebar update immediately with academy data
    window.dispatchEvent(new CustomEvent('academyMembershipChanged', {
      detail: {
        academyId: id,
        academy: {
          ...academy,
          members: previousJoinedState
            ? (academy.members || []).filter((m) => {
                const memberId = m.userId?._id || m.userId;
                return String(memberId) !== String(user._id);
              })
            : [...(academy.members || []), { userId: user._id }]
        },
        isJoining: !previousJoinedState,
        userId: user._id
      }
    }));
    
    try {
      const result = await toggleJoinAcademy(id, user._id);
      if (result.success) {
        // Update with server response for accuracy
        if (result.data) {
          setCommunities((prev) =>
            prev.map((a) => (a._id === id || a.id === id) ? result.data : a)
          );
          
          // Dispatch event again with accurate server data
          const joined = result.data.members?.some((m) => {
            const memberId = m.userId?._id || m.userId;
            return String(memberId) === String(user._id);
          });
          
          // Update joinedAcademyIds set based on whether user joined or left
          setJoinedAcademyIds((prev) => {
            const newSet = new Set(prev);
            if (joined) {
              newSet.add(id);
            } else {
              newSet.delete(id);
            }
            return newSet;
          });
          
          window.dispatchEvent(new CustomEvent('academyMembershipChanged', {
            detail: {
              academyId: id,
              academy: result.data,
              isJoining: joined,
              userId: user._id
            }
          }));
        }
      } else {
        // Revert on failure
        setJoined((prev) => ({ ...prev, [id]: previousJoinedState }));
        setCommunities((prev) =>
          prev.map((a) => {
            if (a._id === id || a.id === id) {
              return {
                ...a,
                members: previousJoinedState 
                  ? [...(a.members || []), { userId: user._id }]
                  : (a.members || []).slice(0, previousMemberCount),
              };
            }
            return a;
          })
        );
        throw new Error(result.message || "Failed to update membership");
      }
    } catch (error) {
      console.error("Error joining academy:", error);
      // Revert optimistic update on error
      setJoined((prev) => ({ ...prev, [id]: previousJoinedState }));
      setCommunities((prev) =>
        prev.map((a) => {
          if (a._id === id || a.id === id) {
            return {
              ...a,
              members: previousJoinedState 
                ? [...(a.members || []), { userId: user._id }]
                : (a.members || []).slice(0, previousMemberCount),
            };
          }
          return a;
        })
      );
      showError(error.message || "Failed to join/leave academy");
    } finally {
      setLoading((prev) => ({ ...prev, [id]: false }));
    }
  }, [user, joined, showError]);

  const handleDelete = useCallback(async (academyId, e) => {
    e.stopPropagation();
    if (!user) return;
    
    // Use a styled confirmation via toast warning - if user wants to proceed, they can delete again
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
      showSuccess("Academy deleted successfully");
    } catch (error) {
      console.error("Error deleting academy:", error);
      showError(error.message || "Failed to delete academy");
    }
  }, [user, showSuccess, showError]);

  // Navigation is now handled by right sidebar buttons - handleNavigationChange removed

  // Memoize filtered results (by search, category, and exclude joined/created academies)
  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase();
    return communities.filter((c) => {
      const academyId = c._id || c.id;
      
      // Exclude academies that user has joined or created
      const isJoined = joinedAcademyIds.has(academyId);
      const isCreated = createdAcademyIds.has(academyId);
      
      // Show only academies that are NOT joined and NOT created
      // (This includes academies the user left, since they won't be in joinedAcademyIds)
      if (isJoined || isCreated) {
        return false;
      }
      
      const matchesSearch = c.name.toLowerCase().includes(searchLower);
      const matchesCategory = !selectedCategory || c.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [communities, search, selectedCategory, joinedAcademyIds, createdAcademyIds]);

  return (
    <div className="w-full relative z-[90] overflow-x-hidden pb-20 md:pb-0 bg-black">
      {/* Bottom Navigation - Mobile Only */}
      {!(showJoinedAcademiesModal || showMyAcademiesModal) && (
        <BottomNavigation 
          onJoinedClick={() => setShowJoinedAcademiesModal(true)}
          onMyAcademiesClick={() => setShowMyAcademiesModal(true)}
        />
      )}

      <div className="flex w-full relative">
        {/* Main Content Area */}
        <div className="flex-1 relative z-10 w-full md:mr-80">
          {/* Twitter-style Header Section */}
          <div className="mb-6 md:mb-8 pb-4 md:pb-6 border-b border-[#2f3336]">
            <div>
              <h2 className="text-[20px] font-bold text-white mb-2 leading-tight">
                Available Academies
              </h2>
              <p className="text-[#71767a] text-[15px] leading-normal">
                Explore sports academies and connect with like-minded people
              </p>
            </div>
          </div>

          {/* Premium Filters Section */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-fadeIn delay-100">
            {/* Category Filter Dropdown - Desktop and Mobile */}
            <div className="relative group">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="relative w-full sm:w-auto min-w-[200px] border border-[#2f3336] rounded-lg px-4 py-2.5 text-[15px] bg-black text-white focus:outline-none focus:border-[#1d9bf0] focus:ring-1 focus:ring-[#1d9bf0] transition-colors min-h-[48px] cursor-pointer font-medium leading-normal"
              >
                <option value="" style={{ backgroundColor: '#000000', color: '#71767a' }}>All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} style={{ backgroundColor: '#000000', color: '#ffffff' }}>
                    {cat}
                  </option>
                ))}
              </select>
              {/* Custom dropdown arrow */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-[#71767a] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="relative flex-1 group">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search academy by name..."
              className="w-full border border-[#2f3336] rounded-full pl-11 pr-4 py-2.5 text-[15px] bg-black text-white placeholder-[#71767a] focus:outline-none focus:border-[#1d9bf0] focus:ring-1 focus:ring-[#1d9bf0] transition-colors leading-normal"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#71767a] group-focus-within:text-[#1d9bf0] transition-colors"
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

        {/* Loading State */}
        {isLoadingAcademies && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-8 h-8 border-2 border-[#1d9bf0] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-[#71767a] text-[15px] font-medium leading-normal">Loading academies...</p>
            </div>
          </div>
        )}

        {/* Premium Cards Grid - One by one in web view */}
        {!isLoadingAcademies && (
        <div className="flex flex-col items-center gap-4 sm:gap-3 md:gap-6 w-full px-4 sm:px-0">
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
                className={`relative w-full mx-auto rounded-3xl overflow-hidden cursor-pointer shadow-2xl hover:shadow-sky-500/20 transition-all duration-500 group transform hover:scale-[1.02] animate-fadeIn ${
                  clickedCardId === a._id ? 'md:shadow-none' : ''
                }`}
                style={{ 
                  minHeight: '320px', 
                  maxHeight: '400px',
                  maxWidth: '900px',
                  animationDelay: `${index * 0.05}s`,
                  boxShadow: clickedCardId === a._id 
                    ? '0 16px 40px rgba(139, 92, 246, 0.8), 0 8px 20px rgba(139, 92, 246, 0.6)' 
                    : undefined
                }}
                onClick={() => {
                  setClickedCardId(a._id);
                  setTimeout(() => {
                    navigate(`/community/${a._id}`);
                  }, 200);
                }}
                onTouchStart={() => setClickedCardId(a._id)}
                onTouchEnd={() => setTimeout(() => setClickedCardId(null), 300)}
              >
                {/* Neon Violet Glow Effect - Mobile Only - Bottom of Card */}
                {clickedCardId === a._id && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-violet-500/90 blur-2xl rounded-full md:hidden z-20 pointer-events-none"></div>
                )}
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
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="relative group/logo flex-shrink-0">
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
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[20px] font-bold text-white mb-1.5 drop-shadow-2xl leading-tight group-hover:text-sky-100 transition-colors">
                        {a.name}
                      </h3>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16181c] border border-[#2f3336]">
                        <span className="text-[13px] text-[#71767a] font-medium leading-normal">
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
                      <span className="text-[13px] font-bold text-white whitespace-nowrap drop-shadow-lg leading-normal">
                        {memberCount} / {maxCapacity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* Empty State */}
        {!isLoadingAcademies && filtered.length === 0 && (
          <div className="text-center py-16">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#71767a] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-[20px] font-bold text-white mb-2 leading-tight">No academies found</p>
            <p className="text-[15px] text-[#71767a] leading-normal">Try adjusting your search or filter criteria</p>
          </div>
        )}
        </div>

        {/* Right Sidebar Navigation - Desktop Only */}
        <aside className="hidden md:flex md:fixed md:top-0 md:right-0 md:h-screen md:w-80 bg-black border-l border-[#2f3336] z-[1000] overflow-y-auto">
          <div className="w-full p-6">
            <div className="flex flex-col gap-3">
              {/* Joined Academies Button */}
              <button
                onClick={() => {
                  // Close other modals first
                  setShowMyAcademiesModal(false);
                  // Toggle joined academies modal
                  setShowJoinedAcademiesModal(prev => !prev);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-full border transition-colors text-left ${
                  showJoinedAcademiesModal 
                    ? 'bg-[#181818] text-white border-[#2f3336]' 
                    : 'bg-black text-white border-[#2f3336] hover:bg-[#181818]'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-[15px] font-bold leading-normal">Joined Academies</span>
              </button>

              {/* My Academies Button */}
              <button
                onClick={() => {
                  // Close other modals first
                  setShowJoinedAcademiesModal(false);
                  // Toggle my academies modal
                  setShowMyAcademiesModal(prev => !prev);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-full border transition-colors text-left ${
                  showMyAcademiesModal 
                    ? 'bg-[#181818] text-white border-[#2f3336]' 
                    : 'bg-black text-white border-[#2f3336] hover:bg-[#181818]'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-[15px] font-bold leading-normal">My Academies</span>
              </button>

              {/* Create Academy Button */}
              <button
                onClick={() => {
                  // Close all modals before navigating
                  setShowJoinedAcademiesModal(false);
                  setShowMyAcademiesModal(false);
                  navigate("/form");
                }}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-full bg-white text-black hover:bg-[#e6e6e6] transition-colors text-left font-bold"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-[15px] font-bold leading-normal">Create Academy</span>
              </button>
            </div>
          </div>
        </aside>
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
        /* Dropdown/Select Option Styling - Twitter Style */
        select option {
          background: #000000 !important;
          color: #ffffff !important;
          padding: 14px 18px !important;
          font-weight: 400;
          font-size: 15px;
          border: none;
          cursor: pointer;
        }
        select option:hover,
        select option:focus {
          background: #181818 !important;
          color: #ffffff !important;
        }
        select option:checked,
        select option[selected] {
          background: #16181c !important;
          color: #ffffff !important;
          font-weight: 500;
        }
        select option:disabled {
          color: rgba(156, 163, 175, 0.6) !important;
          background: linear-gradient(135deg, rgba(31, 41, 55, 0.5) 0%, rgba(15, 23, 42, 0.5) 100%) !important;
          backdrop-filter: blur(8px) !important;
          -webkit-backdrop-filter: blur(8px) !important;
          cursor: not-allowed;
        }
        /* Styling for the select element itself - Remove default arrow */
        select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          padding-right: 45px !important;
        }
        
        /* Mobile-specific dropdown styling */
        @media (max-width: 640px) {
          /* Ensure touch-friendly select elements on mobile */
          select {
            min-height: 48px !important; /* iOS recommended touch target */
            font-size: 16px !important; /* Prevents zoom on iOS */
            padding: 14px 48px 14px 16px !important;
            background-position: right 14px center !important;
            background-size: 18px !important;
            border-radius: 12px !important;
          }
          
          /* Better mobile dropdown options - Twitter Style */
          select option {
            padding: 16px 20px !important;
            font-size: 16px !important;
            min-height: 48px !important;
            line-height: 1.5 !important;
            background: #000000 !important;
            color: #ffffff !important;
          }
          select option:hover,
          select option:focus {
            background: #181818 !important;
          }
          select option:checked,
          select option[selected] {
            background: #16181c !important;
          }
          
          /* Mobile select focus states - Twitter Style */
          select:focus {
            border-color: #1d9bf0 !important;
            box-shadow: 0 0 0 1px #1d9bf0 !important;
          }
          
          /* Ensure dropdown menu is readable on mobile */
          select:active,
          select:focus {
            background-color: #000000 !important;
          }
        }
        
        /* Tablet and medium screen optimizations */
        @media (min-width: 641px) and (max-width: 1024px) {
          select {
            min-height: 44px !important;
            padding: 12px 44px 12px 16px !important;
          }
          
          select option {
            padding: 14px 18px !important;
            font-size: 15px !important;
          }
        }
        
        /* Desktop - Full width optimizations for Available Academies */
        @media (min-width: 1024px) {
          /* Ensure academy cards grid uses available width with proper spacing */
          .grid[class*="grid-cols"] {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          
          /* Ensure cards take full width of their grid cell */
          .grid[class*="grid-cols"] > div {
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
        }
        
        /* Modal Animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>

      {/* --- JOINED ACADEMIES MODAL - Twitter Style --- */}
      {showJoinedAcademiesModal && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-end md:items-center justify-center z-[9999] md:z-50 p-0 md:p-4"
          onClick={() => setShowJoinedAcademiesModal(false)}
        >
          <div 
            className="relative w-full md:max-w-lg max-h-[85vh] md:max-h-[75vh] flex flex-col animate-slideUp rounded-t-[2.5rem] md:rounded-2xl overflow-hidden bg-black border border-[#2f3336]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex items-center justify-between p-6 pb-4 border-b border-[#2f3336] sticky top-0 z-10 bg-black">
              <div className="flex items-center gap-4">
                <div className="relative p-3 rounded-2xl bg-[#16181c]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Joined Academies</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-3 py-1 rounded-full bg-[#16181c] text-[#71767a] text-xs font-medium">
                      {joinedAcademies.length} {joinedAcademies.length === 1 ? 'academy' : 'academies'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowJoinedAcademiesModal(false)}
                className="p-2 rounded-full hover:bg-[#181818] transition-colors"
              >
                <X size={18} className="text-white" />
              </button>
            </div>

            <div className="relative overflow-y-auto p-5 space-y-3 z-10" style={{ maxHeight: '350px' }}>
              <style>{`
                .joined-academies-scroll::-webkit-scrollbar {
                  width: 0;
                  display: none;
                }
                .joined-academies-scroll {
                  scrollbar-width: none;
                  -ms-overflow-style: none;
                }
              `}</style>
              
              {joinedAcademies.length > 0 ? (
                joinedAcademies.map((academy, index) => (
                  <button
                    key={academy._id || academy.id}
                    onClick={() => {
                      navigate(`/community/${academy._id || academy.id}`);
                      setShowJoinedAcademiesModal(false);
                    }}
                    className="relative w-full flex items-center gap-4 p-4 hover:bg-[#181818] transition-colors border-b border-[#2f3336] last:border-0"
                  >
                    <div className="relative flex-shrink-0 z-10">
                      <div className="relative">
                        {academy.logo && academy.logo.trim() !== '' ? (
                          <img
                            src={academy.logo}
                            alt={academy.name}
                            className="w-12 h-12 rounded-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.querySelector('div').style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div style={{ display: academy.logo && academy.logo.trim() !== '' ? 'none' : 'flex' }}>
                          <DefaultAcademyLogo size="w-12 h-12" className="rounded-full" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 text-left z-10">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[15px] font-bold text-white truncate">
                          {academy.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {academy.category && (
                          <span className="text-xs font-medium text-[#71767a]">
                            {academy.category}
                          </span>
                        )}
                        <span className="text-xs text-[#71767a] flex items-center gap-1">
                          {academy.members?.length || 0} members
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#71767a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-16 px-4 z-10">
                  <h3 className="text-lg font-bold text-white mb-2">No Joined Academies</h3>
                  <p className="text-sm text-[#71767a] mb-6 max-w-sm mx-auto">Start exploring and join academies to build your community network</p>
                  <button
                    onClick={() => {
                      setShowJoinedAcademiesModal(false);
                      navigate("/communities");
                    }}
                    className="px-6 py-3 bg-white text-black rounded-full font-bold hover:bg-[#e6e6e6] transition-colors"
                  >
                    Explore Academies
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MY ACADEMIES MODAL - Twitter Style --- */}
      {showMyAcademiesModal && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-end md:items-center justify-center z-[9999] md:z-50 p-0 md:p-4"
          onClick={() => setShowMyAcademiesModal(false)}
        >
          <div 
            className="relative w-full md:max-w-lg max-h-[85vh] md:max-h-[75vh] flex flex-col animate-slideUp rounded-t-[2.5rem] md:rounded-2xl overflow-hidden bg-black border border-[#2f3336]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex items-center justify-between p-6 pb-4 border-b border-[#2f3336] sticky top-0 z-10 bg-black">
              <div className="flex items-center gap-4">
                <div className="relative p-3 rounded-2xl bg-[#16181c]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">My Academies</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-3 py-1 rounded-full bg-[#16181c] text-[#71767a] text-xs font-medium">
                      {myAcademies.length} {myAcademies.length === 1 ? 'academy' : 'academies'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowMyAcademiesModal(false)}
                className="p-2 rounded-full hover:bg-[#181818] transition-colors"
              >
                <X size={18} className="text-white" />
              </button>
            </div>

            <div className="relative overflow-y-auto p-5 space-y-3 z-10" style={{ maxHeight: '350px' }}>
              {myAcademies.length > 0 ? (
                myAcademies.map((academy, index) => (
                  <button
                    key={academy._id || academy.id}
                    onClick={() => {
                      navigate(`/community/${academy._id || academy.id}`);
                      setShowMyAcademiesModal(false);
                    }}
                    className="relative w-full flex items-center gap-4 p-4 hover:bg-[#181818] transition-colors border-b border-[#2f3336] last:border-0"
                  >
                    <div className="relative flex-shrink-0 z-10">
                      <div className="relative">
                        {academy.logo && academy.logo.trim() !== '' ? (
                          <img
                            src={academy.logo}
                            alt={academy.name}
                            className="w-12 h-12 rounded-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.querySelector('div').style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div style={{ display: academy.logo && academy.logo.trim() !== '' ? 'none' : 'flex' }}>
                          <DefaultAcademyLogo size="w-12 h-12" className="rounded-full" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 text-left z-10">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[15px] font-bold text-white truncate">
                          {academy.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {academy.category && (
                          <span className="text-xs font-medium text-[#71767a]">
                            {academy.category}
                          </span>
                        )}
                        <span className="text-xs text-[#71767a] flex items-center gap-1">
                          {academy.members?.length || 0} members
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#71767a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-16 px-4 z-10">
                  <h3 className="text-lg font-bold text-white mb-2">No Academies Created</h3>
                  <p className="text-sm text-[#71767a] mb-6 max-w-sm mx-auto">Create your first academy to start building your community</p>
                  <button
                    onClick={() => {
                      setShowMyAcademiesModal(false);
                      navigate("/form");
                    }}
                    className="px-6 py-3 bg-white text-black rounded-full font-bold hover:bg-[#e6e6e6] transition-colors"
                  >
                    Create Academy
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
