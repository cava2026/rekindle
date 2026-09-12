import { useMemo } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { Link, router } from 'expo-router';
import { Button, Typography } from 'heroui-native';
import { ArrowRight, CalendarCheck, Sparkles } from 'lucide-react-native';
import { format } from 'date-fns';

import { CapacityMeter } from '@/components/CapacityMeter';
import { DisclaimerNote } from '@/components/DisclaimerNote';
import { GoalRow } from '@/components/GoalRow';
import { SectionCard } from '@/components/SectionCard';
import { SosButton } from '@/components/SosButton';
import { capacityScore } from '@/lib/capacity';
import { BRAND_HEX, CHECKIN_SCALES } from '@/lib/content';
import {
  todayKey,
  useCheckins,
  useGoalLogs,
  useGoals,
  useInsights,
  useProfile,
  useToggleGoalLog,
} from '@/lib/queries';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function TodayScreen() {
  const { data: profile } = useProfile();
  const checkins = useCheckins(30);
  const goals = useGoals();
  const goalLogs = useGoalLogs(14);
  const insights = useInsights();
  const toggleGoal = useToggleGoalLog();

  const today = todayKey();
  const todaysCheckin = useMemo(
    () => checkins.data?.find((checkin) => checkin.checkin_date === today) ?? null,
    [checkins.data, today],
  );

  const reading = useMemo(
    () => capacityScore(checkins.data ?? [], goalLogs.data ?? [], goals.data?.length ?? 0),
    [checkins.data, goalLogs.data, goals.data?.length],
  );

  const doneToday = useMemo(
    () =>
      new Set((goalLogs.data ?? []).filter((log) => log.log_date === today).map((l) => l.goal_id)),
    [goalLogs.data, today],
  );

  const latestInsight = insights.data?.[0] ?? null;
  const refreshing = checkins.isFetching || goals.isFetching || goalLogs.isFetching;

  const onRefresh = () => {
    void checkins.refetch();
    void goals.refetch();
    void goalLogs.refetch();
    void insights.refetch();
  };

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="gap-4 px-4 pb-10 pt-safe-offset-4"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={BRAND_HEX.lavender}
        />
      }
    >
      <View className="gap-1 px-1">
        <Typography className="text-muted text-xs font-medium tracking-wide uppercase">
          {format(new Date(), 'EEEE d MMMM')}
        </Typography>
        <Typography className="text-foreground text-3xl font-bold">
          {greeting()}
          {profile?.first_name ? `, ${profile.first_name}` : ''}
        </Typography>
      </View>

      <SosButton onPress={() => router.push('/reset/brain-dump')} />

      <SectionCard
        title="Today's check-in"
        subtitle={
          todaysCheckin
            ? 'Thanks for checking in today.'
            : 'Three taps, and Buddy has today covered.'
        }
        right={
          <Button size="sm" variant="secondary" onPress={() => router.push('/checkin')}>
            <Button.Label>{todaysCheckin ? 'Update' : 'Check in'}</Button.Label>
          </Button>
        }
      >
        {todaysCheckin ? (
          <View className="flex-row gap-2">
            {CHECKIN_SCALES.map((scale) => (
              <View
                key={scale.key}
                className="bg-background-secondary flex-1 items-center gap-1 rounded-2xl py-3"
              >
                <Typography className="text-foreground text-lg font-bold">
                  {todaysCheckin[scale.key]}
                </Typography>
                <Typography className="text-muted text-[11px]">{scale.label}</Typography>
              </View>
            ))}
          </View>
        ) : (
          <View className="bg-background-secondary flex-row items-center gap-3 rounded-2xl p-3">
            <CalendarCheck size={20} color={BRAND_HEX.lavender} />
            <Typography className="text-muted flex-1 text-sm">
              Log mood, energy and stress so Buddy can notice your patterns over time.
            </Typography>
          </View>
        )}
      </SectionCard>

      <SectionCard>
        <CapacityMeter reading={reading} />
        <Link href="/(tabs)/align" asChild>
          <Button variant="ghost" size="sm" className="mt-3 self-start">
            <Button.Label className="flex-row items-center gap-1.5">
              See what changed
              <ArrowRight size={15} color={BRAND_HEX.lavender} />
            </Button.Label>
          </Button>
        </Link>
      </SectionCard>

      {latestInsight ? (
        <SectionCard title="From Buddy" subtitle="Based on the check-ins you logged">
          <View className="gap-2">
            <View className="flex-row items-start gap-2">
              <Sparkles size={18} color={BRAND_HEX.lavender} />
              <Typography className="text-foreground flex-1 text-sm font-semibold">
                {latestInsight.title}
              </Typography>
            </View>
            <Typography className="text-muted text-sm leading-5">{latestInsight.body}</Typography>
            {latestInsight.action ? (
              <View className="bg-lavender-soft rounded-2xl p-3">
                <Typography className="text-lavender-deep text-sm leading-5">
                  {latestInsight.action}
                </Typography>
              </View>
            ) : null}
          </View>
        </SectionCard>
      ) : null}

      <SectionCard
        title="Your goals today"
        subtitle={
          (goals.data?.length ?? 0) === 0
            ? 'Add a goal to keep one thing in view.'
            : 'Tick what you managed. Skipping a day is allowed.'
        }
        right={
          <Link href="/(tabs)/goals" asChild>
            <Button size="sm" variant="ghost">
              <Button.Label>All goals</Button.Label>
            </Button>
          </Link>
        }
      >
        {(goals.data?.length ?? 0) === 0 ? (
          <Button variant="secondary" onPress={() => router.push('/goal-new')}>
            <Button.Label>Add your first goal</Button.Label>
          </Button>
        ) : (
          <View className="gap-2">
            {(goals.data ?? []).slice(0, 4).map((goal) => (
              <GoalRow
                key={goal.id}
                goal={goal}
                done={doneToday.has(goal.id)}
                onToggle={() =>
                  toggleGoal.mutate({ goalId: goal.id, done: !doneToday.has(goal.id) })
                }
              />
            ))}
          </View>
        )}
      </SectionCard>

      <Button variant="ghost" size="sm" onPress={() => router.push('/crisis')}>
        <Button.Label className="text-muted">Need urgent support right now?</Button.Label>
      </Button>

      <DisclaimerNote />
    </ScrollView>
  );
}
