# Required Info.plist usage descriptions

Add these to your app target (Target ▸ Info ▸ Custom iOS Target Properties, or
edit Info.plist as source). The app will crash the first time it asks for a
permission if the matching key is missing.

| Key | Suggested value |
|-----|-----------------|
| `NSMicrophoneUsageDescription` | SilverFox listens to your voice commands. |
| `NSSpeechRecognitionUsageDescription` | SilverFox turns what you say into text so it can understand you. |
| `NSRemindersFullAccessUsageDescription` | SilverFox creates reminders for you. |
| `NSCalendarsFullAccessUsageDescription` | SilverFox reads and adds calendar events for you. |

## To let SilverFox open other apps / Shortcuts

`UIApplication.open` to common schemes (`sms:`, `tel:`, `https:`, `mailto:`,
`shortcuts:`) works without extra config. If you add tools that query whether a
specific third-party app is installed (`canOpenURL`), list those schemes under
`LSApplicationQueriesSchemes`.

## Raw Info.plist snippet

```xml
<key>NSMicrophoneUsageDescription</key>
<string>SilverFox listens to your voice commands.</string>
<key>NSSpeechRecognitionUsageDescription</key>
<string>SilverFox turns what you say into text so it can understand you.</string>
<key>NSRemindersFullAccessUsageDescription</key>
<string>SilverFox creates reminders for you.</string>
<key>NSCalendarsFullAccessUsageDescription</key>
<string>SilverFox reads and adds calendar events for you.</string>
```
