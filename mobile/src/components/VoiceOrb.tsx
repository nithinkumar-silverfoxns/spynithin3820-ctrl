import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';

type Props = {
  active: boolean;          // listening or speaking -> animate
  busy?: boolean;           // thinking
  onPress: () => void;
  label?: string;
};

/**
 * Animated circular voice waveform + glowing activation indicator.
 * Concentric rings pulse outward while active; the core glows. Pure RN Animated
 * (no native deps) so it runs anywhere.
 */
export function VoiceOrb({ active, busy, onPress, label }: Props) {
  const { palette } = useTheme();
  const rings = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  const core = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let loops: Animated.CompositeAnimation[] = [];
    if (active) {
      loops = rings.map((v, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(i * 400),
            Animated.timing(v, { toValue: 1, duration: 1800, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          ]),
        ),
      );
      loops.push(
        Animated.loop(
          Animated.sequence([
            Animated.timing(core, { toValue: 1, duration: 900, useNativeDriver: true }),
            Animated.timing(core, { toValue: 0, duration: 900, useNativeDriver: true }),
          ]),
        ),
      );
      loops.forEach((l) => l.start());
    } else {
      rings.forEach((v) => v.setValue(0));
      core.setValue(0);
    }
    return () => loops.forEach((l) => l.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const coreScale = core.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });

  return (
    <View style={styles.wrap}>
      {rings.map((v, i) => {
        const scale = v.interpolate({ inputRange: [0, 1], outputRange: [1, 2.4] });
        const opacity = v.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });
        return (
          <Animated.View
            key={i}
            pointerEvents="none"
            style={[
              styles.ring,
              { borderColor: palette.primary, transform: [{ scale }], opacity: active ? opacity : 0 },
            ]}
          />
        );
      })}

      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Activate JARVIS voice">
        <Animated.View
          style={[
            styles.core,
            {
              backgroundColor: palette.surfaceAlt,
              borderColor: palette.primary,
              shadowColor: palette.primary,
              transform: [{ scale: coreScale }],
            },
          ]}
        >
          <Text style={[styles.icon, { color: palette.primary }]}>
            {busy ? '…' : active ? '◉' : '🎙'}
          </Text>
        </Animated.View>
      </Pressable>

      {!!label && <Text style={[styles.label, { color: palette.textDim }]}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', height: 260 },
  ring: { position: 'absolute', width: 140, height: 140, borderRadius: 70, borderWidth: 2 },
  core: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.8,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  icon: { fontSize: 46 },
  label: { marginTop: 18, letterSpacing: 1, fontSize: 13, fontWeight: '600' },
});
