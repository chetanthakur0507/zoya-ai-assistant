import React, { useEffect, useRef } from 'react';
import { SessionState, AtmosphereTheme } from '../types';

interface WaveformVisualizerProps {
  state: SessionState;
  theme: AtmosphereTheme;
  inputVolume: number;
  outputVolume: number;
  frequencies: number[];
  isMuted: boolean;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  state,
  theme,
  inputVolume,
  outputVolume,
  frequencies,
  isMuted,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      phase += 0.05;
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      const isSpeaking = state === 'speaking';
      const isListening = state === 'listening' && !isMuted;
      const activeVol = isSpeaking ? outputVolume * 2.5 : isListening ? inputVolume * 3.0 : 0.04;

      const numBars = 48;
      const barWidth = 3;
      const spacing = (width - numBars * barWidth) / (numBars + 1);

      // Create gradient based on theme
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, theme.accentSecondary);
      gradient.addColorStop(0.5, theme.accent);
      gradient.addColorStop(1, theme.accentSecondary);

      ctx.fillStyle = gradient;

      // Draw symmetrical equalizer bars
      for (let i = 0; i < numBars; i++) {
        const x = spacing + i * (barWidth + spacing);
        const normalizedIndex = Math.abs(i - numBars / 2) / (numBars / 2); // 0 at center, 1 at edges

        let barHeight = 4;
        if (state !== 'disconnected') {
          const freqVal = frequencies[i % frequencies.length] || 0.1;
          const wave = Math.sin(phase + i * 0.25) * 6;
          const scale = 1 - Math.pow(normalizedIndex, 1.5) * 0.7; // higher in center

          barHeight = Math.max(
            4,
            (activeVol * 45 + freqVal * 30 + wave) * scale
          );
        }

        const y = centerY - barHeight / 2;

        // Rounded pill bar
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, theme, inputVolume, outputVolume, frequencies, isMuted]);

  return (
    <div className="w-full max-w-sm sm:max-w-md h-12 flex items-center justify-center opacity-85 px-4">
      <canvas
        ref={canvasRef}
        width={380}
        height={48}
        className="w-full h-full pointer-events-none"
      />
    </div>
  );
};
