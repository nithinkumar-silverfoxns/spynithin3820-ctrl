# SILVERFOXNS JARVIS — Mobile app

React Native + TypeScript (Expo) app: the premium JARVIS experience — animated
voice orb, dashboard, conversation, device control, privacy/security centre,
biometric unlock, and the client that talks to the Phase 1 backend.

## Run it

Prerequisites: Node 18+, and the **backend running** (see `../backend/README.md`).

```bash
cd mobile
npm install
npx expo install        # aligns native deps to the Expo SDK
npx expo start          # press i (iOS sim), a (Android emulator), or scan the QR
```

Then in the app: **Settings ▸ API Configuration** → point it at your backend
(`http://localhost:8000` on iOS sim, `http://10.0.2.2:8000` on Android emulator,
your LAN IP on a physical phone) → **Test connection** → **Save**. Register an
account and you're in.

## What works in Expo Go today

- Full UI, theming (light/dark/system), navigation, biometric unlock.
- Account auth against the backend (register/login, tokens in Keychain/Keystore).
- **Turn-based conversation**: type to JARVIS; it replies (spoken via TTS) and
  calls tools through the secure dispatcher.
- Device actions achievable with RN built-ins: open apps/links, navigation,
  dialer, SMS composer, share sheet, settings.
- The high-risk **confirmation flow** (e.g. "call Mom" → Yes/Cancel).

## What needs a native/dev build (Phase 3 — honestly flagged, not faked)

| Feature | Why | Where |
|---------|-----|-------|
| "Hey Silverfox" wake word | Licensed on-device engine (e.g. Picovoice Porcupine) + custom keyword file | `docs/VOICE.md` |
| Live streaming voice | `react-native-webrtc` + Expo **dev client** (not Expo Go) | `docs/VOICE.md` |
| Flashlight, battery, camera, alarms, reminders, contacts, notifications | Native modules / platform APIs | `android/`, `ios/` (Phase 3) |

Actions that aren't implemented yet return an honest "needs the native module"
message — never a fake success (see `src/services/deviceActions.ts`).

## Structure

```
src/
  components/   VoiceOrb (animated waveform), Screen, ui kit
  screens/      Splash, Onboarding, Login, Lock, Dashboard, Voice,
                History, DeviceControl, Security, Settings, ApiConfig
  navigation/   auth → biometric lock → tabbed main app
  services/     api, auth, commands, deviceActions, voice, tts
  hooks/        useAuth, useAssistant
  security/     secureStorage (Keychain/Keystore), biometrics
  theme/        light/dark palettes + provider
```

## Type-check

```bash
npm run typecheck
```
