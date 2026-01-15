import React, { useState, useEffect, useRef } from 'react';
import { BigCursor } from './components/BigCursor';
import { INITIAL_UPGRADES, getIcon } from './constants';
import { Upgrade, FloatingText } from './types';
import { Coins, Zap, Activity, TrendingUp, MousePointer2, Save, Volume2, VolumeX } from 'lucide-react';
import { UsernameModal } from './components/UsernameModal';
import { playClickSound, playUpgradeSound, playUiSound, playErrorSound } from './utils/audio';

const STORAGE_KEY = 'the_cursor_save_v2'; 

// Use environment variable for API URL if available, otherwise default to localhost
// We use optional chaining here because in some environments (or if incorrectly bundled), import.meta.env might not be defined.
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';

// Format numbers (e.g. 1.2k, 1M)
const formatNumber = (num: number): string => {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'k';
  return Math.floor(num).toLocaleString();
};

export default function App() {
  // --- Initialization ---
  const loadSavedGame = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) {
        console.error("Save file corrupted or missing", e);
    }
    return null;
  };
  const savedState = loadSavedGame();

  // --- State ---
  // User Identity
  const [username, setUsername] = useState<string | null>(savedState?.username ?? null);
  
  // Game Stats
  const [balance, setBalance] = useState<number>(savedState?.balance ?? 0);
  const [totalClicks, setTotalClicks] = useState<number>(savedState?.totalClicks ?? 0); 
  const [clickPower, setClickPower] = useState<number>(savedState?.clickPower ?? 1);
  const [autoClickPower, setAutoClickPower] = useState<number>(savedState?.autoClickPower ?? 0);
  const [upgrades, setUpgrades] = useState<Upgrade[]>(savedState?.upgrades ?? INITIAL_UPGRADES);
  
  // Visuals & UI
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [isClicking, setIsClicking] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  
  // Settings
  const [isMuted, setIsMuted] = useState<boolean>(savedState?.isMuted ?? false);
  
  // Refs for access inside intervals
  const balanceRef = useRef(balance);
  const totalClicksRef = useRef(totalClicks);
  const autoClickPowerRef = useRef(autoClickPower);
  const upgradesRef = useRef(upgrades);
  const clickPowerRef = useRef(clickPower);
  const usernameRef = useRef(username);
  const isMutedRef = useRef(isMuted);

  // Anti-Cheat Refs
  const clickHistoryRef = useRef<number[]>([]);

  // Sync refs
  useEffect(() => {
    balanceRef.current = balance;
    totalClicksRef.current = totalClicks;
    autoClickPowerRef.current = autoClickPower;
    upgradesRef.current = upgrades;
    clickPowerRef.current = clickPower;
    usernameRef.current = username;
    isMutedRef.current = isMuted;
  }, [balance, totalClicks, autoClickPower, upgrades, clickPower, username, isMuted]);

  // --- Offline Earnings ---
  useEffect(() => {
    if (savedState && savedState.lastSaveTime && savedState.autoClickPower > 0) {
        const now = Date.now();
        const secondsOffline = (now - savedState.lastSaveTime) / 1000;
        
        // If away for more than 5 seconds, calculate earnings
        if (secondsOffline > 5) {
            const earned = Math.floor(secondsOffline * savedState.autoClickPower);
            if (earned > 0) {
                setBalance(prev => prev + earned);
                setTimeout(() => {
                    alert(`Welcome back ${savedState.username || 'Anon'}!\n\nWhile you were away, your passive income generated:\n$CURSOR ${formatNumber(earned)}`);
                }, 500);
            }
        }
    }
  }, []);

  // --- Auto Save & Sync Loop ---
  useEffect(() => {
    const saveInterval = setInterval(() => {
        // Local Save
        const gameState = {
            username: usernameRef.current,
            balance: balanceRef.current,
            totalClicks: totalClicksRef.current,
            clickPower: clickPowerRef.current,
            autoClickPower: autoClickPowerRef.current,
            upgrades: upgradesRef.current,
            isMuted: isMutedRef.current,
            lastSaveTime: Date.now()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
        setLastSaved(new Date());

        // Backend Sync (If username exists)
        if (usernameRef.current) {
            syncScore(usernameRef.current, totalClicksRef.current);
        }

    }, 5000); // Save every 5 seconds

    return () => clearInterval(saveInterval);
  }, []);

  // --- API Functions ---
  const syncScore = async (user: string, clicks: number) => {
    try {
        await fetch(`${API_URL}/score`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, score: clicks })
        });
    } catch (e) {
        // Silent fail for sync
    }
  };

  // --- Game Loop (Passive Income) ---
  useEffect(() => {
    const interval = setInterval(() => {
      if (autoClickPowerRef.current > 0) {
        // Add income every second
        setBalance(prev => prev + autoClickPowerRef.current);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Handlers ---

  const handleJoin = (name: string) => {
    if (!isMuted) playUiSound();
    setUsername(name);
    // Initial sync
    syncScore(name, totalClicks);
  };

  const handleCursorClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // --- RATE LIMIT CHECK (Anti-Cheat) ---
    const now = Date.now();
    const CPM_LIMIT = 700; // Adjusted to 700 CPM (~11-12 clicks/sec)
    const TIME_WINDOW = 3000; // Look at last 3 seconds for smoother limiting
    // Calculate max allowed clicks in this time window
    const MAX_CLICKS_IN_WINDOW = Math.ceil((CPM_LIMIT / 60) * (TIME_WINDOW / 1000)); 

    // 1. Filter history to current window
    const recentClicks = clickHistoryRef.current.filter(t => now - t < TIME_WINDOW);
    clickHistoryRef.current = recentClicks;

    // 2. Check if limit exceeded
    if (recentClicks.length >= MAX_CLICKS_IN_WINDOW) {
         if (!isMuted) playErrorSound();
         
         // Visual feedback for rate limiting
         const rect = e.currentTarget.getBoundingClientRect();
         const x = e.clientX - rect.left + (Math.random() * 100 - 50); 
         const y = e.clientY - rect.top;

         const errorText: FloatingText = {
             id: Date.now() + Math.random(),
             x,
             y,
             value: 0,
             text: "SLOW DOWN",
             color: "text-red-500"
         };

         setFloatingTexts(prev => {
            const next = [...prev, errorText];
            if (next.length > 20) return next.slice(next.length - 20);
            return next;
         });

         setTimeout(() => {
             setFloatingTexts(prev => prev.filter(ft => ft.id !== errorText.id));
         }, 800);

         return; // STOP HERE - Do not register click
    }

    // 3. Register valid click timestamp
    clickHistoryRef.current.push(now);
    // -------------------------------------

    // 0. Sound
    if (!isMuted) playClickSound();

    // 1. Add balance & click count
    setBalance(prev => prev + clickPower);
    setTotalClicks(prev => prev + 1);
    
    // 2. Visual click state
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 80);

    // 3. Floating Text Logic
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left + (Math.random() * 100 - 50); 
    const y = e.clientY - rect.top;

    const newText: FloatingText = {
      id: Date.now() + Math.random(),
      x,
      y,
      value: clickPower
    };

    // Cap floating text to prevent lag
    setFloatingTexts(prev => {
        const next = [...prev, newText];
        if (next.length > 20) return next.slice(next.length - 20);
        return next;
    });

    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(ft => ft.id !== newText.id));
    }, 800);
  };

  const buyUpgrade = (upgradeId: string) => {
    setUpgrades(prev => prev.map(up => {
      if (up.id !== upgradeId) return up;

      const currentCost = Math.floor(up.baseCost * Math.pow(up.costMultiplier, up.count));
      
      if (balance >= currentCost) {
        if (!isMuted) playUpgradeSound();
        setBalance(b => b - currentCost);
        
        if (up.effectType === 'click') {
            setClickPower(cp => cp + up.effectValue);
        } else {
            setAutoClickPower(acp => acp + up.effectValue);
        }

        return { ...up, count: up.count + 1 };
      } else {
        // Optional: Error sound if clicked but can't afford
        // if (!isMuted) playErrorSound();
      }
      return up;
    }));
  };

  // --- Render ---

  if (!username) {
    return (
        <>
            {/* Background for modal */}
            <div className="fixed inset-0 z-0 bg-[#050505]">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-green-500/10 blur-[120px] rounded-full mix-blend-screen"></div>
            </div>
            <UsernameModal onJoin={handleJoin} />
        </>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden font-inter selection:bg-green-500 selection:text-black flex flex-col">
      
      {/* --- Background --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-green-500/10 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-900/10 blur-[100px] rounded-full mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)]"></div>
      </div>

      {/* --- Header --- */}
      <header className="relative z-20 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.3)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-gray-100 to-gray-300 opacity-50"></div>
              <MousePointer2 className="text-black fill-black relative z-10 transform -rotate-12 translate-y-0.5 translate-x-[-1px]" size={24} />
           </div>
           <div>
              <h1 className="font-bold text-xl tracking-tight leading-none">The Cursor</h1>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">ID: {username}</span>
                <span className="text-[10px] text-green-600 font-mono flex items-center gap-1 opacity-50">
                    <Save size={8} /> Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
           </div>
        </div>
        
        <div className="flex gap-4">
            <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
            >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            
            {/* X (Twitter) Community Link */}
            <a 
                href="https://x.com/i/communities/2011724393349541904" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
                title="Join X Community"
            >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white group-hover:fill-gray-200" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            </a>

            {/* Pump.fun Link */}
            <a 
                href="https://pump.fun/coin/2wC658QPsHGhherS4xfJYff8gwE54WSk2r9UUGkepump" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 flex items-center justify-center transition-all hover:scale-105 active:scale-95 group overflow-hidden"
                title="View on Pump.fun"
            >
                 <div className="relative w-3 h-5 transform rotate-45">
                     <div className="absolute top-0 left-0 right-0 h-[60%] bg-green-500 rounded-t-full"></div>
                     <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-white rounded-b-full"></div>
                </div>
            </a>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        
        {/* LEFT: The Arena */}
        <div className="flex flex-col items-center justify-center space-y-12 py-8 lg:py-0">
            
            {/* Stats Display */}
            <div className="text-center relative">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-[100px] font-bold text-white/5 select-none pointer-events-none whitespace-nowrap blur-sm">
                    CURSOR
                </div>
                <h2 className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">Current Balance</h2>
                <div className="flex items-center justify-center gap-2">
                    <span className="text-7xl lg:text-8xl font-sans font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-lg break-all">
                        {Math.floor(balance).toLocaleString()}
                    </span>
                </div>
                <span className="text-green-500 font-bold text-lg tracking-wider">$CURSOR</span>
            </div>

            {/* The Cursor Interaction */}
            <div className="relative w-full flex justify-center py-8 min-h-[320px] items-center">
                 {/* Floating Text Overlay */}
                 {floatingTexts.map(ft => (
                    <div
                        key={ft.id}
                        className={`absolute pointer-events-none font-bold text-3xl animate-float z-50 font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] select-none ${ft.color || 'text-green-400'}`}
                        style={{ left: `calc(50% + ${ft.x}px)`, top: `calc(50% + ${ft.y - 120}px)` }}
                    >
                        {ft.text ? ft.text : `+${formatNumber(ft.value)}`}
                    </div>
                 ))}
                 
                 <div className="relative z-10">
                     <BigCursor onClick={handleCursorClick} isClicking={isClicking} />
                 </div>
            </div>

            {/* Stat Badges */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center gap-1 group hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-2 text-yellow-400 mb-1">
                        <Zap size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Click Power</span>
                    </div>
                    <span className="text-2xl font-mono font-bold">{formatNumber(clickPower)}</span>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center gap-1 group hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-2 text-blue-400 mb-1">
                        <Activity size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Auto Pump</span>
                    </div>
                    <span className="text-2xl font-mono font-bold">{formatNumber(autoClickPower)} <span className="text-sm text-gray-500">/sec</span></span>
                </div>
                <div className="col-span-2 bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center gap-1 group hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-2 text-purple-400 mb-1">
                        <MousePointer2 size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Total Manual Clicks</span>
                    </div>
                    <span className="text-2xl font-mono font-bold">{totalClicks.toLocaleString()}</span>
                </div>
            </div>
        </div>

        {/* RIGHT: Upgrade Station */}
        <div className="h-[600px] bg-black/40 border border-white/10 rounded-3xl overflow-hidden flex flex-col backdrop-blur-xl shadow-2xl relative">
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-white/[0.02] flex justify-between items-center sticky top-0 z-10 backdrop-blur-lg">
                <div>
                    <h3 className="font-bold text-xl flex items-center gap-2">
                        <Coins className="text-purple-400" size={20} /> 
                        Upgrade Station
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Scale your operations</p>
                </div>
                
                <div className="flex gap-2">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Live</span>
                    </div>
                </div>
            </div>
            
            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {upgrades.map(upgrade => {
                    const currentCost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.count));
                    const canAfford = balance >= currentCost;
                    const isClickUpgrade = upgrade.effectType === 'click';

                    return (
                        <button
                            key={upgrade.id}
                            onClick={() => buyUpgrade(upgrade.id)}
                            disabled={!canAfford}
                            className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-all duration-300 group relative overflow-hidden text-left
                                ${canAfford 
                                    ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-green-500/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)]' 
                                    : 'bg-transparent border-transparent opacity-40 cursor-not-allowed grayscale-[0.5]'
                                }
                            `}
                        >
                            {/* Icon Box */}
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-black font-bold shadow-lg transition-transform group-hover:scale-110 shrink-0
                                ${canAfford ? 'bg-gradient-to-br from-gray-100 to-gray-300' : 'bg-gray-800 text-gray-500'}
                            `}>
                                {getIcon(upgrade.icon, `w-6 h-6 ${canAfford ? 'text-black' : 'text-gray-500'}`)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-bold text-sm lg:text-base group-hover:text-green-400 transition-colors truncate">{upgrade.name}</h4>
                                    <span className="text-[10px] font-mono font-bold bg-black/40 px-2 py-0.5 rounded text-gray-400 border border-white/5 ml-2 whitespace-nowrap">LVL {upgrade.count}</span>
                                </div>
                                
                                {/* Stat Badge + Description */}
                                <div className="flex items-center gap-2 mb-2">
                                     <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1
                                        ${isClickUpgrade 
                                            ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' 
                                            : 'text-blue-400 bg-blue-400/10 border-blue-400/20'}
                                     `}>
                                        {isClickUpgrade ? <Zap size={10} /> : <Activity size={10} />}
                                        <span>+{formatNumber(upgrade.effectValue)} {isClickUpgrade ? 'Click' : 'Auto'}</span>
                                     </div>
                                </div>
                                
                                <p className="text-xs text-gray-400 mb-2 leading-relaxed">{upgrade.description}</p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-sm font-mono font-bold">
                                        <span className={canAfford ? 'text-green-400' : 'text-gray-600'}>
                                            {formatNumber(currentCost)}
                                        </span>
                                        <span className="text-[10px] text-gray-600 uppercase">$CURSOR</span>
                                    </div>
                                    {canAfford && (
                                        <TrendingUp size={14} className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
            
            {/* Bottom Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
        </div>

      </main>

      {/* --- Footer --- */}
      <footer className="w-full py-4 text-center z-10">
        <p className="text-[10px] text-gray-600 font-mono tracking-widest uppercase opacity-50 hover:opacity-100 transition-opacity">
            Not Financial Advice • Degen responsibly
        </p>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}