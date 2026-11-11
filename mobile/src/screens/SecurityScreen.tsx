import React, { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card, GhostButton } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth';
import { biometrics } from '../security/biometrics';
import { typography, useTheme } from '../theme';

function ToggleRow({
  title, body, value, onChange, disabled,
}: { title: string; body: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  const { palette } = useTheme();
  return (
    <Card style={{ marginBottom: 10 }}>
      <View style={styles.row}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={{ color: palette.text, fontSize: 15, fontWeight: '700' }}>{title}</Text>
          <Text style={{ color: palette.textDim, fontSize: 12, marginTop: 3, lineHeight: 17 }}>{body}</Text>
        </View>
        <Switch value={value} onValueChange={onChange} disabled={disabled} trackColor={{ true: palette.primary }} />
      </View>
    </Card>
  );
}

export function SecurityScreen() {
  const { palette } = useTheme();
  const { profile, refreshProfile, logout } = useAuth();
  const [note, setNote] = useState('');

  const setMemory = async (v: boolean) => {
    await authService.setConsent({ memory_consent: v });
    await refreshProfile();
  };

  const setBiometric = async (v: boolean) => {
    if (v) {
      const ok = await biometrics.isAvailable();
      if (!ok) {
        setNote('No biometrics are enrolled on this device. Set up Face ID / fingerprint in system settings first.');
        return;
      }
      const passed = await biometrics.authenticate('Confirm to enable biometric unlock');
      if (!passed) return;
    }
    await authService.setConsent({ biometric_enrolled: v });
    await refreshProfile();
    setNote('');
  };

  return (
    <Screen>
      <Text style={[typography.title, { color: palette.text, marginTop: 8 }]}>Privacy & Security</Text>
      <Text style={[styles.sub, { color: palette.textDim }]}>You control what JARVIS remembers and how it unlocks.</Text>

      <View style={{ marginTop: 14 }}>
        <ToggleRow
          title="Conversation memory"
          body="Store conversations (encrypted at rest) so JARVIS remembers context across sessions. Off by default."
          value={!!profile?.memory_consent}
          onChange={setMemory}
        />
        <ToggleRow
          title="Biometric unlock"
          body="Require Face ID / fingerprint each time you open JARVIS."
          value={!!profile?.biometric_enrolled}
          onChange={setBiometric}
        />
      </View>

      {!!note && <Text style={{ color: palette.accent, marginTop: 4, fontSize: 12 }}>{note}</Text>}

      <Card style={{ marginTop: 6 }}>
        <Text style={[typography.caption, { color: palette.textDim }]}>HOW YOU'RE PROTECTED</Text>
        {[
          'Access tokens are short-lived and stored in the Keychain / Keystore.',
          'High-risk actions (calls, messages, contacts) require explicit confirmation.',
          'Every sensitive action is written to a server-side audit log.',
          'API keys never leave the server — the app uses short-lived tokens.',
        ].map((t) => (
          <Text key={t} style={{ color: palette.text, fontSize: 13, marginTop: 8, lineHeight: 19 }}>• {t}</Text>
        ))}
      </Card>

      <View style={{ marginTop: 16 }}>
        <GhostButton title="Sign out" onPress={logout} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sub: { fontSize: 12, marginTop: 4, lineHeight: 17 },
  row: { flexDirection: 'row', alignItems: 'center' },
});
