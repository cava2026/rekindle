import { View } from 'react-native';
import { Button, Typography } from 'heroui-native';
import { Check, ChevronRight, SkipForward } from 'lucide-react-native';

import { BRAND_HEX } from '@/lib/content';
import { cn } from '@/lib/utils';
import type { GoalAction, GoalActionLog } from '@/lib/types';

type Props = {
  action: GoalAction;
  parentTitle?: string;
  status?: GoalActionLog['status'] | null;
  onStatusChange: (status: GoalActionLog['status'] | null) => void;
  onOpen?: () => void;
};

export function GoalActionRow({ action, parentTitle, status, onStatusChange, onOpen }: Props) {
  return (
    <View className="border-border bg-surface gap-2 rounded-2xl border px-3 py-3">
      <View className="flex-row items-center gap-2">
        <View className="flex-1 gap-0.5">
          <Typography
            className={cn(
              'text-foreground text-sm font-semibold',
              status === 'completed' && 'text-muted line-through',
            )}
          >
            {action.title}
          </Typography>
          {parentTitle ? (
            <Typography className="text-muted text-xs">For {parentTitle}</Typography>
          ) : null}
        </View>
        {onOpen ? (
          <Button isIconOnly size="sm" variant="ghost" accessibilityLabel="Open goal" onPress={onOpen}>
            <Button.Label>
              <ChevronRight size={17} color={BRAND_HEX.muted} />
            </Button.Label>
          </Button>
        ) : null}
      </View>

      <View className="flex-row gap-2">
        <Button
          size="sm"
          className="flex-1"
          variant={status === 'completed' ? 'primary' : 'secondary'}
          onPress={() => onStatusChange(status === 'completed' ? null : 'completed')}
        >
          <Button.Label className="flex-row items-center gap-1.5">
            <Check size={14} color={status === 'completed' ? BRAND_HEX.surface : BRAND_HEX.lavender} />
            {status === 'completed' ? 'Completed' : 'Done'}
          </Button.Label>
        </Button>
        <Button
          size="sm"
          className="flex-1"
          variant={status === 'skipped' ? 'secondary' : 'ghost'}
          onPress={() => onStatusChange(status === 'skipped' ? null : 'skipped')}
        >
          <Button.Label className="flex-row items-center gap-1.5">
            <SkipForward size={14} color={BRAND_HEX.muted} />
            {status === 'skipped' ? 'Skipped' : 'Skip today'}
          </Button.Label>
        </Button>
      </View>
    </View>
  );
}
