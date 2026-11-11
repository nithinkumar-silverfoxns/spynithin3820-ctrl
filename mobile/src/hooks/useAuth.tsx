import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authService, UserProfile } from '../services/auth';

type AuthState = {
  loading: boolean;
  signedIn: boolean;
  unlocked: boolean;        // biometric gate passed this session
  profile: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  setUnlocked: (v: boolean) => void;
  refreshProfile: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const bootstrap = useCallback(async () => {
    setLoading(true);
    try {
      const has = await authService.hasSession();
      setSignedIn(has);
      if (has) {
        try {
          setProfile(await authService.me());
        } catch {
          // token invalid/expired beyond refresh -> force sign-out
          await authService.logout();
          setSignedIn(false);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (email: string, password: string) => {
    await authService.login(email, password);
    setProfile(await authService.me());
    setSignedIn(true);
    setUnlocked(true);
  }, []);

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    await authService.register(email, password, displayName);
    setProfile(await authService.me());
    setSignedIn(true);
    setUnlocked(true);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setSignedIn(false);
    setUnlocked(false);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    setProfile(await authService.me());
  }, []);

  return (
    <Ctx.Provider
      value={{ loading, signedIn, unlocked, profile, login, register, logout, setUnlocked, refreshProfile }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
