import React from 'react';
import { MousePointer2 } from 'lucide-react';

interface BigCursorProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isClicking: boolean;
}

export const BigCursor: React.FC<BigCursorProps> = ({ onClick, isClicking }) => {
  return (
    <button
      onClick={onClick}
      className="relative group focus:outline-none cursor-none" 
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* 1. Impact Ripple (Only triggers on click) */}
      {isClicking && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-green-500/20 rounded-full animate-ping pointer-events-none"></div>
      )}

      {/* 2. Idle Glow */}
      <div className="absolute inset-0 bg-green-500/20 blur-[60px] rounded-full scale-150 animate-pulse pointer-events-none group-hover:bg-green-400/30 transition-colors duration-500"></div>

      {/* 3. The Cursor Graphic */}
      <div 
        className={`relative transition-all duration-75 ease-out transform pointer-events-none
          ${isClicking ? 'scale-90 rotate-[-15deg] translate-y-2' : 'scale-100 rotate-[-12deg] hover:scale-105 hover:rotate-[-5deg]'}
        `}
      >
        {/* Main Body Shadow */}
        <MousePointer2 
            size={240} 
            className="text-black/50 absolute top-4 left-4 blur-sm" 
            strokeWidth={1}
        />
        
        {/* Main Body Fill */}
        <div className="relative">
            <svg 
                width="240" 
                height="240" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]"
            >
                <defs>
                    <linearGradient id="cursorGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#86efac" />
                    </linearGradient>
                </defs>
                <path 
                    d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" 
                    fill="url(#cursorGradient)" 
                    stroke="#000" 
                    strokeWidth="1.2"
                />
                <path 
                    d="M13 13l6 6" 
                    stroke="#000" 
                    strokeWidth="1.2"
                />
            </svg>
            
            {/* Tech Details overlay */}
            <div className="absolute top-8 left-6 pointer-events-none opacity-40">
                <div className="w-1 h-1 bg-black rounded-full mb-1"></div>
                <div className="w-1 h-1 bg-black rounded-full"></div>
            </div>
        </div>
      </div>
      
      {/* 4. Click Label */}
      <div className="absolute -bottom-12 left-0 right-0 text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="bg-black/80 text-green-400 font-mono text-xs px-3 py-1 rounded-full border border-green-500/20 tracking-widest uppercase shadow-lg">
            Initialize Click
        </span>
      </div>
    </button>
  );
};