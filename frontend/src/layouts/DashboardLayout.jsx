import React, { useState } from "react";
import AcademySidebar from "../components/sidebar/AcademySidebar";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-900 text-white relative overflow-hidden">
      {/* ===== SIDEBAR ===== */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 border-r border-gray-700 z-[1000]
        transition-all duration-300 ease-in-out md:translate-x-0 md:opacity-100
        ${
          sidebarOpen
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "-translate-x-full opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto md:translate-x-0"
        }`}
      >
        <AcademySidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* ===== OVERLAY ===== */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 md:hidden z-[900]
        ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 ml-0 md:ml-[16rem] lg:ml-[18rem] p-4 sm:p-6 transition-all duration-300 w-full relative z-[100]">
        {/* Mobile Header with Hamburger */}
        <div className="flex items-center justify-between mb-4 md:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-white">Academy</h2>
        </div>

        {children}
      </main>
    </div>
  );
}
