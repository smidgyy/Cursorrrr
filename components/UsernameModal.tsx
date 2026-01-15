import React, { useState } from 'react';
import { BAD_WORDS } from '../constants';
import { UserCheck, AlertCircle } from 'lucide-react';

interface UsernameModalProps {
  onJoin: (username: string) => void;
}

export const UsernameModal: React.FC<UsernameModalProps> = ({ onJoin }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const validate = (name: string): string | null => {
    if (name.length < 3) return "Username too short (min 3 chars).";
    if (name.length > 12) return "Username too long (max 12 chars).";
    if (!/^[a-zA-Z0-9_]+$/.test(name)) return "Only letters, numbers, and underscores.";
    
    // Check profanity
    const lowerName = name.toLowerCase();
    if (BAD_WORDS.some(bad => lowerName.includes(bad))) {
        return "That username is not allowed.";
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate(input);
    if (validationError) {
      setError(validationError);
      return;
    }
    onJoin(input);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-[50px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px] pointer-events-none"></div>

        <div className="relative z-10 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-2xl mx-auto flex items-center justify-center mb-6 border border-white/5">
                <UserCheck className="text-green-400" size={32} />
            </div>
            
            <h2 className="text-2xl font-bold font-mono mb-2">Identify Yourself</h2>
            <p className="text-gray-400 text-sm mb-8">Enter a unique ID to join the global bonding curve. Your clicks will be recorded.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative group">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            setError('');
                        }}
                        placeholder="USERNAME"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-center font-mono text-lg outline-none focus:border-green-500/50 focus:bg-white/10 transition-all uppercase placeholder:text-gray-700"
                    />
                </div>

                {error && (
                    <div className="flex items-center justify-center gap-2 text-red-400 text-xs font-mono animate-pulse">
                        <AlertCircle size={12} />
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-sm"
                >
                    Enter System
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};
