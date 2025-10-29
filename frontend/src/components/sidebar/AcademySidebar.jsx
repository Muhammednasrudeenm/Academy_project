import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { PlusCircle, Compass, X } from "lucide-react";
import MyAcademiesList from "./MyAcademiesList";
import JoinedAcademiesList from "./JoinedAcademiesList";

export default function AcademySidebar({ onClose = () => {} }) {
  const [showMy, setShowMy] = useState(true);
  const [showJoined, setShowJoined] = useState(true);

  const myAcademies = [
    { id: 1, name: "Elite Sports", logo: "https://img.icons8.com/color/48/trophy.png" },
    { id: 2, name: "NextGen Football", logo: "https://img.icons8.com/color/48/soccer-ball.png" },
  ];

  const joinedAcademies = [
    { id: 3, name: "Power Swimmers", logo: "https://img.icons8.com/color/48/swimming.png" },
    { id: 4, name: "Hoop Stars", logo: "https://img.icons8.com/color/48/basketball.png" },
  ];

  return (
    <aside
      className={`
        fixed top-0 left-0 z-[60] h-screen w-72 p-4 flex flex-col bg-[#15202B] border-r border-gray-700 
        transform transition-transform duration-300 ease-in-out 
        md:translate-x-0 md:opacity-100 md:pointer-events-auto
      `}
    >
      {/* ===== Mobile Close Header ===== */}
      <div className="flex justify-between items-center mb-4 md:hidden">
        <h2 className="text-white font-semibold text-lg">Academies</h2>
        <button
          className="text-gray-400 hover:text-white transition"
          onClick={onClose}
        >
          <X size={22} />
        </button>
      </div>

      {/* ===== Create Academy Button ===== */}
      <div className="mb-4">
        <NavLink
          to="/form"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          <PlusCircle size={16} />
          <span>Create Academy</span>
        </NavLink>
      </div>

      {/* ===== Scrollable Lists ===== */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
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
      </div>

      {/* ===== Explore Button ===== */}
      <div className="mt-4">
        <NavLink
          to="/communities"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          <Compass size={16} />
          <span>Explore Academies</span>
        </NavLink>
      </div>
    </aside>
  );
}
