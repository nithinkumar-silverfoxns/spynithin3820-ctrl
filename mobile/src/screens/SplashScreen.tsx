import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { typography, useTheme } from '../theme';

export function SplashScreen() {
  const { palette } = useTheme();
  return (
    <Screen scroll={false}>
      <View style={styles.center}>
        <Text style={[styles.mark, { color: palette.primary }]}>◉</Text>
        <Text style={[typography.display, { color: palette.text, marginTop: 16 }]}>JARVIS</Text>
        <Text style={[styles.brand, { color: palette.textDim }]}>SILVERFOXNS</Text>
        <Text style={[styles.tag, { color: palette.textDim }]}>Your Personal AI. Your Voice. Your Control.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mark: { fontSize: 72 },
  brand: { marginTop: 6, letterSpacing: 6, fontSize: 13, fontWeight: '700' },
  tag: { marginTop: 24, fontSize: 13, textAlign: 'center' },
});
