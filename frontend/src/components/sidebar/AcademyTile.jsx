import React from "react";
import { NavLink } from "react-router-dom";
import DefaultAcademyLogo from "../DefaultAcademyLogo";

export default function AcademyTile({ academy }) {
  return (
    <NavLink
      to={`/community/${academy._id || academy.id}`}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
          isActive
            ? "bg-gradient-to-r from-sky-500/30 to-sky-600/20 border-2 border-sky-400/50 text-white shadow-lg shadow-sky-500/20"
            : "bg-gray-800/30 border border-gray-700/30 hover:bg-gray-800/50 hover:border-gray-600/50 text-gray-200 hover:text-white"
        }`
      }
    >
      <div className="relative flex-shrink-0">
        {academy.logo && academy.logo.trim() !== '' ? (
          <img
            src={academy.logo}
            alt={academy.name}
            className="w-10 h-10 rounded-lg object-cover border-2 border-gray-600 shadow-md transition-transform group-hover:scale-110"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div style={{ display: academy.logo && academy.logo.trim() !== '' ? 'none' : 'flex' }}>
          <DefaultAcademyLogo size="w-10 h-10" className="border-2 border-gray-600 shadow-md transition-transform group-hover:scale-110" />
        </div>
      </div>
      <span className="text-sm font-semibold truncate flex-1">
        {academy.name}
      </span>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </NavLink>
  );
}
