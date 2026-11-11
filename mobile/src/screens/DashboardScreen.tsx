import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { VoiceOrb } from '../components/VoiceOrb';
import { Card, QuickAction, SectionTitle, StatusTile } from '../components/ui';
import { useAssistant } from '../hooks/useAssistant';
import { useAuth } from '../hooks/useAuth';
import { getApiBase } from '../services/api';
import { typography, useTheme } from '../theme';

export function DashboardScreen() {
  const { palette } = useTheme();
  const nav = useNavigation<any>();
  const { profile } = useAuth();
  const { sendText, busy } = useAssistant();
  const [online, setOnline] = useState<boolean | null>(null);
  const [openaiReady, setOpenaiReady] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const base = await getApiBase();
        const r = await fetch(`${base}/health`);
        const j = await r.json();
        setOnline(j.status === 'ok');
        setOpenaiReady(!!j.openai_configured);
      } catch {
        setOnline(false);
        setOpenaiReady(false);
      }
    })();
  }, []);

  const quick = (prompt: string) => {
    sendText(prompt);
    nav.navigate('Voice');
  };

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={[styles.hi, { color: palette.textDim }]}>
            {profile?.display_name ? `Hi ${profile.display_name}` : 'Welcome'}
          </Text>
          <Text style={[typography.title, { color: palette.text }]}>JARVIS</Text>
        </View>
        <Pressable onPress={() => nav.navigate('Settings')}>
          <Text style={{ fontSize: 22, color: palette.textDim }}>⚙︎</Text>
        </Pressable>
      </View>

      <VoiceOrb
        active={false}
        busy={busy}
        onPress={() => nav.navigate('Voice')}
        label={'Tap to open the voice assistant'}
      />

      <SectionTitle>Status</SectionTitle>
      <View style={styles.tiles}>
        <StatusTile label="Assistant" value={online == null ? '…' : online ? 'Online' : 'Offline'} tone={online ? 'ok' : 'danger'} />
        <StatusTile label="Voice AI" value={openaiReady == null ? '…' : openaiReady ? 'Ready' : 'No key'} tone={openaiReady ? 'ok' : 'warn'} />
      </View>
      <View style={[styles.tiles, { marginTop: 10 }]}>
        <StatusTile label="Security" value="Encrypted" tone="ok" />
        <StatusTile label="Memory" value={profile?.memory_consent ? 'On' : 'Off'} tone={profile?.memory_consent ? 'ok' : 'warn'} />
      </View>

      <SectionTitle>Quick actions</SectionTitle>
      <View style={styles.grid}>
        <QuickAction icon="🗺" label="Navigate" onPress={() => quick('Open navigation to the nearest coffee shop')} />
        <QuickAction icon="📞" label="Call" onPress={() => quick('Call my last contact')} />
        <QuickAction icon="💬" label="Message" onPress={() => quick('Draft a message saying I am running late')} />
        <QuickAction icon="🔗" label="Share" onPress={() => quick('Share my location text')} />
        <QuickAction icon="⚙︎" label="Settings" onPress={() => quick('Open device settings')} />
        <QuickAction icon="▣" label="Devices" onPress={() => nav.navigate('Devices')} />
      </View>

      <Card style={{ marginTop: 20 }}>
        <Text style={[typography.caption, { color: palette.textDim }]}>SECURITY STATUS</Text>
        <Text style={[styles.secBody, { color: palette.text }]}>
          🛡 Biometric lock active · tokens in Keychain/Keystore · high-risk actions require confirmation.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 6 },
  hi: { fontSize: 13, fontWeight: '600' },
  tiles: { flexDirection: 'row', gap: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  secBody: { marginTop: 8, fontSize: 13, lineHeight: 19 },
});
