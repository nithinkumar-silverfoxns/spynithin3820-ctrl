import Foundation

// MARK: - Tool schema (Anthropic "tools" format)

struct ToolSpec: Encodable {
    let name: String
    let description: String
    let input_schema: InputSchema
}

struct InputSchema: Encodable {
    let type = "object"
    let properties: [String: Property]
    let required: [String]
}

struct Property: Encodable {
    let type: String
    let description: String
}

// MARK: - Tool registry + dispatch

/// Holds the tool specifications sent to Claude and routes tool calls to
/// the real device actions.
@MainActor
final class ToolBox {
    private let actions: DeviceActions
    init(actions: DeviceActions) { self.actions = actions }

    let specs: [ToolSpec] = [
        ToolSpec(
            name: "create_reminder",
            description: "Add a reminder to the user's Reminders app. Optionally with a due date/time.",
            input_schema: InputSchema(
                properties: [
                    "title": Property(type: "string", description: "What to be reminded about"),
                    "due": Property(type: "string", description: "Optional ISO 8601 date-time, e.g. 2026-11-12T15:00:00")
                ],
                required: ["title"])
        ),
        ToolSpec(
            name: "create_calendar_event",
            description: "Create an event in the user's Calendar.",
            input_schema: InputSchema(
                properties: [
                    "title": Property(type: "string", description: "Event title"),
                    "start": Property(type: "string", description: "ISO 8601 start, e.g. 2026-11-12T15:00:00"),
                    "end": Property(type: "string", description: "ISO 8601 end; defaults to one hour after start if omitted")
                ],
                required: ["title", "start"])
        ),
        ToolSpec(
            name: "list_today_events",
            description: "List the user's calendar events for today.",
            input_schema: InputSchema(properties: [:], required: [])
        ),
        ToolSpec(
            name: "open_url",
            description: "Open a URL, app deep link, tel: number, or mailto: link on the device. Use tel:+1555... to start a call.",
            input_schema: InputSchema(
                properties: ["url": Property(type: "string", description: "The URL or deep link to open")],
                required: ["url"])
        ),
        ToolSpec(
            name: "run_shortcut",
            description: "Run one of the user's Siri Shortcuts by its exact name. This is how to do anything not covered by another tool (smart home, music, settings, routines).",
            input_schema: InputSchema(
                properties: [
                    "name": Property(type: "string", description: "Exact name of the Shortcut"),
                    "input": Property(type: "string", description: "Optional text input to pass to the Shortcut")
                ],
                required: ["name"])
        ),
        ToolSpec(
            name: "compose_message",
            description: "Open the Messages composer pre-filled with a recipient and body. The user must tap Send (iOS does not allow silent sending).",
            input_schema: InputSchema(
                properties: [
                    "recipient": Property(type: "string", description: "Phone number or contact to text"),
                    "body": Property(type: "string", description: "Message text")
                ],
                required: ["body"])
        )
    ]

    /// Execute a tool call and return a short text result string for Claude.
    func execute(name: String, input: JSONValue?) async -> String {
        do {
            switch name {
            case "create_reminder":
                let title = input?.str("title") ?? "Reminder"
                return try await actions.createReminder(title: title, dueISO: input?.str("due"))
            case "create_calendar_event":
                guard let title = input?.str("title"), let start = input?.str("start") else {
                    return "Missing title or start time."
                }
                return try await actions.createEvent(title: title, startISO: start, endISO: input?.str("end"))
            case "list_today_events":
                return try await actions.listTodayEvents()
            case "open_url":
                return actions.openURL(input?.str("url") ?? "")
            case "run_shortcut":
                return actions.runShortcut(name: input?.str("name") ?? "", input: input?.str("input"))
            case "compose_message":
                return actions.composeMessage(recipient: input?.str("recipient"), body: input?.str("body") ?? "")
            default:
                return "Unknown tool: \(name)"
            }
        } catch {
            return "Failed: \(error.localizedDescription)"
        }
    }
}
