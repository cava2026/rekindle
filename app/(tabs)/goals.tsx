import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Typography } from 'heroui-native';
import { ChevronRight, Plus, Trash2 } from 'lucide-react-native';

import { DisclaimerNote } from '@/components/DisclaimerNote';
import { SectionCard } from '@/components/SectionCard';
import { BRAND_HEX } from '@/lib/content';
import {
  useArchiveGoal,
  useGoalActionLogs,
  useGoalActions,
  useGoals,
} from '@/lib/queries';

export default function GoalsScreen() {
  const goals = useGoals();
  const actions = useGoalActions();
  const actionLogs = useGoalActionLogs(90);
  const archiveGoal = useArchiveGoal();

  const completedActionIds = useMemo(
    () =>
      new Set(
        (actionLogs.data ?? [])
          .filter((log) => log.status === 'completed')
          .map((log) => log.goal_action_id),
      ),
    [actionLogs.data],
  );
  const actionsByGoal = useMemo(() => {
    const grouped = new Map<string, NonNullable<typeof actions.data>>();
    for (const action of actions.data ?? []) {
      const current = grouped.get(action.goal_id) ?? [];
      current.push(action);
      grouped.set(action.goal_id, current);
    }
    return grouped;
  }, [actions.data]);

  const list = goals.data ?? [];

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="gap-4 px-4 pb-10 pt-4"
      showsVerticalScrollIndicator={false}
    >
      <SectionCard
        title="Goals and priorities"
        subtitle="Keep 1–3 active goals so your attention has somewhere clear to go."
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
            {list.map((goal) => {
              const goalActions = actionsByGoal.get(goal.id) ?? [];
              const completed = goalActions.filter((action) => completedActionIds.has(action.id)).length;
              const progress = goalActions.length ? Math.round((completed / goalActions.length) * 100) : 0;
              return (
                <View
                  key={goal.id}
                  className="border-border bg-surface gap-2 rounded-2xl border px-3 py-3"
                >
                  <View className="flex-row items-center gap-2">
                    <Button
                      variant="ghost"
                      className="h-auto flex-1 items-start px-0"
                      onPress={() =>
                        router.push({ pathname: '/goal/[id]', params: { id: goal.id } })
                      }
                    >
                      <Button.Label className="w-full items-start gap-1">
                        <Typography className="text-foreground text-sm font-semibold">
                          {goal.title}
                        </Typography>
                        <Typography className="text-muted text-xs">
                          {goal.kind === 'habit'
                            ? 'Habit'
                            : `${completed} of ${goalActions.length} steps completed`}
                        </Typography>
                      </Button.Label>
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="ghost"
                      accessibilityLabel={`Open ${goal.title}`}
                      onPress={() =>
                        router.push({ pathname: '/goal/[id]', params: { id: goal.id } })
                      }
                    >
                      <Button.Label>
                        <ChevronRight size={17} color={BRAND_HEX.muted} />
                      </Button.Label>
                    </Button>
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
                  </View>
                  {goal.kind === 'outcome' && goalActions.length > 0 ? (
                    <View className="bg-background-tertiary h-1.5 overflow-hidden rounded-full">
                      <View className="bg-lavender h-full rounded-full" style={{ width: `${progress}%` }} />
                    </View>
                  ) : null}
                </View>
              );
            })}
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
