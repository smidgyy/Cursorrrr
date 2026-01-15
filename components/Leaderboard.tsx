import React from 'react';
import { Player } from '../types';
import { Trophy, Globe, User } from 'lucide-react';

interface LeaderboardProps {
  players: Player[];
  currentPlayer: string;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  isOffline: boolean;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ players, currentPlayer, isOpen, onClose, isLoading, isOffline }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Trophy className="text-yellow-400" size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-lg leading-none">Global Rankings</h3>
                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Top Clickers</span>
                </div>
            </div>
            
            {isOffline ? (
                 <span className="text-[10px] text-red-500 font-mono border border-red-500/30 px-2 py-1 rounded bg-red-500/10">OFFLINE</span>
            ) : (
                <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-[10px] text-green-500 font-mono">LIVE</span>
                </div>
            )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {isLoading ? (
                <div className="p-8 text-center text-gray-500 text-sm animate-pulse font-mono">
                    Fetching data...
                </div>
            ) : isOffline ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                    <p className="mb-2">Cannot connect to server.</p>
                    <p className="text-xs opacity-50">Run 'node server.cjs' to enable leaderboard.</p>
                </div>
            ) : (
                <div className="space-y-1">
                    {players.map((player, index) => {
                        const isMe = player.username === currentPlayer;
                        const rank = index + 1;
                        
                        let rankStyle = "text-gray-500";
                        if (rank === 1) rankStyle = "text-yellow-400";
                        if (rank === 2) rankStyle = "text-gray-300";
                        if (rank === 3) rankStyle = "text-amber-600";

                        return (
                            <div 
                                key={index} 
                                className={`flex items-center p-3 rounded-xl border ${isMe ? 'bg-green-500/10 border-green-500/30' : 'bg-transparent border-transparent hover:bg-white/5'}`}
                            >
                                <span className={`font-mono font-bold w-8 text-center ${rankStyle}`}>{rank}</span>
                                
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-3">
                                    <User size={14} className="text-gray-400" />
                                </div>
                                
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className={`font-bold text-sm ${isMe ? 'text-green-400' : 'text-white'}`}>
                                            {player.username}
                                        </span>
                                        <span className="font-mono text-gray-400 text-xs">
                                            {player.score.toLocaleString()} Clicks
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    
                    {players.length === 0 && (
                        <div className="text-center p-8 text-gray-500 text-xs">No players yet. Be the first!</div>
                    )}
                </div>
            )}
        </div>

        {/* Footer / Close */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02]">
            <button 
                onClick={onClose}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm font-bold transition-colors"
            >
                Close Leaderboard
            </button>
        </div>
      </div>
    </div>
  );
};
