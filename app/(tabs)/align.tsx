import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Separator, Spinner, Typography } from 'heroui-native';
import { CalendarClock, HeartPulse, Sparkles } from 'lucide-react-native';
import { format } from 'date-fns';

import { CapacityMeter } from '@/components/CapacityMeter';
import { DisclaimerNote } from '@/components/DisclaimerNote';
import { SectionCard } from '@/components/SectionCard';
import { TrendRow } from '@/components/TrendRow';
import { belowAverageSleepStreak, buildTrends, capacityScore } from '@/lib/capacity';
import { BRAND_HEX, COACH_UNAVAILABLE_MESSAGE } from '@/lib/content';
import {
  useBaseline,
  useCheckins,
  useGenerateInsights,
  useGoalLogs,
  useGoals,
  useInsights,
} from '@/lib/queries';

export default function AlignScreen() {
  const checkins = useCheckins(30);
  const goals = useGoals();
  const goalLogs = useGoalLogs(14);
  const baseline = useBaseline();
  const insights = useInsights();
  const generate = useGenerateInsights();
  const [error, setError] = useState<string | null>(null);

  const reading = useMemo(
    () => capacityScore(checkins.data ?? [], goalLogs.data ?? [], goals.data?.length ?? 0),
    [checkins.data, goalLogs.data, goals.data?.length],
  );
  const trends = useMemo(() => buildTrends(checkins.data ?? []), [checkins.data]);
  const sleepStreak = useMemo(() => belowAverageSleepStreak(checkins.data ?? []), [checkins.data]);

  const enoughData = (checkins.data?.length ?? 0) >= 3;

  const handleGenerate = async () => {
    setError(null);
    try {
      await generate.mutateAsync({
        checkins: checkins.data ?? [],
        baseline: baseline.data ?? null,
        goals: goals.data ?? [],
        goalLogs: goalLogs.data ?? [],
      });
    } catch {
      setError(COACH_UNAVAILABLE_MESSAGE);
    }
  };

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="gap-4 px-4 pb-10 pt-4"
      showsVerticalScrollIndicator={false}
    >
      <SectionCard>
        <CapacityMeter reading={reading} />
      </SectionCard>

      <SectionCard
        title="Recent patterns"
        subtitle="Last seven days of your check-ins, next to the seven before them."
      >
        {enoughData ? (
          <View>
            {trends.map((trend, index) => (
              <View key={trend.label}>
                {index > 0 ? <Separator /> : null}
                <TrendRow trend={trend} />
              </View>
            ))}
          </View>
        ) : (
          <Typography className="text-muted text-sm leading-5">
            A few more check-ins and Buddy can show how this week compares with the last one.
          </Typography>
        )}

        {sleepStreak && sleepStreak.streak >= 2 ? (
          <View className="bg-blush-soft mt-3 rounded-2xl p-3">
            <Typography className="text-foreground text-sm leading-5">
              Your reported sleep has been below your own average of {sleepStreak.average} hours for{' '}
              {sleepStreak.streak} nights in a row. Worth protecting an earlier evening if you can.
            </Typography>
          </View>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Observations from Buddy"
        subtitle="Informational patterns from what you have logged, not an assessment."
        right={
          <Button
            size="sm"
            variant="secondary"
            isDisabled={!enoughData || generate.isPending}
            onPress={() => void handleGenerate()}
          >
            <Button.Label className="flex-row items-center gap-1.5">
              {generate.isPending ? <Spinner size="sm" /> : null}
              Refresh
            </Button.Label>
          </Button>
        }
      >
        {error ? <Typography className="text-danger mb-2 text-xs">{error}</Typography> : null}

        {(insights.data?.length ?? 0) === 0 ? (
          <View className="bg-background-secondary flex-row items-start gap-3 rounded-2xl p-3">
            <Sparkles size={18} color={BRAND_HEX.lavender} />
            <Typography className="text-muted flex-1 text-sm leading-5">
              {enoughData
                ? 'Tap refresh and Buddy will look over your recent check-ins and goals.'
                : 'Check in for about three days, then Buddy has enough to work with.'}
            </Typography>
          </View>
        ) : (
          <View className="gap-3">
            {(insights.data ?? []).map((insight) => (
              <View key={insight.id} className="bg-background-secondary gap-1.5 rounded-2xl p-3">
                <View className="flex-row items-center justify-between gap-2">
                  <Typography className="text-foreground flex-1 text-sm font-semibold">
                    {insight.title}
                  </Typography>
                  <Typography className="text-muted text-[11px]">
                    {format(new Date(insight.created_at), 'd MMM')}
                  </Typography>
                </View>
                <Typography className="text-muted text-sm leading-5">{insight.body}</Typography>
                {insight.action ? (
                  <Typography className="text-lavender-deep text-sm leading-5">
                    {insight.action}
                  </Typography>
                ) : null}
              </View>
            ))}
          </View>
        )}
      </SectionCard>

      <SectionCard
        title="Bring in more context"
        subtitle="Optional connections you can turn on later. Everything today is entered by you."
      >
        <View className="gap-2">
          <View className="border-border bg-surface flex-row items-center gap-3 rounded-2xl border p-3">
            <HeartPulse size={18} color={BRAND_HEX.lavender} />
            <View className="flex-1">
              <Typography className="text-foreground text-sm font-medium">
                Apple Health & Fitness
              </Typography>
              <Typography className="text-muted text-xs">
                Sleep, activity and heart data. Opt in when it arrives.
              </Typography>
            </View>
          </View>
          <View className="border-border bg-surface flex-row items-center gap-3 rounded-2xl border p-3">
            <CalendarClock size={18} color={BRAND_HEX.lavender} />
            <View className="flex-1">
              <Typography className="text-foreground text-sm font-medium">Calendar</Typography>
              <Typography className="text-muted text-xs">
                Meeting load, work hours and travel. Opt in when it arrives.
              </Typography>
            </View>
          </View>
          <Button variant="ghost" size="sm" onPress={() => router.push('/(tabs)/settings')}>
            <Button.Label>Manage in settings</Button.Label>
          </Button>
        </View>
      </SectionCard>

      <DisclaimerNote />
    </ScrollView>
  );
}
