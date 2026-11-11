import Foundation
import SwiftUI

/// App configuration.
///
/// The Claude API key is stored on-device with @AppStorage (UserDefaults).
/// This is fine for a PERSONAL app you build and run on your own phone.
/// Do NOT ship this to the App Store with a hardcoded key — route calls
/// through your own backend instead so the key never lives on the device.
enum Config {
    /// Pick a current model id from https://docs.anthropic.com/en/docs/about-claude/models
    /// Update this string whenever a newer model ships.
    static let model = "claude-sonnet-4-5"

    static let apiURL = URL(string: "https://api.anthropic.com/v1/messages")!
    static let anthropicVersion = "2023-06-01"
    static let maxTokens = 1024

    /// The assistant's personality / instructions.
    static let systemPrompt = """
    You are SilverFox, the SilverFoxNS voice assistant running on the user's iPhone.
    You help by using the tools available to you to act on the device.
    Keep spoken replies short and natural — one or two sentences — since they are read aloud.
    When the user asks you to do something, use a tool rather than just describing it.
    If a request needs an app or capability you don't have a tool for, suggest they
    create a Siri Shortcut and tell them you can run it by name with the run_shortcut tool.
    Never claim you did something you did not actually do with a tool.
    """
}

/// Simple on-device storage for the API key.
final class Secrets: ObservableObject {
    @AppStorage("claude_api_key") var apiKey: String = ""
    var hasKey: Bool { !apiKey.trimmingCharacters(in: .whitespaces).isEmpty }
}
