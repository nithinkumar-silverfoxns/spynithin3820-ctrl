import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Field, GhostButton, PrimaryButton } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { typography, useTheme } from '../theme';

export function LoginScreen() {
  const { palette } = useTheme();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') await login(email.trim(), password);
      else await register(email.trim(), password, name.trim());
    } catch (e: any) {
      setError(e?.message ?? 'Could not sign in. Check the API Configuration and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <View style={{ marginTop: 30, marginBottom: 24 }}>
        <Text style={[typography.display, { color: palette.text }]}>
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </Text>
        <Text style={[styles.sub, { color: palette.textDim }]}>SILVERFOXNS JARVIS</Text>
      </View>

      {mode === 'register' && (
        <Field label="Display name" value={name} onChangeText={setName} placeholder="Nithin" autoCapitalize="words" />
      )}
      <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" />
      <Field label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />

      {!!error && <Text style={[styles.err, { color: palette.danger }]}>{error}</Text>}

      <View style={{ marginTop: 8 }}>
        {busy ? (
          <ActivityIndicator color={palette.primary} />
        ) : (
          <PrimaryButton title={mode === 'login' ? 'Sign in' : 'Create account'} onPress={submit} disabled={!email || password.length < 8} />
        )}
      </View>

      <View style={{ marginTop: 12 }}>
        <GhostButton
          title={mode === 'login' ? 'New here? Create an account' : 'Have an account? Sign in'}
          onPress={() => { setError(''); setMode(mode === 'login' ? 'register' : 'login'); }}
        />
      </View>

      <Text style={[styles.hint, { color: palette.textDim }]}>
        Biometric unlock (Face ID / fingerprint) is enabled from Settings once you’re signed in.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sub: { marginTop: 4, letterSpacing: 3, fontSize: 12, fontWeight: '700' },
  err: { marginBottom: 8, fontSize: 13 },
  hint: { marginTop: 20, fontSize: 12, textAlign: 'center', lineHeight: 17 },
});
