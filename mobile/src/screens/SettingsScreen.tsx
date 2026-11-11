import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card, GhostButton } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { typography, useTheme } from '../theme';

export function SettingsScreen() {
  const { palette, override, setOverride } = useTheme();
  const nav = useNavigation<any>();
  const { profile, logout } = useAuth();

  const modes: Array<'system' | 'light' | 'dark'> = ['system', 'light', 'dark'];

  return (
    <Screen>
      <Card style={{ marginTop: 10 }}>
        <Text style={[typography.caption, { color: palette.textDim }]}>ACCOUNT</Text>
        <Text style={{ color: palette.text, fontSize: 16, fontWeight: '700', marginTop: 6 }}>
          {profile?.display_name || 'JARVIS user'}
        </Text>
        <Text style={{ color: palette.textDim, fontSize: 13 }}>{profile?.email}</Text>
      </Card>

      <Card style={{ marginTop: 12 }}>
        <Text style={[typography.caption, { color: palette.textDim }]}>APPEARANCE</Text>
        <View style={styles.segment}>
          {modes.map((m) => (
            <Pressable
              key={m}
              onPress={() => setOverride(m)}
              style={[
                styles.seg,
                { borderColor: palette.border, backgroundColor: override === m ? palette.primary : 'transparent' },
              ]}
            >
              <Text style={{ color: override === m ? palette.bg : palette.textDim, fontWeight: '700', fontSize: 13 }}>
                {m[0].toUpperCase() + m.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Pressable onPress={() => nav.navigate('ApiConfig')}>
        <Card style={{ marginTop: 12 }}>
          <View style={styles.row}>
            <View>
              <Text style={{ color: palette.text, fontSize: 15, fontWeight: '700' }}>API Configuration</Text>
              <Text style={{ color: palette.textDim, fontSize: 12, marginTop: 3 }}>Point the app at your backend.</Text>
            </View>
            <Text style={{ color: palette.textDim, fontSize: 20 }}>›</Text>
          </View>
        </Card>
      </Pressable>

      <Pressable onPress={() => nav.navigate('Tabs', { screen: 'Security' })}>
        <Card style={{ marginTop: 12 }}>
          <View style={styles.row}>
            <View>
              <Text style={{ color: palette.text, fontSize: 15, fontWeight: '700' }}>Privacy & Security</Text>
              <Text style={{ color: palette.textDim, fontSize: 12, marginTop: 3 }}>Memory, biometrics, audit.</Text>
            </View>
            <Text style={{ color: palette.textDim, fontSize: 20 }}>›</Text>
          </View>
        </Card>
      </Pressable>

      <Card style={{ marginTop: 12 }}>
        <Text style={[typography.caption, { color: palette.textDim }]}>ABOUT</Text>
        <Text style={{ color: palette.text, fontSize: 14, marginTop: 6 }}>SILVERFOXNS JARVIS v0.1.0</Text>
        <Text style={{ color: palette.textDim, fontSize: 12, marginTop: 2 }}>Your Personal AI. Your Voice. Your Control.</Text>
      </Card>

      <View style={{ marginTop: 16 }}>
        <GhostButton title="Sign out" onPress={logout} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  segment: { flexDirection: 'row', gap: 8, marginTop: 10 },
  seg: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
