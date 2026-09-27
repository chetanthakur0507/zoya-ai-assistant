import React from 'react';
import { AtmosphereTheme } from '../types';
import { X, Sparkles, Radio, Zap, Shield, Heart } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  theme: AtmosphereTheme;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  theme,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-3xl p-6 border shadow-2xl overflow-hidden text-white"
        style={{
          backgroundColor: '#0d0d12',
          borderColor: 'rgba(255, 255, 255, 0.12)',
          boxShadow: `0 0 40px ${theme.glowColor}`,
        }}
      >
        {/* Glow accent */}
        <div
          className="absolute -right-20 -top-20 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-40"
          style={{ backgroundColor: theme.accent }}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
              style={{
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentSecondary})`,
              }}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">About Zoya AI</h3>
              <p className="text-[11px] text-white/50">Real-time voice-to-voice persona</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="py-4 space-y-4 relative z-10 text-xs">
          {/* Persona Card */}
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-white/90">
              <Heart className="w-3.5 h-3.5" style={{ color: theme.accent }} />
              <span>Persona & Attitude</span>
            </div>
            <p className="text-white/70 leading-relaxed">
              Zoya is designed as a young, confident, witty, and playful companion.
              She speaks casually, uses gentle teasing banter, clever one-liners, and
              emotional expressiveness while remaining strictly safe and respectful.
            </p>
          </div>

          {/* Engine Specs */}
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-white/90">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Architecture & Audio Engine</span>
            </div>
            <ul className="space-y-1.5 text-white/70 list-disc list-inside">
              <li>
                <span className="font-medium text-white/90">Gemini Live API</span>: Continuous low-latency bidirectional session.
              </li>
              <li>
                <span className="font-medium text-white/90">Input</span>: 16kHz PCM16 mic streaming with hardware echo cancellation.
              </li>
              <li>
                <span className="font-medium text-white/90">Output</span>: 24kHz Web Audio API gapless buffer scheduler.
              </li>
              <li>
                <span className="font-medium text-white/90">Interruption Detection</span>: Instant cutoff when you speak over Zoya.
              </li>
            </ul>
          </div>

          {/* Function Calling Actions */}
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-white/90">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>Real-Time Browser Tools</span>
            </div>
            <p className="text-white/70 leading-relaxed">
              Ask Zoya to open external destinations like Spotify, YouTube, or Google.
              She will execute the browser action and show an interactive HUD card on your screen.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pure voice-to-voice stream</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl font-medium text-white transition-all hover:brightness-110 cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentSecondary})`,
            }}
          >
            Got it, babe
          </button>
        </div>
      </div>
    </div>
  );
};
