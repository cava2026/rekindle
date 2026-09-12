import { Pressable, View } from 'react-native';
import { Typography } from 'heroui-native';
import { LifeBuoy } from 'lucide-react-native';

import { BRAND_HEX } from '@/lib/content';
import { cn } from '@/lib/utils';

/** The RESET entry point. Deliberately the loudest element on the dashboard. */
export function SosButton({ onPress, className }: { onPress: () => void; className?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="I am overwhelmed, start a Buddy Reset"
      onPress={onPress}
      className={cn(
        'bg-lavender flex-row items-center gap-4 rounded-3xl px-5 py-5 active:opacity-90',
        className,
      )}
      style={{
        shadowColor: BRAND_HEX.lavenderDeep,
        shadowOpacity: 0.28,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        elevation: 4,
      }}
    >
      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
        <LifeBuoy size={26} color="#ffffff" />
      </View>
      <View className="flex-1 gap-0.5">
        <Typography className="text-lg font-bold tracking-wide text-white">
          I&apos;M OVERWHELMED
        </Typography>
        <Typography className="text-xs leading-4 text-white/85">
          Start a Buddy Reset. Empty your head, then get one small next step.
        </Typography>
      </View>
    </Pressable>
  );
}
