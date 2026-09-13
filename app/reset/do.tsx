import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Spinner, Typography } from 'heroui-native';
import { Check, Clock, Timer } from 'lucide-react-native';

import { ResetStageHeader } from '@/components/ResetStageHeader';
import { GesturePressable } from '@/components/ui/primitives/GesturePressable';
import { useResetSessionFlow } from '@/hooks/useResetSessionFlow';
import { CoachUnavailableError, localPlan, planFromItems } from '@/lib/coach';
import { BRAND_HEX, COACH_UNAVAILABLE_MESSAGE } from '@/lib/content';
import {
  useCoachContext,
  useResetActions,
  useResetItems,
  useSaveResetActions,
  useToggleResetAction,
  useUpdateResetSession,
} from '@/lib/queries';
import { resetRouteAtIndex } from '@/lib/navigation';
import { useResetFlow } from '@/lib/resetStore';
import type { ResetActionHorizon } from '@/lib/types';
import { cn } from '@/lib/utils';

function ActionRow({
  label,
  done,
  onToggle,
}: {
  label: string;
  done: boolean;
  onToggle: () => void;
}) {
  return (
    <GesturePressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={label}
      onPress={onToggle}
      className="border-border bg-surface flex-row items-center gap-3 rounded-2xl border px-3 py-3"
    >
      <View
        className={cn(
          'h-7 w-7 items-center justify-center rounded-full border',
          done ? 'border-lavender bg-lavender' : 'border-border bg-background-secondary',
        )}
      >
        {done ? <Check size={15} color="#ffffff" /> : null}
      </View>
      <Typography
        className={cn(
          'flex-1 text-sm leading-5',
          done ? 'text-muted line-through' : 'text-foreground',
        )}
      >
        {label}
      </Typography>
    </GesturePressable>
  );
}

export default function DoScreen() {
  const flow = useResetSessionFlow();
  const sessionId = flow.sessionId;
  const plan = useResetFlow((state) => state.plan);
  const degraded = useResetFlow((state) => state.coachDegraded);
  const setPlan = useResetFlow((state) => state.setPlan);
  const resetFlow = useResetFlow((state) => state.reset);

  const items = useResetItems(sessionId);
  const actions = useResetActions(sessionId);
  const context = useCoachContext();
  const saveActions = useSaveResetActions();
  const toggleAction = useToggleResetAction();
  const updateSession = useUpdateResetSession();

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  const buildPlan = useCallback(async () => {
    const list = items.data ?? [];
    if (list.length === 0) return;

    setLoading(true);
    setError(null);
    const payload = list.map((item) => ({
      content: item.content,
      category: item.category,
      decision: item.decision,
    }));

    try {
      const result = await planFromItems(payload, context);
      setPlan(result, false);
      if (sessionId) {
        await Promise.all([
          updateSession.mutateAsync({
            sessionId,
            patch: {
              stage: 'do',
              why_prompt: result.why_prompt,
            },
          }),
          saveActions.mutateAsync({
            sessionId,
            actions: [
              { title: result.next_five_minutes, horizon: 'next_five_minutes', sort: 0 },
              ...result.today.map((title, sort) => ({ title, horizon: 'today' as const, sort })),
              ...result.this_week.map((title, sort) => ({
                title,
                horizon: 'this_week' as const,
                sort,
              })),
            ],
          }),
        ]);
      }
    } catch (caught) {
      if (!(caught instanceof CoachUnavailableError)) {
        setError('Buddy could not build the plan. Showing a simple version instead.');
      }
      const fallback = localPlan(payload);
      setPlan(fallback, true);
      if (sessionId) {
        try {
          await Promise.all([
            updateSession.mutateAsync({
              sessionId,
              patch: {
                stage: 'do',
                why_prompt: fallback.why_prompt,
                coach_degraded: true,
              },
            }),
            saveActions.mutateAsync({
              sessionId,
              actions: [
                { title: fallback.next_five_minutes, horizon: 'next_five_minutes', sort: 0 },
                ...fallback.today.map((title, sort) => ({
                  title,
                  horizon: 'today' as const,
                  sort,
                })),
                ...fallback.this_week.map((title, sort) => ({
                  title,
                  horizon: 'this_week' as const,
                  sort,
                })),
              ],
            }),
          ]);
        } catch {
          setError('The plan is visible, but it could not be saved. Please try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  }, [items.data, context, sessionId, setPlan, updateSession, saveActions]);

  useEffect(() => {
    if (!sessionId) {
      router.replace('/reset/brain-dump');
      return;
    }
    if (startedRef.current || plan || items.isLoading || (items.data?.length ?? 0) === 0) return;
    startedRef.current = true;
    void buildPlan();
  }, [sessionId, plan, items.isLoading, items.data, buildPlan]);

  const close = () => {
    resetFlow();
    router.replace('/(tabs)');
  };

  const toggle = (key: string, horizon: ResetActionHorizon, title: string) => {
    const saved = actions.data?.find(
      (action) => action.horizon === horizon && action.title === title,
    );
    const currentlyCompleted = Object.hasOwn(done, key) ? done[key] : Boolean(saved?.completed_at);
    const nextCompleted = !currentlyCompleted;
    setDone((previous) => ({ ...previous, [key]: nextCompleted }));
    if (saved && sessionId) {
      toggleAction.mutate({
        actionId: saved.id,
        sessionId,
        completed: nextCompleted,
      });
    }
  };

  return (
    <View className="bg-background flex-1">
      <ResetStageHeader
        stage={3}
        title="One step, then the next"
        subtitle="Nothing here needs to be impressive. It needs to be doable."
        maxStage={flow.maxStage}
        onStagePress={flow.onStagePress}
        onClose={close}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-5 pb-8 pt-1"
        showsVerticalScrollIndicator={false}
      >
        {loading || !plan ? (
          <View className="items-center gap-3 py-16">
            <Spinner />
            <Typography className="text-muted text-sm">Buddy is putting this in order</Typography>
          </View>
        ) : (
          <>
            {degraded ? (
              <View className="bg-blush-soft rounded-2xl p-3">
                <Typography className="text-foreground text-xs leading-5">
                  {COACH_UNAVAILABLE_MESSAGE}
                </Typography>
              </View>
            ) : null}
            {error ? <Typography className="text-danger text-xs">{error}</Typography> : null}

            <View className="bg-lavender gap-3 rounded-3xl p-4">
              <View className="flex-row items-center gap-2">
                <Timer size={16} color="#ffffff" />
                <Typography className="text-xs font-bold tracking-wide text-white uppercase">
                  Next five minutes
                </Typography>
              </View>
              <Typography className="text-lg leading-6 font-semibold text-white">
                {plan.next_five_minutes}
              </Typography>
              <Button
                variant="secondary"
                size="sm"
                className="self-start"
                onPress={() => toggle('now', 'next_five_minutes', plan.next_five_minutes)}
              >
                <Button.Label>
                  {(done.now ??
                  Boolean(
                    actions.data?.find(
                      (saved) =>
                        saved.horizon === 'next_five_minutes' &&
                        saved.title === plan.next_five_minutes,
                    )?.completed_at,
                  ))
                    ? 'Done, nice work'
                    : 'Mark it done'}
                </Button.Label>
              </Button>
            </View>

            <View className="gap-2">
              <View className="flex-row items-center gap-2">
                <Clock size={16} color={BRAND_HEX.lavender} />
                <Typography className="text-foreground text-sm font-semibold">Today</Typography>
              </View>
              {plan.today.map((action) => (
                <ActionRow
                  key={action}
                  label={action}
                  done={
                    done[`today:${action}`] ??
                    Boolean(
                      actions.data?.find(
                        (saved) => saved.horizon === 'today' && saved.title === action,
                      )?.completed_at,
                    )
                  }
                  onToggle={() => toggle(`today:${action}`, 'today', action)}
                />
              ))}
            </View>

            <View className="gap-2">
              <View className="flex-row items-center gap-2">
                <Clock size={16} color={BRAND_HEX.lavender} />
                <Typography className="text-foreground text-sm font-semibold">This week</Typography>
              </View>
              {plan.this_week.map((action) => (
                <ActionRow
                  key={action}
                  label={action}
                  done={
                    done[`week:${action}`] ??
                    Boolean(
                      actions.data?.find(
                        (saved) => saved.horizon === 'this_week' && saved.title === action,
                      )?.completed_at,
                    )
                  }
                  onToggle={() => toggle(`week:${action}`, 'this_week', action)}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <View className="pb-safe-offset-3 border-border bg-surface border-t px-5 pt-3">
        <Button
          size="lg"
          isDisabled={!plan}
          onPress={async () => {
            if (!sessionId) return;
            await updateSession.mutateAsync({ sessionId, patch: { stage: 'why' } });
            router.push(resetRouteAtIndex(sessionId, 4));
          }}
        >
          <Button.Label>One last thing</Button.Label>
        </Button>
      </View>
    </View>
  );
}
