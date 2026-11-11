import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card, GhostButton } from '../components/ui';
import { useAssistant } from '../hooks/useAssistant';
import { useAuth } from '../hooks/useAuth';
import { typography, useTheme } from '../theme';

export function HistoryScreen() {
  const { palette } = useTheme();
  const { lines, clear } = useAssistant();
  const { profile } = useAuth();

  return (
    <Screen>
      <Text style={[typography.title, { color: palette.text, marginTop: 8, marginBottom: 4 }]}>Conversation history</Text>
      <Text style={[styles.sub, { color: palette.textDim }]}>
        {profile?.memory_consent
          ? 'Memory is ON — conversations are encrypted and stored on the server.'
          : 'Memory is OFF — history lives only in this session. Enable it in Security.'}
      </Text>

      {lines.length === 0 ? (
        <Card style={{ marginTop: 16 }}>
          <Text style={{ color: palette.textDim }}>No messages yet in this session.</Text>
        </Card>
      ) : (
        lines.map((l) => (
          <Card key={l.id} style={{ marginTop: 10 }}>
            <Text style={[styles.role, { color: l.role === 'you' ? palette.primary : palette.accent }]}>
              {l.role === 'you' ? 'YOU' : 'JARVIS'}
            </Text>
            <Text style={{ color: palette.text, marginTop: 4, fontSize: 14, lineHeight: 20 }}>{l.text}</Text>
          </Card>
        ))
      )}

      {lines.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <GhostButton title="Clear this session" onPress={clear} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  sub: { fontSize: 12, lineHeight: 17 },
  role: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
});
