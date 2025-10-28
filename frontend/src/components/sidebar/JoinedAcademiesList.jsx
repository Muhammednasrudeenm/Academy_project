import React from "react";
import { ChevronDown, ChevronRight, Users } from "lucide-react";
import AcademyTile from "./AcademyTile";

export default function JoinedAcademiesList({ academies, show, toggle }) {
  return (
    <section>
      <button
        onClick={toggle}
        className="flex items-center justify-between w-full mb-2 text-sm font-semibold text-white hover:text-sky-400 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Users size={16} />
          Joined Academies
        </div>
        {show ? (
          <ChevronDown size={16} className="text-gray-400" />
        ) : (
          <ChevronRight size={16} className="text-gray-400" />
        )}
      </button>

      {show && (
        <div className="flex flex-col gap-1 pl-2">
          {academies.length > 0 ? (
            academies.map((a) => <AcademyTile key={a.id} academy={a} />)
          ) : (
            <p className="text-xs text-gray-400 pl-2">No academies joined.</p>
          )}
        </div>
      )}
    </section>
  );
}
