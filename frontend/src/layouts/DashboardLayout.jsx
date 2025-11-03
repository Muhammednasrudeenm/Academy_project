import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import AcademySidebar from "../components/sidebar/AcademySidebar";
import BottomNavigation from "../components/BottomNavigation";
import DefaultAcademyLogo from "../components/DefaultAcademyLogo";
import { fetchJoinedAcademies, fetchMyAcademies } from "../api/api";

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showJoinedAcademiesModal, setShowJoinedAcademiesModal] = useState(false);
  const [joinedAcademies, setJoinedAcademies] = useState([]);
  const [showMyAcademiesModal, setShowMyAcademiesModal] = useState(false);
  const [myAcademies, setMyAcademies] = useState([]);
  
  // Memoize user to prevent re-parsing on every render
  const user = useMemo(() => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (e) {
      return null;
    }
  }, []);

  // Fetch joined academies when modal opens
  const loadJoinedAcademies = useCallback(async () => {
    if (user?._id) {
      try {
        const data = await fetchJoinedAcademies(user._id);
        if (data.success && Array.isArray(data.data)) {
          setJoinedAcademies(data.data);
        }
      } catch (error) {
        console.error("Error loading joined academies:", error);
      }
    }
  }, [user?._id]);

  useEffect(() => {
    if (showJoinedAcademiesModal) {
      loadJoinedAcademies();
    }
    
    const handleMembershipChange = (event) => {
      const { detail } = event;
      if (!detail || !user?._id) return;
      
      // Immediate optimistic update
      if (detail.academy && detail.isJoining !== undefined) {
        if (detail.isJoining) {
          // Add to joined academies list
          setJoinedAcademies((prev) => {
            // Check if already in list
            const exists = prev.some(a => (a._id || a.id) === (detail.academyId || detail.academy._id || detail.academy.id));
            if (exists) return prev;
            // Add the academy
            return [...prev, detail.academy];
          });
        } else {
          // Remove from joined academies list
          setJoinedAcademies((prev) => 
            prev.filter(a => (a._id || a.id) !== (detail.academyId || detail.academy?._id || detail.academy?.id))
          );
        }
      }
      
      // Also refresh from server if modal is open
      if (showJoinedAcademiesModal && user?._id) {
        loadJoinedAcademies();
      }
    };
    
    window.addEventListener('academyMembershipChanged', handleMembershipChange);
    return () => {
      window.removeEventListener('academyMembershipChanged', handleMembershipChange);
    };
  }, [showJoinedAcademiesModal, user?._id, loadJoinedAcademies]);

  // Fetch my academies when modal opens
  const loadMyAcademies = useCallback(async () => {
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
  }, [showMyAcademiesModal, user?._id]);

  useEffect(() => {
    if (showMyAcademiesModal) {
      loadMyAcademies();
    }
    
    const handleMembershipChange = () => {
      if (showMyAcademiesModal && user?._id) {
        loadMyAcademies();
      }
    };
    
    window.addEventListener('academyMembershipChanged', handleMembershipChange);
    return () => {
      window.removeEventListener('academyMembershipChanged', handleMembershipChange);
    };
  }, [showMyAcademiesModal, user?._id, loadMyAcademies]);

  return (
    <div className="min-h-screen w-screen flex bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white relative overflow-hidden" style={{ width: '100vw', maxWidth: '100vw' }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* ===== SIDEBAR (Web View Only) ===== */}
      <aside
        className="hidden md:flex md:fixed md:top-0 md:left-0 md:h-screen md:w-64 lg:w-72 bg-gradient-to-b from-[#15202B] via-[#0f172a] to-[#15202B] border-r border-gray-700/50 z-[1000] backdrop-blur-sm"
      >
        <AcademySidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* ===== BOTTOM NAVIGATION (Mobile Only) ===== */}
      <BottomNavigation 
        onJoinedClick={() => setShowJoinedAcademiesModal(true)}
        onMyAcademiesClick={() => setShowMyAcademiesModal(true)}
      />

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 ml-0 md:ml-[16rem] lg:ml-[18rem] p-4 sm:p-6 transition-all duration-300 relative z-[100] w-full md:w-[calc(100%-16rem)] lg:w-[calc(100%-18rem)] overflow-y-auto overflow-x-hidden h-screen pb-16 md:pb-6" style={{ maxWidth: '100%', width: '100%' }}>

        {children}
      </main>

      {/* --- JOINED ACADEMIES MODAL (Mobile) - Beautiful Transparent Design --- */}
      {showJoinedAcademiesModal && (
        <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60 flex items-end md:items-center justify-center z-[9999] md:z-50 px-3 pb-3 md:p-4 animate-fadeIn">
          <div className="relative rounded-[2rem] w-full md:max-w-sm overflow-hidden max-h-[85vh] md:max-h-[70vh] flex flex-col animate-slideUp">
            {/* Beautiful Transparent Background with Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1e293b]/95 via-[#0f172a]/95 to-[#1e293b]/95 rounded-[2rem]"></div>
            
            {/* Subtle Animated Gradient Orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000 pointer-events-none"></div>
            
            {/* Subtle Border Glow */}
            <div className="absolute inset-0 border border-white/5 rounded-[2rem] pointer-events-none"></div>
            
            {/* Header */}
            <div className="relative flex items-center justify-between p-5 pb-4 border-b border-white/5 sticky top-0 z-10 bg-gradient-to-b from-[#1e293b]/50 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Joined Academies</h2>
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
                joinedAcademies.map((academy) => (
                  <button
                    key={academy._id || academy.id}
                    onClick={() => {
                      navigate(`/community/${academy._id || academy.id}`);
                      setShowJoinedAcademiesModal(false);
                    }}
                    className="relative w-full flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 hover:from-white/10 hover:to-white/5 hover:border-purple-500/30 transition-all duration-300 transform hover:scale-[1.02] group"
                  >
                    <div className="relative flex-shrink-0">
                      {academy.logo && academy.logo.trim() !== '' ? (
                        <img
                          src={academy.logo}
                          alt={academy.name}
                          className="w-12 h-12 rounded-lg object-cover border-2 border-gray-600 shadow-md transition-transform group-hover:scale-110"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.querySelector('div').style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div style={{ display: academy.logo && academy.logo.trim() !== '' ? 'none' : 'flex' }}>
                        <DefaultAcademyLogo size="w-12 h-12" className="border-2 border-gray-600 shadow-md transition-transform group-hover:scale-110" />
                      </div>
                      {academy.verified && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5 border-2 border-[#1E293B]">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <h3 className="text-sm font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                        {academy.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {academy.category && (
                          <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-0.5 rounded-full">
                            {academy.category}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {academy.members?.length || 0} members
                        </span>
                      </div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 rounded-full bg-purple-500/10 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-400 font-medium">No joined academies</p>
                  <p className="text-sm text-gray-500 mt-2">Explore and join academies to see them here</p>
                  <button
                    onClick={() => {
                      setShowJoinedAcademiesModal(false);
                      navigate("/communities");
                    }}
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
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
        <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60 flex items-end md:items-center justify-center z-[9999] md:z-50 px-3 pb-3 md:p-4 animate-fadeIn">
          <div className="relative w-full md:max-w-md max-h-[85vh] md:max-h-[75vh] flex flex-col animate-slideUp rounded-[2rem] overflow-hidden">
            {/* Beautiful Transparent Background with Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1e293b]/95 via-[#0f172a]/95 to-[#1e293b]/95 rounded-[2rem]"></div>
            
            {/* Subtle Animated Gradient Orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000 pointer-events-none"></div>
            
            {/* Subtle Border Glow */}
            <div className="absolute inset-0 border border-white/5 rounded-[2rem] pointer-events-none"></div>
            
            {/* Header */}
            <div className="relative flex items-center justify-between p-6 pb-4 border-b border-white/5 sticky top-0 z-10 bg-gradient-to-b from-[#1e293b]/50 to-transparent">
                <div className="flex items-center gap-4">
                <div className="relative p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">My Academies</h2>
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
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 drop-shadow-lg">No Academies Created</h3>
                  <p className="text-sm text-white/70 mb-6 max-w-sm mx-auto">Start building your community by creating your first academy</p>
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
    </div>
  );
}
