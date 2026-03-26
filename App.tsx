/**
 * EA Connect — Main Application Entry
 *
 * Navigation architecture:
 *   Stack (root)
 *     └─ "Inbox"       → MainTabs (bottom tab navigator)
 *     │    ├─ Chat      → InboxScreen
 *     │    └─ Showdowns → ShowdownsInboxScreen
 *     └─ ChatThread     → slide_from_right (contains Showdown widgets)
 */

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { InboxScreen } from './src/screens/InboxScreen';
import { ChatThreadScreen } from './src/screens/ChatThreadScreen';
import { ShowdownsInboxScreen } from './src/screens/ShowdownsInboxScreen';
import { toastConfig } from './src/components/ToastConfig';
import { colors } from './src/utils/theme';
import { RootStackParamList } from './src/types/navigation';
import { MainTabParamList } from './src/types/tabNavigation';
import { chatTimeline } from './src/data/eadpMock';
import { MONO_FONT } from './src/types/showdown';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const initialPendingCount = chatTimeline.filter(
  (i) => i.type === 'showdown_bounty' && i.bounty.status === 'pending',
).length;

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#111118',
          borderTopWidth: 1,
          borderTopColor: 'rgba(0,118,255,0.15)',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#0076FF',
        tabBarInactiveTintColor: '#55556A',
        tabBarLabelStyle: {
          fontFamily: MONO_FONT,
          fontSize: 9,
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: 1.35,
        },
      }}
    >
      <Tab.Screen
        name="Chat"
        component={InboxScreen}
        options={{
          tabBarLabel: 'CHAT',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 18, color, fontWeight: '700' }}>◉</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Showdowns"
        component={ShowdownsInboxScreen}
        options={{
          tabBarLabel: 'SHOWDOWNS',
          tabBarIcon: ({ color }) => (
            <View>
              <Text style={{ fontSize: 18 }}>⚡</Text>
              {initialPendingCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: -6,
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#FF3B5C',
                  }}
                />
              )}
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <View style={styles.container}>
          <StatusBar style="light" />
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.backgroundPrimary },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="Inbox" component={MainTabs} />
            <Stack.Screen name="ChatThread" component={ChatThreadScreen} />
          </Stack.Navigator>
          <Toast config={toastConfig} />
        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
});
