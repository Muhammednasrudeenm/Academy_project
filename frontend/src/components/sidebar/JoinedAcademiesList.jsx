import React from "react";
import { ChevronDown, ChevronRight, Users } from "lucide-react";
import AcademyTile from "./AcademyTile";

export default function JoinedAcademiesList({ academies, show, toggle }) {
  return (
    <section className="bg-gradient-to-br from-[#1E293B]/50 to-[#0f172a]/50 rounded-2xl p-4 border border-gray-700/30 backdrop-blur-sm">
      <button
        onClick={toggle}
        className="group flex items-center justify-between w-full mb-3 p-2.5 rounded-xl bg-gradient-to-r from-purple-500/10 to-purple-600/5 hover:from-purple-500/20 hover:to-purple-600/10 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/30 to-purple-600/20 group-hover:from-purple-500/40 group-hover:to-purple-600/30 transition-all shadow-lg">
            <Users size={18} className="text-purple-300" />
          </div>
          <span className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">
            Joined Academies
          </span>
          {academies.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold">
              {academies.length}
            </span>
          )}
        </div>
        {show ? (
          <ChevronDown size={18} className="text-purple-400 transition-transform" />
        ) : (
          <ChevronRight size={18} className="text-purple-400 transition-transform" />
        )}
      </button>

      {show && (
        <div className="flex flex-col gap-2 mt-2">
          {academies.length > 0 ? (
            academies.map((a) => <AcademyTile key={a._id || a.id} academy={a} />)
          ) : (
            <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/30 text-center">
              <p className="text-xs text-gray-400">No academies joined yet.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
