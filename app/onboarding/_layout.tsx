import { Stack } from 'expo-router';
import { useThemeColor } from 'heroui-native';

export default function OnboardingLayout() {
  const [background] = useThemeColor(['background']);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: background },
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="disclaimer" />
      <Stack.Screen name="about-you" />
      <Stack.Screen name="baseline" />
      <Stack.Screen name="goals" />
    </Stack>
  );
}
