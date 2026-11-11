import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card, Field, PrimaryButton } from '../components/ui';
import { DEFAULT_API_BASE, getApiBase, setApiBase } from '../services/api';
import { typography, useTheme } from '../theme';

export function ApiConfigScreen() {
  const { palette } = useTheme();
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getApiBase().then(setUrl);
  }, []);

  const test = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const base = url.replace(/\/+$/, '');
      const r = await fetch(`${base}/health`);
      const j = await r.json();
      setStatus({ ok: j.status === 'ok', text: j.status === 'ok' ? `Connected to ${j.app}.` : 'Reached server, unexpected response.' });
    } catch (e: any) {
      setStatus({ ok: false, text: `Could not reach ${url}. Is the backend running?` });
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    await setApiBase(url);
    setStatus({ ok: true, text: 'Saved. The app will use this backend.' });
  };

  return (
    <Screen>
      <Text style={[typography.title, { color: palette.text, marginTop: 8 }]}>API Configuration</Text>
      <Text style={[styles.sub, { color: palette.textDim }]}>
        The URL of your SILVERFOXNS JARVIS backend. The real OpenAI key lives there, never in this app.
      </Text>

      <View style={{ marginTop: 16 }}>
        <Field label="Backend base URL" value={url} onChangeText={setUrl} autoCapitalize="none" keyboardType="url" placeholder={DEFAULT_API_BASE} />
      </View>

      {busy ? <ActivityIndicator color={palette.primary} /> : <PrimaryButton title="Test connection" onPress={test} />}
      <View style={{ height: 10 }} />
      <PrimaryButton title="Save" onPress={save} disabled={!url} />

      {status && (
        <Card style={{ marginTop: 16, borderColor: status.ok ? palette.success : palette.danger }}>
          <Text style={{ color: status.ok ? palette.success : palette.danger, fontSize: 14 }}>{status.text}</Text>
        </Card>
      )}

      <Card style={{ marginTop: 16 }}>
        <Text style={[typography.caption, { color: palette.textDim }]}>TIPS</Text>
        <Text style={{ color: palette.text, fontSize: 13, marginTop: 8, lineHeight: 19 }}>
          • iOS simulator: use http://localhost:8000{'\n'}
          • Android emulator: use http://10.0.2.2:8000{'\n'}
          • Physical phone: use your computer's LAN IP, e.g. http://192.168.1.20:8000
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sub: { fontSize: 12, marginTop: 4, lineHeight: 17 },
});
