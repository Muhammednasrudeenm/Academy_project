import React, { useState } from "react";
import AcademySidebar from "../components/sidebar/AcademySidebar";

export default function DashboardLayout({ children, hideMobileHamburger = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-black text-white relative overflow-hidden w-screen" style={{ width: '100vw', maxWidth: '100vw' }}>
      {/* ===== SIDEBAR ===== */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-black border-r border-[#2f3336] z-[1000]
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
        className={`fixed inset-0 bg-black/80 transition-opacity duration-300 md:hidden z-[900]
        ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 ml-0 md:ml-[16rem] lg:ml-[18rem] px-2 sm:px-4 md:px-6 lg:px-6 pt-2 pb-2 sm:pt-4 sm:pb-4 md:pt-6 md:pb-6 transition-all duration-300 w-full relative z-[100]">
        {/* Mobile Header with Hamburger - Hidden if hideMobileHamburger is true */}
        {!hideMobileHamburger && (
          <div className="flex items-center justify-between mb-4 md:hidden">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-full hover:bg-[#181818] focus:outline-none transition-colors"
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
            <h2 className="text-lg font-bold text-white">Academy</h2>
          </div>
        )}

        {children}
      </main>
    </div>
  );
}
