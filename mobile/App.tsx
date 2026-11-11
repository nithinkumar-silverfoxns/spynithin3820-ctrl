import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AssistantProvider } from './src/hooks/useAssistant';
import { AuthProvider } from './src/hooks/useAuth';
import { RootNavigator } from './src/navigation';
import { ThemeProvider } from './src/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AssistantProvider>
            <StatusBar style="auto" />
            <RootNavigator />
          </AssistantProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
