export interface Upgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  effectValue: number;
  effectType: 'click' | 'passive';
  icon: string;
  count: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  value: number;
  text?: string;    // Custom text to display instead of value
  color?: string;   // Custom color (e.g., red for errors)
}

export interface GameState {
  balance: number;
  totalClicks: number; // New stat for leaderboard
  clickPower: number;
  autoClickPower: number;
  marketCap: number; 
  bondingCurveProgress: number;
}

export interface Player {
  username: string;
  score: number;
  rank?: number;
}