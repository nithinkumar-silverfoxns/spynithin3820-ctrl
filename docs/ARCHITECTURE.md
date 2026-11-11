# SILVERFOXNS JARVIS — Architecture

**Brand:** Silverfoxns · **Product:** JARVIS · **Tagline:** Your Personal AI. Your Voice. Your Control.

A cross-platform AI voice assistant. Wake phrase **"Hey Silverfox"**. Natural-language
voice, context-aware responses, and *authorized* smartphone actions — within what
each OS actually allows.

## System overview

```
┌──────────────────────────────┐        ephemeral token         ┌──────────────┐
│        Mobile app (RN)        │ ─────────────────────────────▶ │   OpenAI     │
│  wake word · STT/TTS · UI     │ ◀───── live voice (WebRTC) ───▶ │  Realtime    │
│  native device actions        │                                 └──────────────┘
└───────────┬──────────────────┘
            │ HTTPS (JWT)          tool call authorization (WSS)
            ▼
┌──────────────────────────────┐
│     Backend (FastAPI)         │   auth · dispatcher · audit · encrypted memory
│  mints ephemeral tokens       │   the REAL OpenAI key lives only here
│  authorizes every command     │
└───────────┬──────────────────┘
            ▼
     PostgreSQL (users, conversations, messages[encrypted], audit_logs)
```

## The 8-step command pipeline

1. **Speech recognition** — on device / OpenAI Realtime.
2. **Intent identification** — resolve to a registry command.
3. **Permission verification** — all required OS permissions must be granted.
4. **Risk assessment** — `low` / `medium` / `high`.
5. **User confirmation** — high-risk commands need a signed, 2-minute confirmation token.
6. **Native device action** — backend returns an authorized *directive*; the app executes it.
7. **Result verification** — the app reports success/failure back.
8. **Spoken response** — generated and spoken on device.

The backend authorizes; the device acts. No arbitrary AI-generated code ever runs.

## What each OS allows (stated honestly)

| Capability | Android | iPhone (iOS) |
|------------|---------|--------------|
| Foreground mic / wake word | ✅ foreground service | ✅ while app active / with entitlements |
| Open apps, maps, settings pages | ✅ intents | ✅ URL schemes / App Intents |
| Flashlight, battery, camera | ✅ | ✅ |
| Alarms / reminders | ✅ | ✅ (EventKit) |
| Read notifications | ✅ with NotificationListenerService | ⚠️ very limited |
| Place call / send SMS | ✅ (send needs user action) | ⚠️ pre-fill only; user taps send |
| Drive **other** apps automatically | ❌ not allowed | ❌ not allowed |

Anything not directly supported is routed through **Siri Shortcuts** (iOS) or an
Android intent, and the assistant says so rather than pretending.

## Repository layout

```
/backend     FastAPI app, migrations, docker-compose      (Phase 1 — DONE, tested)
/mobile      React Native + TypeScript app                (Phase 2)
/android     Kotlin native modules (intents, mic service) (Phase 3)
/ios         Swift App Intents / Shortcuts bridge         (Phase 3)
/ios-jarvis  Standalone SwiftUI reference app             (earlier prototype)
/docs        Architecture, security, setup
/tests       Backend smoke tests
```
