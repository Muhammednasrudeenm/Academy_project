import React from "react";
import { NavLink } from "react-router-dom";

export default function AcademyTile({ academy }) {
  return (
    <NavLink
      to={`/academies/${academy.id}`}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
          isActive
            ? "bg-sky-700 text-white font-semibold"
            : "text-white hover:bg-sky-800 hover:text-white"
        }`
      }
    >
      <img
        src={academy.logo || "https://img.icons8.com/color/48/university.png"}
        alt={academy.name}
        className="w-8 h-8 rounded-md object-cover"
      />
      <span className="text-sm font-medium truncate text-white">
        {academy.name}
      </span>
    </NavLink>
  );
}
