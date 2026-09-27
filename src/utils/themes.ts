import { AtmosphereMood, AtmosphereTheme } from '../types';

export const ATMOSPHERE_THEMES: Record<AtmosphereMood, AtmosphereTheme> = {
  'neon-rose': {
    id: 'neon-rose',
    name: 'Neon Rose',
    tagline: 'Flirty, sassy & dangerously charming',
    accent: '#f43f5e', // rose-500
    accentSecondary: '#d946ef', // fuchsia-500
    glowColor: 'rgba(244, 63, 94, 0.45)',
    bgGradient: 'radial-gradient(ellipse at 50% 40%, rgba(244, 63, 94, 0.15) 0%, rgba(136, 19, 55, 0.08) 50%, rgba(0, 0, 0, 0.98) 100%)',
    orbGradStart: '#ff2e93',
    orbGradEnd: '#a855f7',
  },
  'cyber-violet': {
    id: 'cyber-violet',
    name: 'Cyber Violet',
    tagline: 'Deep, mysterious & intellectually playful',
    accent: '#a855f7', // purple-500
    accentSecondary: '#6366f1', // indigo-500
    glowColor: 'rgba(168, 85, 247, 0.45)',
    bgGradient: 'radial-gradient(ellipse at 50% 40%, rgba(168, 85, 247, 0.18) 0%, rgba(79, 70, 229, 0.08) 50%, rgba(0, 0, 0, 0.98) 100%)',
    orbGradStart: '#9333ea',
    orbGradEnd: '#4f46e5',
  },
  'electric-cyan': {
    id: 'electric-cyan',
    name: 'Electric Cyan',
    tagline: 'Cool, razor-sharp & futuristic',
    accent: '#06b6d4', // cyan-500
    accentSecondary: '#3b82f6', // blue-500
    glowColor: 'rgba(6, 182, 212, 0.45)',
    bgGradient: 'radial-gradient(ellipse at 50% 40%, rgba(6, 182, 212, 0.16) 0%, rgba(59, 130, 246, 0.07) 50%, rgba(0, 0, 0, 0.98) 100%)',
    orbGradStart: '#22d3ee',
    orbGradEnd: '#2563eb',
  },
  'hot-amber': {
    id: 'hot-amber',
    name: 'Hot Amber',
    tagline: 'Spicy, fiery banter & golden attitude',
    accent: '#f59e0b', // amber-500
    accentSecondary: '#f97316', // orange-500
    glowColor: 'rgba(245, 158, 11, 0.45)',
    bgGradient: 'radial-gradient(ellipse at 50% 40%, rgba(245, 158, 11, 0.16) 0%, rgba(234, 88, 12, 0.08) 50%, rgba(0, 0, 0, 0.98) 100%)',
    orbGradStart: '#fbbf24',
    orbGradEnd: '#ea580c',
  },
  'emerald-matrix': {
    id: 'emerald-matrix',
    name: 'Emerald Matrix',
    tagline: 'Cheeky cybernetic rebel vibe',
    accent: '#10b981', // emerald-500
    accentSecondary: '#14b8a6', // teal-500
    glowColor: 'rgba(16, 185, 129, 0.45)',
    bgGradient: 'radial-gradient(ellipse at 50% 40%, rgba(16, 185, 129, 0.16) 0%, rgba(20, 184, 166, 0.08) 50%, rgba(0, 0, 0, 0.98) 100%)',
    orbGradStart: '#34d399',
    orbGradEnd: '#0d9488',
  },
};
