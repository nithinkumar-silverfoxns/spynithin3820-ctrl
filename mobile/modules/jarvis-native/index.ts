import { requireNativeModule } from 'expo-modules-core';

/**
 * JS surface for the JARVIS native module (Kotlin on Android, Swift on iOS).
 * Methods reject with code 'UNSUPPORTED' on platforms where the OS has no public
 * API for the action — callers map that to an honest spoken message rather than
 * faking success.
 */
export type BatteryInfo = { level: number; charging: boolean };

interface JarvisNativeModule {
  getBattery(): Promise<BatteryInfo>;
  setTorch(on: boolean): Promise<boolean>;
  launchCamera(): Promise<boolean>;
  setAlarm(hour: number, minute: number, label: string): Promise<boolean>;
  addReminder(title: string, dueISO: string | null): Promise<boolean>;
  openApp(target: string): Promise<boolean>;
  startListeningService(): Promise<boolean>;
  stopListeningService(): Promise<boolean>;
}

// May be undefined in Expo Go (no custom native code); callers must guard.
let native: JarvisNativeModule | undefined;
try {
  native = requireNativeModule<JarvisNativeModule>('JarvisNative');
} catch {
  native = undefined;
}

export const JarvisNative = native;
export const hasNative = !!native;
