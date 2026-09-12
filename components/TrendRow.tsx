import { View } from 'react-native';
import { Typography } from 'heroui-native';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react-native';

import { trendIsPositive, type Trend } from '@/lib/capacity';
import { BRAND_HEX } from '@/lib/content';

function formatValue(value: number | null, unit: string): string {
  if (value == null) return '—';
  const rounded = Math.round(value * 10) / 10;
  return `${rounded}${unit}`;
}

export function TrendRow({ trend }: { trend: Trend }) {
  const positive = trendIsPositive(trend);
  const color = positive == null ? BRAND_HEX.muted : positive ? '#4f9a6f' : BRAND_HEX.blushDeep;

  const Icon =
    trend.direction === 'up' ? ArrowUpRight : trend.direction === 'down' ? ArrowDownRight : Minus;

  return (
    <View className="flex-row items-center gap-3 py-2.5">
      <View className="flex-1 gap-0.5">
        <Typography className="text-foreground text-sm font-medium">{trend.label}</Typography>
        <Typography className="text-muted text-xs">
          {trend.previous == null
            ? 'No earlier week to compare yet'
            : `Previous week ${formatValue(trend.previous, trend.unit)}`}
        </Typography>
      </View>
      <Typography className="text-foreground text-base font-semibold">
        {formatValue(trend.current, trend.unit)}
      </Typography>
      <Icon size={18} color={color} />
    </View>
  );
}
