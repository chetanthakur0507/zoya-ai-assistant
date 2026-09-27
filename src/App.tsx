import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AtmosphereMood,
  ReactionEvent,
  SessionState,
  WebsiteAction,
} from './types';
import { ATMOSPHERE_THEMES } from './utils/themes';
import { LiveSession } from './services/LiveSession';
import { Header } from './components/Header';
import { ZoyaOrb } from './components/ZoyaOrb';
import { WaveformVisualizer } from './components/WaveformVisualizer';
import { ReactionHUD } from './components/ReactionHUD';
import { AtmosphereSelector } from './components/AtmosphereSelector';
import { ConversationStarters } from './components/ConversationStarters';
import { SettingsModal } from './components/SettingsModal';
import { AlertCircle, RefreshCw, X } from 'lucide-react';

export default function App() {
  const [sessionState, setSessionState] = useState<SessionState>('disconnected');
  const [currentMood, setCurrentMood] = useState<AtmosphereMood>('neon-rose');
  const [reaction, setReaction] = useState<ReactionEvent | null>(null);
  const [websiteAction, setWebsiteAction] = useState<WebsiteAction | null>(null);
  const [atmosphereQuote, setAtmosphereQuote] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Real-time audio metrics
  const [audioMetrics, setAudioMetrics] = useState<{
    inputVolume: number;
    outputVolume: number;
    frequencies: number[];
  }>({
    inputVolume: 0,
    outputVolume: 0,
    frequencies: [],
  });

  const liveSessionRef = useRef<LiveSession | null>(null);
  const activeTheme = ATMOSPHERE_THEMES[currentMood] || ATMOSPHERE_THEMES['neon-rose'];

  // Initialize and bind session callbacks
  useEffect(() => {
    const session = new LiveSession({
      onStateChange: (newState) => {
        setSessionState(newState);
        if (newState === 'listening' || newState === 'speaking') {
          setErrorMessage(null);
        }
      },
      onReaction: (rx) => {
        setReaction(rx);
      },
      onWebsiteAction: (action) => {
        setWebsiteAction(action);
      },
      onAtmosphereChange: (mood, quote) => {
        setCurrentMood(mood);
        if (quote) {
          setAtmosphereQuote(quote);
          setTimeout(() => setAtmosphereQuote(null), 4000);
        }
      },
      onError: (err) => {
        setErrorMessage(err);
      },
      onMetricsUpdate: (metrics) => {
        setAudioMetrics(metrics);
      },
    });

    liveSessionRef.current = session;

    return () => {
      session.disconnect();
    };
  }, []);

  const handleTogglePower = useCallback(async () => {
    if (!liveSessionRef.current) return;

    if (sessionState === 'disconnected' || sessionState === 'error') {
      setErrorMessage(null);
      await liveSessionRef.current.connect();
    } else {
      liveSessionRef.current.disconnect();
    }
  }, [sessionState]);

  const handleToggleMute = useCallback(() => {
    if (!liveSessionRef.current) return;
    const newMuted = !isMuted;
    liveSessionRef.current.setMuted(newMuted);
    setIsMuted(newMuted);
  }, [isMuted]);

  const handleSelectMood = useCallback((mood: AtmosphereMood) => {
    setCurrentMood(mood);
  }, []);

  const getSubheadText = () => {
    switch (sessionState) {
      case 'connecting':
        return 'Waking up Zoya... syncing neural voice link';
      case 'listening':
        return isMuted
          ? 'Microphone muted. Tap mic button to speak.'
          : 'I’m listening, babe. Say whatever’s on your mind.';
      case 'speaking':
        return 'Zoya is speaking. Jump in or interrupt anytime!';
      case 'error':
        return 'Connection lost. Tap the core or retry below.';
      default:
        return 'Tap the core to wake Zoya for a voice conversation.';
    }
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex flex-col justify-between text-white transition-all duration-700 font-sans"
      style={{
        background: activeTheme.bgGradient,
        backgroundColor: '#050508',
      }}
    >
      {/* Background Cybernetic Grid Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Floating Animated Particles / Bokeh Glows */}
      <div
        className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-[120px] pointer-events-none transition-all duration-1000 opacity-25"
        style={{ backgroundColor: activeTheme.accent }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[140px] pointer-events-none transition-all duration-1000 opacity-20"
        style={{ backgroundColor: activeTheme.accentSecondary }}
      />

      {/* Top Header */}
      <Header
        state={sessionState}
        theme={activeTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Floating HUD for Reactions, Captions & Website Tool Calls */}
      <ReactionHUD
        reaction={reaction}
        websiteAction={websiteAction}
        atmosphereQuote={atmosphereQuote}
        theme={activeTheme}
        onDismissWebsiteAction={() => setWebsiteAction(null)}
      />

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="fixed top-18 inset-x-4 z-50 max-w-md mx-auto animate-in fade-in slide-in-from-top-3">
          <div className="p-3.5 rounded-2xl bg-red-950/90 border border-red-500/50 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3 text-red-200 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleTogglePower}
                className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 font-semibold flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
              <button
                onClick={() => setErrorMessage(null)}
                aria-label="Dismiss error"
                className="p-1 rounded-lg hover:bg-white/10 text-red-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Center Stage */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-16 pb-4">
        {/* Dynamic Context Tagline */}
        <div className="text-center mb-6 max-w-sm sm:max-w-md">
          <h2
            className="text-lg sm:text-xl font-bold tracking-tight text-white drop-shadow transition-colors"
            style={{ textShadow: `0 0 20px ${activeTheme.glowColor}` }}
          >
            {sessionState === 'disconnected' ? 'Meet Zoya' : 'Zoya AI'}
          </h2>
          <p className="text-xs sm:text-sm text-white/60 mt-1 font-medium leading-relaxed transition-all">
            {getSubheadText()}
          </p>
        </div>

        {/* Central Core Holographic Orb */}
        <ZoyaOrb
          state={sessionState}
          theme={activeTheme}
          inputVolume={audioMetrics.inputVolume}
          outputVolume={audioMetrics.outputVolume}
          frequencies={audioMetrics.frequencies}
          isMuted={isMuted}
          onTogglePower={handleTogglePower}
          onToggleMute={handleToggleMute}
        />

        {/* Real-time Oscilloscope / Frequency Spectrum */}
        <div className="mt-4">
          <WaveformVisualizer
            state={sessionState}
            theme={activeTheme}
            inputVolume={audioMetrics.inputVolume}
            outputVolume={audioMetrics.outputVolume}
            frequencies={audioMetrics.frequencies}
            isMuted={isMuted}
          />
        </div>
      </main>

      {/* Bottom Area: Starters & Atmosphere Pill */}
      <footer className="relative z-20 pb-6 pt-2 flex flex-col items-center gap-3">
        {/* Atmosphere Selector Bar */}
        <AtmosphereSelector
          currentMood={currentMood}
          onSelectMood={handleSelectMood}
        />

        {/* Spoken conversational prompts */}
        <ConversationStarters
          theme={activeTheme}
          state={sessionState}
        />
      </footer>

      {/* Info / Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        theme={activeTheme}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
