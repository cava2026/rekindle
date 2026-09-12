import { View } from 'react-native';
import { Typography } from 'heroui-native';

import { AI_DISCLAIMER, MEDICAL_DISCLAIMER } from '@/lib/content';
import { cn } from '@/lib/utils';

type DisclaimerNoteProps = {
  variant?: 'full' | 'short';
  className?: string;
};

export function DisclaimerNote({ variant = 'short', className }: DisclaimerNoteProps) {
  return (
    <View className={cn('bg-background-secondary rounded-2xl p-3', className)}>
      <Typography className="text-muted text-[11px] leading-4">
        {variant === 'full' ? MEDICAL_DISCLAIMER : AI_DISCLAIMER}
      </Typography>
    </View>
  );
}
