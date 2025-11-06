import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MoreVertical, Plus, X, Trash2, Image, Video, Edit } from "lucide-react";
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
  const { showError, showSuccess, showWarning } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showAddButton, setShowAddButton] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDeleteAcademyConfirm, setShowDeleteAcademyConfirm] = useState(false);
  const [deletingAcademy, setDeletingAcademy] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
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
      showWarning("Please login to join academies");
      return;
    }

    // If user is trying to exit, show confirmation first
    if (isJoined) {
      setShowExitConfirm(true);
      return;
    }

    // Proceed with joining (no confirmation needed)
    await performJoinLeave();
  };

  const performJoinLeave = async () => {
    if (!user) return;

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
      showError(error.message || "Failed to join/leave academy");
    }
  };

  const handleDelete = async () => {
    if (deletingAcademy) return;
    
    try {
      setDeletingAcademy(true);
      await deleteAcademy(communityId, user._id);
      showSuccess("Academy deleted successfully");
      setTimeout(() => navigate("/communities"), 1000);
    } catch (error) {
      console.error("Error deleting academy:", error);
      showError(error.message || "Failed to delete academy");
      setDeletingAcademy(false);
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
      
    };

    if (showComposeBox) {
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
    <div className="flex min-h-screen w-screen bg-black text-white overflow-x-hidden" style={{ width: '100vw', maxWidth: '100vw' }}>
      {/* --- SIDEBAR --- (Hidden on mobile, visible on desktop) */}
      <aside
        className={`hidden md:flex md:fixed md:top-0 md:left-0 md:h-screen md:w-64 lg:w-72 bg-black border-r border-[#2f3336] z-[1000]`}
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
        {/* --- TWITTER-STYLE HEADER --- */}
            {community && (
          <div className="relative w-full sticky top-0 z-30 bg-black border-b border-[#2f3336]">
            <div className="relative px-4 py-3.5">
              <div className="flex items-center justify-between gap-1 sm:gap-2">
                {/* Left Side: Logo + Name + Members - Perfectly Aligned */}
                <div className="flex items-center gap-3 sm:gap-2 md:gap-2 min-w-0 flex-1">
                  {/* Academy Logo */}
                  <div className="relative flex-shrink-0 flex items-center">
                    {community.logo && community.logo.trim() !== '' ? (
                      <img
                        src={community.logo}
                        alt={community.name}
                        className="relative w-10 h-10 rounded-full object-cover cursor-pointer transition-opacity hover:opacity-80"
                        onClick={() => setShowCommunityModal(true)}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div style={{ display: community.logo && community.logo.trim() !== '' ? 'none' : 'flex' }} onClick={() => setShowCommunityModal(true)} className="cursor-pointer">
                      <DefaultAcademyLogo size="w-10 h-10" className="rounded-full" />
                    </div>
                  </div>

                  {/* Academy Name & Info */}
                  <div className="flex-1 min-w-0 flex flex-col gap-0 sm:flex-row sm:items-center sm:gap-2">
                    <h1 
                      className="!text-[20px] sm:!text-[20px] md:!text-[30px] font-bold text-white truncate cursor-pointer hover:underline leading-tight"
                      style={{ 
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                        fontSize: '20px'
                      }}
                      onClick={() => setShowCommunityModal(true)}
                      title={community.name}
                    >
                      {community.name}
                    </h1>
                    
                    {/* Members Count - Below name on mobile, inline on larger screens */}
                    <span className="text-[9px] xs:text-[10px] sm:text-[11px] md:text-[13px] text-[#71767a] leading-normal whitespace-nowrap">
                      {community.members?.length || 0} members
                    </span>
                  </div>
                </div>

                {/* Right Side: Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Join/Leave or Creator Badge */}
                  {!isCreator ? (
                    <button
                      onClick={handleJoinLeave}
                      className={`px-1.5 py-0 md:px-4 md:py-1.5 rounded-full font-bold text-[8px] md:text-[13px] leading-none transition-colors ${
                        isJoined
                          ? "bg-black text-white border border-[#2f3336] hover:bg-[#181818]"
                          : "bg-white text-black hover:bg-[#e6e6e6]"
                      }`}
                    >
                      {isJoined ? "Exit" : "Join"}
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-full bg-[#16181c] text-[#71767a] text-[13px] font-medium leading-normal">
                      Creator
                    </span>
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
                <div ref={composeBoxRef} className="sticky top-0 z-20 bg-black border-b border-[#2f3336] px-4 py-3.5">
                  <form onSubmit={handleComposeSubmit} className="space-y-3">
                    <div className="flex gap-3">
                      {/* User Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-[#1d9bf0] flex items-center justify-center text-white font-bold text-[15px] leading-normal">
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
                          className="w-full bg-transparent text-white placeholder-[#71767a] resize-none focus:outline-none text-[20px] leading-normal transition-all"
                          onFocus={() => setShowComposeBox(true)}
                          maxLength={20000}
                        />
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-[13px] leading-normal ${composeCaption.length > 20000 ? 'text-[#f4212e]' : composeCaption.length > 19000 ? 'text-yellow-400' : 'text-[#71767a]'}`}>
                            {composeCaption.length > 0 && `${composeCaption.length} / 20,000`}
                          </span>
                          {composeCaption.length > 20000 && (
                            <span className="text-[13px] leading-normal text-[#f4212e]">Character limit exceeded</span>
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
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2f3336] gap-2 md:gap-0">
                            <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
                              <label className="cursor-pointer flex items-center text-[#1d9bf0] hover:text-[#1a8cd8] transition-colors">
                                <Image size={20} />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleComposeFileChange}
                                />
                              </label>

                              <label className="cursor-pointer flex items-center text-[#1d9bf0] hover:text-[#1a8cd8] transition-colors">
                                <Video size={20} />
                                <input
                                  type="file"
                                  accept="video/*"
                                  className="hidden"
                                  onChange={handleComposeFileChange}
                                />
                              </label>
                            </div>

                            <div className="flex items-center gap-2 md:gap-2 ml-auto md:ml-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowComposeBox(false);
                                  if (!composeCaption.trim() && !composeFile && !composeTitle.trim()) {
                                    setComposeTitle("");
                                    setComposeCaption("");
                                  }
                                }}
                                className="px-3 md:px-4 py-2 text-[13px] md:text-[15px] font-medium leading-normal text-white hover:bg-[#181818] rounded-full transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={composeLoading || (!composeCaption.trim() && !composeFile)}
                                className="px-3 md:px-4 py-2 text-[13px] md:text-[15px] font-bold leading-normal bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <div className="inline-flex items-center justify-center w-8 h-8 border-2 border-[#1d9bf0] border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-[#71767a] text-[15px] font-medium leading-normal">Loading community...</p>
                </div>
              ) : (isJoined || isCreator) ? (
                posts.length > 0 ? (
                  <div className="flex flex-col border-t border-[#2f3336]">
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
                <div className="flex flex-col items-center justify-center min-h-[60vh] w-full border-t border-[#2f3336]">
                  <p className="text-center text-white text-[20px] font-bold leading-normal mb-2">
                    No posts available yet.
                  </p>
                  <p className="text-center text-[#71767a] text-[15px] leading-normal">
                    Be the first to share something!
                  </p>
                  </div>
                )
              ) : (
                // Only show join screen when we've confirmed user is NOT joined and NOT creator
                <div className="flex flex-col items-center justify-center min-h-[60vh] w-full border-t border-[#2f3336]">
                  <div className="text-center max-w-md mx-auto p-8">
                    <h3 className="text-[20px] font-bold text-white mb-3 leading-tight">
                      Join to View Posts
                    </h3>
                    <p className="text-[#71767a] text-[15px] leading-normal">
                      You need to join this academy to see posts and interact with the community.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar - Twitter Style */}
            <aside className="hidden lg:block w-80 flex-shrink-0 space-y-5 sticky top-4 h-fit pr-4">
              {/* Academy Info Card - Twitter Style */}
              {community && (
                <div className="relative bg-black rounded-2xl p-4 border border-[#2f3336]">
                  <div className="relative z-10">
                    {/* Header with Logo */}
                    <div className="flex flex-col items-center mb-4">
                      <div className="relative mb-3">
                        {community.logo && community.logo.trim() !== '' ? (
                          <img
                            src={community.logo}
                            alt={community.name}
                            className="w-20 h-20 rounded-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div style={{ display: community.logo && community.logo.trim() !== '' ? 'none' : 'flex' }}>
                          <DefaultAcademyLogo size="w-20 h-20" className="rounded-full" />
                        </div>
                      </div>
                      <h3 className="text-[20px] font-bold text-white text-center mb-1 leading-tight">
                        {community.name}
                      </h3>
                      {community.category && (
                        <span className="text-[15px] text-[#71767a] leading-normal">
                          {community.category}
                        </span>
                      )}
                  </div>
                  
                    {/* Stats - Twitter Style */}
                    <div className="space-y-4 pt-4 border-t border-[#2f3336]">
                      {/* Only show Members button if user is joined or is creator */}
                      {(isJoined || isCreator) && (
                        <button 
                          onClick={() => setShowMembersModal(true)}
                          className="w-full flex items-center justify-between py-2 hover:bg-[#181818] rounded-lg px-2 transition-colors"
                        >
                          <span className="text-[#71767a] text-[15px]">Members</span>
                          <span className="text-white font-bold text-[15px]">
                            {community.members?.length || 0}
                          </span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          const postsContainer = document.querySelector('.posts-container');
                          if (postsContainer) {
                            postsContainer.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        className="w-full flex items-center justify-between py-2 hover:bg-[#181818] rounded-lg px-2 transition-colors"
                      >
                        <span className="text-[#71767a] text-[15px]">Posts</span>
                        <span className="text-white font-bold text-[15px]">
                          {posts.length}
                        </span>
                      </button>
                      
                    {community.createdBy && (
                        <div className="flex items-center justify-between py-2">
                          <span className="text-[#71767a] text-[15px]">Creator</span>
                          <span className="text-white font-bold text-[15px] truncate max-w-[120px]" title={community.createdBy?.name || "Admin"}>
                            {community.createdBy?.name || "Admin"}
                          </span>
                        </div>
                    )}
                  </div>

                    {/* Creator Actions - Twitter Style */}
                    {isCreator && (
                      <div className="mt-4 pt-4 border-t border-[#2f3336] space-y-3">
                        <button
                          onClick={() => navigate(`/form/edit/${communityId}`, { state: { academy: community } })}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white text-black hover:bg-[#e6e6e6] transition-colors font-bold text-[15px] leading-normal"
                        >
                          <Edit size={18} />
                          <span>Edit Academy</span>
                        </button>
                        <button
                          onClick={() => setShowDeleteAcademyConfirm(true)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-black text-[#f4212e] border border-[#f4212e] hover:bg-[#f4212e]/10 transition-colors font-bold text-[15px] leading-normal"
                        >
                          <Trash2 size={18} />
                          <span>Delete Academy</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description Card - Twitter Style */}
              {community?.description && (
                <div className="relative bg-black rounded-2xl p-4 border border-[#2f3336]">
                  <h4 className="text-[20px] font-bold text-white mb-3 leading-tight">Description</h4>
                  <p className="text-[15px] text-white leading-normal">
                    {community.description}
                  </p>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>

      {/* --- COMMUNITY MODAL --- Twitter Style */}
      {showCommunityModal && community && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCommunityModal(false)}
        >
          <div 
            className="bg-black rounded-2xl w-full max-w-md relative border border-[#2f3336] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCommunityModal(false)}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-[#181818] z-10 transition-colors"
            >
              <X size={18} className="text-white" />
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
              {/* Header Section - Twitter Style */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  {community.logo && community.logo.trim() !== '' ? (
                    <img
                      src={community.logo}
                      alt={community.name}
                      className="w-16 h-16 rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div style={{ display: community.logo && community.logo.trim() !== '' ? 'none' : 'flex' }}>
                    <DefaultAcademyLogo size="w-16 h-16" className="rounded-full" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-[20px] font-bold text-white mb-1 leading-tight">{community.name}</h2>
                  {community.category && (
                    <span className="text-[15px] text-[#71767a] leading-normal">
                      {community.category}
                    </span>
                  )}
                </div>
              </div>

              {/* Stats Section - Twitter Style */}
              <div className="space-y-3 mb-4 pt-4 border-t border-[#2f3336]">
                <button 
                  onClick={() => setShowMembersModal(true)}
                  className="w-full flex items-center justify-between py-2 hover:bg-[#181818] rounded-lg px-2 transition-colors"
                >
                  <span className="text-[#71767a] text-[15px]">Members</span>
                  <span className="text-white font-bold text-[15px]">
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
                  className="w-full flex items-center justify-between py-2 hover:bg-[#181818] rounded-lg px-2 transition-colors"
                >
                  <span className="text-[#71767a] text-[15px]">Posts</span>
                  <span className="text-white font-bold text-[15px]">
                    {posts.length}
                  </span>
                </button>
                {community.createdBy && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[#71767a] text-[15px]">Creator</span>
                    <span className="text-white font-bold text-[15px] truncate max-w-[150px]">
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
                    <h3 className="text-sm font-semibold text-white">Description</h3>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {community.description}
                  </p>
                </div>
              )}

              {/* Action Button - Twitter Style */}
              {!isCreator && (
                <div className="pt-4 border-t border-[#2f3336]">
                  <button
                    onClick={() => {
                      handleJoinLeave();
                      setShowCommunityModal(false);
                    }}
                    className={`w-full py-2.5 rounded-full font-bold text-sm transition-colors ${
                      isJoined
                        ? "bg-black text-white border border-[#2f3336] hover:bg-[#181818]"
                        : "bg-white text-black hover:bg-[#e6e6e6]"
                    }`}
                  >
                    {isJoined ? "Exit" : "Join"}
                  </button>
                </div>
              )}
              {isCreator && (
                <div className="pt-4 border-t border-[#2f3336] space-y-3">
                  <button
                    onClick={() => {
                      setShowCommunityModal(false);
                      navigate(`/form/edit/${communityId}`, { state: { academy: community } });
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-white text-black hover:bg-[#e6e6e6] transition-colors font-bold text-sm"
                  >
                    <Edit size={18} />
                    <span>Edit Academy</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowCommunityModal(false);
                      setShowDeleteAcademyConfirm(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-black text-[#f4212e] border border-[#f4212e] hover:bg-[#f4212e]/10 transition-colors font-bold text-sm"
                  >
                    <Trash2 size={18} />
                    <span>Delete Academy</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MEMBERS MODAL --- Twitter Style */}
      {showMembersModal && community && (isJoined || isCreator) && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setShowMembersModal(false)}
          style={{ willChange: 'opacity', transform: 'translateZ(0)' }}
        >
          <div 
            className="relative w-full max-w-md max-h-[75vh] flex flex-col rounded-2xl overflow-hidden bg-black border border-[#2f3336]"
            onClick={(e) => e.stopPropagation()}
            style={{ willChange: 'transform', transform: 'translateZ(0)' }}
          >
            {/* Header - Twitter Style */}
            <div className="relative flex items-center justify-between px-4 py-3 border-b border-[#2f3336] sticky top-0 z-10 bg-black">
              <div className="flex items-center gap-3">
                <div className="relative p-2 rounded-full bg-[#16181c]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-[20px] font-bold text-white leading-tight">Members</h2>
                  <p className="text-[13px] text-[#71767a] leading-normal mt-0.5">
                    {community.members?.length || 0} {community.members?.length === 1 ? 'member' : 'members'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMembersModal(false)}
                className="p-2 rounded-full hover:bg-[#181818] transition-colors"
              >
                <X size={18} className="text-white transition-colors" />
              </button>
            </div>

            {/* Members List - Twitter Style */}
            <div className="relative overflow-y-auto px-4 py-3 z-10" style={{ maxHeight: 'calc(75vh - 80px)' }}>
              {community.members && community.members.length > 0 ? (
                <div className="space-y-1">
                  {community.members.map((member, index) => {
                    const memberUser = member.userId;
                    const memberName = memberUser?.name || (typeof memberUser === 'string' ? 'Unknown User' : 'Anonymous');
                    const isMemberCreator = community.createdBy?._id?.toString() === memberUser?._id?.toString() || 
                                           community.createdBy?.toString() === memberUser?._id?.toString() ||
                                           (typeof community.createdBy === 'string' && community.createdBy === memberUser?._id?.toString());
                    
                    return (
                      <div
                        key={memberUser?._id || index}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#181818] transition-colors rounded-lg"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#1d9bf0] flex items-center justify-center text-white font-bold text-[15px] flex-shrink-0">
                          {memberName?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[15px] font-bold text-white leading-normal truncate">
                              {memberName}
                            </span>
                            {isMemberCreator && (
                              <span className="px-2 py-0.5 text-[13px] font-medium bg-[#16181c] text-[#71767a] rounded-full border border-[#2f3336]">
                                Creator
                              </span>
                            )}
                          </div>
                          {(() => {
                            // Try to get joinedAt from various possible locations
                            const joinedDate = member.joinedAt || member.joinDate || member.createdAt;
                            
                            if (joinedDate) {
                              try {
                                const date = new Date(joinedDate);
                                // Check if date is valid
                                if (!isNaN(date.getTime())) {
                                  const now = new Date();
                                  const diff = now - date;
                                  const days = Math.floor(diff / 86400000);
                                  const months = Math.floor(days / 30);
                                  const years = Math.floor(days / 365);
                                  
                                  let dateText;
                                  if (days < 1) {
                                    dateText = 'today';
                                  } else if (days < 7) {
                                    dateText = `${days} ${days === 1 ? 'day' : 'days'} ago`;
                                  } else if (months < 1) {
                                    const weeks = Math.floor(days / 7);
                                    dateText = `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
                                  } else if (years < 1) {
                                    dateText = `${months} ${months === 1 ? 'month' : 'months'} ago`;
                                  } else {
                                    dateText = `${years} ${years === 1 ? 'year' : 'years'} ago`;
                                  }
                                  
                                  return (
                                    <p className="text-[13px] text-[#71767a] leading-normal mt-0.5">
                                      Joined {dateText}
                                    </p>
                                  );
                                }
                              } catch (e) {
                                // Invalid date, don't show anything
                                return null;
                              }
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 rounded-full bg-[#16181c] w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#71767a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="text-[15px] text-[#71767a] font-medium leading-normal">No members yet</p>
                  <p className="text-[13px] text-[#71767a] leading-normal mt-1">Be the first to join this academy!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- JOINED ACADEMIES MODAL (Mobile) - Twitter Style --- */}
      {showJoinedAcademiesModal && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-end md:items-center justify-center z-[9999] md:z-50 p-0 md:p-4 animate-fadeIn"
          onClick={() => setShowJoinedAcademiesModal(false)}
          style={{ willChange: 'opacity', transform: 'translateZ(0)' }}
        >
          <div 
            className="relative w-full md:max-w-lg max-h-[85vh] md:max-h-[75vh] flex flex-col animate-slideUp rounded-t-[2.5rem] md:rounded-[2rem] overflow-hidden bg-black border border-[#2f3336]"
            onClick={(e) => e.stopPropagation()}
            style={{ willChange: 'transform', transform: 'translateZ(0)' }}
          >
            {/* Header - Twitter Style */}
            <div className="relative flex items-center justify-between px-4 py-3 border-b border-[#2f3336] sticky top-0 z-10 bg-black">
              <div className="flex items-center gap-3">
                <div className="relative p-2 rounded-full bg-[#16181c]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-[20px] font-bold text-white leading-tight">
                    Joined Academies
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-3 py-1 rounded-full bg-[#16181c] text-[#71767a] text-[13px] font-medium leading-normal">
                      {joinedAcademies.length} {joinedAcademies.length === 1 ? 'academy' : 'academies'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowJoinedAcademiesModal(false)}
                className="p-2 rounded-full hover:bg-[#181818] transition-colors"
              >
                <X size={18} className="text-white transition-colors" />
              </button>
            </div>

            {/* Academies List - Scrollable (Shows 4 items max) */}
            <div className="relative overflow-y-auto px-4 py-3 z-10 joined-academies-scroll" style={{ maxHeight: '350px' }}>
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
                    className="relative w-full flex items-center gap-3 px-4 py-3 hover:bg-[#181818] transition-colors border-b border-[#2f3336] last:border-0"
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
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-[15px] font-bold text-white truncate leading-normal">
                          {academy.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {academy.category && (
                          <span className="text-[13px] font-medium text-[#71767a] leading-normal">
                            {academy.category}
                          </span>
                        )}
                        <span className="text-[13px] text-[#71767a] flex items-center gap-1 leading-normal">
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
                  <h3 className="text-[20px] font-bold text-white mb-2 leading-tight">No Joined Academies</h3>
                  <p className="text-[15px] text-[#71767a] mb-6 max-w-sm mx-auto leading-normal">Start exploring and join academies to build your community network</p>
                  <button
                    onClick={() => {
                      setShowJoinedAcademiesModal(false);
                      navigate("/communities");
                    }}
                    className="px-4 py-2 bg-white text-black rounded-full font-bold text-[15px] leading-normal hover:bg-[#e6e6e6] transition-colors"
                  >
                    Explore Academies
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MY ACADEMIES MODAL (Mobile) - Twitter Style --- */}
      {showMyAcademiesModal && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-end md:items-center justify-center z-[9999] md:z-50 p-0 md:p-4 animate-fadeIn"
          onClick={() => setShowMyAcademiesModal(false)}
          style={{ willChange: 'opacity', transform: 'translateZ(0)' }}
        >
          <div 
            className="relative w-full md:max-w-lg max-h-[85vh] md:max-h-[75vh] flex flex-col animate-slideUp rounded-t-[2.5rem] md:rounded-[2rem] overflow-hidden bg-black border border-[#2f3336]"
            onClick={(e) => e.stopPropagation()}
            style={{ willChange: 'transform', transform: 'translateZ(0)' }}
          >
            
            {/* Header - Twitter Style */}
            <div className="relative flex items-center justify-between px-4 py-3 border-b border-[#2f3336] sticky top-0 z-10 bg-black">
              <div className="flex items-center gap-3">
                <div className="relative p-2 rounded-full bg-[#16181c]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-[20px] font-bold text-white leading-tight">
                    My Academies
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-3 py-1 rounded-full bg-[#16181c] text-[#71767a] text-[13px] font-medium leading-normal">
                      {myAcademies.length} {myAcademies.length === 1 ? 'academy' : 'academies'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowMyAcademiesModal(false)}
                className="p-2 rounded-full hover:bg-[#181818] transition-colors"
              >
                <X size={18} className="text-white transition-colors" />
              </button>
            </div>

            {/* Academies List - Scrollable (Shows 4 items max) */}
            <div className="relative overflow-y-auto px-4 py-3 z-10 my-academies-scroll" style={{ maxHeight: '350px' }}>
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
                    className="relative w-full flex items-center gap-3 px-4 py-3 hover:bg-[#181818] transition-colors border-b border-[#2f3336] last:border-0"
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
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-[15px] font-bold text-white truncate leading-normal">
                          {academy.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {academy.category && (
                          <span className="text-[13px] font-medium text-[#71767a] leading-normal">
                            {academy.category}
                          </span>
                        )}
                        <span className="text-[13px] text-[#71767a] flex items-center gap-1 leading-normal">
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
                  <h3 className="text-[20px] font-bold text-white mb-2 leading-tight">No Academies Created</h3>
                  <p className="text-[15px] text-[#71767a] mb-6 max-w-sm mx-auto leading-normal">Create your first academy to start building your community</p>
                  <button
                    onClick={() => {
                      setShowMyAcademiesModal(false);
                      navigate("/form");
                    }}
                    className="px-4 py-2 bg-white text-black rounded-full font-bold text-[15px] leading-normal hover:bg-[#e6e6e6] transition-colors"
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

      {/* --- DELETE ACADEMY CONFIRMATION MODAL --- Twitter Style */}
      {/* Exit Community Confirmation Modal */}
      {showExitConfirm && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999]" 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowExitConfirm(false);
            }
          }}
        >
          <div 
            className="relative w-full max-w-md mx-4 flex flex-col animate-fadeIn bg-black/90 backdrop-blur-xl border border-[#2f3336]/50 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1d9bf0]/10 via-transparent to-transparent opacity-50 pointer-events-none"></div>
            
            <div className="relative p-6 z-10">
              <h3 className="text-[20px] font-bold text-white mb-2 leading-tight">
                Exit community?
              </h3>
              <p className="text-[15px] text-[#71767a] mb-6 leading-normal">
                You'll no longer see posts from this academy. You can join again anytime.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={async () => {
                    setShowExitConfirm(false);
                    await performJoinLeave();
                  }}
                  className="w-full py-3 rounded-full bg-[#1d9bf0] text-white font-bold text-[15px] leading-normal hover:bg-[#1a8cd8] transition-colors"
                >
                  Exit
                </button>
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="w-full py-3 rounded-full bg-black/50 backdrop-blur-sm text-white border border-[#2f3336] font-bold text-[15px] leading-normal hover:bg-[#181818] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteAcademyConfirm && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999]" 
          onClick={(e) => {
            if (e.target === e.currentTarget && !deletingAcademy) {
              setShowDeleteAcademyConfirm(false);
            }
          }}
        >
          <div 
            className="relative w-full max-w-md mx-4 flex flex-col animate-fadeIn bg-black/90 backdrop-blur-xl border border-[#2f3336]/50 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#f4212e]/10 via-transparent to-transparent opacity-50 pointer-events-none"></div>
            
            <div className="relative p-6 z-10">
              <h3 className="text-[20px] font-bold text-white mb-2 leading-tight">
                Delete academy?
              </h3>
              <p className="text-[15px] text-[#71767a] mb-6 leading-normal">
                This can't be undone. The academy, all its posts, and member data will be permanently removed.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deletingAcademy}
                  className="w-full py-3 rounded-full bg-[#f4212e] text-white font-bold text-[15px] leading-normal hover:bg-[#d91a26] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingAcademy ? "Deleting..." : "Delete"}
                </button>
                <button
                  onClick={() => setShowDeleteAcademyConfirm(false)}
                  disabled={deletingAcademy}
                  className="w-full py-3 rounded-full bg-black/50 backdrop-blur-sm text-white border border-[#2f3336] font-bold text-[15px] leading-normal hover:bg-[#181818] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
