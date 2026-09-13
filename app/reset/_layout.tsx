import { Stack } from 'expo-router';

import { BRAND_HEX } from '@/lib/content';

export default function ResetLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: BRAND_HEX.background },
      }}
    >
      <Stack.Screen name="brain-dump" />
      <Stack.Screen name="unpack" />
      <Stack.Screen name="decide" />
      <Stack.Screen name="do" />
      <Stack.Screen name="why" />
      <Stack.Screen name="summary" />
      <Stack.Screen name="history" />
      <Stack.Screen name="[sessionId]" />
    </Stack>
  );
}
