import { Pressable, View } from 'react-native';
import { Typography } from 'heroui-native';

import { cn } from '@/lib/utils';

type ScaleFieldProps = {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
  low?: string;
  high?: string;
  className?: string;
};

/** 1-10 self-report scale used across onboarding and daily check-ins. */
export function ScaleField({ label, value, onChange, low, high, className }: ScaleFieldProps) {
  return (
    <View className={cn('gap-2', className)}>
      <View className="flex-row items-center justify-between">
        <Typography className="text-foreground text-base font-medium">{label}</Typography>
        <Typography className="text-accent text-sm font-semibold">
          {value == null ? '—' : `${value}/10`}
        </Typography>
      </View>

      <View className="flex-row gap-1">
        {Array.from({ length: 10 }, (_, index) => index + 1).map((step) => {
          const selected = value != null && step <= value;
          const isCurrent = value === step;
          return (
            <Pressable
              key={step}
              accessibilityRole="button"
              accessibilityLabel={`${label} ${step} out of 10`}
              onPress={() => onChange(step)}
              className={cn(
                'h-10 flex-1 items-center justify-center rounded-lg border',
                selected ? 'border-accent bg-accent-soft' : 'border-border bg-surface',
                isCurrent && 'border-2',
              )}
            >
              <Typography
                className={cn(
                  'text-xs',
                  isCurrent ? 'text-accent font-bold' : selected ? 'text-accent' : 'text-muted',
                )}
              >
                {step}
              </Typography>
            </Pressable>
          );
        })}
      </View>

      {(low || high) && (
        <View className="flex-row justify-between">
          <Typography className="text-muted text-xs">{low}</Typography>
          <Typography className="text-muted text-xs">{high}</Typography>
        </View>
      )}
    </View>
  );
}
