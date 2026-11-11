# SilverFox — a voice AI assistant for iPhone
### by SilverFoxNS

A SwiftUI starter app (SilverFoxNS): you talk to it, **Claude** decides what to do, and it acts
on your iPhone through **tool use** — creating reminders and calendar events,
reading your schedule, opening apps/links, starting calls, pre-filling messages,
and running your **Siri Shortcuts** (the bridge to everything else: smart home,
music, settings, routines).

## ⚠️ What iPhone allows (read this first)

Apple's sandbox is strict. A custom app **cannot**:
- read or tap other apps' screens,
- drive other apps automatically,
- run silent background automation, or
- send a text/iMessage without you tapping **Send**.

So this is not an Android-style "control anything" agent — nothing on iOS can be.
What it *is*: a genuinely useful voice assistant that acts through the official
APIs above, plus **Shortcuts** as the escape hatch for everything else. If you can
build it as a Shortcut, SilverFox can run it by name.

## Setup

1. **Mac with Xcode 15+** and an iPhone running iOS 17+.
2. In Xcode: **File ▸ New ▸ Project ▸ iOS ▸ App**, name it `SilverFox`, interface
   **SwiftUI**, language **Swift**.
3. Delete the generated `ContentView.swift` and the `App` file, then drag every
   `.swift` file from `Jarvis/` in this folder into the project.
4. Add the usage-description keys from `Info-plist-keys.md` to your target
   (**Target ▸ Info**). The app will crash on first permission request without them.
5. Enable capabilities if prompted (Calendars, Reminders are permission-only, no
   capability toggle needed).
6. Get a Claude API key at **console.anthropic.com**, run the app on your iPhone
   (signing with your free Apple ID is fine), open **⚙︎ Settings** in the app, and
   paste the key.
7. Tap the **mic** and talk, or type. Try:
   - "Remind me to call the dentist at 3pm tomorrow."
   - "What's on my calendar today?"
   - "Run my Good Morning shortcut."
   - "Text Mom that I'm running late." (opens the composer — you tap Send)

## How it works

```
Voice  ──SpeechManager──▶  text
text   ──Assistant──▶  ClaudeClient (Messages API + tools)
                           │  loops while Claude requests tools
                           ▼
                       ToolBox ──▶ DeviceActions (EventKit, URLs, Shortcuts)
reply  ◀──AVSpeech── spoken answer
```

- `ClaudeClient.swift` — talks to the Anthropic Messages API and runs the
  tool-use loop.
- `ToolDefinitions.swift` — the tools Claude can call, and their dispatch.
- `DeviceActions.swift` — the real iOS actions (the "hands").
- `SpeechManager.swift` — speech-to-text and text-to-speech.
- `Assistant.swift` / `ContentView.swift` — glue and UI.
- `Config.swift` — model id, system prompt, API key storage.

## Extending it (add a new capability)

1. Add a `ToolSpec` in `ToolDefinitions.swift` describing the tool to Claude.
2. Add a `case` in `ToolBox.execute(...)` that calls into `DeviceActions`.
3. Implement the action in `DeviceActions.swift`.

For anything the iOS SDK won't let an app do directly, build a **Siri Shortcut**
and let Claude trigger it via the existing `run_shortcut` tool — no code needed.

## Security note

The API key is stored on-device for personal use. **Do not ship this to the App
Store with the key on the device** — put a small backend between the app and
Anthropic so the key never leaves your server, and move it to the Keychain.
