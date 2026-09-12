import { View } from 'react-native';
import { Chip, Typography } from 'heroui-native';

import { cn } from '@/lib/utils';

type ChipSelectProps = {
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
  multiple?: boolean;
  label?: string;
  hint?: string;
  className?: string;
};

export function ChipSelect({
  options,
  selected,
  onChange,
  multiple = true,
  label,
  hint,
  className,
}: ChipSelectProps) {
  const toggle = (option: string) => {
    if (!multiple) {
      onChange(selected[0] === option ? [] : [option]);
      return;
    }
    onChange(
      selected.includes(option)
        ? selected.filter((item) => item !== option)
        : [...selected, option],
    );
  };

  return (
    <View className={cn('gap-3', className)}>
      {label && (
        <View className="gap-1">
          <Typography className="text-foreground text-base font-medium">{label}</Typography>
          {hint && <Typography className="text-muted text-xs">{hint}</Typography>}
        </View>
      )}
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <Chip
              key={option}
              onPress={() => toggle(option)}
              className={cn(
                'border',
                isSelected ? 'border-accent bg-accent-soft' : 'border-border bg-surface',
              )}
            >
              <Chip.Label
                className={cn(
                  'text-sm',
                  isSelected ? 'text-accent font-semibold' : 'text-foreground',
                )}
              >
                {option}
              </Chip.Label>
            </Chip>
          );
        })}
      </View>
    </View>
  );
}
