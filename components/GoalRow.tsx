import { Pressable, View } from 'react-native';
import { Typography } from 'heroui-native';
import { Check } from 'lucide-react-native';

import { cn } from '@/lib/utils';
import type { Goal } from '@/lib/types';

type GoalRowProps = {
  goal: Goal;
  done: boolean;
  onToggle: () => void;
  /** Days logged in the tracked window, used for the progress line. */
  loggedDays?: number;
  windowDays?: number;
  right?: React.ReactNode;
};

export function GoalRow({
  goal,
  done,
  onToggle,
  loggedDays,
  windowDays = 14,
  right,
}: GoalRowProps) {
  const percent =
    loggedDays == null ? null : Math.min(100, Math.round((loggedDays / windowDays) * 100));

  return (
    <View className="border-border bg-surface flex-row items-center gap-3 rounded-2xl border px-3 py-3">
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={`Mark ${goal.title} as done today`}
        onPress={onToggle}
        className={cn(
          'h-9 w-9 items-center justify-center rounded-full border',
          done ? 'border-lavender bg-lavender' : 'border-border bg-background-secondary',
        )}
      >
        {done ? <Check size={18} color="#ffffff" /> : null}
      </Pressable>

      <View className="flex-1 gap-1">
        <Typography
          className={cn(
            'text-sm font-medium',
            done ? 'text-muted line-through' : 'text-foreground',
          )}
        >
          {goal.title}
        </Typography>
        {percent == null ? (
          goal.category ? (
            <Typography className="text-muted text-xs">{goal.category}</Typography>
          ) : null
        ) : (
          <View className="gap-1">
            <View className="bg-background-tertiary h-1.5 overflow-hidden rounded-full">
              <View className="bg-lavender h-full rounded-full" style={{ width: `${percent}%` }} />
            </View>
            <Typography className="text-muted text-xs">
              {loggedDays} of the last {windowDays} days
            </Typography>
          </View>
        )}
      </View>

      {right}
    </View>
  );
}
