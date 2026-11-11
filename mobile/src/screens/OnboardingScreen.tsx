import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card, PrimaryButton } from '../components/ui';
import { typography, useTheme } from '../theme';

const POINTS = [
  { icon: '🎙', title: 'Talk naturally', body: 'Say “Hey Silverfox” and speak. JARVIS understands context.' },
  { icon: '🛡', title: 'Secure by design', body: 'Biometric unlock, encrypted memory, and confirmation before anything sensitive.' },
  { icon: '📱', title: 'Real device actions', body: 'Open apps, navigate, call, message, share — within what your OS allows.' },
  { icon: '🔑', title: 'Your keys stay private', body: 'API keys live on the server, never in the app.' },
];

export function OnboardingScreen({ navigation }: any) {
  const { palette } = useTheme();
  return (
    <Screen>
      <View style={{ marginTop: 20, marginBottom: 10 }}>
        <Text style={[typography.display, { color: palette.text }]}>Meet JARVIS</Text>
        <Text style={[styles.sub, { color: palette.textDim }]}>by Silverfoxns</Text>
      </View>
      {POINTS.map((p) => (
        <Card key={p.title} style={{ marginBottom: 12 }}>
          <View style={styles.row}>
            <Text style={styles.icon}>{p.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[typography.title, { color: palette.text, fontSize: 16 }]}>{p.title}</Text>
              <Text style={[styles.body, { color: palette.textDim }]}>{p.body}</Text>
            </View>
          </View>
        </Card>
      ))}
      <View style={{ marginTop: 16 }}>
        <PrimaryButton title="Get started" onPress={() => navigation.navigate('Login')} />
      </View>
      <Text style={[styles.fine, { color: palette.textDim }]}>
        By continuing you agree that JARVIS acts only on commands you give and asks before sensitive actions.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sub: { marginTop: 4, letterSpacing: 3, fontSize: 12, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  icon: { fontSize: 30 },
  body: { marginTop: 4, fontSize: 13, lineHeight: 19 },
  fine: { marginTop: 16, fontSize: 11, textAlign: 'center', lineHeight: 16 },
});
