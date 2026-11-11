import Foundation
import EventKit
import UIKit

/// The "hands" of Jarvis: the real iOS actions behind each tool.
/// Everything here stays inside Apple's sandbox — no driving of other apps.
@MainActor
final class DeviceActions {
    private let store = EKEventStore()

    private lazy var isoFull: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime]
        return f
    }()

    /// Parse an ISO string, tolerating a value without a timezone (treated as local).
    private func parse(_ iso: String?) -> Date? {
        guard let iso else { return nil }
        if let d = isoFull.date(from: iso) { return d }
        let local = DateFormatter()
        local.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
        local.timeZone = .current
        return local.date(from: iso) ?? {
            local.dateFormat = "yyyy-MM-dd'T'HH:mm"
            return local.date(from: iso)
        }()
    }

    // MARK: Reminders

    func createReminder(title: String, dueISO: String?) async throws -> String {
        try await requestAccess(.reminder)
        let reminder = EKReminder(eventStore: store)
        reminder.title = title
        reminder.calendar = store.defaultCalendarForNewReminders()
        if let due = parse(dueISO) {
            reminder.dueDateComponents = Calendar.current.dateComponents(
                [.year, .month, .day, .hour, .minute], from: due)
            let alarm = EKAlarm(absoluteDate: due)
            reminder.addAlarm(alarm)
        }
        try store.save(reminder, commit: true)
        return "Reminder created: \"\(title)\"."
    }

    // MARK: Calendar

    func createEvent(title: String, startISO: String, endISO: String?) async throws -> String {
        try await requestAccess(.event)
        guard let start = parse(startISO) else { return "Could not understand the start time." }
        let event = EKEvent(eventStore: store)
        event.title = title
        event.startDate = start
        event.endDate = parse(endISO) ?? start.addingTimeInterval(3600)
        event.calendar = store.defaultCalendarForNewEvents
        try store.save(event, span: .thisEvent, commit: true)
        let when = DateFormatter.localizedString(from: start, dateStyle: .medium, timeStyle: .short)
        return "Event \"\(title)\" added for \(when)."
    }

    func listTodayEvents() async throws -> String {
        try await requestAccess(.event)
        let cal = Calendar.current
        let start = cal.startOfDay(for: Date())
        let end = cal.date(byAdding: .day, value: 1, to: start)!
        let predicate = store.predicateForEvents(withStart: start, end: end, calendars: nil)
        let events = store.events(matching: predicate).sorted { $0.startDate < $1.startDate }
        if events.isEmpty { return "Nothing on the calendar today." }
        return events.map { e in
            let t = DateFormatter.localizedString(from: e.startDate, dateStyle: .none, timeStyle: .short)
            return "\(t): \(e.title ?? "Untitled")"
        }.joined(separator: "; ")
    }

    // MARK: URLs / calls / shortcuts / messages

    @discardableResult
    func openURL(_ string: String) -> String {
        guard let url = URL(string: string) else { return "Invalid URL." }
        UIApplication.shared.open(url)
        return "Opening \(string)."
    }

    func runShortcut(name: String, input: String?) -> String {
        var comps = URLComponents(string: "shortcuts://run-shortcut")!
        var items = [URLQueryItem(name: "name", value: name)]
        if let input, !input.isEmpty { items.append(URLQueryItem(name: "input", value: input)) }
        comps.queryItems = items
        guard let url = comps.url else { return "Could not build the Shortcut URL." }
        UIApplication.shared.open(url)
        return "Running Shortcut \"\(name)\"."
    }

    func composeMessage(recipient: String?, body: String) -> String {
        // Uses the sms: scheme to pre-fill Messages. The user taps Send.
        var comps = URLComponents()
        comps.scheme = "sms"
        comps.path = recipient ?? ""
        comps.queryItems = [URLQueryItem(name: "body", value: body)]
        guard let url = comps.url else { return "Could not build the message." }
        UIApplication.shared.open(url)
        return "Opened a message\(recipient.map { " to \($0)" } ?? "") — tap Send to deliver it."
    }

    // MARK: Permissions

    private enum Entity { case event, reminder }

    private func requestAccess(_ entity: Entity) async throws {
        let type: EKEntityType = (entity == .event) ? .event : .reminder
        if #available(iOS 17.0, *) {
            let granted: Bool
            switch entity {
            case .event:    granted = try await store.requestFullAccessToEvents()
            case .reminder: granted = try await store.requestFullAccessToReminders()
            }
            if !granted { throw NSError(domain: "Jarvis", code: 1,
                userInfo: [NSLocalizedDescriptionKey: "Access was not granted. Enable it in Settings > Privacy."]) }
        } else {
            let granted = try await store.requestAccess(to: type)
            if !granted { throw NSError(domain: "Jarvis", code: 1,
                userInfo: [NSLocalizedDescriptionKey: "Access was not granted."]) }
        }
    }
}
