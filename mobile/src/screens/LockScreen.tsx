import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { GhostButton, PrimaryButton } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { biometrics } from '../security/biometrics';
import { typography, useTheme } from '../theme';

/**
 * Biometric lock gate. If the device has no biometrics enrolled, the user can
 * continue (the account password already authenticated them); we never block
 * access behind hardware the device lacks.
 */
export function LockScreen() {
  const { palette } = useTheme();
  const { setUnlocked, logout, profile } = useAuth();
  const [status, setStatus] = useState('');

  const tryUnlock = useCallback(async () => {
    const available = await biometrics.isAvailable();
    if (!available) {
      setStatus('No biometrics enrolled on this device — continuing.');
      setUnlocked(true);
      return;
    }
    const ok = await biometrics.authenticate('Unlock SILVERFOXNS JARVIS');
    if (ok) setUnlocked(true);
    else setStatus('Authentication failed. Try again.');
  }, [setUnlocked]);

  useEffect(() => {
    tryUnlock();
  }, [tryUnlock]);

  return (
    <Screen scroll={false}>
      <View style={styles.center}>
        <Text style={[styles.lock, { color: palette.primary }]}>🛡</Text>
        <Text style={[typography.title, { color: palette.text, marginTop: 16 }]}>
          {profile?.display_name ? `Hello, ${profile.display_name}` : 'Locked'}
        </Text>
        <Text style={[styles.sub, { color: palette.textDim }]}>JARVIS is locked for your security.</Text>
        {!!status && <Text style={[styles.status, { color: palette.textDim }]}>{status}</Text>}
        <View style={{ width: '100%', marginTop: 28 }}>
          <PrimaryButton title="Unlock" onPress={tryUnlock} />
          <View style={{ height: 12 }} />
          <GhostButton title="Sign out" onPress={logout} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  lock: { fontSize: 64 },
  sub: { marginTop: 8, fontSize: 13 },
  status: { marginTop: 16, fontSize: 12 },
});
