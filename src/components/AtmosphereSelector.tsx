import React from 'react';
import { AtmosphereMood } from '../types';
import { ATMOSPHERE_THEMES } from '../utils/themes';
import { Palette } from 'lucide-react';

interface AtmosphereSelectorProps {
  currentMood: AtmosphereMood;
  onSelectMood: (mood: AtmosphereMood) => void;
}

export const AtmosphereSelector: React.FC<AtmosphereSelectorProps> = ({
  currentMood,
  onSelectMood,
}) => {
  const moods: AtmosphereMood[] = [
    'neon-rose',
    'cyber-violet',
    'electric-cyan',
    'hot-amber',
    'emerald-matrix',
  ];

  return (
    <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-lg">
      <div className="pl-2 pr-1 text-white/40 hidden sm:flex items-center">
        <Palette className="w-3.5 h-3.5" />
      </div>
      {moods.map((mood) => {
        const theme = ATMOSPHERE_THEMES[mood];
        const isActive = currentMood === mood;

        return (
          <button
            key={mood}
            onClick={() => onSelectMood(mood)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer select-none ${
              isActive
                ? 'bg-white/15 text-white shadow-sm border border-white/20'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            title={theme.tagline}
          >
            <span
              className="w-2 h-2 rounded-full transition-transform"
              style={{
                backgroundColor: theme.accent,
                boxShadow: isActive ? `0 0 8px ${theme.accent}` : 'none',
                transform: isActive ? 'scale(1.2)' : 'scale(1)',
              }}
            />
            <span className="text-[11px] font-medium">{theme.name}</span>
          </button>
        );
      })}
    </div>
  );
};
