/**
 * AudioStreamer manages Web Audio API for 16kHz microphone capture
 * and 24kHz gapless model audio playback with real-time spectrum analysis.
 */
export class AudioStreamer {
  // Input (Microphone - 16kHz)
  private inputAudioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private inputAnalyser: AnalyserNode | null = null;
  private onAudioChunkCallback: ((base64Pcm: string) => void) | null = null;

  // Output (Model Playback - 24kHz)
  private outputAudioCtx: AudioContext | null = null;
  private outputAnalyser: AnalyserNode | null = null;
  private nextStartTime = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private isMuted = false;

  // Real-time Visualizer buffers
  private inputDataArray: Uint8Array | null = null;
  private outputDataArray: Uint8Array | null = null;

  constructor() {}

  /**
   * Initializes input (mic) and output (speaker) AudioContexts.
   * Must be called during or after a user gesture.
   */
  async startRecording(onAudioChunk: (base64Pcm: string) => void): Promise<void> {
    this.onAudioChunkCallback = onAudioChunk;

    // 1. Prepare Output AudioContext (24kHz for Gemini Live)
    if (!this.outputAudioCtx || this.outputAudioCtx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.outputAudioCtx = new AudioCtxClass({ sampleRate: 24000 });
      this.outputAnalyser = this.outputAudioCtx.createAnalyser();
      this.outputAnalyser.fftSize = 128;
      this.outputAnalyser.smoothingTimeConstant = 0.8;
      this.outputAnalyser.connect(this.outputAudioCtx.destination);
      this.outputDataArray = new Uint8Array(this.outputAnalyser.frequencyBinCount);
    }

    if (this.outputAudioCtx.state === 'suspended') {
      await this.outputAudioCtx.resume();
    }

    // 2. Prepare Input AudioContext (16kHz for Gemini mic input)
    if (!this.inputAudioCtx || this.inputAudioCtx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.inputAudioCtx = new AudioCtxClass({ sampleRate: 16000 });
      this.inputAnalyser = this.inputAudioCtx.createAnalyser();
      this.inputAnalyser.fftSize = 128;
      this.inputAnalyser.smoothingTimeConstant = 0.8;
      this.inputDataArray = new Uint8Array(this.inputAnalyser.frequencyBinCount);
    }

    if (this.inputAudioCtx.state === 'suspended') {
      await this.inputAudioCtx.resume();
    }

    // 3. Request user media with optimal voice parameters
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    this.inputSource = this.inputAudioCtx.createMediaStreamSource(this.mediaStream);
    if (this.inputAnalyser) {
      this.inputSource.connect(this.inputAnalyser);
    }

    // Buffer size of 2048 (~128ms chunks at 16kHz) for low-latency streaming
    this.scriptProcessor = this.inputAudioCtx.createScriptProcessor(2048, 1, 1);
    if (this.inputAnalyser) {
      this.inputAnalyser.connect(this.scriptProcessor);
    }
    this.scriptProcessor.connect(this.inputAudioCtx.destination);

    this.scriptProcessor.onaudioprocess = (e) => {
      if (this.isMuted) return;

      const inputBuffer = e.inputBuffer.getChannelData(0);
      const pcm16Buffer = this.floatTo16BitPCM(inputBuffer);
      const base64 = this.arrayBufferToBase64(pcm16Buffer);

      if (this.onAudioChunkCallback && base64) {
        this.onAudioChunkCallback(base64);
      }
    };
  }

  /**
   * Schedules a raw PCM16 24kHz audio chunk for gapless playback.
   */
  playPcmChunk(base64Pcm: string): void {
    if (!this.outputAudioCtx || !this.outputAnalyser) return;

    if (this.outputAudioCtx.state === 'suspended') {
      this.outputAudioCtx.resume();
    }

    const float32Array = this.base64ToFloat32PCM(base64Pcm);
    if (!float32Array || float32Array.length === 0) return;

    const audioBuffer = this.outputAudioCtx.createBuffer(1, float32Array.length, 24000);
    audioBuffer.getChannelData(0).set(float32Array);

    const source = this.outputAudioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.outputAnalyser);

    const currentTime = this.outputAudioCtx.currentTime;
    if (this.nextStartTime < currentTime) {
      this.nextStartTime = currentTime + 0.015; // Small 15ms lead-in jitter buffer
    }

    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration;

    this.activeSources.push(source);

    source.onended = () => {
      const idx = this.activeSources.indexOf(source);
      if (idx !== -1) {
        this.activeSources.splice(idx, 1);
      }
    };
  }

  /**
   * Immediate interruption: Stops all currently playing & queued audio.
   */
  stopPlayback(): void {
    for (const src of this.activeSources) {
      try {
        src.stop();
        src.disconnect();
      } catch (_) {}
    }
    this.activeSources = [];
    if (this.outputAudioCtx) {
      this.nextStartTime = this.outputAudioCtx.currentTime;
    }
  }

  /**
   * Toggles microphone mute state.
   */
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.mediaStream) {
      this.mediaStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Retrieves real-time volume levels and frequency analysis.
   */
  getAudioMetrics(): { inputVolume: number; outputVolume: number; frequencies: number[] } {
    let inputVolume = 0;
    let outputVolume = 0;
    const frequencies: number[] = [];

    // Mic input analysis
    if (this.inputAnalyser && this.inputDataArray && !this.isMuted) {
      this.inputAnalyser.getByteFrequencyData(this.inputDataArray as any);
      let sum = 0;
      for (let i = 0; i < this.inputDataArray.length; i++) {
        sum += this.inputDataArray[i];
      }
      inputVolume = sum / (this.inputDataArray.length * 255);
    }

    // Model output playback analysis
    if (this.outputAnalyser && this.outputDataArray) {
      this.outputAnalyser.getByteFrequencyData(this.outputDataArray as any);
      let sum = 0;
      const count = Math.min(32, this.outputDataArray.length);
      for (let i = 0; i < count; i++) {
        const val = this.outputDataArray[i] / 255;
        frequencies.push(val);
        sum += this.outputDataArray[i];
      }
      outputVolume = sum / (this.outputDataArray.length * 255);
    }

    return { inputVolume, outputVolume, frequencies };
  }

  /**
   * Stops recording and cleans up resources.
   */
  stopAll(): void {
    this.stopPlayback();

    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }

    if (this.inputSource) {
      this.inputSource.disconnect();
      this.inputSource = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.inputAudioCtx && this.inputAudioCtx.state !== 'closed') {
      try {
        this.inputAudioCtx.close();
      } catch (_) {}
      this.inputAudioCtx = null;
    }

    if (this.outputAudioCtx && this.outputAudioCtx.state !== 'closed') {
      try {
        this.outputAudioCtx.close();
      } catch (_) {}
      this.outputAudioCtx = null;
    }
  }

  // --- Utility conversions ---

  private floatTo16BitPCM(input: Float32Array): ArrayBuffer {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return output.buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private base64ToFloat32PCM(base64: string): Float32Array {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768.0;
    }
    return float32;
  }
}
