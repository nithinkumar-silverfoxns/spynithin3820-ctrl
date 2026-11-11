import SwiftUI

@main
struct SilverFoxApp: App {
    @StateObject private var assistant = Assistant()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(assistant)
        }
    }
}
