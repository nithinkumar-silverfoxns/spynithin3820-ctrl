import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

export type Palette = {
  mode: 'light' | 'dark';
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textDim: string;
  primary: string;      // JARVIS cyan
  primaryGlow: string;
  accent: string;
  danger: string;
  success: string;
  border: string;
};

const dark: Palette = {
  mode: 'dark',
  bg: '#060A18',
  surface: '#0E1630',
  surfaceAlt: '#13203F',
  text: '#EAF2FF',
  textDim: '#8698BF',
  primary: '#28E0FF',
  primaryGlow: 'rgba(40,224,255,0.35)',
  accent: '#7A5CFF',
  danger: '#FF5C7A',
  success: '#3BE38B',
  border: 'rgba(120,150,210,0.18)',
};

const light: Palette = {
  mode: 'light',
  bg: '#F4F7FD',
  surface: '#FFFFFF',
  surfaceAlt: '#EAF0FB',
  text: '#0A1024',
  textDim: '#53617F',
  primary: '#0096C7',
  primaryGlow: 'rgba(0,150,199,0.25)',
  accent: '#5B3EE8',
  danger: '#D6365B',
  success: '#1E9E63',
  border: 'rgba(20,40,90,0.12)',
};

export const typography = {
  display: { fontSize: 30, fontWeight: '800' as const, letterSpacing: 1.5 },
  title: { fontSize: 20, fontWeight: '700' as const, letterSpacing: 0.5 },
  body: { fontSize: 15, fontWeight: '500' as const },
  caption: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.8 },
};

type ThemeCtx = {
  palette: Palette;
  override: 'system' | 'light' | 'dark';
  setOverride: (v: 'system' | 'light' | 'dark') => void;
};

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [override, setOverride] = useState<'system' | 'light' | 'dark'>('system');

  const palette = useMemo(() => {
    const resolved = override === 'system' ? system ?? 'dark' : override;
    return resolved === 'light' ? light : dark;
  }, [override, system]);

  return <Ctx.Provider value={{ palette, override, setOverride }}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
