import { Compass, House, Settings, Target } from 'lucide-react-native';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { BRAND_HEX } from '@/lib/content';

export default function TabLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: BRAND_HEX.background },
          headerTintColor: BRAND_HEX.foreground,
          headerTitleStyle: { color: BRAND_HEX.foreground, fontWeight: '600' },
          headerShadowVisible: false,
          sceneStyle: { backgroundColor: BRAND_HEX.background },
          tabBarStyle: {
            backgroundColor: BRAND_HEX.surface,
            borderTopColor: BRAND_HEX.border,
          },
          tabBarActiveTintColor: BRAND_HEX.lavender,
          tabBarInactiveTintColor: BRAND_HEX.muted,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Today',
            headerShown: false,
            tabBarIcon: ({ color, size }) => <House color={color} size={size ?? 24} />,
          }}
        />
        <Tabs.Screen
          name="align"
          options={{
            title: 'Align',
            tabBarIcon: ({ color, size }) => <Compass color={color} size={size ?? 24} />,
          }}
        />
        <Tabs.Screen
          name="goals"
          options={{
            title: 'Goals',
            tabBarIcon: ({ color, size }) => <Target color={color} size={size ?? 24} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => <Settings color={color} size={size ?? 24} />,
          }}
        />
      </Tabs>
    </>
  );
}
