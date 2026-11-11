# Phase 3 — Native modules (Kotlin + Swift)

The app includes a local **Expo module** `jarvis-native` that performs real
device actions in Kotlin (Android) and Swift (iOS). It is not active in Expo Go
— it links in when you create a native build.

## What each method does

| JS method | Android (Kotlin) | iOS (Swift) |
|-----------|------------------|-------------|
| `getBattery()` | `BatteryManager` | `UIDevice` |
| `setTorch(on)` | `CameraManager.setTorchMode` | `AVCaptureDevice.torchMode` |
| `launchCamera()` | `MediaStore` camera intent | `UNSUPPORTED` → Shortcut |
| `setAlarm(h,m,label)` | `AlarmClock.ACTION_SET_ALARM` | `UNSUPPORTED` → Clock Shortcut |
| `addReminder(title,due)` | `UNSUPPORTED` → alarm/calendar | `EventKit` |
| `openApp(target)` | launch intent / URI | `UIApplication.open` |
| `startListeningService()` | foreground mic service (persistent notification) | `UNSUPPORTED` → background audio mode |
| `stopListeningService()` | stops the service | no-op |

Unsupported platform actions reject with code `UNSUPPORTED`; the JS
(`src/services/deviceActions.ts`) turns that into an honest spoken message and
suggests a Shortcut — never a fake success.

## Build & run the native app

```bash
cd mobile
npm install
npx expo prebuild            # generates android/ and ios/, links jarvis-native
npx expo run:android         # device/emulator with the native module
npx expo run:ios             # Mac + Xcode
```

`npx expo prebuild` autolinks any module under `mobile/modules/`, so
`jarvis-native` is picked up with no extra config. The permission strings and
Android service declaration are already in `app.json` and the module's
`AndroidManifest.xml`.

## Foreground microphone service (Android)

`MicForegroundService.kt` runs with a **persistent, visible notification**
("JARVIS is listening") so the mic is never active silently. It is started only
when the user opts in. Plug the wake-word engine into its `onStartCommand` /
`onDestroy` (see `docs/VOICE.md`).

## Wake word + live streaming voice

See `docs/VOICE.md`. Summary: add `@picovoice/porcupine-react-native` with your
own "Hey Silverfox" `.ppn` keyword file, and `react-native-webrtc` for streaming
with the backend's ephemeral-token endpoint. Both require this native build
(not Expo Go).

## Note on compilation

These Kotlin/Swift sources are written against the Expo Modules API but have not
been compiled in this environment (no Android SDK / Xcode here). Build them with
the commands above; if the toolchain flags anything, share the error and it's a
quick fix.
