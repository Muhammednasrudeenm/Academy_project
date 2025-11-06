import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { School, PlusCircle, Search, Users, GraduationCap, X } from "lucide-react";
import { fetchJoinedAcademies, fetchMyAcademies } from "../api/api";

export default function BottomNavigation({ onJoinedClick, onMyAcademiesClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const [joinedCount, setJoinedCount] = useState(0);
  const [myAcademiesCount, setMyAcademiesCount] = useState(0);
  const [ripple, setRipple] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [showAcademyModal, setShowAcademyModal] = useState(false);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef(null);
  const modalRef = useRef(null);

  // Handle scroll to hide/show navigation
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = (e) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Get scroll position from either the event target (container) or window
          let currentScrollY = 0;
          
          if (e && e.target && e.target !== document && e.target !== window) {
            // Scroll event from a container (like posts-container)
            currentScrollY = e.target.scrollTop || 0;
          } else {
            // Window scroll
            currentScrollY = window.scrollY || document.documentElement.scrollTop || 0;
          }
          
          // Clear existing timeout
          if (scrollTimeout.current) {
            clearTimeout(scrollTimeout.current);
          }

          // Show navigation when scrolling up
          if (currentScrollY < lastScrollY.current && currentScrollY > 50) {
            setIsVisible(true);
          }
          // Hide navigation when scrolling down
          else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
            setIsVisible(false);
          }
          // Always show at top
          else if (currentScrollY < 50) {
            setIsVisible(true);
          }

          lastScrollY.current = currentScrollY;

          // Show navigation after scroll stops (2 seconds)
          scrollTimeout.current = setTimeout(() => {
            setIsVisible(true);
          }, 2000);

          ticking = false;
        });
        ticking = true;
      }
    };

    // Listen to scroll events on window
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Also listen to scroll on posts container and other scrollable containers
    const postsContainer = document.querySelector('.posts-container');
    const mainContent = document.querySelector('main');
    const scrollableContainers = [postsContainer, mainContent].filter(Boolean);
    
    scrollableContainers.forEach(container => {
      container.addEventListener('scroll', handleScroll, { passive: true });
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      scrollableContainers.forEach(container => {
        container.removeEventListener('scroll', handleScroll);
      });
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  // Fetch joined and my academies counts
  React.useEffect(() => {
    const fetchCounts = async () => {
      if (!user?._id) return;
      try {
        const [joinedData, myData] = await Promise.all([
          fetchJoinedAcademies(user._id),
          fetchMyAcademies(user._id),
        ]);
        setJoinedCount(joinedData.success ? joinedData.data?.length || 0 : 0);
        setMyAcademiesCount(myData.success ? myData.data?.length || 0 : 0);
      } catch (error) {
        console.error("Error fetching academy counts:", error);
      }
    };
    fetchCounts();
    
    // Listen for academy membership changes to update count
    const handleMembershipChange = () => {
      fetchCounts();
    };
    
    window.addEventListener('academyMembershipChanged', handleMembershipChange);
    return () => {
      window.removeEventListener('academyMembershipChanged', handleMembershipChange);
    };
  }, [user?._id]);

  const handleAcademyClick = (event) => {
    // Create ripple effect
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setRipple({ id: "academy", x, y });
    setTimeout(() => setRipple(null), 600);
    setShowAcademyModal(true);
  };

  // Close modal when clicking/touching outside
  const handleModalBackdropClick = (e) => {
    // Only close if clicking directly on the backdrop, not on modal content
    if (e.target === e.currentTarget) {
      setShowAcademyModal(false);
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showAcademyModal) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      // Prevent scrolling on iOS
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      // Cleanup on unmount
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [showAcademyModal]);

  const handleOptionClick = (option) => {
    setShowAcademyModal(false);
    switch (option) {
      case "joined":
        onJoinedClick?.();
        break;
      case "my":
        onMyAcademiesClick?.();
        break;
      case "create":
        navigate("/form");
        break;
      case "explore":
        navigate("/communities");
        break;
      default:
        break;
    }
  };

  return (
    <>
    <nav 
      className={`fixed bottom-2 left-1/2 -translate-x-1/2 w-auto max-w-xs z-[9999] md:hidden transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ transform: 'translateZ(0)' }}
    >
      {/* Navigation Bar - Twitter Style */}
      <div className="relative bg-black border border-[#2f3336] rounded-full shadow-lg">
        <div className="relative flex items-center justify-center px-4 py-3 safe-area-inset-bottom">
          <button
            onClick={handleAcademyClick}
            className="relative flex items-center justify-center gap-2 px-4 py-2 rounded-full transition-colors hover:bg-[#181818] active:bg-[#181818] focus:outline-none focus-visible:outline-none focus:ring-0 focus:ring-offset-0 border-0"
            style={{ 
              WebkitTapHighlightColor: 'transparent', 
              touchAction: 'manipulation',
              outline: 'none',
              border: 'none',
              boxShadow: 'none'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.border = 'none';
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = 'none';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.border = 'none';
            }}
          >
            {/* Icon Container */}
            <div className="relative">
              <School 
                size={24} 
                className="text-white"
                strokeWidth={2}
              />
              
              {/* Total Count Badge */}
              {(joinedCount > 0 || myAcademiesCount > 0) && (
                <span className="absolute -top-1 -right-1 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-[#1d9bf0]">
                  {joinedCount + myAcademiesCount > 9 ? "9+" : joinedCount + myAcademiesCount}
                </span>
              )}
            </div>
            
            {/* Label */}
            <span className="text-sm font-bold text-white">
              Academy
            </span>
          </button>
        </div>
      </div>
    </nav>

    {/* Academy Options Modal */}
    {showAcademyModal && (
        <div 
          ref={modalRef}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-[10000] p-0 animate-fadeIn touch-none"
          onClick={handleModalBackdropClick}
          onTouchStart={handleModalBackdropClick}
          style={{ 
            willChange: 'opacity', 
            transform: 'translateZ(0)',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div 
            className="relative w-full max-w-md max-h-[60vh] flex flex-col animate-slideUp rounded-t-2xl overflow-hidden bg-black border-t border-x border-[#2f3336] touch-auto"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            style={{ 
              willChange: 'transform', 
              transform: 'translateZ(0)',
              overscrollBehavior: 'contain'
            }}
          >
            {/* Header */}
            <div className="relative flex items-center justify-between p-4 border-b border-[#2f3336] sticky top-0 z-10 bg-black">
              <div className="flex items-center gap-3">
                <School size={24} className="text-white" />
                <div>
                  <h2 className="text-xl font-bold text-white">Academy</h2>
                  <p className="text-sm text-[#71767a] mt-0.5">Choose an option</p>
                </div>
              </div>
              <button
                onClick={() => setShowAcademyModal(false)}
                className="p-2 rounded-full hover:bg-[#181818] transition-colors"
              >
                <X size={18} className="text-white" />
              </button>
            </div>

            {/* Options List */}
            <div 
              className="relative overflow-y-auto p-2 space-y-1 z-10 overscroll-contain"
              style={{ overscrollBehavior: 'contain' }}
            >
              {/* Joined Academies */}
              <button
                onClick={() => handleOptionClick("joined")}
                className="relative w-full flex items-center gap-4 p-4 rounded-xl hover:bg-[#181818] transition-colors group"
              >
                <Users size={24} className="text-white" />
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="text-base font-bold text-white mb-0.5">Joined Academies</h3>
                  <p className="text-sm text-[#71767a]">View academies you've joined</p>
                  {joinedCount > 0 && (
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-[#16181c] text-[#71767a] text-xs font-semibold">
                      {joinedCount} {joinedCount === 1 ? 'academy' : 'academies'}
                    </span>
                  )}
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#71767a] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* My Academies */}
              <button
                onClick={() => handleOptionClick("my")}
                className="relative w-full flex items-center gap-4 p-4 rounded-xl hover:bg-[#181818] transition-colors group"
              >
                <GraduationCap size={24} className="text-white" />
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="text-base font-bold text-white mb-0.5">My Academies</h3>
                  <p className="text-sm text-[#71767a]">Manage academies you created</p>
                  {myAcademiesCount > 0 && (
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-[#16181c] text-[#71767a] text-xs font-semibold">
                      {myAcademiesCount} {myAcademiesCount === 1 ? 'academy' : 'academies'}
                    </span>
                  )}
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#71767a] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Create Academy */}
              <button
                onClick={() => handleOptionClick("create")}
                className="relative w-full flex items-center gap-4 p-4 rounded-xl hover:bg-[#181818] transition-colors group"
              >
                <PlusCircle size={24} className="text-white" />
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="text-base font-bold text-white mb-0.5">Create Academy</h3>
                  <p className="text-sm text-[#71767a]">Start a new academy community</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#71767a] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Explore Academy */}
              <button
                onClick={() => handleOptionClick("explore")}
                className="relative w-full flex items-center gap-4 p-4 rounded-xl hover:bg-[#181818] transition-colors group"
              >
                <Search size={24} className="text-white" />
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="text-base font-bold text-white mb-0.5">Explore Academy</h3>
                  <p className="text-sm text-[#71767a]">Discover and join academies</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#71767a] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
    )}

    {/* Custom Animation Styles */}
      <style>{`
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }
        
        .animate-ripple {
          animation: ripple 0.6s ease-out;
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

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
          will-change: opacity, transform;
        }

        .delay-1000 {
          animation-delay: 1s;
        }
        
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
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </>
  );
}
