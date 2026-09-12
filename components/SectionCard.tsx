import { View } from 'react-native';
import { Surface, Typography } from 'heroui-native';

import { cn } from '@/lib/utils';

type SectionCardProps = {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function SectionCard({ title, subtitle, right, children, className }: SectionCardProps) {
  return (
    <Surface className={cn('border-border bg-surface rounded-3xl border p-4', className)}>
      {(title || right) && (
        <View className="mb-3 flex-row items-start justify-between gap-3">
          <View className="flex-1 gap-0.5">
            {title && (
              <Typography className="text-foreground text-base font-semibold">{title}</Typography>
            )}
            {subtitle && <Typography className="text-muted text-xs">{subtitle}</Typography>}
          </View>
          {right}
        </View>
      )}
      {children}
    </Surface>
  );
}
