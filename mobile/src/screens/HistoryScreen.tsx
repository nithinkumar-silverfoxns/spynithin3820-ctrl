import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card, GhostButton } from '../components/ui';
import { useAssistant } from '../hooks/useAssistant';
import { useAuth } from '../hooks/useAuth';
import { ConversationDetail, ConversationSummary, conversationService } from '../services/conversations';
import { typography, useTheme } from '../theme';

export function HistoryScreen() {
  const { palette } = useTheme();
  const { lines, clear } = useAssistant();
  const { profile } = useAuth();
  const [saved, setSaved] = useState<ConversationSummary[]>([]);
  const [open, setOpen] = useState<ConversationDetail | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    if (!profile?.memory_consent) {
      setSaved([]);
      return;
    }
    conversationService.list().then(setSaved).catch((e) => setError(e?.message ?? 'Could not load history.'));
  }, [profile?.memory_consent]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const openConvo = async (id: number) => {
    try {
      setOpen(await conversationService.get(id));
    } catch (e: any) {
      setError(e?.message ?? 'Could not open conversation.');
    }
  };

  const clearAll = async () => {
    await conversationService.clearAll().catch(() => {});
    setOpen(null);
    load();
  };

  return (
    <Screen>
      <Text style={[typography.title, { color: palette.text, marginTop: 8, marginBottom: 4 }]}>History</Text>
      <Text style={[styles.sub, { color: palette.textDim }]}>
        {profile?.memory_consent
          ? 'Memory is ON — conversations are encrypted and stored on your server.'
          : 'Memory is OFF — history lives only in this session. Turn it on in Security.'}
      </Text>

      {!!error && <Text style={{ color: palette.danger, marginTop: 8 }}>{error}</Text>}

      {/* Saved (server) history */}
      {profile?.memory_consent && (
        <>
          <Text style={[typography.caption, styles.section, { color: palette.textDim }]}>SAVED</Text>
          {saved.length === 0 ? (
            <Card><Text style={{ color: palette.textDim }}>No saved conversations yet.</Text></Card>
          ) : (
            saved.map((c) => (
              <Pressable key={c.id} onPress={() => openConvo(c.id)}>
                <Card style={{ marginBottom: 8 }}>
                  <View style={styles.row}>
                    <Text style={{ color: palette.text, fontSize: 15, fontWeight: '700', flex: 1 }} numberOfLines={1}>
                      {c.title}
                    </Text>
                    <Text style={{ color: palette.textDim, fontSize: 12 }}>{c.message_count} msgs</Text>
                  </View>
                </Card>
              </Pressable>
            ))
          )}
          {open && (
            <Card style={{ marginTop: 6, borderColor: palette.primary }}>
              <Text style={[typography.caption, { color: palette.primary }]}>{open.title.toUpperCase()}</Text>
              {open.messages.map((m) => (
                <Text key={m.id} style={{ color: palette.text, fontSize: 13, marginTop: 6, lineHeight: 19 }}>
                  <Text style={{ color: m.role === 'user' ? palette.primary : palette.accent, fontWeight: '800' }}>
                    {m.role === 'user' ? 'You: ' : 'JARVIS: '}
                  </Text>
                  {m.content}
                </Text>
              ))}
              <View style={{ marginTop: 10 }}>
                <GhostButton title="Close" onPress={() => setOpen(null)} />
              </View>
            </Card>
          )}
          {saved.length > 0 && (
            <View style={{ marginTop: 10 }}>
              <GhostButton title="Delete all saved history" onPress={clearAll} />
            </View>
          )}
        </>
      )}

      {/* Current session */}
      <Text style={[typography.caption, styles.section, { color: palette.textDim }]}>THIS SESSION</Text>
      {lines.length === 0 ? (
        <Card><Text style={{ color: palette.textDim }}>No messages yet in this session.</Text></Card>
      ) : (
        lines.map((l) => (
          <Card key={l.id} style={{ marginTop: 8 }}>
            <Text style={[styles.role, { color: l.role === 'you' ? palette.primary : palette.accent }]}>
              {l.role === 'you' ? 'YOU' : 'JARVIS'}
            </Text>
            <Text style={{ color: palette.text, marginTop: 4, fontSize: 14, lineHeight: 20 }}>{l.text}</Text>
          </Card>
        ))
      )}
      {lines.length > 0 && (
        <View style={{ marginTop: 12 }}>
          <GhostButton title="Clear this session" onPress={clear} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  sub: { fontSize: 12, lineHeight: 17 },
  section: { marginTop: 20, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  role: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
});
