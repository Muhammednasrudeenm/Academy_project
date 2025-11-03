import React from "react";
import { MessageCircle, Users } from "lucide-react";

export default function DefaultAcademyBanner({ className = "" }) {
  return (
    <div className={`w-full h-full ${className} bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 flex items-center justify-center relative overflow-hidden`}>
      {/* Background pattern - subtle texture */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(0,0,0,0.3) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>
      
      {/* Conversation bubbles / speech patterns */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Left side person */}
        <div className="absolute left-1/4 top-1/2 transform -translate-y-1/2 -translate-x-1/2">
          <div className="relative">
            <div className="w-16 h-16 bg-gray-700/60 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-gray-800/40">
              <Users className="w-8 h-8 text-gray-900" strokeWidth={2} />
            </div>
            {/* Speech bubble */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
              <div className="w-12 h-12 bg-gray-800/70 rounded-2xl rounded-tl-none backdrop-blur-sm border border-gray-900/50 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-gray-700" strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Center connection lines */}
        <div className="absolute left-1/3 top-1/2 w-1/3 h-0.5 bg-gray-700/40 transform -translate-y-1/2"></div>
        <div className="absolute left-1/2 top-1/2 w-0.5 h-16 bg-gray-700/30 transform -translate-x-1/2 -translate-y-1/2"></div>
        
        {/* Right side person */}
        <div className="absolute right-1/4 top-1/2 transform -translate-y-1/2 translate-x-1/2">
          <div className="relative">
            <div className="w-16 h-16 bg-gray-700/60 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-gray-800/40">
              <Users className="w-8 h-8 text-gray-900" strokeWidth={2} />
            </div>
            {/* Speech bubble */}
            <div className="absolute -top-8 right-1/2 transform translate-x-1/2">
              <div className="w-12 h-12 bg-gray-800/70 rounded-2xl rounded-tr-none backdrop-blur-sm border border-gray-900/50 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-gray-700" strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional conversation elements */}
      <div className="absolute bottom-1/4 left-1/3">
        <div className="w-8 h-8 bg-gray-600/50 rounded-full backdrop-blur-sm"></div>
      </div>
      <div className="absolute bottom-1/4 right-1/3">
        <div className="w-6 h-6 bg-gray-600/50 rounded-full backdrop-blur-sm"></div>
      </div>
      
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-600/30 via-transparent to-gray-500/20"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-gray-600/20 via-transparent to-gray-500/20"></div>
    </div>
  );
}

