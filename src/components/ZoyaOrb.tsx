import React, { useMemo } from 'react';
import { SessionState, AtmosphereTheme } from '../types';
import { Mic, MicOff, Power, Sparkles, Volume2 } from 'lucide-react';

interface ZoyaOrbProps {
  state: SessionState;
  theme: AtmosphereTheme;
  inputVolume: number;
  outputVolume: number;
  frequencies: number[];
  isMuted: boolean;
  onTogglePower: () => void;
  onToggleMute: () => void;
}

export const ZoyaOrb: React.FC<ZoyaOrbProps> = ({
  state,
  theme,
  inputVolume,
  outputVolume,
  frequencies,
  isMuted,
  onTogglePower,
  onToggleMute,
}) => {
  // Compute active volume based on whether Zoya is speaking or user is speaking
  const activeVolume = useMemo(() => {
    if (state === 'speaking') {
      return Math.min(1, outputVolume * 2.2);
    }
    if (state === 'listening' && !isMuted) {
      return Math.min(1, inputVolume * 3.0);
    }
    return 0;
  }, [state, outputVolume, inputVolume, isMuted]);

  // Dynamic scale calculation with smooth dampening
  const orbScale = 1 + activeVolume * 0.28;
  const outerGlowScale = 1 + activeVolume * 0.65;
  const auraOpacity = 0.35 + activeVolume * 0.55;

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* Outer ambient blur aura */}
      <div
        className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full transition-all duration-300 pointer-events-none blur-3xl"
        style={{
          background: `radial-gradient(circle, ${theme.accent} 0%, ${theme.accentSecondary} 40%, transparent 75%)`,
          transform: `scale(${outerGlowScale})`,
          opacity: state === 'disconnected' ? 0.15 : auraOpacity,
        }}
      />

      {/* Rotating Cybernetic Orbital Rings */}
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
        {/* Ring 1 - Outer dashed orbital */}
        <div
          className={`absolute inset-0 rounded-full border border-dashed transition-all duration-700 ${
            state === 'connecting'
              ? 'animate-[spin_4s_linear_infinite] border-white/40'
              : state === 'speaking'
              ? 'animate-[spin_10s_linear_infinite] border-white/30'
              : state === 'listening'
              ? 'animate-[spin_20s_linear_infinite] border-white/20'
              : 'border-white/10'
          }`}
          style={{
            borderColor: state !== 'disconnected' ? theme.accent : 'rgba(255, 255, 255, 0.1)',
            transform: `scale(${1 + activeVolume * 0.15})`,
          }}
        />

        {/* Ring 2 - Inner reverse orbital */}
        <div
          className={`absolute inset-4 rounded-full border border-dotted transition-all duration-700 ${
            state === 'connecting'
              ? 'animate-[spin_3s_linear_infinite_reverse]'
              : state === 'speaking'
              ? 'animate-[spin_8s_linear_infinite_reverse]'
              : state === 'listening'
              ? 'animate-[spin_16s_linear_infinite_reverse]'
              : 'border-white/10'
          }`}
          style={{
            borderColor: state !== 'disconnected' ? theme.accentSecondary : 'rgba(255, 255, 255, 0.08)',
          }}
        />

        {/* Ring 3 - Soundwave Frequency spikes (when speaking) */}
        {state === 'speaking' && (
          <div className="absolute inset-2 flex items-center justify-center pointer-events-none">
            {frequencies.slice(0, 16).map((freq, idx) => {
              const angle = (idx / 16) * 360;
              const height = Math.max(4, freq * 36);
              return (
                <div
                  key={idx}
                  className="absolute w-1 rounded-full transition-all duration-75 origin-bottom"
                  style={{
                    height: `${height}px`,
                    transform: `rotate(${angle}deg) translateY(-132px)`,
                    background: `linear-gradient(to top, ${theme.accent}, ${theme.accentSecondary})`,
                    opacity: 0.8,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Ring 4 - Listening Sound ripples (when listening to user) */}
        {state === 'listening' && activeVolume > 0.05 && (
          <div
            className="absolute inset-0 rounded-full border-2 animate-ping pointer-events-none"
            style={{
              borderColor: theme.accent,
              opacity: Math.min(0.6, activeVolume * 1.5),
            }}
          />
        )}

        {/* Central Core Orb Button */}
        <button
          onClick={onTogglePower}
          aria-label={state === 'disconnected' ? 'Wake Zoya' : 'Disconnect session'}
          className={`relative z-10 w-44 h-44 sm:w-52 sm:h-52 rounded-full cursor-pointer transition-all duration-300 flex flex-col items-center justify-center p-4 focus:outline-none focus:ring-4 focus:ring-rose-500/30 group ${
            state === 'disconnected'
              ? 'hover:scale-105 active:scale-95'
              : 'active:scale-95'
          }`}
          style={{
            transform: `scale(${orbScale})`,
            boxShadow: `0 0 50px ${theme.glowColor}, inset 0 0 40px rgba(0, 0, 0, 0.7)`,
          }}
        >
          {/* Inner holographic gradient sphere */}
          <div
            className={`absolute inset-0 rounded-full transition-all duration-500 overflow-hidden ${
              state === 'connecting'
                ? 'animate-pulse'
                : state === 'speaking'
                ? 'animate-[pulse_1.5s_ease-in-out_infinite]'
                : ''
            }`}
            style={{
              background:
                state === 'disconnected'
                  ? 'radial-gradient(circle at 35% 35%, #27272a 0%, #09090b 70%, #000000 100%)'
                  : `radial-gradient(circle at 35% 35%, ${theme.orbGradStart} 0%, ${theme.orbGradEnd} 60%, #09090b 100%)`,
            }}
          >
            {/* Shimmer light reflection effect */}
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/20 rounded-full blur-xl transform -rotate-45" />

            {/* Mesh particle shimmer */}
            <div
              className={`absolute inset-0 opacity-40 mix-blend-overlay ${
                state !== 'disconnected' ? 'animate-[spin_12s_linear_infinite]' : ''
              }`}
              style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, white 1px, transparent 1px)`,
                backgroundSize: '16px 16px',
              }}
            />
          </div>

          {/* Core Content / Icon */}
          <div className="relative z-20 flex flex-col items-center justify-center text-center">
            {state === 'disconnected' && (
              <>
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-2.5 text-white/80 group-hover:text-white group-hover:bg-white/20 transition-all shadow-inner">
                  <Power className="w-7 h-7" />
                </div>
                <span className="text-xs font-semibold tracking-wider uppercase text-white/70 group-hover:text-white transition-colors">
                  Tap To Wake
                </span>
                <span className="text-[10px] text-white/40 tracking-tight mt-0.5">
                  Voice-to-Voice
                </span>
              </>
            )}

            {state === 'connecting' && (
              <>
                <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white animate-spin mb-2" />
                <span className="text-xs font-medium tracking-wider uppercase text-white/90">
                  Tuning Link
                </span>
                <span className="text-[10px] text-white/60 tracking-tight mt-0.5">
                  Quantum sync...
                </span>
              </>
            )}

            {state === 'listening' && (
              <>
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-2 text-white shadow-lg">
                  {isMuted ? (
                    <MicOff className="w-7 h-7 text-rose-300" />
                  ) : (
                    <Mic
                      className="w-7 h-7"
                      style={{
                        transform: `scale(${1 + activeVolume * 0.4})`,
                        transition: 'transform 0.1s ease',
                      }}
                    />
                  )}
                </div>
                <span className="text-xs font-bold tracking-wider uppercase text-white drop-shadow">
                  {isMuted ? 'Muted' : 'Listening...'}
                </span>
                <span className="text-[10px] text-white/70 tracking-tight mt-0.5">
                  {isMuted ? 'Tap mic to talk' : 'Speak to Zoya'}
                </span>
              </>
            )}

            {state === 'speaking' && (
              <>
                <div className="w-14 h-14 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center mb-2 text-white shadow-lg animate-bounce">
                  <Volume2 className="w-7 h-7 drop-shadow" />
                </div>
                <span className="text-xs font-bold tracking-wider uppercase text-white drop-shadow">
                  Speaking
                </span>
                <span className="text-[10px] text-white/80 tracking-tight mt-0.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Zoya
                </span>
              </>
            )}
          </div>
        </button>
      </div>

      {/* Quick mic mute button when active */}
      {state !== 'disconnected' && (
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute();
            }}
            aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            className={`px-4 py-2 rounded-full text-xs font-medium backdrop-blur-lg border transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
              isMuted
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 hover:bg-rose-500/30'
                : 'bg-white/10 border-white/20 text-white/90 hover:bg-white/20 hover:text-white'
            }`}
          >
            {isMuted ? (
              <>
                <MicOff className="w-3.5 h-3.5 text-rose-400" />
                <span>Microphone Muted</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
                <span>Microphone Live</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
