import React, { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VoiceOrb } from '../components/VoiceOrb';
import { useAssistant } from '../hooks/useAssistant';
import { typography, useTheme } from '../theme';

export function VoiceScreen() {
  const { palette } = useTheme();
  const { lines, busy, pending, sendText, resolvePending } = useAssistant();
  const [draft, setDraft] = useState('');
  const [micNote, setMicNote] = useState(false);
  const listRef = useRef<FlatList>(null);

  const send = () => {
    const t = draft.trim();
    if (!t) return;
    setDraft('');
    sendText(t);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.bg }]} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.orbWrap}>
          <VoiceOrb
            active={busy}
            busy={busy}
            onPress={() => setMicNote((v) => !v)}
            label={busy ? 'Thinking…' : 'Say “Hey Silverfox”'}
          />
          {micNote && (
            <Text style={[styles.note, { color: palette.textDim, borderColor: palette.border }]}>
              Live hands-free voice (“Hey Silverfox” + streaming) needs the native wake-word + WebRTC
              build (Phase 3 / dev client). Type below to talk to JARVIS now.
            </Text>
          )}
        </View>

        <FlatList
          ref={listRef}
          data={lines}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: palette.textDim }]}>
              Ask me to open an app, navigate, call or message someone, or just chat.
            </Text>
          }
          renderItem={({ item }) => {
            const mine = item.role === 'you';
            return (
              <View style={[styles.row, { justifyContent: mine ? 'flex-end' : 'flex-start' }]}>
                <View
                  style={[
                    styles.bubble,
                    {
                      backgroundColor: mine ? palette.primary : palette.surface,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <Text style={{ color: mine ? palette.bg : palette.text, fontSize: 15, lineHeight: 20 }}>
                    {item.text}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        {pending && (
          <View style={[styles.confirm, { backgroundColor: palette.surfaceAlt, borderColor: palette.accent }]}>
            <Text style={[typography.caption, { color: palette.accent }]}>CONFIRMATION REQUIRED</Text>
            <Text style={[styles.confirmMsg, { color: palette.text }]}>{pending.message}</Text>
            <View style={styles.confirmRow}>
              <Pressable style={[styles.cbtn, { backgroundColor: palette.success }]} onPress={() => resolvePending(true)}>
                <Text style={styles.cbtnText}>Yes, do it</Text>
              </Pressable>
              <Pressable style={[styles.cbtn, { backgroundColor: palette.danger }]} onPress={() => resolvePending(false)}>
                <Text style={styles.cbtnText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={[styles.inputBar, { borderTopColor: palette.border, backgroundColor: palette.bg }]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Message JARVIS…"
            placeholderTextColor={palette.textDim}
            style={[styles.input, { backgroundColor: palette.surface, color: palette.text, borderColor: palette.border }]}
            onSubmitEditing={send}
            returnKeyType="send"
          />
          <Pressable onPress={send} style={[styles.sendBtn, { backgroundColor: palette.primary }]}>
            <Text style={{ color: palette.bg, fontSize: 18, fontWeight: '800' }}>↑</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  orbWrap: { alignItems: 'center' },
  note: { marginHorizontal: 24, marginTop: -16, marginBottom: 6, fontSize: 12, lineHeight: 17, textAlign: 'center', borderWidth: 1, borderRadius: 12, padding: 10 },
  list: { paddingHorizontal: 16, paddingBottom: 10, flexGrow: 1 },
  empty: { textAlign: 'center', marginTop: 30, fontSize: 13, paddingHorizontal: 24, lineHeight: 19 },
  row: { flexDirection: 'row', marginVertical: 5 },
  bubble: { maxWidth: '82%', borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  confirm: { margin: 12, borderRadius: 16, borderWidth: 1, padding: 14 },
  confirmMsg: { marginTop: 6, fontSize: 15, fontWeight: '600' },
  confirmRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  cbtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  cbtnText: { color: '#06101F', fontWeight: '800' },
  inputBar: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderTopWidth: 1 },
  input: { flex: 1, borderRadius: 22, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 11, fontSize: 15 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
