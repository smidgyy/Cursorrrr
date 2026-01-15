import React from 'react';

interface PillProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isClicking: boolean;
}

export const Pill: React.FC<PillProps> = ({ onClick, isClicking }) => {
  return (
    <button
      onClick={onClick}
      className={`relative group transition-all duration-100 ease-in-out transform ${
        isClicking ? 'scale-95' : 'scale-100 hover:scale-105'
      } focus:outline-none cursor-pointer`}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Outer Glow Effect */}
      <div className="absolute inset-0 bg-green-500/30 rounded-full blur-[60px] opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>

      {/* The Pill Graphic */}
      <div className={`relative w-72 h-36 md:w-96 md:h-48 rounded-full flex overflow-hidden border-[6px] border-black/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${isClicking ? 'rotate-[-2deg]' : 'rotate-0'}`}>
        
        {/* Left Green Side - More Vibrant */}
        <div className="w-1/2 h-full bg-gradient-to-br from-green-400 via-green-500 to-green-700 relative">
            {/* Highlight */}
            <div className="absolute top-4 left-6 w-20 h-8 bg-white opacity-20 rounded-full transform -rotate-12 blur-sm"></div>
        </div>
        
        {/* Right White Side - Cleaner */}
        <div className="w-1/2 h-full bg-gradient-to-br from-gray-50 via-gray-200 to-gray-400 relative">
             {/* Dimple */}
            <div className="absolute bottom-6 right-10 w-12 h-12 rounded-full bg-black opacity-5 blur-md"></div>
        </div>
        
        {/* Center Seam */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 bg-black/20 blur-[1px]"></div>
        
        {/* Gloss Overlay */}
        <div className="absolute top-0 left-0 w-full h-[60%] bg-gradient-to-b from-white/40 to-transparent rounded-t-full pointer-events-none"></div>
      </div>
      
      {/* Text Label - Moved to top to avoid overlap */}
      <div className="absolute -top-12 left-0 right-0 text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="bg-black/80 text-green-400 font-mono text-xs px-3 py-1 rounded-full border border-green-500/20 tracking-widest uppercase shadow-lg">
            Click to Pump
        </span>
      </div>
    </button>
  );
};