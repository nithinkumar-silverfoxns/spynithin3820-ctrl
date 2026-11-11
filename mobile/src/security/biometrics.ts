import * as LocalAuthentication from 'expo-local-authentication';

/** Biometric (Face ID / Touch ID / fingerprint) gate for unlocking JARVIS. */
export const biometrics = {
  async isAvailable(): Promise<boolean> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && enrolled;
  },

  async authenticate(reason = 'Unlock SILVERFOXNS JARVIS'): Promise<boolean> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      fallbackLabel: 'Use passcode',
      disableDeviceFallback: false,
    });
    return result.success;
  },
};
