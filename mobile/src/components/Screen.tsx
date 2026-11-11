import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme';

/** Themed screen container with a subtle gradient-like layered background. */
export function Screen({
  children,
  scroll = true,
  padded = true,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
}) {
  const { palette } = useTheme();
  const Body = (
    <View style={[padded && styles.padded, { flexGrow: 1 }]}>{children}</View>
  );
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.bg }]} edges={['top', 'left', 'right']}>
      {/* layered glow accents */}
      <View pointerEvents="none" style={[styles.glow, { backgroundColor: palette.primaryGlow, top: -80, right: -60 }]} />
      <View pointerEvents="none" style={[styles.glow, { backgroundColor: palette.primaryGlow, bottom: -100, left: -70, opacity: 0.5 }]} />
      {scroll ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          {Body}
        </ScrollView>
      ) : (
        Body
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  padded: { paddingHorizontal: 20, paddingBottom: 24 },
  glow: { position: 'absolute', width: 240, height: 240, borderRadius: 120, opacity: 0.7 },
});
