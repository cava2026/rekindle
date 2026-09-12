import { View } from 'react-native';
import { Typography } from 'heroui-native';

import { BAND_COPY } from '@/lib/content';
import { cn } from '@/lib/utils';
import type { CapacityReading } from '@/lib/types';

const SEGMENTS = [
  { band: 'recovery' as const, width: 'w-[45%]' },
  { band: 'overloaded' as const, width: 'w-[15%]' },
  { band: 'elevated' as const, width: 'w-[15%]' },
  { band: 'sustainable' as const, width: 'w-[25%]' },
];

export function CapacityMeter({ reading }: { reading: CapacityReading }) {
  const copy = BAND_COPY[reading.band];

  return (
    <View className="gap-3">
      <View className="flex-row items-end justify-between">
        <View className="gap-1">
          <Typography className="text-muted text-xs tracking-wide uppercase">
            Alignment & Capacity
          </Typography>
          <Typography className="text-foreground text-2xl font-bold">
            {reading.hasData ? copy.label : 'Not enough check-ins yet'}
          </Typography>
        </View>
        {reading.hasData && (
          <Typography className="text-accent text-3xl font-bold">{reading.score}</Typography>
        )}
      </View>

      <View className="gap-2">
        <View className="h-3 flex-row overflow-hidden rounded-full">
          {SEGMENTS.map((segment) => (
            <View
              key={segment.band}
              className={cn('h-full', segment.width, BAND_COPY[segment.band].colorClass)}
              style={{ opacity: reading.band === segment.band ? 1 : 0.28 }}
            />
          ))}
        </View>
        {reading.hasData && (
          <View className="h-4">
            <View
              className="border-surface bg-foreground absolute h-4 w-4 -translate-x-2 rounded-full border-2"
              style={{ left: `${Math.min(100, Math.max(0, reading.score))}%`, top: -12 }}
            />
          </View>
        )}
      </View>

      <Typography className="text-muted text-sm">
        {reading.hasData
          ? copy.description
          : 'Check in for a few days and Buddy can show how sustainable your reported pace looks.'}
      </Typography>

      {reading.hasData && reading.days < 4 && (
        <Typography className="text-muted text-xs">
          Based on {reading.days} {reading.days === 1 ? 'check-in' : 'check-ins'}, so the picture is
          still forming.
        </Typography>
      )}
    </View>
  );
}
