import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { typography, useTheme } from '../theme';

export function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  const { palette } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }, style]}>
      {children}
    </View>
  );
}

export function StatusTile({ label, value, tone }: { label: string; value: string; tone?: 'ok' | 'warn' | 'danger' }) {
  const { palette } = useTheme();
  const color = tone === 'danger' ? palette.danger : tone === 'warn' ? palette.accent : palette.success;
  return (
    <Card style={{ flex: 1, minWidth: 140 }}>
      <Text style={[styles.tileLabel, { color: palette.textDim }]}>{label.toUpperCase()}</Text>
      <View style={styles.tileRow}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={[styles.tileValue, { color: palette.text }]}>{value}</Text>
      </View>
    </Card>
  );
}

export function QuickAction({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  const { palette } = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.qa, { backgroundColor: palette.surfaceAlt, borderColor: palette.border, opacity: pressed ? 0.7 : 1 }]}>
      <Text style={styles.qaIcon}>{icon}</Text>
      <Text style={[styles.qaLabel, { color: palette.text }]} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

export function PrimaryButton({ title, onPress, disabled }: { title: string; onPress: () => void; disabled?: boolean }) {
  const { palette } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: palette.primary, opacity: disabled ? 0.4 : pressed ? 0.85 : 1 },
      ]}
    >
      <Text style={[styles.btnText, { color: palette.bg }]}>{title}</Text>
    </Pressable>
  );
}

export function GhostButton({ title, onPress }: { title: string; onPress: () => void }) {
  const { palette } = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.ghost, { borderColor: palette.border, opacity: pressed ? 0.7 : 1 }]}>
      <Text style={[styles.ghostText, { color: palette.textDim }]}>{title}</Text>
    </Pressable>
  );
}

export function Field(props: TextInputProps & { label: string }) {
  const { palette } = useTheme();
  const { label, ...rest } = props;
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={[styles.fieldLabel, { color: palette.textDim }]}>{label}</Text>
      <TextInput
        placeholderTextColor={palette.textDim}
        {...rest}
        style={[styles.input, { backgroundColor: palette.surface, color: palette.text, borderColor: palette.border }]}
      />
    </View>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  const { palette } = useTheme();
  return <Text style={[typography.caption, styles.section, { color: palette.textDim }]}>{String(children).toUpperCase()}</Text>;
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, borderWidth: 1, padding: 16 },
  tileLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  tileRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  tileValue: { fontSize: 17, fontWeight: '700' },
  qa: { width: '31%', aspectRatio: 1, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center', padding: 8 },
  qaIcon: { fontSize: 26, marginBottom: 8 },
  qaLabel: { fontSize: 12, fontWeight: '600' },
  btn: { borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  btnText: { fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  ghost: { borderRadius: 14, paddingVertical: 13, alignItems: 'center', borderWidth: 1 },
  ghostText: { fontSize: 14, fontWeight: '600' },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6, letterSpacing: 0.5 },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  section: { marginTop: 22, marginBottom: 10 },
});
