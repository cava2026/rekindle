import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Button, Input, Label, Spinner, Typography } from 'heroui-native';
import { Pencil, Plus, Trash2 } from 'lucide-react-native';

import { GoalActionRow } from '@/components/GoalActionRow';
import { SectionCard } from '@/components/SectionCard';
import { BRAND_HEX } from '@/lib/content';
import {
  todayKey,
  useArchiveGoalAction,
  useGoalActionLogs,
  useGoalActions,
  useGoals,
  useSaveGoalAction,
  useSetGoalActionStatus,
} from '@/lib/queries';

export default function GoalDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const goalId = Array.isArray(params.id) ? params.id[0] : params.id;
  const goals = useGoals();
  const actions = useGoalActions(goalId);
  const logs = useGoalActionLogs(90);
  const saveAction = useSaveGoalAction();
  const archiveAction = useArchiveGoalAction();
  const setStatus = useSetGoalActionStatus();
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const goal = goals.data?.find((item) => item.id === goalId);
  const todayStatuses = useMemo(
    () =>
      new Map(
        (logs.data ?? [])
          .filter((log) => log.log_date === todayKey())
          .map((log) => [log.goal_action_id, log.status]),
      ),
    [logs.data],
  );
  const completedIds = useMemo(
    () =>
      new Set(
        (logs.data ?? [])
          .filter((log) => log.status === 'completed')
          .map((log) => log.goal_action_id),
      ),
    [logs.data],
  );
  const completedCount = (actions.data ?? []).filter((action) => completedIds.has(action.id)).length;
  const progress = actions.data?.length
    ? Math.round((completedCount / actions.data.length) * 100)
    : 0;

  const submitAction = async () => {
    if (!goalId || !draft.trim()) return;
    setError(null);
    try {
      await saveAction.mutateAsync({
        id: editingId ?? undefined,
        goalId,
        title: draft,
        sort: actions.data?.length ?? 0,
        scheduleDays: editingId
          ? (actions.data?.find((action) => action.id === editingId)?.schedule_days ?? [])
          : [],
      });
      setDraft('');
      setEditingId(null);
    } catch {
      setError('That step did not save. Please try again.');
    }
  };

  if (goals.isLoading || actions.isLoading) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <Spinner />
      </View>
    );
  }

  if (!goal) {
    return (
      <View className="bg-background flex-1 items-center justify-center px-6">
        <Typography className="text-foreground text-center text-lg font-semibold">Goal not found</Typography>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="bg-background flex-1"
    >
      <ScrollView
        contentContainerClassName="gap-4 px-4 pb-10 pt-4"
        keyboardShouldPersistTaps="handled"
      >
        <SectionCard>
          <View className="gap-2">
            <Typography className="text-muted text-xs font-semibold tracking-wide uppercase">
              {goal.kind === 'habit' ? 'Habit goal' : 'Outcome goal'}
            </Typography>
            <Typography className="text-foreground text-2xl font-bold">{goal.title}</Typography>
            {goal.category ? <Typography className="text-muted text-sm">{goal.category}</Typography> : null}
            {goal.kind === 'outcome' ? (
              <View className="gap-1.5 pt-1">
                <View className="bg-background-tertiary h-2 overflow-hidden rounded-full">
                  <View className="bg-lavender h-full rounded-full" style={{ width: `${progress}%` }} />
                </View>
                <Typography className="text-muted text-xs">
                  {completedCount} of {actions.data?.length ?? 0} steps completed
                </Typography>
              </View>
            ) : null}
          </View>
        </SectionCard>

        <SectionCard
          title={goal.kind === 'habit' ? 'Daily action' : 'Steps'}
          subtitle={
            goal.kind === 'habit'
              ? 'Mark the habit done or skip it without breaking your progress.'
              : 'Keep each step small enough to act on today.'
          }
        >
          <View className="gap-2">
            {(actions.data ?? []).map((action) => (
              <View key={action.id} className="gap-1">
                <GoalActionRow
                  action={action}
                  status={todayStatuses.get(action.id)}
                  onStatusChange={(status) => setStatus.mutate({ actionId: action.id, status })}
                />
                <View className="flex-row justify-end gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onPress={() => {
                      setEditingId(action.id);
                      setDraft(action.title);
                    }}
                  >
                    <Button.Label className="flex-row items-center gap-1">
                      <Pencil size={13} color={BRAND_HEX.muted} /> Edit
                    </Button.Label>
                  </Button>
                  {goal.kind === 'outcome' ? (
                    <Button size="sm" variant="ghost" onPress={() => archiveAction.mutate(action.id)}>
                      <Button.Label className="flex-row items-center gap-1 text-danger">
                        <Trash2 size={13} color={BRAND_HEX.muted} /> Remove
                      </Button.Label>
                    </Button>
                  ) : null}
                </View>
              </View>
            ))}

            {goal.kind === 'outcome' || editingId ? (
              <View className="border-border mt-2 gap-2 border-t pt-3">
                <Label>{editingId ? 'Edit step' : 'Add another step'}</Label>
                <Input
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="A small next action"
                  returnKeyType="done"
                  onSubmitEditing={() => void submitAction()}
                />
                {error ? <Typography className="text-danger text-xs">{error}</Typography> : null}
                <View className="flex-row gap-2">
                  <Button
                    size="sm"
                    isDisabled={!draft.trim() || saveAction.isPending}
                    onPress={() => void submitAction()}
                  >
                    <Button.Label className="flex-row items-center gap-1">
                      {!editingId ? <Plus size={14} color={BRAND_HEX.surface} /> : null}
                      {editingId ? 'Save change' : 'Add step'}
                    </Button.Label>
                  </Button>
                  {editingId ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onPress={() => {
                        setEditingId(null);
                        setDraft('');
                      }}
                    >
                      <Button.Label>Cancel</Button.Label>
                    </Button>
                  ) : null}
                </View>
              </View>
            ) : null}
          </View>
        </SectionCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
