export type SessionState = 'disconnected' | 'connecting' | 'listening' | 'speaking' | 'error';

export type AtmosphereMood =
  | 'neon-rose'
  | 'cyber-violet'
  | 'electric-cyan'
  | 'hot-amber'
  | 'emerald-matrix';

export type ReactionType =
  | 'wink'
  | 'smirk'
  | 'heart'
  | 'sparkle'
  | 'laugh'
  | 'eyeroll'
  | 'fire';

export interface ReactionEvent {
  id: string;
  reaction: ReactionType;
  caption?: string;
  timestamp: number;
}

export interface WebsiteAction {
  id: string;
  url: string;
  name?: string;
  timestamp: number;
}

export interface AtmosphereTheme {
  id: AtmosphereMood;
  name: string;
  tagline: string;
  accent: string;
  accentSecondary: string;
  glowColor: string;
  bgGradient: string;
  orbGradStart: string;
  orbGradEnd: string;
}

export interface AudioVisualizerLevels {
  inputVolume: number;
  outputVolume: number;
  frequencies: number[];
}
