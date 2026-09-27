import { AudioStreamer } from '../audio/AudioStreamer';
import {
  AtmosphereMood,
  ReactionEvent,
  ReactionType,
  SessionState,
  WebsiteAction,
} from '../types';

export interface LiveSessionCallbacks {
  onStateChange: (state: SessionState) => void;
  onReaction: (reaction: ReactionEvent) => void;
  onWebsiteAction: (action: WebsiteAction) => void;
  onAtmosphereChange: (mood: AtmosphereMood, quote?: string) => void;
  onError: (errorMessage: string) => void;
  onMetricsUpdate?: (metrics: {
    inputVolume: number;
    outputVolume: number;
    frequencies: number[];
  }) => void;
}

export class LiveSession {
  private ws: WebSocket | null = null;
  private audioStreamer: AudioStreamer;
  private state: SessionState = 'disconnected';
  private callbacks: LiveSessionCallbacks;
  private metricsInterval: number | null = null;
  private isModelSpeaking = false;
  private speakingTimeout: number | null = null;

  constructor(callbacks: LiveSessionCallbacks) {
    this.callbacks = callbacks;
    this.audioStreamer = new AudioStreamer();
  }

  getState(): SessionState {
    return this.state;
  }

  isMuted(): boolean {
    return this.audioStreamer.getMuted();
  }

  setMuted(muted: boolean): void {
    this.audioStreamer.setMuted(muted);
  }

  async connect(): Promise<void> {
    if (this.state === 'connecting' || this.state === 'listening' || this.state === 'speaking') {
      return;
    }

    this.setState('connecting');

    try {
      // 1. Initialize microphone and speaker Web Audio contexts
      await this.audioStreamer.startRecording((base64Pcm: string) => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(
            JSON.stringify({
              type: 'audio',
              data: base64Pcm,
            })
          );
        }
      });

      // 2. Establish WebSocket connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      console.log('[LiveSession] Connecting to WebSocket:', wsUrl);

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[LiveSession] WebSocket connection established');
      };

      this.ws.onmessage = (event) => {
        this.handleServerMessage(event.data);
      };

      this.ws.onclose = (event) => {
        console.log('[LiveSession] WebSocket closed:', event.code, event.reason);
        this.disconnect();
      };

      this.ws.onerror = (err) => {
        console.error('[LiveSession] WebSocket error:', err);
        this.callbacks.onError('Connection to Zoya failed. Please check microphone access or refresh.');
        this.disconnect();
      };

      // 3. Start audio spectrum metrics loop
      this.startMetricsLoop();
    } catch (err: any) {
      console.error('[LiveSession] Connect failed:', err);
      let errorMsg = 'Could not access microphone. Please enable mic permissions in your browser.';
      if (err.name === 'NotAllowedError') {
        errorMsg = 'Microphone permission denied. Allow mic access to talk with Zoya.';
      }
      this.callbacks.onError(errorMsg);
      this.disconnect();
    }
  }

  private handleServerMessage(data: string): void {
    try {
      const msg = JSON.parse(data);

      if (msg.type === 'status') {
        if (msg.status === 'connected') {
          this.setState('listening');
        } else if (msg.status === 'connecting') {
          this.setState('connecting');
        } else if (msg.status === 'disconnected') {
          this.disconnect();
        }
      } else if (msg.type === 'audio' && msg.data) {
        // Output audio received from Gemini Live
        this.isModelSpeaking = true;
        this.setState('speaking');

        this.audioStreamer.playPcmChunk(msg.data);

        // Keep state as 'speaking' as long as audio chunks keep arriving
        if (this.speakingTimeout) {
          window.clearTimeout(this.speakingTimeout);
        }
        this.speakingTimeout = window.setTimeout(() => {
          this.isModelSpeaking = false;
          if (this.state === 'speaking') {
            this.setState('listening');
          }
        }, 1200);
      } else if (msg.type === 'interrupted') {
        // Interruption detected: model was cut off
        this.audioStreamer.stopPlayback();
        this.isModelSpeaking = false;
        if (this.speakingTimeout) {
          window.clearTimeout(this.speakingTimeout);
        }
        this.setState('listening');
      } else if (msg.type === 'turnComplete') {
        // Turn completed: reset to listening when playback finishes
        if (!this.isModelSpeaking && this.state === 'speaking') {
          this.setState('listening');
        }
      } else if (msg.type === 'toolCall' && msg.call) {
        this.executeToolCall(msg.call);
      } else if (msg.type === 'error') {
        console.error('[LiveSession] Server error message:', msg.message);
        this.callbacks.onError(msg.message || 'Error occurred in live session');
      }
    } catch (err) {
      console.error('[LiveSession] Error handling message:', err);
    }
  }

  private executeToolCall(call: { id: string; name: string; args: any }): void {
    const { id, name, args } = call;
    console.log('[LiveSession] Executing tool call:', name, args);

    if (name === 'openWebsite') {
      const url = args.url || 'https://google.com';
      const siteName = args.name || new URL(url).hostname;
      const action: WebsiteAction = {
        id: id || String(Date.now()),
        url,
        name: siteName,
        timestamp: Date.now(),
      };
      this.callbacks.onWebsiteAction(action);
    } else if (name === 'changeAtmosphere') {
      const mood = (args.mood as AtmosphereMood) || 'neon-rose';
      const quote = args.sassyQuote;
      this.callbacks.onAtmosphereChange(mood, quote);
    } else if (name === 'triggerReaction') {
      const reaction = (args.reaction as ReactionType) || 'sparkle';
      const caption = args.caption;
      const event: ReactionEvent = {
        id: id || String(Date.now()),
        reaction,
        caption,
        timestamp: Date.now(),
      };
      this.callbacks.onReaction(event);
    }
  }

  private startMetricsLoop(): void {
    if (this.metricsInterval) return;

    this.metricsInterval = window.setInterval(() => {
      const metrics = this.audioStreamer.getAudioMetrics();
      if (this.callbacks.onMetricsUpdate) {
        this.callbacks.onMetricsUpdate(metrics);
      }

      // If user speaks loudly while listening, make sure we reflect active listening
      if (this.state === 'listening' && metrics.inputVolume > 0.08) {
        // Active voice detection visual pulse
      }
    }, 50); // 20fps for smooth visualizer updates
  }

  private stopMetricsLoop(): void {
    if (this.metricsInterval) {
      window.clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
  }

  private setState(newState: SessionState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.callbacks.onStateChange(newState);
    }
  }

  disconnect(): void {
    this.stopMetricsLoop();
    if (this.speakingTimeout) {
      window.clearTimeout(this.speakingTimeout);
      this.speakingTimeout = null;
    }

    if (this.ws) {
      try {
        this.ws.close();
      } catch (_) {}
      this.ws = null;
    }

    this.audioStreamer.stopAll();
    this.isModelSpeaking = false;
    this.setState('disconnected');
  }
}
