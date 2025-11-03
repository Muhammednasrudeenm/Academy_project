import React, { useEffect, useState, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { PlusCircle, Compass, X } from "lucide-react";
import MyAcademiesList from "./MyAcademiesList";
import JoinedAcademiesList from "./JoinedAcademiesList";
import { fetchMyAcademies, fetchJoinedAcademies } from "../../api/api";

export default function AcademySidebar({ onClose = () => {} }) {
  const [showMy, setShowMy] = useState(true);
  const [showJoined, setShowJoined] = useState(true);
  const [myAcademies, setMyAcademies] = useState([]);
  const [joinedAcademies, setJoinedAcademies] = useState([]);

  // ✅ Fetch academies function (memoized with useCallback)
  const fetchAcademies = useCallback(async () => {
    try {
      const loggedUser = JSON.parse(localStorage.getItem("user"));
      if (!loggedUser || !loggedUser._id) {
        return;
      }

      // Fetch both my academies and joined academies
      const [myData, joinedData] = await Promise.all([
        fetchMyAcademies(loggedUser._id),
        fetchJoinedAcademies(loggedUser._id),
      ]);

      if (myData.success && Array.isArray(myData.data)) {
        setMyAcademies(myData.data);
      }

      if (joinedData.success && Array.isArray(joinedData.data)) {
        setJoinedAcademies(joinedData.data);
      }
    } catch (error) {
      console.error("Error fetching academies:", error);
    }
  }, []);

  // ✅ Fetch academies from backend on mount
  useEffect(() => {
    let isMounted = true;
    
    // Initial load
    fetchAcademies();
    
    // ✅ Listen for academy membership changes (join/leave)
    const handleMembershipChange = (event) => {
      if (!isMounted) return;
      
      const { detail } = event;
      if (!detail) {
        // No detail means full refresh
        fetchAcademies();
        return;
      }
      
      // Immediate optimistic update for joined academies
      if (detail.academy && detail.isJoining !== undefined) {
        if (detail.isJoining) {
          // Add to joined academies list immediately
          setJoinedAcademies((prev) => {
            const exists = prev.some(a => (a._id || a.id) === (detail.academyId || detail.academy._id || detail.academy.id));
            if (exists) return prev;
            return [...prev, detail.academy];
          });
        } else {
          // Remove from joined academies list immediately
          setJoinedAcademies((prev) => 
            prev.filter(a => (a._id || a.id) !== (detail.academyId || detail.academy?._id || detail.academy?.id))
          );
        }
      }
      
      // Always refresh from server for accuracy (with small delay to let server catch up)
      setTimeout(() => {
        if (isMounted) {
          fetchAcademies();
        }
      }, 500);
    };

    window.addEventListener('academyMembershipChanged', handleMembershipChange);
    
    return () => { 
      isMounted = false;
      window.removeEventListener('academyMembershipChanged', handleMembershipChange);
    };
  }, [fetchAcademies]);


  return (
    <aside className="h-full w-full flex flex-col bg-gradient-to-b from-[#15202B] via-[#0f172a] to-[#15202B] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-20 right-0 w-40 h-40 bg-sky-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-0 w-32 h-32 bg-purple-500 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full p-5">
        {/* ===== Mobile Close Header ===== */}
        <div className="flex justify-between items-center mb-6 md:hidden pb-4 border-b border-gray-700/50">
          <h2 className="text-white font-extrabold text-xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Academies
          </h2>
          <button
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* ===== Header Section ===== */}
        <div className="mb-6">
          <h2 className="hidden md:block text-white font-extrabold text-xl mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Navigation
          </h2>
          
          {/* ===== Create Academy Button - Premium ===== */}
          <NavLink
            to="/form"
            onClick={onClose}
            className="group flex items-center justify-center gap-3 w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-sky-600 to-purple-600 hover:from-sky-600 hover:via-sky-700 hover:to-purple-700 text-white font-bold text-sm shadow-2xl hover:shadow-sky-500/50 transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <PlusCircle size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            <span>Create Academy</span>
          </NavLink>
        </div>

        {/* ===== Scrollable Lists ===== */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar sidebar-scroll">
          <MyAcademiesList
            academies={myAcademies}
            show={showMy}
            toggle={() => setShowMy(!showMy)}
          />
          <JoinedAcademiesList
            academies={joinedAcademies}
            show={showJoined}
            toggle={() => setShowJoined(!showJoined)}
          />
          {/* Custom Scrollbar Styling - Hidden */}
          <style>{`
            .sidebar-scroll::-webkit-scrollbar {
              width: 0;
              display: none;
            }
            .sidebar-scroll {
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
            .sidebar-scroll::-webkit-scrollbar-track {
              display: none;
            }
            .sidebar-scroll::-webkit-scrollbar-thumb {
              display: none;
            }
          `}</style>
        </div>

        {/* ===== Explore Button - Premium ===== */}
        <div className="mt-6 pt-5 border-t border-gray-700/50">
          <NavLink
            to="/communities"
            onClick={onClose}
            className="group flex items-center justify-center gap-3 w-full py-3.5 rounded-2xl bg-gradient-to-r from-gray-700/50 via-gray-800/50 to-gray-700/50 hover:from-gray-700 hover:via-gray-800 hover:to-gray-700 border border-gray-600/50 hover:border-gray-500 text-white font-bold text-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <Compass size={18} className="group-hover:rotate-12 transition-transform duration-300" />
            <span>Explore Academies</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </NavLink>
        </div>
      </div>
    </aside>
  );
}
