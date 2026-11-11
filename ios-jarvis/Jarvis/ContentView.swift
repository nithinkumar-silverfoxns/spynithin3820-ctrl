import SwiftUI

struct ContentView: View {
    @EnvironmentObject var assistant: Assistant
    @State private var draft = ""
    @State private var showSettings = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                conversation
                inputBar
            }
            .navigationTitle("SilverFox")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button { showSettings = true } label: { Image(systemName: "gearshape") }
                }
            }
            .sheet(isPresented: $showSettings) { SettingsView().environmentObject(assistant) }
        }
    }

    private var conversation: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 12) {
                    ForEach(assistant.lines) { line in
                        bubble(line).id(line.id)
                    }
                    if assistant.isThinking {
                        HStack { ProgressView(); Text("Thinking…").foregroundStyle(.secondary) }
                    }
                }
                .padding()
            }
            .onChange(of: assistant.lines.count) {
                if let last = assistant.lines.last { withAnimation { proxy.scrollTo(last.id, anchor: .bottom) } }
            }
        }
    }

    private func bubble(_ line: ChatLine) -> some View {
        let mine = line.role == "you"
        return HStack {
            if mine { Spacer() }
            Text(line.text)
                .padding(10)
                .background(mine ? Color.accentColor.opacity(0.2) : Color.gray.opacity(0.15))
                .clipShape(RoundedRectangle(cornerRadius: 14))
                .frame(maxWidth: 280, alignment: mine ? .trailing : .leading)
            if !mine { Spacer() }
        }
    }

    private var inputBar: some View {
        HStack(spacing: 10) {
            TextField("Ask SilverFox…", text: $draft, axis: .vertical)
                .textFieldStyle(.roundedBorder)
                .onSubmit(sendDraft)

            Button(action: sendDraft) { Image(systemName: "arrow.up.circle.fill").font(.title2) }
                .disabled(draft.trimmingCharacters(in: .whitespaces).isEmpty)

            Button {
                Task { await assistant.toggleListening() }
            } label: {
                Image(systemName: assistant.speech.isListening ? "mic.fill" : "mic")
                    .font(.title2)
                    .foregroundStyle(assistant.speech.isListening ? .red : .accentColor)
            }
        }
        .padding()
    }

    private func sendDraft() {
        let text = draft
        draft = ""
        Task { await assistant.send(text) }
    }
}

struct SettingsView: View {
    @EnvironmentObject var assistant: Assistant
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Form {
                Section("Claude API Key") {
                    SecureField("sk-ant-…", text: assistant.secrets.$apiKey)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                    Text("Get a key at console.anthropic.com. Stored only on this device.")
                        .font(.caption).foregroundStyle(.secondary)
                }
            }
            .navigationTitle("Settings")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) { Button("Done") { dismiss() } }
            }
        }
    }
}
