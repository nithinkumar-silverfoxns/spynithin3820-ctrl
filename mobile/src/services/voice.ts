import { apiFetch } from './api';

/**
 * Voice / conversation service.
 *
 * Two modes:
 *  1. TEXT / turn-based (works everywhere, incl. Expo Go): sends messages to the
 *     backend `/ai/chat`, which calls OpenAI server-side. Returns the assistant
 *     message plus any tool calls, which the app routes through the secure
 *     command dispatcher.
 *  2. LIVE realtime voice: `getRealtimeSession()` returns a short-lived ephemeral
 *     token from the backend. Streaming audio with it requires a native WebRTC
 *     module (`react-native-webrtc`) and an Expo *dev client* / bare build — it
 *     does NOT run in Expo Go. See docs/VOICE.md. This is stated honestly rather
 *     than faked: until the native build is wired, the app uses text mode above.
 */

export type ChatMessage = { role: 'user' | 'assistant' | 'system' | 'tool'; content: string };

export type ToolCall = { id: string; name: string; arguments: Record<string, unknown> };

export type ChatTurn = { assistantText: string; toolCalls: ToolCall[]; raw: unknown };

export const voiceService = {
  /** Mint an ephemeral OpenAI Realtime token (server-side key stays on server). */
  async getRealtimeSession(): Promise<{ clientSecret: string; expiresAt: number; model: string }> {
    const data: any = await apiFetch('/api/v1/ai/realtime/session', { method: 'POST' });
    return {
      clientSecret: data?.client_secret?.value,
      expiresAt: data?.client_secret?.expires_at,
      model: data?.model,
    };
  },

  /** Turn-based chat with tool-call extraction. */
  async chat(messages: ChatMessage[]): Promise<ChatTurn> {
    const data: any = await apiFetch('/api/v1/ai/chat', {
      method: 'POST',
      body: { messages },
    });
    const msg = data?.choices?.[0]?.message ?? {};
    const toolCalls: ToolCall[] = (msg.tool_calls ?? []).map((tc: any) => ({
      id: tc.id,
      name: tc.function?.name,
      arguments: safeParse(tc.function?.arguments),
    }));
    return { assistantText: msg.content ?? '', toolCalls, raw: data };
  },
};

function safeParse(s: unknown): Record<string, unknown> {
  if (typeof s !== 'string') return {};
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}
