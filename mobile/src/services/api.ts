import { Platform } from 'react-native';
import { secureStorage } from '../security/secureStorage';

/**
 * Minimal typed API client (fetch-based) for the JARVIS backend.
 * - Injects the Bearer access token.
 * - On a 401, transparently refreshes once and retries.
 * - Base URL is configurable in-app (API Configuration screen).
 */

// Sensible dev defaults: Android emulator reaches host via 10.0.2.2.
export const DEFAULT_API_BASE =
  Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

let inMemoryBase: string | null = null;

export async function getApiBase(): Promise<string> {
  if (inMemoryBase) return inMemoryBase;
  const stored = await secureStorage.getApiBase();
  inMemoryBase = stored || DEFAULT_API_BASE;
  return inMemoryBase;
}

export async function setApiBase(url: string) {
  inMemoryBase = url.replace(/\/+$/, '');
  await secureStorage.setApiBase(inMemoryBase);
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function refreshTokens(): Promise<boolean> {
  const refresh = await secureStorage.getRefresh();
  if (!refresh) return false;
  const base = await getApiBase();
  const resp = await fetch(`${base}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refresh }),
  });
  if (!resp.ok) return false;
  const data = await resp.json();
  await secureStorage.setTokens(data.access_token, data.refresh_token);
  return true;
}

export async function apiFetch<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const { method = 'GET', body, auth = true } = options;
  const base = await getApiBase();

  const doRequest = async (): Promise<Response> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (auth) {
      const access = await secureStorage.getAccess();
      if (access) headers.Authorization = `Bearer ${access}`;
    }
    return fetch(`${base}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  };

  let resp = await doRequest();
  if (resp.status === 401 && auth && (await refreshTokens())) {
    resp = await doRequest();
  }

  if (!resp.ok) {
    let detail = resp.statusText;
    try {
      const j = await resp.json();
      detail = j.detail ?? detail;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(resp.status, String(detail));
  }

  if (resp.status === 204) return undefined as T;
  return (await resp.json()) as T;
}
