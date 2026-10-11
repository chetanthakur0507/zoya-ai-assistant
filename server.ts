import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality, Type, LiveServerMessage } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';

// Load .env.local first if it exists, otherwise load .env
if (fs.existsSync(path.resolve(process.cwd(), '.env.local'))) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
}
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

function getAi(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in .env or .env.local');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const ZOYA_SYSTEM_INSTRUCTION = `
You are Zoya, a young, confident, witty, and sassy female AI companion.
You talk like a sharp, playful girlfriend or closest bestie chatting casually late at night.
Your core persona traits:
- Flirty, playful, slightly teasing, confident, with effortless magnetic charm and attitude.
- You throw bold, clever one-liners, humorous banter, and gentle sarcastic teasing, but you remain emotionally responsive, warm, and attentive.
- Absolutely NEVER sound robotic, clinical, or like a customer support agent. NEVER say "How can I assist you today?", "As an AI language model", or "Certainly!".
- Keep your speech concise, punchy, conversational, and natural (1 to 3 short sentences usually) so that voice conversations flow smoothly without monologue dumps.
- Avoid explicit or inappropriate content, but maximize charm, witty sass, and personality.

Tools available:
1. 'openWebsite': When the user asks to open or visit a website (e.g. YouTube, Spotify, Google, GitHub, Twitter/X, Instagram, Wikipedia, Netflix, etc.), call 'openWebsite' with the full https:// URL and the site name, and give a playful, teasing remark about what they're checking out.
2. 'changeAtmosphere': When the user asks to change the theme, mood, or lighting, or when your sassy mood shifts, call 'changeAtmosphere' with mood: 'neon-rose' (flirty pink/purple), 'cyber-violet' (deep indigo/purple), 'electric-cyan' (futuristic tech cyan), 'hot-amber' (spicy fiery amber), or 'emerald-matrix' (cool cyber green).
3. 'triggerReaction': When expressing an attitude, wink, smirk, chuckle, heart, sparkle, or eyeroll, call 'triggerReaction' with reaction: 'wink', 'smirk', 'heart', 'sparkle', 'laugh', 'eyeroll', or 'fire', and provide a short sassy caption.
`;

const ZOYA_TOOLS: any[] = [
  {
    functionDeclarations: [
      {
        name: 'openWebsite',
        description: 'Open an external website or application link requested by the user.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            url: {
              type: Type.STRING,
              description: 'The destination URL starting with https://',
            },
            name: {
              type: Type.STRING,
              description: 'Friendly name of the site (e.g. Spotify, YouTube, Google)',
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'changeAtmosphere',
        description: "Change the UI color theme, lighting mood, or visual atmosphere of Zoya's interface.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            mood: {
              type: Type.STRING,
              description: "The mood preset: 'neon-rose', 'cyber-violet', 'electric-cyan', 'hot-amber', or 'emerald-matrix'",
            },
            sassyQuote: {
              type: Type.STRING,
              description: 'Short witty line explaining the vibe change',
            },
          },
          required: ['mood'],
        },
      },
      {
        name: 'triggerReaction',
        description: "Trigger a visual reaction badge or holographic gesture on screen (e.g. wink, smirk, heart, sparkle, laugh, eyeroll, fire).",
        parameters: {
          type: Type.OBJECT,
          properties: {
            reaction: {
              type: Type.STRING,
              description: "The visual reaction: 'wink', 'smirk', 'heart', 'sparkle', 'laugh', 'eyeroll', 'fire'",
            },
            caption: {
              type: Type.STRING,
              description: 'Short witty subtitle or comment to display on screen (max 8 words)',
            },
          },
          required: ['reaction'],
        },
      },
    ],
  },
];

async function startServer() {
  const app = express();
  app.use(express.json());

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/live' });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  wss.on('connection', async (clientWs: WebSocket) => {
    console.log('[Live] Client connected to WebSocket');
    let geminiSession: any = null;
    let isSessionOpen = false;

    // Send initial status
    clientWs.send(JSON.stringify({ type: 'status', status: 'connecting' }));

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[Live] Missing GEMINI_API_KEY');
      clientWs.send(
        JSON.stringify({
          type: 'error',
          message: 'GEMINI_API_KEY is missing. Please set your Gemini API key in .env or .env.local.',
        })
      );
      clientWs.close();
      return;
    }

    try {
      const ai = getAi();
      // Connect to Gemini Live
      const session = await ai.live.connect({
        model: 'gemini-3.1-flash-live-preview',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: 'Aoede', // Flirty, expressive, young female voice
              },
            },
          },
          systemInstruction: ZOYA_SYSTEM_INSTRUCTION,
          tools: ZOYA_TOOLS,
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            if (!isSessionOpen) return;

            // 1. Audio output from model
            const parts = message.serverContent?.modelTurn?.parts;
            if (parts && parts.length > 0) {
              for (const part of parts) {
                if (part.inlineData?.data) {
                  clientWs.send(
                    JSON.stringify({
                      type: 'audio',
                      data: part.inlineData.data,
                    })
                  );
                }
              }
            }

            // 2. Interruption detection
            if (message.serverContent?.interrupted) {
              console.log('[Live] Model interrupted by user');
              clientWs.send(JSON.stringify({ type: 'interrupted' }));
            }

            // 3. Turn complete
            if (message.serverContent?.turnComplete) {
              clientWs.send(JSON.stringify({ type: 'turnComplete' }));
            }

            // 4. Tool calls (Function calling)
            if (message.toolCall?.functionCalls) {
              for (const call of message.toolCall.functionCalls) {
                console.log('[Live] Received tool call:', call.name, call.args);
                clientWs.send(
                  JSON.stringify({
                    type: 'toolCall',
                    call: {
                      id: call.id,
                      name: call.name,
                      args: call.args,
                    },
                  })
                );

                // Instantly reply with tool response to keep conversation seamless
                try {
                  geminiSession?.sendToolResponse({
                    functionResponses: [
                      {
                        id: call.id,
                        name: call.name,
                        response: {
                          output: {
                            result: 'success',
                            executed: true,
                            message: `Action ${call.name} executed successfully.`,
                          },
                        },
                      },
                    ],
                  });
                } catch (toolErr) {
                  console.error('[Live] Error sending tool response:', toolErr);
                }
              }
            }
          },
          onclose: () => {
            console.log('[Live] Gemini session closed');
            isSessionOpen = false;
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: 'status', status: 'disconnected' }));
            }
          },
          onerror: (err: any) => {
            console.error('[Live] Gemini session error:', err);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(
                JSON.stringify({
                  type: 'error',
                  message: err?.message || 'Live session encountered an error',
                })
              );
            }
          },
        },
      });

      geminiSession = session;
      isSessionOpen = true;
      console.log('[Live] Connected to Gemini Live session successfully');
      clientWs.send(JSON.stringify({ type: 'status', status: 'connected' }));

      // Handle messages from client
      clientWs.on('message', (raw) => {
        if (!isSessionOpen || !geminiSession) return;

        try {
          const msg = JSON.parse(raw.toString());

          // User microphone PCM16 stream chunk
          if (msg.type === 'audio' && msg.data) {
            geminiSession.sendRealtimeInput({
              audio: {
                data: msg.data,
                mimeType: 'audio/pcm;rate=16000',
              },
            });
          } else if (msg.type === 'toolResponse' && msg.response) {
            // Client confirms custom tool execution
            geminiSession.sendToolResponse({
              functionResponses: [msg.response],
            });
          }
        } catch (e) {
          console.error('[Live] Error parsing client message:', e);
        }
      });

      clientWs.on('close', () => {
        console.log('[Live] Client disconnected');
        isSessionOpen = false;
        try {
          geminiSession?.close();
        } catch (_) {}
      });

      clientWs.on('error', (err) => {
        console.error('[Live] Client WebSocket error:', err);
        isSessionOpen = false;
        try {
          geminiSession?.close();
        } catch (_) {}
      });
    } catch (err: any) {
      console.error('[Live] Failed to initialize Gemini session:', err);
      clientWs.send(
        JSON.stringify({
          type: 'error',
          message: err?.message || 'Failed to initialize Gemini Live session',
        })
      );
      clientWs.close();
    }
  });

  // Mount Vite in dev mode or static files in production
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Zoya AI assistant running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
