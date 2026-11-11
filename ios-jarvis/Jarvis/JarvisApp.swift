import SwiftUI

@main
struct JarvisApp: App {
    @StateObject private var assistant = Assistant()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(assistant)
        }
    }
}
