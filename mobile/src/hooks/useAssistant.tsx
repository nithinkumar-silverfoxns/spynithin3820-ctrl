import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { commandService } from '../services/commands';
import { conversationService } from '../services/conversations';
import { currentPermissions, deviceActions } from '../services/deviceActions';
import { tts } from '../services/tts';
import { ChatMessage, voiceService } from '../services/voice';

export type Line = { id: string; role: 'you' | 'jarvis'; text: string };

type Pending = {
  name: string;
  params: Record<string, unknown>;
  token: string;
  message: string;
};

type AssistantState = {
  lines: Line[];
  busy: boolean;
  pending: Pending | null;
  sendText: (text: string) => Promise<void>;
  resolvePending: (approve: boolean) => Promise<void>;
  clear: () => void;
};

const SYSTEM: ChatMessage = {
  role: 'system',
  content:
    "You are JARVIS by Silverfoxns, a concise voice assistant. Wake phrase 'Hey Silverfox'. " +
    'Use tools to act on the phone; keep replies short and natural.',
};

const Ctx = createContext<AssistantState | null>(null);

let seq = 0;
const nextId = () => `${Date.now()}-${seq++}`;

export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);

  // Server-backed encrypted history (only when memory consent is on).
  const convoId = useRef<number | null>(null);
  const persistOff = useRef(false);

  const persist = useCallback(async (role: 'user' | 'assistant', content: string) => {
    if (persistOff.current || !content.trim()) return;
    try {
      if (convoId.current == null) {
        const c = await conversationService.create(content.slice(0, 40) || 'Conversation');
        if (!c) {
          persistOff.current = true; // memory consent is off — stop trying this session
          return;
        }
        convoId.current = c.id;
      }
      const ok = await conversationService.addMessage(convoId.current, role, content);
      if (!ok) persistOff.current = true;
    } catch {
      // Persistence must never break the conversation.
    }
  }, []);

  const say = useCallback((text: string) => {
    if (!text?.trim()) return;
    setLines((l) => [...l, { id: nextId(), role: 'jarvis', text }]);
    tts.speak(text);
    persist('assistant', text);
  }, [persist]);

  const runDirective = useCallback(
    async (name: string, directive: { name: string; params: Record<string, unknown>; risk: string }) => {
      const result = await deviceActions.run(directive);
      const { spoken_response } = await commandService
        .reportResult(name, result.success, result.detail)
        .catch(() => ({ spoken_response: result.success ? 'Done.' : "I couldn't do that." }));
      say(result.success ? spoken_response : `I couldn't complete that — ${result.detail}`);
    },
    [say],
  );

  const handleCommand = useCallback(
    async (name: string, params: Record<string, unknown>) => {
      const res = await commandService.execute(name, params, currentPermissions());
      if (res.status === 'needs_confirmation' && res.confirmation_token) {
        setPending({ name, params, token: res.confirmation_token, message: res.message });
        say(res.message);
      } else if (res.status === 'authorized' && res.directive) {
        await runDirective(name, res.directive);
      } else {
        say(res.message);
      }
    },
    [runDirective, say],
  );

  const sendText = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;
      setLines((l) => [...l, { id: nextId(), role: 'you', text: trimmed }]);
      persist('user', trimmed);
      setBusy(true);
      try {
        const history: ChatMessage[] = [
          SYSTEM,
          ...lines.map((l): ChatMessage => ({
            role: l.role === 'you' ? 'user' : 'assistant',
            content: l.text,
          })),
          { role: 'user', content: trimmed },
        ];
        const turn = await voiceService.chat(history);
        if (turn.assistantText) say(turn.assistantText);
        for (const tc of turn.toolCalls) {
          await handleCommand(tc.name, tc.arguments);
        }
      } catch (e: any) {
        const msg =
          e?.status === 503
            ? 'Voice AI is not configured on the server yet. Add an OpenAI key in the backend .env.'
            : `Something went wrong: ${e?.message ?? 'unknown error'}`;
        say(msg);
      } finally {
        setBusy(false);
      }
    },
    [busy, lines, say, handleCommand, persist],
  );

  const resolvePending = useCallback(
    async (approve: boolean) => {
      const p = pending;
      setPending(null);
      if (!p) return;
      if (!approve) {
        say('Okay, cancelled.');
        return;
      }
      setBusy(true);
      try {
        const res = await commandService.execute(p.name, p.params, currentPermissions(), p.token);
        if (res.status === 'authorized' && res.directive) {
          await runDirective(p.name, res.directive);
        } else {
          say(res.message);
        }
      } finally {
        setBusy(false);
      }
    },
    [pending, runDirective, say],
  );

  const clear = useCallback(() => {
    setLines([]);
    setPending(null);
    tts.stop();
    // Start a fresh conversation next time; re-check consent.
    convoId.current = null;
    persistOff.current = false;
  }, []);

  return (
    <Ctx.Provider value={{ lines, busy, pending, sendText, resolvePending, clear }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAssistant(): AssistantState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAssistant must be used within AssistantProvider');
  return ctx;
}
