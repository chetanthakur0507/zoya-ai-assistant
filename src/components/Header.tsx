import React from 'react';
import { AtmosphereTheme, SessionState } from '../types';
import { Sparkles, Info, ShieldCheck, Radio } from 'lucide-react';

interface HeaderProps {
  state: SessionState;
  theme: AtmosphereTheme;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  theme,
  onOpenSettings,
}) => {
  const getStatusBadge = () => {
    switch (state) {
      case 'connecting':
        return {
          label: 'Linking...',
          color: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
          dot: 'bg-amber-400 animate-ping',
        };
      case 'listening':
        return {
          label: 'Live • Listening',
          color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
          dot: 'bg-emerald-400 animate-pulse',
        };
      case 'speaking':
        return {
          label: 'Zoya Speaking',
          color: 'text-rose-400 bg-rose-400/10 border-rose-400/30',
          dot: 'bg-rose-400 animate-ping',
        };
      case 'error':
        return {
          label: 'Error',
          color: 'text-red-400 bg-red-400/10 border-red-400/30',
          dot: 'bg-red-400',
        };
      default:
        return {
          label: 'Dormant • Ready',
          color: 'text-white/50 bg-white/5 border-white/10',
          dot: 'bg-white/40',
        };
    }
  };

  const status = getStatusBadge();

  return (
    <header className="fixed top-0 inset-x-0 z-30 flex items-center justify-between px-4 sm:px-8 py-4 backdrop-blur-md bg-black/30 border-b border-white/[0.06]">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center font-black tracking-tighter text-sm text-white shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentSecondary})`,
            boxShadow: `0 0 16px ${theme.glowColor}`,
          }}
        >
          Z
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-wider text-base sm:text-lg text-white">
              ZOYA
            </span>
            <span
              className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded-md"
              style={{
                backgroundColor: `${theme.accent}30`,
                color: theme.accent,
              }}
            >
              LIVE
            </span>
          </div>
          <span className="text-[10px] text-white/40 tracking-tight hidden sm:inline">
            Voice-to-Voice Sassy Companion
          </span>
        </div>
      </div>

      {/* Center Status Pill */}
      <div
        className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-2 backdrop-blur-lg shadow-sm transition-all ${status.color}`}
      >
        <span className={`w-2 h-2 rounded-full ${status.dot}`} />
        <span className="font-semibold tracking-wide text-[11px]">
          {status.label}
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSettings}
          aria-label="App info & settings"
          className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
