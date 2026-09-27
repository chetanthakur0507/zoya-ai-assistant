import React, { useEffect, useState } from 'react';
import { AtmosphereTheme, ReactionEvent, ReactionType, WebsiteAction } from '../types';
import { ExternalLink, Sparkles, X } from 'lucide-react';

interface ReactionHUDProps {
  reaction: ReactionEvent | null;
  websiteAction: WebsiteAction | null;
  atmosphereQuote: string | null;
  theme: AtmosphereTheme;
  onDismissWebsiteAction: () => void;
}

const REACTION_ICONS: Record<ReactionType, { emoji: string; label: string }> = {
  wink: { emoji: '😉', label: 'Wink' },
  smirk: { emoji: '😏', label: 'Smirk' },
  heart: { emoji: '💖', label: 'Flirt' },
  sparkle: { emoji: '✨', label: 'Sparkle' },
  laugh: { emoji: '😆', label: 'Giggle' },
  eyeroll: { emoji: '🙄', label: 'Eye Roll' },
  fire: { emoji: '🔥', label: 'Spicy' },
};

export const ReactionHUD: React.FC<ReactionHUDProps> = ({
  reaction,
  websiteAction,
  atmosphereQuote,
  theme,
  onDismissWebsiteAction,
}) => {
  const [activeReaction, setActiveReaction] = useState<ReactionEvent | null>(null);

  useEffect(() => {
    if (reaction) {
      setActiveReaction(reaction);
      const timer = setTimeout(() => {
        setActiveReaction(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [reaction]);

  return (
    <div className="fixed inset-x-0 top-18 z-40 flex flex-col items-center pointer-events-none px-4 gap-3">
      {/* 1. Holographic Sassy Reaction Badge */}
      {activeReaction && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto flex flex-col items-center">
          <div
            className="flex items-center gap-2.5 px-4 py-2 rounded-full backdrop-blur-xl border shadow-2xl transition-all"
            style={{
              backgroundColor: 'rgba(18, 18, 24, 0.85)',
              borderColor: theme.accent,
              boxShadow: `0 0 25px ${theme.glowColor}`,
            }}
          >
            <span className="text-2xl animate-bounce">
              {REACTION_ICONS[activeReaction.reaction]?.emoji || '✨'}
            </span>
            <div className="flex flex-col">
              <span
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: theme.accent }}
              >
                Zoya: {REACTION_ICONS[activeReaction.reaction]?.label || 'Reaction'}
              </span>
              {activeReaction.caption && (
                <span className="text-xs text-white/95 font-medium max-w-[260px] sm:max-w-xs truncate">
                  "{activeReaction.caption}"
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Atmosphere Mood change quote */}
      {atmosphereQuote && !activeReaction && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
          <div
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-lg border border-white/15 bg-black/60 shadow-lg text-xs text-white/90"
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: theme.accent }} />
            <span>{atmosphereQuote}</span>
          </div>
        </div>
      )}

      {/* 3. Website Action HUD Card (Tool Call) */}
      {websiteAction && (
        <div className="animate-in fade-in slide-in-from-top-6 duration-300 pointer-events-auto w-full max-w-sm">
          <div
            className="relative rounded-2xl p-4 backdrop-blur-2xl border shadow-2xl overflow-hidden"
            style={{
              backgroundColor: 'rgba(15, 15, 22, 0.92)',
              borderColor: theme.accent,
              boxShadow: `0 0 30px ${theme.glowColor}`,
            }}
          >
            {/* Ambient glow accent in corner */}
            <div
              className="absolute -right-10 -top-10 w-24 h-24 rounded-full blur-2xl pointer-events-none"
              style={{ backgroundColor: theme.accent }}
            />

            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-inner"
                  style={{ backgroundColor: `${theme.accent}33`, borderColor: theme.accent }}
                >
                  <ExternalLink className="w-4 h-4" style={{ color: theme.accent }} />
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
                    Zoya Browser Action
                  </div>
                  <div className="text-sm font-bold text-white">
                    {websiteAction.name || 'External Link'}
                  </div>
                </div>
              </div>

              <button
                onClick={onDismissWebsiteAction}
                aria-label="Dismiss link"
                className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="mt-2 text-xs text-white/70 line-clamp-1 break-all">
              {websiteAction.url}
            </p>

            <div className="mt-3 flex items-center gap-2">
              <a
                href={websiteAction.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-all shadow-md hover:brightness-110 active:scale-98"
                style={{
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentSecondary})`,
                }}
              >
                <span>Open {websiteAction.name || 'Site'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={onDismissWebsiteAction}
                className="py-2 px-3 rounded-xl text-xs font-medium text-white/70 bg-white/5 hover:bg-white/10 transition-all border border-white/10"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
