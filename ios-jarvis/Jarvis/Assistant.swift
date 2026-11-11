import Foundation
import SwiftUI

/// A line in the on-screen conversation log.
struct ChatLine: Identifiable {
    let id = UUID()
    let role: String   // "you" | "jarvis"
    let text: String
}

/// Top-level view model: owns the conversation, the speech engine, and wires
/// user turns through Claude (with tools) and back out as speech.
@MainActor
final class Assistant: ObservableObject {
    @Published var lines: [ChatLine] = []
    @Published var isThinking = false

    let speech = SpeechManager()
    let secrets = Secrets()

    private let actions = DeviceActions()
    private lazy var tools = ToolBox(actions: actions)
    private var history: [AnthropicMessage] = []

    /// Send a typed or spoken user turn.
    func send(_ text: String) async {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        lines.append(ChatLine(role: "you", text: trimmed))
        history.append(AnthropicMessage(role: "user", content: [.text(trimmed)]))

        guard secrets.hasKey else {
            reply("Set your Claude API key in Settings first.")
            return
        }

        isThinking = true
        defer { isThinking = false }

        do {
            let client = ClaudeClient(apiKey: secrets.apiKey)
            let (answer, newHistory) = try await client.run(messages: history, tools: tools)
            history = newHistory
            reply(answer)
        } catch {
            reply("Something went wrong: \(error.localizedDescription)")
        }
    }

    /// Push-to-talk: start/stop listening; on stop, send what was heard.
    func toggleListening() async {
        if speech.isListening {
            speech.stopListening()
            await send(speech.transcript)
        } else {
            guard await speech.requestPermission() else {
                reply("I need microphone and speech permission to listen.")
                return
            }
            do { try speech.startListening() }
            catch { reply("Couldn't start listening: \(error.localizedDescription)") }
        }
    }

    private func reply(_ text: String) {
        lines.append(ChatLine(role: "jarvis", text: text))
        speech.speak(text)
    }
}
