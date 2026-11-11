# Voice: wake word + live streaming (Phase 3 native work)

The app ships today with **turn-based voice** (type/speak a turn, JARVIS replies
with TTS) which runs everywhere, including Expo Go. True hands-free "Hey
Silverfox" + live streaming conversation needs native modules that are **not**
available in Expo Go. This document is the honest spec for wiring them.

## 1. Wake word — "Hey Silverfox"

On-device wake-word detection needs a licensed engine. Recommended:
**Picovoice Porcupine** (`@picovoice/porcupine-react-native`).

Steps:
1. Create a free Picovoice account, get an **AccessKey**.
2. In the Picovoice console, train a **custom keyword** "Hey Silverfox" → download
   the `.ppn` model for iOS and Android.
3. Add the package, drop the `.ppn` files in the app, and start the detector
   inside a foreground service (Android) / background audio mode (iOS).
4. On detection → open the Voice screen and begin a session.

> The `.ppn` keyword file is tied to your Picovoice account, so only you can
> generate it — the app can't ship one.

Privacy: the mic indicator must be visible whenever the detector is active, and
wake-word listening is a setting the user can turn off (see Security centre).

## 2. Live streaming voice (OpenAI Realtime)

1. The app calls the backend `POST /api/v1/ai/realtime/session` (already built),
   which mints a short-lived **ephemeral token** — the real OpenAI key stays on
   the server.
2. The device opens a WebRTC connection **directly to OpenAI** using that token.
   This needs `react-native-webrtc`, which requires a **custom dev client** or a
   bare build (`npx expo prebuild` / EAS build) — it does not run in Expo Go.
3. Mic audio streams up; model audio streams down and plays. Barge-in
   (interrupting the assistant) is handled by the Realtime API.
4. When the model requests a tool call, forward it over the backend
   `WS /api/v1/voice/stream?token=…` so the **same secure dispatcher** authorizes
   it (permissions, risk, confirmation) before the device acts.

## Build commands (when ready)

```bash
cd mobile
npx expo install react-native-webrtc @picovoice/porcupine-react-native
npx expo prebuild                 # generates android/ and ios/ native projects
npx expo run:ios                  # or: npx expo run:android
```

Until then, the app's turn-based mode is fully functional and uses the exact
same backend, dispatcher and security model.
