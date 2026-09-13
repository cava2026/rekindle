import { View } from 'react-native';
import { Typography } from 'heroui-native';
import { X } from 'lucide-react-native';

import { BRAND_HEX } from '@/lib/content';
import { cn } from '@/lib/utils';
import { GesturePressable } from '@/components/ui/primitives/GesturePressable';

export const RESET_STAGES = [
  { letter: 'B', name: 'Brain dump' },
  { letter: 'U', name: 'Unpack' },
  { letter: 'D', name: 'Decide' },
  { letter: 'D', name: 'Do' },
  { letter: 'Y', name: 'Your why' },
] as const;

type ResetStageHeaderProps = {
  stage: number;
  title: string;
  subtitle?: string;
  maxStage?: number;
  onStagePress?: (stage: number) => void;
  onClose?: () => void;
};

export function ResetStageHeader({
  stage,
  title,
  subtitle,
  maxStage = stage,
  onStagePress,
  onClose,
}: ResetStageHeaderProps) {
  return (
    <View className="pt-safe-offset-2 bg-background gap-4 px-5 pb-3">
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-row items-center gap-1.5">
          {RESET_STAGES.map((item, index) => {
            const enabled = Boolean(onStagePress) && index <= maxStage && index !== stage;
            return (
              <GesturePressable
                key={item.name}
                accessibilityRole="button"
                accessibilityLabel={`${item.letter}: ${item.name}`}
                accessibilityState={{ disabled: !enabled, selected: index === stage }}
                disabled={!enabled}
                onPress={() => onStagePress?.(index)}
                className={cn(
                  'h-10 w-10 items-center justify-center rounded-xl',
                  index === stage
                    ? 'bg-lavender'
                    : index <= maxStage
                      ? 'bg-lavender-soft'
                      : 'bg-background-tertiary',
                )}
              >
                <Typography
                  className={cn(
                    'text-base font-bold',
                    index === stage
                      ? 'text-white'
                      : index <= maxStage
                        ? 'text-lavender-deep'
                        : 'text-muted',
                  )}
                >
                  {item.letter}
                </Typography>
              </GesturePressable>
            );
          })}
        </View>

        {onClose ? (
          <GesturePressable
            accessibilityRole="button"
            accessibilityLabel="Close reset"
            onPress={onClose}
            className="bg-background-secondary h-9 w-9 items-center justify-center rounded-full"
          >
            <X size={18} color={BRAND_HEX.muted} />
          </GesturePressable>
        ) : null}
      </View>

      <View className="gap-1">
        <Typography className="text-lavender text-xs font-semibold tracking-wide uppercase">
          {RESET_STAGES[stage]?.name}
        </Typography>
        <Typography className="text-foreground text-2xl font-bold">{title}</Typography>
        {subtitle ? (
          <Typography className="text-muted text-sm leading-5">{subtitle}</Typography>
        ) : null}
      </View>
    </View>
  );
}
