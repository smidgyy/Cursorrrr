import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface BondingCurveProps {
  progress: number;
}

export const BondingCurve: React.FC<BondingCurveProps> = ({ progress }) => {
  const data = useMemo(() => {
    // Generate an exponential curve based on progress
    const points = [];
    const steps = 20;
    // Current progress maps to an index in the curve
    const currentStep = Math.floor((progress / 100) * steps);

    for (let i = 0; i <= steps; i++) {
      const x = i;
      // Exponential growth formula: y = e^(kx)
      const normalizedX = i / steps;
      const y = Math.pow(normalizedX, 3) * 1000; 
      
      points.push({
        name: `${i}`,
        value: y,
        isAchieved: i <= currentStep
      });
    }
    return points;
  }, [progress]);

  const gradientOffset = () => {
    return (progress / 100);
  };

  const off = gradientOffset();

  return (
    <div className="w-full h-48 bg-black/40 rounded-xl border border-white/10 p-2 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute top-2 left-4 z-10">
        <h3 className="text-xs text-gray-400 uppercase tracking-widest font-bold">Bonding Curve</h3>
        <p className="text-green-400 font-mono text-lg">{progress.toFixed(2)}% <span className="text-xs text-gray-500">to Raydium</span></p>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="splitColor" x1="0" y1="0" x2="1" y2="0">
              <stop offset={off} stopColor="#4ade80" stopOpacity={0.8}/>
              <stop offset={off} stopColor="#4ade80" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="name" hide />
          <YAxis hide domain={[0, 'auto']} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
            itemStyle={{ color: '#4ade80' }}
            cursor={{ stroke: '#ffffff30' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#22c55e" 
            strokeWidth={2}
            fill="url(#splitColor)" 
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Target Line */}
      <div className="absolute top-4 right-4 text-right">
        <div className="flex items-center justify-end gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
            <span className="text-xs text-purple-400 font-bold">KING OF THE HILL</span>
        </div>
      </div>
    </div>
  );
};