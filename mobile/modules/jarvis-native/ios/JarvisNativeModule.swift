import ExpoModulesCore
import AVFoundation
import EventKit
import UIKit

/// JARVIS native actions on iOS, within Apple's public APIs. Anything iOS does
/// not permit from an app (e.g. system alarms, launching the Camera app, driving
/// other apps) rejects with code `UNSUPPORTED`, and the JS layer suggests a
/// Siri Shortcut instead — never a fake success.
public class JarvisNativeModule: Module {
  private let eventStore = EKEventStore()

  public func definition() -> ModuleDefinition {
    Name("JarvisNative")

    AsyncFunction("getBattery") { () -> [String: Any] in
      UIDevice.current.isBatteryMonitoringEnabled = true
      let level = UIDevice.current.batteryLevel // -1 if unknown
      let state = UIDevice.current.batteryState
      let charging = (state == .charging || state == .full)
      return ["level": Int((level < 0 ? 0 : level) * 100), "charging": charging]
    }

    AsyncFunction("setTorch") { (on: Bool) -> Bool in
      guard let device = AVCaptureDevice.default(for: .video), device.hasTorch else {
        throw Exception(name: "UNSUPPORTED", description: "No torch on this device")
      }
      try device.lockForConfiguration()
      device.torchMode = on ? .on : .off
      device.unlockForConfiguration()
      return on
    }

    // iOS gives apps no public API to open the Camera app or set a system alarm.
    AsyncFunction("launchCamera") { () -> Bool in
      throw Exception(name: "UNSUPPORTED", description: "Use a Siri Shortcut to open the Camera on iOS")
    }

    AsyncFunction("setAlarm") { (_ hour: Int, _ minute: Int, _ label: String) -> Bool in
      throw Exception(name: "UNSUPPORTED", description: "iOS has no public alarm API; use a Clock Shortcut")
    }

    AsyncFunction("addReminder") { (title: String, dueISO: String?, promise: Promise) in
      self.requestReminderAccess { granted in
        guard granted else {
          promise.reject("DENIED", "Reminders access was not granted")
          return
        }
        let reminder = EKReminder(eventStore: self.eventStore)
        reminder.title = title
        reminder.calendar = self.eventStore.defaultCalendarForNewReminders()
        if let dueISO, let date = ISO8601DateFormatter().date(from: dueISO) {
          reminder.dueDateComponents = Calendar.current.dateComponents(
            [.year, .month, .day, .hour, .minute], from: date)
          reminder.addAlarm(EKAlarm(absoluteDate: date))
        }
        do {
          try self.eventStore.save(reminder, commit: true)
          promise.resolve(true)
        } catch {
          promise.reject("SAVE_FAILED", error.localizedDescription)
        }
      }
    }

    AsyncFunction("openApp") { (target: String, promise: Promise) in
      guard let url = URL(string: target) else {
        promise.reject("BAD_URL", "Invalid URL or scheme")
        return
      }
      DispatchQueue.main.async {
        UIApplication.shared.open(url, options: [:]) { ok in promise.resolve(ok) }
      }
    }

    // iOS has no "foreground service"; background audio uses an AVAudioSession
    // background mode instead. Wake word is wired per docs/VOICE.md.
    AsyncFunction("startListeningService") { () -> Bool in
      throw Exception(name: "UNSUPPORTED", description: "iOS uses background audio mode, not a foreground service")
    }
    AsyncFunction("stopListeningService") { () -> Bool in true }
  }

  private func requestReminderAccess(_ completion: @escaping (Bool) -> Void) {
    if #available(iOS 17.0, *) {
      eventStore.requestFullAccessToReminders { granted, _ in completion(granted) }
    } else {
      eventStore.requestAccess(to: .reminder) { granted, _ in completion(granted) }
    }
  }
}
