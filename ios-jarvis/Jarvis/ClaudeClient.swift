import Foundation

// MARK: - Wire types for the Anthropic Messages API

struct AnthropicRequest: Encodable {
    let model: String
    let max_tokens: Int
    let system: String
    var messages: [AnthropicMessage]
    let tools: [ToolSpec]
}

struct AnthropicMessage: Codable {
    let role: String            // "user" | "assistant"
    let content: [ContentBlock]
}

/// A content block. The API mixes text, tool_use (assistant) and tool_result (user)
/// blocks, so this is a small tagged union that encodes/decodes all of them.
struct ContentBlock: Codable {
    let type: String
    // text
    var text: String?
    // tool_use
    var id: String?
    var name: String?
    var input: JSONValue?
    // tool_result
    var tool_use_id: String?
    var content: String?

    static func text(_ s: String) -> ContentBlock {
        ContentBlock(type: "text", text: s, id: nil, name: nil, input: nil, tool_use_id: nil, content: nil)
    }
    static func toolResult(id: String, result: String) -> ContentBlock {
        ContentBlock(type: "tool_result", text: nil, id: nil, name: nil, input: nil, tool_use_id: id, content: result)
    }
}

struct AnthropicResponse: Decodable {
    let content: [ContentBlock]
    let stop_reason: String?
}

// MARK: - Client

enum ClaudeError: LocalizedError {
    case noKey
    case http(Int, String)
    var errorDescription: String? {
        switch self {
        case .noKey: return "No Claude API key set. Add it in Settings."
        case .http(let code, let body): return "API error \(code): \(body)"
        }
    }
}

struct ClaudeClient {
    let apiKey: String

    /// Runs a full tool-use loop: send the conversation, and while Claude asks to
    /// use tools, execute them and send the results back, until it produces a final
    /// text reply. Returns the spoken text and the updated message history.
    func run(messages: [AnthropicMessage], tools: ToolBox) async throws -> (reply: String, history: [AnthropicMessage]) {
        guard !apiKey.isEmpty else { throw ClaudeError.noKey }
        var history = messages

        // Guard against runaway loops.
        for _ in 0..<6 {
            let response = try await send(history: history, tools: tools.specs)
            history.append(AnthropicMessage(role: "assistant", content: response.content))

            if response.stop_reason == "tool_use" {
                var results: [ContentBlock] = []
                for block in response.content where block.type == "tool_use" {
                    let output = await tools.execute(name: block.name ?? "", input: block.input)
                    results.append(.toolResult(id: block.id ?? "", result: output))
                }
                history.append(AnthropicMessage(role: "user", content: results))
                continue // loop back with tool results
            }

            // Final answer: collect text blocks.
            let text = response.content.compactMap { $0.text }.joined(separator: " ")
            return (text.isEmpty ? "Done." : text, history)
        }
        return ("I got stuck in a loop handling that — try rephrasing?", history)
    }

    private func send(history: [AnthropicMessage], tools: [ToolSpec]) async throws -> AnthropicResponse {
        var req = URLRequest(url: Config.apiURL)
        req.httpMethod = "POST"
        req.setValue(apiKey, forHTTPHeaderField: "x-api-key")
        req.setValue(Config.anthropicVersion, forHTTPHeaderField: "anthropic-version")
        req.setValue("application/json", forHTTPHeaderField: "content-type")

        let body = AnthropicRequest(
            model: Config.model,
            max_tokens: Config.maxTokens,
            system: Config.systemPrompt,
            messages: history,
            tools: tools
        )
        req.httpBody = try JSONEncoder().encode(body)

        let (data, resp) = try await URLSession.shared.data(for: req)
        if let http = resp as? HTTPURLResponse, !(200...299).contains(http.statusCode) {
            throw ClaudeError.http(http.statusCode, String(data: data, encoding: .utf8) ?? "")
        }
        return try JSONDecoder().decode(AnthropicResponse.self, from: data)
    }
}
