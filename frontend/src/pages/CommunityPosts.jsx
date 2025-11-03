import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MoreVertical, Plus, X, Trash2, Image, Video, Smile, Edit } from "lucide-react";
import PostCard from "../components/PostCard";
import AcademySidebar from "../components/sidebar/AcademySidebar";
import BottomNavigation from "../components/BottomNavigation";
import PostCreationModal from "../components/PostCreationModal";
import DefaultAcademyLogo from "../components/DefaultAcademyLogo";
import DefaultAcademyBanner from "../components/DefaultAcademyBanner";
import { fetchAcademyById, fetchPostsByAcademy, toggleJoinAcademy, deleteAcademy, createPost, uploadMedia, fetchJoinedAcademies, fetchMyAcademies } from "../api/api";
import { useToast } from "../contexts/ToastContext";

export default function CommunityPosts() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showAddButton, setShowAddButton] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showJoinedAcademiesModal, setShowJoinedAcademiesModal] = useState(false);
  const [joinedAcademies, setJoinedAcademies] = useState([]);
  const [showMyAcademiesModal, setShowMyAcademiesModal] = useState(false);
  const [myAcademies, setMyAcademies] = useState([]);

  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isJoined, setIsJoined] = useState(null); // null = checking, true/false = known
  const [isCreator, setIsCreator] = useState(null); // null = checking, true/false = known
  const [isLoadingCommunity, setIsLoadingCommunity] = useState(true);
  
  // Memoize user to prevent re-parsing on every render
  const user = useMemo(() => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (e) {
      return null;
    }
  }, []);

  // Compose box state (Twitter style)
  const [composeTitle, setComposeTitle] = useState("");
  const [composeCaption, setComposeCaption] = useState("");
  const [composeFile, setComposeFile] = useState(null);
  const [composePreview, setComposePreview] = useState(null);
  const [composeLoading, setComposeLoading] = useState(false);
  const [showComposeBox, setShowComposeBox] = useState(false);
  
  // Refs for detecting outside clicks
  const composeBoxRef = useRef(null);
  const menuRef = useRef(null);

  // ✅ Hide + button on scroll down, show on scroll stop or scroll up
  useEffect(() => {
    let lastScroll = 0;
    let ticking = false;
    let scrollTimeout = null;
    
    const handleScroll = (e) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollElement = e.target;
          const currentScroll = scrollElement.scrollTop || 0;
          const scrollDifference = Math.abs(currentScroll - lastScroll);
          
          // Clear any existing timeout
          if (scrollTimeout) {
            clearTimeout(scrollTimeout);
          }
          
          // Only update if scroll difference is significant (prevents flickering)
          if (scrollDifference > 5) {
            if (currentScroll > lastScroll && currentScroll > 50) {
              // Scrolling down - hide button
              setShowAddButton(false);
            } else if (currentScroll < lastScroll) {
              // Scrolling up - show button immediately
              setShowAddButton(true);
            }
            lastScroll = currentScroll;
          }
          
          // Show button when scrolling stops (after 150ms of no scroll)
          scrollTimeout = setTimeout(() => {
            setShowAddButton(true);
          }, 150);
          
          ticking = false;
        });
        ticking = true;
      }
    };
    
    const postsContainer = document.querySelector('.posts-container');
    if (postsContainer) {
      postsContainer.addEventListener("scroll", handleScroll, { passive: true });
      return () => {
        postsContainer.removeEventListener("scroll", handleScroll);
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }
      };
    }
  }, []);

  // ✅ Fetch community & posts from backend
  useEffect(() => {
    const loadCommunityData = async () => {
      setIsLoadingCommunity(true);
      // Set initial states to null while loading (prevents showing wrong UI)
      setIsJoined(null);
      setIsCreator(null);
      
      try {
        const groupData = await fetchAcademyById(communityId);
        setCommunity(groupData);

        // Check if user is joined or creator - do this FIRST before setting community
        if (user) {
          // Handle both populated (object with _id) and non-populated (string) userId in members
          const joined = groupData.members?.some((m) => {
            const memberId = m.userId?._id || m.userId;
            return memberId?.toString() === user._id || memberId === user._id;
          });
          
          // Handle both populated (object with _id) and non-populated (string) createdBy
          const createdById = groupData.createdBy?._id || groupData.createdBy;
          const creator = createdById?.toString() === user._id || createdById === user._id;
          
          // If user is creator, they are automatically considered "joined"
          setIsCreator(!!creator);
          setIsJoined(!!creator || !!joined); // Creator is always considered joined
        } else {
          // If no user, reset states
          setIsJoined(false);
          setIsCreator(false);
        }

        const postData = await fetchPostsByAcademy(communityId);
        setPosts(postData);
      } catch (err) {
        console.error("Error loading community data:", err);
        setIsJoined(false);
        setIsCreator(false);
      } finally {
        setIsLoadingCommunity(false);
      }
    };

    if (communityId) {
      loadCommunityData();
    }
  }, [communityId, user?._id]);

  // Fetch joined academies when modal opens
  useEffect(() => {
    const loadJoinedAcademies = async () => {
      if (showJoinedAcademiesModal && user?._id) {
        try {
          const data = await fetchJoinedAcademies(user._id);
          if (data.success && Array.isArray(data.data)) {
            setJoinedAcademies(data.data);
          }
        } catch (error) {
          console.error("Error loading joined academies:", error);
        }
      }
    };
    
    if (showJoinedAcademiesModal) {
      loadJoinedAcademies();
    }
    
    // Listen for membership changes
    const handleMembershipChange = () => {
      if (showJoinedAcademiesModal && user?._id) {
        loadJoinedAcademies();
      }
    };
    
    window.addEventListener('academyMembershipChanged', handleMembershipChange);
    return () => {
      window.removeEventListener('academyMembershipChanged', handleMembershipChange);
    };
  }, [showJoinedAcademiesModal, user?._id]);

  // Fetch my academies when modal opens
  useEffect(() => {
    const loadMyAcademies = async () => {
      if (showMyAcademiesModal && user?._id) {
        try {
          const data = await fetchMyAcademies(user._id);
          if (data.success && Array.isArray(data.data)) {
            setMyAcademies(data.data);
          }
        } catch (error) {
          console.error("Error loading my academies:", error);
        }
      }
    };
    
    if (showMyAcademiesModal) {
      loadMyAcademies();
    }
    
    // Listen for membership changes (in case academy is deleted)
    const handleMembershipChange = () => {
      if (showMyAcademiesModal && user?._id) {
        loadMyAcademies();
      }
    };
    
    window.addEventListener('academyMembershipChanged', handleMembershipChange);
    return () => {
      window.removeEventListener('academyMembershipChanged', handleMembershipChange);
    };
  }, [showMyAcademiesModal, user?._id]);

  const handleJoinLeave = async () => {
    if (!user) {
      alert("Please login to join academies");
      return;
    }

    // Optimistic update - update UI immediately
    const previousJoinedState = isJoined;
    const previousMembers = community?.members || [];
    
    // Immediately update the UI
    setIsJoined(!isJoined);
    setCommunity((prev) => {
      if (!prev) return prev;
      const isJoining = !previousJoinedState;
      return {
        ...prev,
        members: isJoining
          ? [...(prev.members || []), { userId: user._id }]
          : (prev.members || []).filter((m) => {
              const memberId = m.userId?._id || m.userId;
              return String(memberId) !== String(user._id);
            }),
      };
    });
    
    // Dispatch event immediately with academy data for instant updates
    const isJoining = !previousJoinedState;
    window.dispatchEvent(new CustomEvent('academyMembershipChanged', { 
      detail: { 
        academyId: communityId,
        academy: {
          ...community,
          members: isJoining
            ? [...(community?.members || []), { userId: user._id }]
            : (community?.members || []).filter((m) => {
                const memberId = m.userId?._id || m.userId;
                return String(memberId) !== String(user._id);
              })
        },
        isJoining: isJoining,
        userId: user._id
      } 
    }));

    try {
      const result = await toggleJoinAcademy(communityId, user._id);
      if (result.success && result.data) {
        // Update with server response for accuracy
        setCommunity(result.data);
        const joined = result.data.members?.some((m) => {
          const memberId = m.userId?._id || m.userId;
          return String(memberId) === String(user._id);
        });
        setIsJoined(!!joined);
        
        // Dispatch event again with accurate server data
        window.dispatchEvent(new CustomEvent('academyMembershipChanged', { 
          detail: { 
            academyId: communityId,
            academy: result.data,
            isJoining: joined,
            userId: user._id
          } 
        }));
      } else {
        // Revert on failure
        setIsJoined(previousJoinedState);
        setCommunity((prev) => {
          if (!prev) return prev;
          return { ...prev, members: previousMembers };
        });
        throw new Error(result.message || "Failed to update membership");
      }
    } catch (error) {
      console.error("Error joining/leaving:", error);
      // Revert optimistic update on error
      setIsJoined(previousJoinedState);
      setCommunity((prev) => {
        if (!prev) return prev;
        return { ...prev, members: previousMembers };
      });
      alert(error.message || "Failed to join/leave academy");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this academy? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteAcademy(communityId, user._id);
      navigate("/communities");
      alert("Academy deleted successfully");
    } catch (error) {
      console.error("Error deleting academy:", error);
      alert(error.message || "Failed to delete academy");
    }
  };

  const handlePostDelete = useCallback((deletedPostId) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post._id !== deletedPostId));
  }, []);

  // Handle click outside compose box to shrink it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        composeBoxRef.current &&
        !composeBoxRef.current.contains(event.target) &&
        showComposeBox
      ) {
        // Only collapse if there's no content
        if (!composeCaption.trim() && !composeFile && !composeTitle.trim()) {
          setShowComposeBox(false);
        }
      }
      
      // Close menu if clicking outside
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        menuOpen
      ) {
        setMenuOpen(false);
      }
    };

    if (showComposeBox || menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showComposeBox, composeCaption, composeFile, composeTitle, menuOpen]);

  // Handle compose box file change
  const handleComposeFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setComposeFile(selected);
      setComposePreview(URL.createObjectURL(selected));
      setShowComposeBox(true);
    }
  };

  // Handle compose box submit (Twitter style - inline)
  const handleComposeSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showError("Please login to create posts");
      return;
    }

    if (!composeCaption.trim() && !composeFile) {
      return;
    }

    setComposeLoading(true);
    try {
      let image = "";
      let video = "";

      // Upload media if file is selected
      if (composeFile) {
        try {
          const uploaded = await uploadMedia(composeFile);
          if (uploaded.secure_url) {
            if (composeFile.type.startsWith("video")) {
              video = uploaded.secure_url;
            } else {
              image = uploaded.secure_url;
            }
          }
        } catch (uploadError) {
          console.error("Upload error:", uploadError);
          showError(`Failed to upload media: ${uploadError.message}`);
          setComposeLoading(false);
          return;
        }
      }

      // Prepare post data
      const postData = {
        title: composeTitle || undefined,
        caption: composeCaption,
        image,
        video,
        userId: user._id,
      };

      await createPost(communityId, postData);

      // Reset form
      setComposeTitle("");
      setComposeCaption("");
      setComposeFile(null);
      setComposePreview(null);
      setShowComposeBox(false);
      showSuccess("Post created successfully!");

      // Refresh posts
      const refreshedPosts = await fetchPostsByAcademy(communityId);
      setPosts(refreshedPosts);
    } catch (err) {
      console.error("Error creating post:", err);
      showError(err.message || "Error while creating post");
    } finally {
      setComposeLoading(false);
    }
  };

  const isLongDescription =
    community && community.description && community.description.length > 100;
  const displayDescription =
    isLongDescription && !showFullDesc
      ? community.description.slice(0, 50) + "..."
      : community?.description || "";

  return (
    <div className="flex min-h-screen w-screen bg-[#0f172a] text-gray-100 overflow-x-hidden" style={{ width: '100vw', maxWidth: '100vw' }}>
      {/* --- SIDEBAR --- (Hidden on mobile, visible on desktop) */}
      <aside
        className={`hidden md:flex md:fixed md:top-0 md:left-0 md:h-screen md:w-64 lg:w-72 bg-[#15202B] border-r border-gray-700 z-[1000]`}
      >
        <AcademySidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* --- BOTTOM NAVIGATION (Mobile Only) --- */}
      {!(showCommunityModal || showMembersModal || showJoinedAcademiesModal || showMyAcademiesModal) && (
        <BottomNavigation 
          onJoinedClick={() => setShowJoinedAcademiesModal(true)}
          onMyAcademiesClick={() => setShowMyAcademiesModal(true)}
        />
      )}

      {/* --- MAIN CONTENT --- */}
      <main className="flex flex-col h-screen md:ml-64 lg:ml-72 transition-all duration-300 overflow-x-hidden pb-16 md:pb-0 w-full" style={{ width: '100%', maxWidth: '100%', marginRight: 0 }}>
        {/* --- MODERN ACADEMY INFO BANNER --- */}
            {community && (
          <div className="relative w-full sticky top-0 z-30 bg-[#1a1f2e] border-b border-gray-800/80">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-0 w-full h-full" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(148, 163, 184, 0.1) 1px, transparent 0)`,
                backgroundSize: '24px 24px'
              }}></div>
            </div>
            
            {/* Bottom Accent Line */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-600/40 to-transparent"></div>

            <div className="relative px-4 sm:px-3 md:px-4 py-2.5 sm:py-3 md:py-4 lg:py-5">
              <div className="flex items-center justify-between gap-1 sm:gap-2">
                {/* Left Side: Logo + Name + Members - Perfectly Aligned */}
                <div className="flex items-center gap-0.5 sm:gap-1.5 md:gap-2 min-w-0 flex-1">
                  {/* Academy Logo */}
                  <div className="relative group/logo flex-shrink-0 flex items-center">
                    {community.logo && community.logo.trim() !== '' ? (
                      <img
                        src={community.logo}
                        alt={community.name}
                        className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg object-cover border border-gray-700/60 hover:border-blue-500/60 cursor-pointer transition-all duration-200 group-hover/logo:shadow-lg group-hover/logo:shadow-blue-500/20"
                        onClick={() => setShowCommunityModal(true)}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div style={{ display: community.logo && community.logo.trim() !== '' ? 'none' : 'flex' }} onClick={() => setShowCommunityModal(true)} className="cursor-pointer">
                      <DefaultAcademyLogo size="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" className="border border-gray-700/60 hover:border-blue-500/60 transition-all duration-200 group-hover/logo:shadow-lg group-hover/logo:shadow-blue-500/20" />
                    </div>
                    {/* Verified Badge */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 sm:w-3.5 sm:h-3.5 bg-blue-500 rounded-full border-2 border-[#1a1f2e] flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-0.5 w-0.5 sm:h-2 sm:w-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  {/* Academy Name & Members */}
                  <div className="flex-1 min-w-0 flex items-center gap-1 sm:gap-1.5 md:gap-3">
                    <h1 
                      className="text-[20px] sm:text-[16px] md:text-[20px] font-medium text-white overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer hover:text-blue-400 transition-colors leading-none self-center"
                      onClick={() => setShowCommunityModal(true)}
                      title={community.name}
                      style={{ fontSize: '20px', lineHeight: '1.2', maxWidth: 'calc(100vw - 140px)' }}
                    >
                    {community.name}
                    </h1>
                    
                    {/* Members Badge */}
                      <button
                      onClick={() => setShowMembersModal(true)}
                      className="flex items-center justify-center gap-0.5 px-1 py-0.5 sm:px-2 sm:py-1 rounded-md bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/40 hover:border-blue-500/40 transition-all duration-200 group/members flex-shrink-0"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2 sm:h-3.5 sm:w-3.5 text-gray-400 group-hover/members:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span className="text-[5px] sm:text-[10px] font-medium text-gray-300 group-hover/members:text-blue-300 whitespace-nowrap leading-none">
                        {community.members?.length || 0}
                      </span>
                      </button>
                    
                    {/* Category Badge */}
                    {community.category && (
                      <span className="text-[7px] sm:text-[9px] text-gray-500 font-medium uppercase tracking-wider hidden sm:inline px-1.5 py-0.5 rounded-md bg-gray-800/40 border border-gray-700/30 leading-none">
                        {community.category}
                      </span>
                    )}
                </div>
              </div>

                {/* Right Side: Action Buttons */}
                <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                  {/* Join/Leave or Creator Badge */}
                  {!isCreator ? (
                    <button
                      onClick={handleJoinLeave}
                      className={`px-2 py-1 sm:px-2.5 sm:py-1 rounded-md font-medium text-[9px] sm:text-[10px] transition-all duration-200 hover:scale-105 ${
                        isJoined
                          ? "bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 border border-red-500/40 hover:border-red-400/60"
                          : "bg-blue-600 hover:bg-blue-500 text-white border border-blue-500/60"
                      }`}
                    >
                      {isJoined ? "Leave" : "Join"}
                    </button>
                  ) : (
                    <div className="px-2 py-1 sm:px-2.5 sm:py-1 rounded-md bg-blue-500/20 border border-blue-500/40 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="text-[9px] sm:text-[10px] font-medium text-blue-300">Creator</span>
          </div>
                  )}

                  {/* Menu Button - Only show for creators (they can edit/delete) or non-joined users (they can join) */}
                  {/* Hide for joined non-creator users since they already have a Leave button */}
                  {/* Explicitly check isJoined === false to avoid showing menu when isJoined is null (loading) or true (joined) */}
                  {(isCreator || isJoined === false) && (
                    <div ref={menuRef} className="relative z-50">
                      <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="p-1.5 rounded-md hover:bg-gray-700/40 transition-colors flex items-center justify-center border border-gray-700/40 hover:border-gray-600/60"
                        aria-label="Menu"
                      >
                        <MoreVertical size={13} className="text-gray-400 hover:text-gray-300 transition-colors" />
                      </button>

                      {menuOpen && (
                        <div className="absolute right-0 top-full mt-2 bg-gradient-to-br from-[#1E293B]/95 to-[#0f172a]/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl w-44 text-sm z-[9999] overflow-hidden" style={{ zIndex: 9999 }}>
                          {isCreator ? (
                            <>
                              <button
                                onClick={() => {
                                  navigate(`/form/edit/${communityId}`, { state: { academy: community } });
                                  setMenuOpen(false);
                                }}
                                className="flex items-center gap-3 w-full text-left px-4 py-2.5 hover:bg-blue-500/20 text-blue-400 transition-colors border-b border-gray-700/50"
                              >
                                <Edit size={16} />
                                <span className="font-semibold text-xs">Edit Academy</span>
                              </button>
                              <button
                                onClick={() => {
                                  handleDelete();
                                  setMenuOpen(false);
                                }}
                                className="flex items-center gap-3 w-full text-left px-4 py-2.5 hover:bg-red-500/20 text-red-400 transition-colors"
                              >
                                <Trash2 size={16} />
                                <span className="font-semibold text-xs">Delete Academy</span>
                              </button>
                            </>
                          ) : (
                            !isJoined && (
                              <button
                                onClick={() => {
                                  handleJoinLeave();
                                  setMenuOpen(false);
                                }}
                                className="flex items-center gap-3 w-full text-left px-4 py-2.5 hover:bg-sky-500/20 text-sky-400 transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="font-semibold text-xs">Join Academy</span>
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  )}
        </div>
              </div>
            </div>
          </div>
        )}

        {/* --- POSTS SECTION --- */}
        <div className="flex-1 w-full overflow-y-auto overflow-x-hidden posts-container" style={{ minHeight: 0 }}>
          <div className="w-full flex gap-4 sm:gap-6 pl-4 sm:pl-6 md:pl-8 lg:pl-10 pr-4 lg:pr-0 py-4 sm:py-6 pb-24 md:pb-40 min-w-0">
            {/* Main Posts Area - Expands to fill available space */}
            <div className="flex-1 min-w-0 relative max-w-3xl" style={{ maxWidth: 'none', width: '100%' }}>
              {/* Twitter-Style Compose Box - Sticky */}
              {(isJoined || isCreator) && (
                <div ref={composeBoxRef} className="sticky top-0 z-20 bg-[#1E293B]/80 backdrop-blur-md rounded-xl p-2 sm:p-3 mb-3 border border-gray-700/50 shadow-xl">
                  <form onSubmit={handleComposeSubmit} className="space-y-2">
                    <div className="flex gap-2 sm:gap-3">
                      {/* User Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                          {user?.name?.[0]?.toUpperCase() || "U"}
                        </div>
                      </div>
                      
                      {/* Compose Area */}
                      <div className="flex-1 min-w-0">
                        {showComposeBox && (
                          <div>
                            <input
                              type="text"
                              placeholder="Title (optional)"
                              value={composeTitle}
                              onChange={(e) => {
                                if (e.target.value.length <= 500) {
                                  setComposeTitle(e.target.value);
                                  if (!showComposeBox && e.target.value) setShowComposeBox(true);
                                }
                              }}
                              maxLength={500}
                              className="w-full bg-transparent text-gray-300 placeholder-gray-500 text-xs sm:text-sm mb-1.5 focus:outline-none"
                              onFocus={() => setShowComposeBox(true)}
                            />
                            <div className="text-right">
                              <span className={`text-xs ${composeTitle.length > 500 ? 'text-red-400' : composeTitle.length > 450 ? 'text-yellow-400' : 'text-gray-500'}`}>
                                {composeTitle.length} / 500
                              </span>
                            </div>
                          </div>
                        )}
                        <textarea
                          value={composeCaption}
                          onChange={(e) => {
                            if (e.target.value.length <= 20000) {
                              setComposeCaption(e.target.value);
                              if (!showComposeBox) setShowComposeBox(true);
                            }
                          }}
                          placeholder="What's happening?"
                          rows={showComposeBox ? (composeCaption.length > 500 ? 4 : 2) : 1}
                          className="w-full bg-transparent text-gray-200 placeholder-gray-500 resize-none focus:outline-none text-sm sm:text-base transition-all"
                          onFocus={() => setShowComposeBox(true)}
                          maxLength={20000}
                        />
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-xs ${composeCaption.length > 20000 ? 'text-red-400' : composeCaption.length > 19000 ? 'text-yellow-400' : 'text-gray-500'}`}>
                            {composeCaption.length} / 20,000
                          </span>
                          {composeCaption.length > 20000 && (
                            <span className="text-xs text-red-400">Character limit exceeded</span>
                          )}
                        </div>

                        {/* Media Preview */}
                        {composePreview && (
                          <div className="mt-2 relative group">
                            {composeFile?.type.startsWith("video") ? (
                              <video
                                src={composePreview}
                                controls
                                className="rounded-lg w-full max-h-48 object-cover"
                              />
                            ) : (
                              <img
                                src={composePreview}
                                alt="Preview"
                                className="rounded-lg w-full max-h-48 object-cover"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setComposeFile(null);
                                setComposePreview(null);
                                if (!composeCaption.trim() && !composeTitle.trim()) {
                                  setShowComposeBox(false);
                                }
                              }}
                              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 hover:bg-black/90 text-white transition"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}

                        {/* Action Bar - Show when expanded */}
                        {showComposeBox && (
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-700">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <label className="cursor-pointer flex items-center gap-1 text-gray-400 hover:text-sky-400 transition-colors">
                                <Image size={16} />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleComposeFileChange}
                                />
                              </label>

                              <label className="cursor-pointer flex items-center gap-1 text-gray-400 hover:text-sky-400 transition-colors">
                                <Video size={16} />
                                <input
                                  type="file"
                                  accept="video/*"
                                  className="hidden"
                                  onChange={handleComposeFileChange}
                                />
                              </label>

                              <button
                                type="button"
                                className="p-1 text-gray-400 hover:text-sky-400 transition-colors"
                              >
                                <Smile size={16} />
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowComposeBox(false);
                                  if (!composeCaption.trim() && !composeFile && !composeTitle.trim()) {
                                    setComposeTitle("");
                                    setComposeCaption("");
                                  }
                                }}
                                className="px-3 py-1 text-xs sm:text-sm font-medium text-gray-400 hover:text-white transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={composeLoading || (!composeCaption.trim() && !composeFile)}
                                className="px-3 py-1 text-xs sm:text-sm font-semibold bg-sky-500 hover:bg-sky-600 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {composeLoading ? "Posting..." : "Post"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Posts List - Only visible if joined or creator */}
              {isLoadingCommunity || isJoined === null || isCreator === null ? (
                // Loading state - don't show join screen while checking
                <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-sky-500/20 to-purple-500/20 mb-4 border border-sky-500/30">
                    <div className="w-8 h-8 border-3 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-gray-400 font-medium">Loading community...</p>
                </div>
              ) : (isJoined || isCreator) ? (
                posts.length > 0 ? (
                  <div className="flex flex-col gap-6 sm:gap-8 w-full max-w-full">
                  {posts.map((post) => (
                    <PostCard 
                      key={post._id} 
                      post={post} 
                      onPostUpdate={(postId, updates) => {
                        setPosts(prevPosts => 
                          prevPosts.map(p => 
                            p._id === postId 
                              ? { ...p, likes: updates.likes, likedBy: updates.likedBy || p.likedBy }
                              : p
                          )
                        );
                      }}
                      onPostDelete={handlePostDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
                  <p className="text-center text-gray-400 text-lg mb-4">
                    No posts available yet.
                  </p>
                  <p className="text-center text-gray-500 text-sm">
                    Be the first to share something!
                  </p>
                  </div>
                )
              ) : (
                // Only show join screen when we've confirmed user is NOT joined and NOT creator
                <div className="flex flex-col items-center justify-center min-h-[60vh] w-full animate-fadeIn">
                  <div className="text-center max-w-md mx-auto p-8 rounded-3xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 backdrop-blur-sm">
                    <div className="mb-6">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-sky-500/20 to-purple-500/20 mb-4 border-2 border-sky-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-2xl font-extrabold text-white mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      Join to View Posts
                    </h3>
                    <p className="text-gray-400 text-base mb-6 leading-relaxed">
                      You need to join this academy to see posts and interact with the community.
                    </p>
                    <button
                      onClick={handleJoinLeave}
                      className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-sky-600 to-purple-600 hover:from-sky-600 hover:via-sky-700 hover:to-purple-700 text-white font-bold text-base shadow-2xl hover:shadow-sky-500/50 transition-all duration-300 transform hover:scale-105"
                    >
                      Join Academy
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar - Structured and Visually Appealing */}
            <aside className="hidden lg:block w-80 flex-shrink-0 space-y-5 sticky top-4 h-fit pr-4">
              {/* Academy Info Card - Premium Design */}
              {community && (
                <div className="relative bg-gradient-to-br from-[#1E293B] via-[#0f172a] to-[#1E293B] rounded-3xl p-6 shadow-2xl border border-gray-700/60 backdrop-blur-sm overflow-hidden">
                  {/* Decorative Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500 rounded-full blur-2xl"></div>
                  </div>
                  
                  <div className="relative z-10">
                    {/* Header with Logo - Centered & Premium */}
                    <div className="flex flex-col items-center mb-6">
                      <div className="relative mb-4 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-purple-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <img
                      src={community.logo || "https://via.placeholder.com/48"}
                      alt={community.name}
                          className="relative w-28 h-28 rounded-2xl object-cover border-4 border-gray-700 shadow-2xl ring-4 ring-sky-500/30 transition-transform group-hover:scale-105"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/48";
                          }}
                        />
                        {/* Verified Badge - Enhanced */}
                        <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-green-400 to-green-600 rounded-full p-2 shadow-xl border-3 border-[#1E293B] ring-2 ring-green-500/50">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-2xl font-extrabold text-white text-center mb-2 leading-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {community.name}
                    </h3>
                      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-sky-500/20 to-purple-500/20 border border-sky-400/30 backdrop-blur-sm">
                        <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></div>
                        <span className="text-xs font-semibold text-sky-300 uppercase tracking-wide">
                          {community.category || "Uncategorized"}
                        </span>
                      </div>
                  </div>
                  
                    {/* Stats Grid - Modern Card Style */}
                    <div className="space-y-2.5 pt-5 border-t border-gray-700/60">
                      <button 
                        onClick={() => setShowMembersModal(true)}
                        className="group w-full flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-600/5 hover:from-blue-500/20 hover:to-blue-600/10 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/20 group-hover:from-blue-500/40 group-hover:to-blue-600/30 transition-all shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-200 font-semibold">Members</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-white bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                        {community.members?.length || 0}
                      </span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                    </div>
                      </button>
                      
                      <button
                        onClick={() => {
                          const postsContainer = document.querySelector('.posts-container');
                          if (postsContainer) {
                            postsContainer.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        className="group w-full flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-purple-500/10 to-purple-600/5 hover:from-purple-500/20 hover:to-purple-600/10 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-600/20 group-hover:from-purple-500/40 group-hover:to-purple-600/30 transition-all shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-200 font-semibold">Posts</span>
                    </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-white bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
                        {posts.length}
                      </span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                    </div>
                      </button>
                      
                    {community.createdBy && (
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 shadow-lg">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-200 font-semibold">Creator</span>
                          </div>
                          <span className="text-sm font-bold text-emerald-300 truncate max-w-[120px]" title={community.createdBy?.name || "Admin"}>
                          {community.createdBy?.name || "Admin"}
                        </span>
                      </div>
                    )}
                  </div>

                    {/* Action Button - Premium Design */}
                    <div className="mt-6 pt-5 border-t border-gray-700/60">
                    {!isCreator && (
                      <button
                        onClick={handleJoinLeave}
                          className={`w-full py-3.5 rounded-2xl font-bold text-base transition-all duration-300 transform hover:scale-[1.02] shadow-2xl ${
                          isJoined
                              ? "bg-gradient-to-r from-red-500/20 to-red-600/10 text-red-300 hover:from-red-500/30 hover:to-red-600/20 border-2 border-red-500/50 hover:border-red-400/70 shadow-red-500/20"
                              : "bg-gradient-to-r from-sky-500 via-sky-600 to-purple-600 hover:from-sky-600 hover:via-sky-700 hover:to-purple-700 text-white border-2 border-transparent hover:shadow-sky-500/50"
                        }`}
                      >
                        {isJoined ? "Leave Academy" : "Join Academy"}
                      </button>
                    )}
                      {isCreator && (
                        <div className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-500/15 to-purple-500/10 border-2 border-sky-400/30 text-center backdrop-blur-sm">
                          <div className="flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span className="text-sm font-bold text-sky-300">You are the Creator</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions - Premium Card */}
              <div className="relative bg-gradient-to-br from-[#1E293B] via-[#0f172a] to-[#1E293B] rounded-3xl p-6 shadow-2xl border border-gray-700/60 backdrop-blur-sm overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-sky-500/10 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-700/60">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-sky-500/30 to-sky-600/20 shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-extrabold text-white">Quick Actions</h4>
                  </div>
                  <button
                    onClick={() => navigate("/communities")}
                    className="group w-full flex items-center justify-center gap-3 py-4 px-5 bg-gradient-to-r from-gray-700/50 to-gray-800/50 hover:from-gray-700 hover:to-gray-800 border border-gray-600/50 hover:border-gray-500 text-white rounded-2xl font-bold text-sm transition-all duration-300 transform hover:scale-[1.02] shadow-xl hover:shadow-2xl"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Explore Academies</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Description Card - Enhanced */}
              {community?.description && (
                <div className="relative bg-gradient-to-br from-[#1E293B] via-[#0f172a] to-[#1E293B] rounded-3xl p-6 shadow-2xl border border-gray-700/60 backdrop-blur-sm overflow-hidden">
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-700/60">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/30 to-indigo-600/20 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-extrabold text-white">About</h4>
                    </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {community.description}
                  </p>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>

      {/* --- COMMUNITY MODAL --- */}
      {showCommunityModal && community && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setShowCommunityModal(false)}
          style={{ 
            animation: 'fadeIn 0.3s ease-out',
            willChange: 'opacity'
          }}
        >
          <div 
            className="bg-[#1E293B] rounded-2xl w-full max-w-md relative shadow-2xl overflow-hidden animate-modalSlideIn"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              animation: 'modalSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              willChange: 'transform, opacity',
              transform: 'translateZ(0)'
            }}
          >
            <button
              onClick={() => setShowCommunityModal(false)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 z-10 backdrop-blur-sm transition-all duration-300 transform hover:scale-110 hover:rotate-90"
              style={{ animationDelay: '0.1s', animation: 'slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) both' }}
            >
              <X size={18} className="text-white transition-all duration-300" />
            </button>

            {/* Banner Image - Always show, with fallback */}
            <div 
              className="w-full h-40 sm:h-48 relative overflow-hidden" 
              style={{ 
                animationDelay: '0.1s', 
                animation: 'slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
                willChange: 'transform, opacity',
                transform: 'translateZ(0)'
              }}
            >
              {community.banner && community.banner.trim() !== '' ? (
                <img
                  src={community.banner}
                  alt="Community Banner"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div style={{ display: community.banner && community.banner.trim() !== '' ? 'none' : 'flex' }} className="w-full h-full">
                <DefaultAcademyBanner />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            <div className="p-5 max-h-[70vh] overflow-y-auto">
              {/* Header Section */}
              <div className="flex items-center gap-3 mb-4" style={{ animationDelay: '0.2s', animation: 'slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) both', willChange: 'transform, opacity', transform: 'translateZ(0)' }}>
                <div className="relative">
                  {community.logo && community.logo.trim() !== '' ? (
                    <img
                      src={community.logo}
                      alt={community.name}
                      className="w-16 h-16 rounded-2xl border-3 border-sky-500 object-cover flex-shrink-0 shadow-lg"
                      style={{ borderWidth: '3px' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div style={{ display: community.logo && community.logo.trim() !== '' ? 'none' : 'flex' }}>
                    <DefaultAcademyLogo size="w-16 h-16" className="border-3 border-sky-500 shadow-lg" style={{ borderWidth: '3px' }} />
                  </div>
                  {/* Verified Badge */}
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 shadow-lg border-2 border-[#1E293B]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-white mb-1 leading-tight">{community.name}</h2>
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 w-fit">
                    <span className="text-xs font-medium text-sky-400">
                      {community.category || "Uncategorized"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="space-y-2.5 mb-4 pt-4 border-t border-gray-700" style={{ animationDelay: '0.3s', animation: 'slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) both', willChange: 'transform, opacity', transform: 'translateZ(0)' }}>
                <button 
                  onClick={() => setShowMembersModal(true)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-blue-500/20">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-300 font-medium">Members</span>
                  </div>
                  <span className="text-base font-bold text-white">
                    {community.members?.length || 0}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setShowCommunityModal(false);
                    setTimeout(() => {
                      const postsContainer = document.querySelector('.posts-container');
                      if (postsContainer) {
                        postsContainer.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }, 300);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-purple-500/20">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-300 font-medium">Posts</span>
                  </div>
                  <span className="text-base font-bold text-white">
                    {posts.length}
                  </span>
                </button>
                {community.createdBy && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 transform hover:scale-[1.02]">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-md bg-emerald-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-300 font-medium">Created by</span>
                    </div>
                    <span className="text-sm font-semibold text-sky-400 truncate ml-2 max-w-[150px]">
                      {community.createdBy?.name || "Admin"}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              {community.description && (
                <div className="mb-4 pt-4 border-t border-gray-700" style={{ animationDelay: '0.4s', animation: 'slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) both', willChange: 'transform, opacity', transform: 'translateZ(0)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1 rounded-lg bg-indigo-500/20">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-white">About</h3>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {community.description}
                  </p>
                </div>
              )}

              {/* Action Button */}
              {!isCreator && (
                <div className="pt-4 border-t border-gray-700" style={{ animationDelay: '0.5s', animation: 'slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) both', willChange: 'transform, opacity', transform: 'translateZ(0)' }}>
                  <button
                    onClick={() => {
                      handleJoinLeave();
                      setShowCommunityModal(false);
                    }}
                    className={`w-full py-3 rounded-xl font-semibold transition-all shadow-lg ${
                      isJoined
                        ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border-2 border-red-500/50 hover:border-red-500/70"
                        : "bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white border-2 border-transparent hover:shadow-sky-500/50"
                    }`}
                  >
                    {isJoined ? "Leave Academy" : "Join Academy"}
                  </button>
                </div>
              )}
              {isCreator && (
                <div className="pt-4 border-t border-gray-700" style={{ animationDelay: '0.5s', animation: 'slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) both', willChange: 'transform, opacity', transform: 'translateZ(0)' }}>
                  <div className="w-full py-3 px-4 rounded-xl bg-sky-500/10 border border-sky-500/30 text-center">
                    <span className="text-sm font-semibold text-sky-400">You are the Creator</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MEMBERS MODAL --- */}
      {showMembersModal && community && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] rounded-2xl w-full max-w-md relative shadow-2xl overflow-hidden">
            <button
              onClick={() => setShowMembersModal(false)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 z-10 backdrop-blur-sm"
            >
              <X size={18} className="text-white" />
            </button>

            <div className="p-5 max-h-[70vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-700">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              <div>
                  <h2 className="text-xl font-bold text-white">Members</h2>
                <p className="text-sm text-gray-400">
                    {community.members?.length || 0} {community.members?.length === 1 ? 'member' : 'members'}
                </p>
              </div>
            </div>

              {/* Members List */}
              <div className="space-y-2">
                {community.members && community.members.length > 0 ? (
                  community.members.map((member, index) => {
                    const memberUser = member.userId;
                    const memberName = memberUser?.name || (typeof memberUser === 'string' ? 'Unknown User' : 'Anonymous');
                    const isCreator = community.createdBy?._id?.toString() === memberUser?._id?.toString() || 
                                     community.createdBy?.toString() === memberUser?._id?.toString() ||
                                     (typeof community.createdBy === 'string' && community.createdBy === memberUser?._id?.toString());
                    
                    return (
                      <div
                        key={memberUser?._id || index}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                          {memberName?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white truncate">
                              {memberName}
                            </span>
                            {isCreator && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-sky-500/20 text-sky-400 rounded-full border border-sky-500/30">
                                Creator
                              </span>
                            )}
                          </div>
                          {member.joinedAt && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Joined {new Date(member.joinedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <div className="p-4 rounded-full bg-gray-700/50 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-400">No members yet</p>
                    <p className="text-sm text-gray-500 mt-1">Be the first to join this academy!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- JOINED ACADEMIES MODAL (Mobile) - Beautiful Transparent Design --- */}
      {showJoinedAcademiesModal && (
        <div 
          className="fixed inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60 flex items-end md:items-center justify-center z-[9999] md:z-50 p-0 md:p-4 animate-fadeIn"
          onClick={() => setShowJoinedAcademiesModal(false)}
          style={{ willChange: 'opacity', transform: 'translateZ(0)' }}
        >
          <div 
            className="relative w-full md:max-w-lg max-h-[85vh] md:max-h-[75vh] flex flex-col animate-slideUp rounded-t-[2.5rem] md:rounded-[2rem] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ willChange: 'transform', transform: 'translateZ(0)' }}
          >
            {/* Beautiful Transparent Background with Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1e293b]/95 via-[#0f172a]/95 to-[#1e293b]/95"></div>
            
            {/* Subtle Animated Gradient Orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ willChange: 'opacity, transform', transform: 'translateZ(0)' }}></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000 pointer-events-none" style={{ willChange: 'opacity, transform', transform: 'translateZ(0)' }}></div>
            
            {/* Subtle Border Glow */}
            <div className="absolute inset-0 border border-white/5 rounded-t-[2.5rem] md:rounded-[2rem] pointer-events-none"></div>
            
            {/* Header - Beautiful Transparent Style */}
            <div className="relative flex items-center justify-between p-6 pb-4 border-b border-white/5 sticky top-0 z-10 bg-gradient-to-b from-[#1e293b]/50 to-transparent">
              <div className="flex items-center gap-4">
                <div className="relative p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Joined Academies
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 text-white text-xs font-semibold">
                      {joinedAcademies.length} {joinedAcademies.length === 1 ? 'academy' : 'academies'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowJoinedAcademiesModal(false)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 transform hover:scale-110 hover:rotate-90"
              >
                <X size={18} className="text-white transition-colors" />
              </button>
            </div>

            {/* Academies List - Scrollable (Shows 4 items max) */}
            <div className="relative overflow-y-auto p-5 space-y-3 z-10 joined-academies-scroll" style={{ maxHeight: '350px' }}>
              {/* Custom Scrollbar Styling - Hidden */}
              <style>{`
                .joined-academies-scroll::-webkit-scrollbar {
                  width: 0;
                  display: none;
                }
                .joined-academies-scroll {
                  scrollbar-width: none;
                  -ms-overflow-style: none;
                }
                .joined-academies-scroll::-webkit-scrollbar-track {
                  display: none;
                }
                .joined-academies-scroll::-webkit-scrollbar-thumb {
                  display: none;
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
                    className="relative w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 hover:from-white/10 hover:to-white/5 hover:border-purple-500/30 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/20 group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Hover Gradient Overlay */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative flex-shrink-0 z-10">
                      <div className="relative">
                        {academy.logo && academy.logo.trim() !== '' ? (
                          <img
                            src={academy.logo}
                            alt={academy.name}
                            className="w-14 h-14 rounded-xl object-cover border-2 border-white/20 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:border-white/40"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.querySelector('div').style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div style={{ display: academy.logo && academy.logo.trim() !== '' ? 'none' : 'flex' }}>
                          <DefaultAcademyLogo size="w-14 h-14" className="border-2 border-white/20 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:border-white/40" />
                        </div>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                      {academy.verified && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-white/30 shadow-lg z-20">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left z-10">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="text-base font-bold text-white truncate drop-shadow-md">
                          {academy.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {academy.category && (
                          <span className="text-xs font-medium text-white/80 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
                            {academy.category}
                          </span>
                        )}
                        <span className="text-xs text-white/60 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          {academy.members?.length || 0} members
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 z-10">
                      <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 backdrop-blur-sm transition-all duration-300 transform group-hover:translate-x-1 border border-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/80 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-16 px-4 z-10">
                  <div className="relative inline-flex items-center justify-center mb-6">
                    <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="relative p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 drop-shadow-lg">No Joined Academies</h3>
                  <p className="text-sm text-white/70 mb-6 max-w-sm mx-auto">Start exploring and join academies to build your community network</p>
                  <button
                    onClick={() => {
                      setShowJoinedAcademiesModal(false);
                      navigate("/communities");
                    }}
                    className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/30 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                  >
                    Explore Academies
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MY ACADEMIES MODAL (Mobile) - Beautiful Transparent Design --- */}
      {showMyAcademiesModal && (
        <div 
          className="fixed inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60 flex items-end md:items-center justify-center z-[9999] md:z-50 p-0 md:p-4 animate-fadeIn"
          onClick={() => setShowMyAcademiesModal(false)}
          style={{ willChange: 'opacity', transform: 'translateZ(0)' }}
        >
          <div 
            className="relative w-full md:max-w-lg max-h-[85vh] md:max-h-[75vh] flex flex-col animate-slideUp rounded-t-[2.5rem] md:rounded-[2rem] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ willChange: 'transform', transform: 'translateZ(0)' }}
          >
            {/* Beautiful Transparent Background with Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1e293b]/95 via-[#0f172a]/95 to-[#1e293b]/95"></div>
            
            {/* Subtle Animated Gradient Orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ willChange: 'opacity, transform', transform: 'translateZ(0)' }}></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000 pointer-events-none" style={{ willChange: 'opacity, transform', transform: 'translateZ(0)' }}></div>
            
            {/* Subtle Border Glow */}
            <div className="absolute inset-0 border border-white/5 rounded-t-[2.5rem] md:rounded-[2rem] pointer-events-none"></div>
            
            {/* Header - Beautiful Transparent Style */}
            <div className="relative flex items-center justify-between p-6 pb-4 border-b border-white/5 sticky top-0 z-10 bg-gradient-to-b from-[#1e293b]/50 to-transparent">
              <div className="flex items-center gap-4">
                <div className="relative p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    My Academies
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 text-white text-xs font-semibold">
                      {myAcademies.length} {myAcademies.length === 1 ? 'academy' : 'academies'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowMyAcademiesModal(false)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 transform hover:scale-110 hover:rotate-90"
              >
                <X size={18} className="text-white transition-colors" />
              </button>
            </div>

            {/* Academies List - Scrollable (Shows 4 items max) */}
            <div className="relative overflow-y-auto p-5 space-y-3 z-10 my-academies-scroll" style={{ maxHeight: '350px' }}>
              {/* Custom Scrollbar Styling - Hidden */}
              <style>{`
                .my-academies-scroll::-webkit-scrollbar {
                  width: 0;
                  display: none;
                }
                .my-academies-scroll {
                  scrollbar-width: none;
                  -ms-overflow-style: none;
                }
                .my-academies-scroll::-webkit-scrollbar-track {
                  display: none;
                }
                .my-academies-scroll::-webkit-scrollbar-thumb {
                  display: none;
                }
              `}</style>
              
              {myAcademies.length > 0 ? (
                myAcademies.map((academy, index) => (
                  <button
                    key={academy._id || academy.id}
                    onClick={() => {
                      navigate(`/community/${academy._id || academy.id}`);
                      setShowMyAcademiesModal(false);
                    }}
                    className="relative w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 hover:from-white/10 hover:to-white/5 hover:border-purple-500/30 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/20 group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Hover Gradient Overlay */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative flex-shrink-0 z-10">
                      <div className="relative">
                        {academy.logo && academy.logo.trim() !== '' ? (
                          <img
                            src={academy.logo}
                            alt={academy.name}
                            className="w-14 h-14 rounded-xl object-cover border-2 border-white/20 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:border-white/40"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.querySelector('div').style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div style={{ display: academy.logo && academy.logo.trim() !== '' ? 'none' : 'flex' }}>
                          <DefaultAcademyLogo size="w-14 h-14" className="border-2 border-white/20 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:border-white/40" />
                        </div>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                      {academy.verified && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-white/30 shadow-lg z-20">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left z-10">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="text-base font-bold text-white truncate drop-shadow-md">
                          {academy.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {academy.category && (
                          <span className="text-xs font-medium text-white/80 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
                            {academy.category}
                          </span>
                        )}
                        <span className="text-xs text-white/60 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          {academy.members?.length || 0} members
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 z-10">
                      <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 backdrop-blur-sm transition-all duration-300 transform group-hover:translate-x-1 border border-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/80 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-16 px-4 z-10">
                  <div className="relative inline-flex items-center justify-center mb-6">
                    <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="relative p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" style={{ opacity: 1 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 drop-shadow-lg" style={{ opacity: 1 }}>No Academies Created</h3>
                  <p className="text-sm text-white mb-6 max-w-sm mx-auto" style={{ opacity: 1 }}>Start building your community by creating your first academy</p>
                  <button
                    onClick={() => {
                      setShowMyAcademiesModal(false);
                      navigate("/form");
                    }}
                    className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/30 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                  >
                    Create Academy
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- POST CREATION MODAL --- */}
      {showPostModal && communityId && (
        <PostCreationModal
          academyId={communityId}
          onClose={() => setShowPostModal(false)}
          onSubmit={async () => {
            // Refresh posts after creation
            try {
              const postData = await fetchPostsByAcademy(communityId);
              setPosts(postData);
            } catch (err) {
              console.error("Error refreshing posts:", err);
            }
            setShowPostModal(false);
          }}
        />
      )}
    </div>
  );
}
