import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Text } from 'react-native';

import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../theme';

import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { LockScreen } from '../screens/LockScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { VoiceScreen } from '../screens/VoiceScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { DeviceControlScreen } from '../screens/DeviceControlScreen';
import { SecurityScreen } from '../screens/SecurityScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ApiConfigScreen } from '../screens/ApiConfigScreen';

export type RootStackParamList = {
  Tabs: undefined;
  Settings: undefined;
  ApiConfig: undefined;
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const tabIcon = (icon: string) => ({ color }: { color: string }) => (
  <Text style={{ fontSize: 20, color }}>{icon}</Text>
);

function MainTabs() {
  const { palette } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.textDim,
        tabBarStyle: { backgroundColor: palette.surface, borderTopColor: palette.border },
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarIcon: tabIcon('⬡') }} />
      <Tab.Screen name="Voice" component={VoiceScreen} options={{ tabBarIcon: tabIcon('🎙') }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarIcon: tabIcon('✦') }} />
      <Tab.Screen name="Devices" component={DeviceControlScreen} options={{ tabBarIcon: tabIcon('▣') }} />
      <Tab.Screen name="Security" component={SecurityScreen} options={{ tabBarIcon: tabIcon('🛡') }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { palette } = useTheme();
  const { loading, signedIn, unlocked } = useAuth();

  const navTheme = palette.mode === 'dark' ? DarkTheme : DefaultTheme;
  navTheme.colors.background = palette.bg;

  return (
    <NavigationContainer theme={navTheme}>
      {loading ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
        </Stack.Navigator>
      ) : !signedIn ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      ) : !unlocked ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Lock" component={LockScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: palette.bg },
            headerTintColor: palette.text,
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen name="Tabs" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="ApiConfig" component={ApiConfigScreen} options={{ title: 'API Configuration' }} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
