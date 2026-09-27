import React from 'react';
import { Sparkles, MessageCircleHeart } from 'lucide-react';
import { AtmosphereTheme, SessionState } from '../types';

interface ConversationStartersProps {
  theme: AtmosphereTheme;
  state: SessionState;
}

const STARTERS = [
  { text: '“Roast my life choices, babe”', tag: 'Sass' },
  { text: '“Open Spotify for me”', tag: 'Action' },
  { text: '“Rate my charisma 1 to 10”', tag: 'Flirt' },
  { text: '“Change vibe to Hot Amber”', tag: 'Theme' },
  { text: '“What’s your spiciest opinion?”', tag: 'Witty' },
  { text: '“Give me a smooth pick-up line”', tag: 'Banter' },
];

export const ConversationStarters: React.FC<ConversationStartersProps> = ({
  theme,
  state,
}) => {
  return (
    <div className="w-full max-w-lg px-4 flex flex-col items-center">
      <div className="flex items-center gap-1.5 text-xs text-white/40 mb-2.5 font-medium tracking-wide">
        <MessageCircleHeart className="w-3.5 h-3.5" style={{ color: theme.accent }} />
        <span>Spoken prompts you can say aloud:</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {STARTERS.map((starter, i) => (
          <div
            key={i}
            className="group px-3 py-1.5 rounded-full backdrop-blur-md bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all text-xs text-white/70 hover:text-white flex items-center gap-1.5 shadow-sm"
          >
            <span
              className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: `${theme.accent}25`,
                color: theme.accent,
              }}
            >
              {starter.tag}
            </span>
            <span className="font-normal italic tracking-tight">{starter.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
