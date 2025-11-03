import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PlusCircle, Search, Users, GraduationCap, UserPlus } from "lucide-react";
import { fetchJoinedAcademies, fetchMyAcademies } from "../api/api";

export default function BottomNavigation({ onJoinedClick, onMyAcademiesClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const [joinedCount, setJoinedCount] = useState(0);
  const [myAcademiesCount, setMyAcademiesCount] = useState(0);
  const [ripple, setRipple] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef(null);

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

  const navItems = [
    {
      id: "explore",
      icon: Search,
      label: "Explore",
      path: "/communities",
      active: location.pathname === "/communities" || location.pathname.startsWith("/community/"),
      onClick: () => navigate("/communities"),
      color: "blue",
    },
    {
      id: "create",
      icon: PlusCircle,
      label: "Create",
      path: "/form",
      active: location.pathname === "/form",
      highlight: true,
      color: "gradient",
    },
    {
      id: "my-academies",
      icon: GraduationCap,
      label: "My",
      path: null,
      count: myAcademiesCount,
      onClick: () => onMyAcademiesClick?.(),
      color: "purple",
    },
    {
      id: "joined-academies",
      icon: UserPlus,
      label: "Joined",
      path: null,
      count: joinedCount,
      onClick: () => onJoinedClick?.(),
      color: "green",
    },
  ];

  const handleClick = (item, event) => {
    // Create ripple effect
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setRipple({ id: item.id, x, y });
    setTimeout(() => setRipple(null), 600);

    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <nav 
      className={`fixed bottom-2 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md z-[9999] md:hidden transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ transform: 'translateZ(0)' }}
    >
      {/* Navigation Bar - Transparent */}
      <div className="relative bg-white/2 backdrop-blur-3xl shadow-[0_-8px_32px_rgba(0,0,0,0.2)] rounded-t-[2.5rem] rounded-b-[2.5rem] overflow-hidden">
        {/* Curved Top Edge */}
        <div className="absolute top-0 left-0 right-0 h-4 pointer-events-none">
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 16" preserveAspectRatio="none">
            <path 
              d="M0,16 Q25,0 50,6 T100,16 L100,16 L0,16 Z" 
              fill="transparent"
            />
          </svg>
        </div>
        
        {/* Curved Bottom Edge */}
        <div className="absolute bottom-0 left-0 right-0 h-4 pointer-events-none">
          <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 100 16" preserveAspectRatio="none">
            <path 
              d="M0,0 Q25,16 50,10 T100,0 L100,0 L0,0 Z" 
              fill="transparent"
            />
          </svg>
        </div>
        
        <div className="relative flex items-center justify-around px-1 pt-1 pb-1 safe-area-inset-bottom">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.active;
            const showRipple = ripple?.id === item.id;
            
            return (
              <button
                key={item.id}
                onClick={(e) => handleClick(item, e)}
                className={`relative flex flex-col items-center justify-center gap-0.5 px-2 py-0.5 rounded-2xl transition-all duration-300 group min-w-[60px] ${
                  "text-gray-400 hover:text-gray-200 active:scale-95"
                }`}
                style={{ transform: 'translateZ(0)', transformStyle: 'preserve-3d' }}
              >
                {/* Ripple Effect */}
                {showRipple && (
                  <span
                    className="absolute rounded-full bg-white/30 pointer-events-none animate-ripple"
                    style={{
                      left: `${ripple.x - 20}px`,
                      top: `${ripple.y - 20}px`,
                      width: '40px',
                      height: '40px',
                      transform: 'scale(0)',
                      animation: 'ripple 0.6s ease-out',
                    }}
                  />
                )}
                
                {/* Icon Container - Simplified */}
                <div className="relative z-10 p-1">
                  <Icon 
                    size={18} 
                    className={`relative transition-all duration-300 z-10 group-hover:scale-125 ${
                      item.highlight 
                        ? "group-hover:rotate-90 text-white filter brightness-120" 
                        : "text-gray-200 group-hover:text-white filter group-hover:brightness-125"
                    }`}
                    strokeWidth={2.5}
                    style={{
                      filter: item.highlight 
                        ? 'drop-shadow(0 4px 8px rgba(168,85,247,0.6)) drop-shadow(0 2px 4px rgba(0,0,0,0.4))' 
                        : 'drop-shadow(0 3px 6px rgba(255,255,255,0.3)) drop-shadow(0 1px 3px rgba(0,0,0,0.3))',
                      textShadow: item.highlight ? '0 0 12px rgba(168,85,247,0.6), 0 0 6px rgba(255,255,255,0.3)' : '0 0 8px rgba(255,255,255,0.2)',
                      transform: 'translateZ(10px)',
                      transformStyle: 'preserve-3d'
                    }}
                  />
                  
                  {/* Enhanced Count Badge */}
                  {item.count !== undefined && item.count > 0 && (
                    <span className={`absolute -top-1 -right-1 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg bg-gradient-to-br from-purple-500 to-pink-500`}>
                      {item.count > 9 ? "9+" : item.count}
                    </span>
                  )}
                </div>
                
                {/* Enhanced Label with Better Typography */}
                <span className={`text-[9px] font-semibold leading-tight transition-all duration-300 text-gray-500 group-hover:text-gray-300`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

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
        
        @keyframes shine {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(200%) translateY(200%) rotate(45deg);
          }
        }
      `}</style>
    </nav>
  );
}
