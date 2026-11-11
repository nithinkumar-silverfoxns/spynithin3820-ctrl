import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card } from '../components/ui';
import { useAssistant } from '../hooks/useAssistant';
import { CommandSpec, commandService } from '../services/commands';
import { typography, useTheme } from '../theme';

const RISK_COLOR: Record<string, 'ok' | 'warn' | 'danger'> = {
  low: 'ok',
  medium: 'warn',
  high: 'danger',
};

const PROMPTS: Record<string, string> = {
  battery_status: "What's my battery level?",
  flashlight: 'Turn on the flashlight',
  launch_camera: 'Open the camera',
  open_app: 'Open the Settings app',
  open_navigation: 'Navigate home',
  set_alarm: 'Set an alarm for 7am',
  set_reminder: 'Remind me to drink water',
  read_notifications: 'Read my notifications',
  read_contacts: 'Find a contact',
  place_call: 'Call my last contact',
  draft_message: 'Draft a message saying hello',
  share_content: 'Share a note',
  device_setting: 'Open wifi settings',
};

export function DeviceControlScreen() {
  const { palette } = useTheme();
  const nav = useNavigation<any>();
  const { sendText } = useAssistant();
  const [catalog, setCatalog] = useState<CommandSpec[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    commandService.catalog().then(setCatalog).catch((e) => setError(e?.message ?? 'Could not load commands.'));
  }, []);

  const trigger = (c: CommandSpec) => {
    sendText(PROMPTS[c.name] ?? c.description);
    nav.navigate('Voice');
  };

  return (
    <Screen>
      <Text style={[typography.title, { color: palette.text, marginTop: 8 }]}>Device control</Text>
      <Text style={[styles.sub, { color: palette.textDim }]}>
        Everything JARVIS can do. High-risk actions always ask first.
      </Text>

      {!!error && <Text style={{ color: palette.danger, marginTop: 10 }}>{error}</Text>}

      <View style={{ marginTop: 14 }}>
        {catalog.map((c) => {
          const tone = RISK_COLOR[c.risk];
          const color = tone === 'danger' ? palette.danger : tone === 'warn' ? palette.accent : palette.success;
          return (
            <Pressable key={c.name} onPress={() => trigger(c)}>
              <Card style={{ marginBottom: 10 }}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: palette.text, fontSize: 15, fontWeight: '700' }}>
                      {c.name.replace(/_/g, ' ')}
                    </Text>
                    <Text style={{ color: palette.textDim, fontSize: 12, marginTop: 3 }}>{c.description}</Text>
                  </View>
                  <View style={[styles.badge, { borderColor: color }]}>
                    <Text style={{ color, fontSize: 10, fontWeight: '800' }}>{c.risk.toUpperCase()}</Text>
                  </View>
                </View>
              </Card>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sub: { fontSize: 12, marginTop: 4, lineHeight: 17 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
});
