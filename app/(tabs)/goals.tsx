import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Typography } from 'heroui-native';
import { Plus, Trash2 } from 'lucide-react-native';

import { DisclaimerNote } from '@/components/DisclaimerNote';
import { GoalRow } from '@/components/GoalRow';
import { SectionCard } from '@/components/SectionCard';
import { BRAND_HEX } from '@/lib/content';
import { todayKey, useArchiveGoal, useGoalLogs, useGoals, useToggleGoalLog } from '@/lib/queries';

export default function GoalsScreen() {
  const goals = useGoals();
  const goalLogs = useGoalLogs(14);
  const toggleGoal = useToggleGoalLog();
  const archiveGoal = useArchiveGoal();
  const today = todayKey();

  const doneToday = useMemo(
    () =>
      new Set((goalLogs.data ?? []).filter((log) => log.log_date === today).map((l) => l.goal_id)),
    [goalLogs.data, today],
  );

  const countByGoal = useMemo(() => {
    const counts = new Map<string, number>();
    for (const log of goalLogs.data ?? []) {
      counts.set(log.goal_id, (counts.get(log.goal_id) ?? 0) + 1);
    }
    return counts;
  }, [goalLogs.data]);

  const list = goals.data ?? [];

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="gap-4 px-4 pb-10 pt-4"
      showsVerticalScrollIndicator={false}
    >
      <SectionCard
        title="Goals and priorities"
        subtitle="Small and repeatable beats ambitious and abandoned."
        right={
          <Button size="sm" variant="secondary" onPress={() => router.push('/goal-new')}>
            <Button.Label className="flex-row items-center gap-1.5">
              <Plus size={15} color={BRAND_HEX.lavender} />
              New
            </Button.Label>
          </Button>
        }
      >
        {list.length === 0 ? (
          <View className="gap-3">
            <Typography className="text-muted text-sm leading-5">
              No goals yet. Pick one thing you would like to keep in view this month.
            </Typography>
            <Button onPress={() => router.push('/goal-new')}>
              <Button.Label>Add a goal</Button.Label>
            </Button>
          </View>
        ) : (
          <View className="gap-2">
            {list.map((goal) => (
              <GoalRow
                key={goal.id}
                goal={goal}
                done={doneToday.has(goal.id)}
                loggedDays={countByGoal.get(goal.id) ?? 0}
                onToggle={() =>
                  toggleGoal.mutate({ goalId: goal.id, done: !doneToday.has(goal.id) })
                }
                right={
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    accessibilityLabel={`Remove ${goal.title}`}
                    onPress={() => archiveGoal.mutate(goal.id)}
                  >
                    <Button.Label>
                      <Trash2 size={16} color={BRAND_HEX.muted} />
                    </Button.Label>
                  </Button>
                }
              />
            ))}
          </View>
        )}
      </SectionCard>

      {list.length > 0 ? (
        <SectionCard title="Why this matters">
          <Typography className="text-muted text-sm leading-5">
            When Buddy walks you through a reset, these goals are what it points back to. Letting
            one go is a valid choice too.
          </Typography>
        </SectionCard>
      ) : null}

      <DisclaimerNote />
    </ScrollView>
  );
}
