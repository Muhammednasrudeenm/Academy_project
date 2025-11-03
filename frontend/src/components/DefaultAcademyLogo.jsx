import React from "react";
import { Trophy } from "lucide-react";

export default function DefaultAcademyLogo({ size = "w-12 h-12", className = "", style = {} }) {
  const sizeClasses = {
    "w-8 h-8": "w-4 h-4",
    "w-10 h-10": "w-5 h-5",
    "w-12 h-12": "w-6 h-6",
    "w-14 h-14": "w-7 h-7",
    "w-16 h-16": "w-8 h-8",
    "w-18 h-18": "w-9 h-9",
  };

  const iconSize = sizeClasses[size] || "w-6 h-6";
  
  // Check if rounded-full is in className
  const isRounded = className.includes('rounded-full') ? 'rounded-full' : 'rounded-lg';

  return (
    <div className={`${size} ${isRounded} bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-red-500/20 ${className.includes('border') ? '' : 'border-2 border-amber-400/30'} ${className} flex items-center justify-center flex-shrink-0`} style={style}>
      <Trophy className={`${iconSize} text-amber-400`} strokeWidth={2.5} fill="currentColor" fillOpacity={0.3} />
    </div>
  );
}

