import React from "react";
import { NavLink } from "react-router-dom";
import { School, X } from "lucide-react";

export default function AcademySidebar({ onClose = () => {} }) {
  return (
    <aside className="h-full w-full flex flex-col bg-black relative overflow-hidden">
      <div className="relative z-10 flex flex-col h-full p-5">
        {/* ===== Mobile Close Header ===== */}
        <div className="flex justify-between items-center mb-6 md:hidden pb-4 border-b border-[#2f3336]">
          <button
            className="p-2 rounded-full text-[#71767a] hover:text-white hover:bg-[#181818] transition-colors ml-auto"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* ===== Header Section ===== */}
        <div className="mb-6">
          {/* ===== Academy Button - Twitter Style ===== */}
          <NavLink
            to="/communities"
            onClick={onClose}
            className={({ isActive }) => 
              `group flex items-center gap-4 w-full px-4 py-3 rounded-full text-white font-semibold text-base transition-colors ${
                isActive 
                  ? 'bg-[#16181c]' 
                  : 'hover:bg-[#181818]'
              }`
            }
          >
            <School size={24} className="transition-colors" />
            <span>Academy</span>
          </NavLink>
        </div>
      </div>
    </aside>
  );
}
