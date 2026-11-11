import { apiFetch, ApiError } from './api';

export type ConversationSummary = {
  id: number;
  title: string;
  created_at: string;
  message_count: number;
};

export type StoredMessage = { id: number; role: string; content: string; created_at: string };
export type ConversationDetail = ConversationSummary & { messages: StoredMessage[] };

/** Server-backed, encrypted conversation history (only when memory consent is on). */
export const conversationService = {
  list(): Promise<ConversationSummary[]> {
    return apiFetch('/api/v1/conversations');
  },
  get(id: number): Promise<ConversationDetail> {
    return apiFetch(`/api/v1/conversations/${id}`);
  },
  async create(title: string): Promise<ConversationSummary | null> {
    try {
      return await apiFetch<ConversationSummary>('/api/v1/conversations', { method: 'POST', body: { title } });
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) return null; // memory off
      throw e;
    }
  },
  async addMessage(id: number, role: string, content: string): Promise<boolean> {
    try {
      await apiFetch(`/api/v1/conversations/${id}/messages`, { method: 'POST', body: { role, content } });
      return true;
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) return false; // memory off
      throw e;
    }
  },
  remove(id: number): Promise<unknown> {
    return apiFetch(`/api/v1/conversations/${id}`, { method: 'DELETE' });
  },
  clearAll(): Promise<unknown> {
    return apiFetch('/api/v1/conversations', { method: 'DELETE' });
  },
};
