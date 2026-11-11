import { apiFetch } from './api';
import { secureStorage } from '../security/secureStorage';

export type UserProfile = {
  id: number;
  email: string;
  display_name: string;
  memory_consent: boolean;
  biometric_enrolled: boolean;
};

type TokenPair = { access_token: string; refresh_token: string };

export const authService = {
  async register(email: string, password: string, displayName: string): Promise<void> {
    const t = await apiFetch<TokenPair>('/api/v1/auth/register', {
      method: 'POST',
      auth: false,
      body: { email, password, display_name: displayName },
    });
    await secureStorage.setTokens(t.access_token, t.refresh_token);
  },

  async login(email: string, password: string): Promise<void> {
    const t = await apiFetch<TokenPair>('/api/v1/auth/login', {
      method: 'POST',
      auth: false,
      body: { email, password },
    });
    await secureStorage.setTokens(t.access_token, t.refresh_token);
  },

  async me(): Promise<UserProfile> {
    return apiFetch<UserProfile>('/api/v1/auth/me');
  },

  async setConsent(patch: { memory_consent?: boolean; biometric_enrolled?: boolean }) {
    return apiFetch<UserProfile>('/api/v1/auth/consent', { method: 'PATCH', body: patch });
  },

  async logout(): Promise<void> {
    await secureStorage.clearTokens();
  },

  async hasSession(): Promise<boolean> {
    return !!(await secureStorage.getAccess());
  },
};
