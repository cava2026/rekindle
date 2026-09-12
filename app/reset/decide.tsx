import { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Spinner, Typography } from 'heroui-native';

import { ResetStageHeader } from '@/components/ResetStageHeader';
import { GesturePressable } from '@/components/ui/primitives/GesturePressable';
import { DECISION_HINTS, DECISION_LABELS } from '@/lib/content';
import { useResetItems, useSetItemDecision } from '@/lib/queries';
import { useResetFlow } from '@/lib/resetStore';
import { DECISIONS } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function DecideScreen() {
  const sessionId = useResetFlow((state) => state.sessionId);
  const resetFlow = useResetFlow((state) => state.reset);
  const items = useResetItems(sessionId);
  const setDecision = useSetItemDecision();

  useEffect(() => {
    if (!sessionId) router.replace('/reset/brain-dump');
  }, [sessionId]);

  const list = items.data ?? [];
  const sorted = list.filter((item) => item.decision != null).length;
  const remaining = list.length - sorted;

  const close = () => {
    resetFlow();
    router.replace('/(tabs)');
  };

  const markRemaining = () => {
    for (const item of list) {
      if (item.decision == null) {
        setDecision.mutate({ itemId: item.id, sessionId: item.session_id, decision: 'can_wait' });
      }
    }
  };

  return (
    <View className="bg-background flex-1">
      <ResetStageHeader
        stage={2}
        title="What actually matters today?"
        subtitle="Sort each one. Deciding something can wait, or can go, is progress too."
        onClose={close}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-5 pb-8 pt-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-background-secondary flex-row flex-wrap gap-2 rounded-2xl p-3">
          {DECISIONS.map((decision) => (
            <View key={decision} className="w-[48%] gap-0.5">
              <Typography className="text-foreground text-xs font-semibold">
                {DECISION_LABELS[decision]}
              </Typography>
              <Typography className="text-muted text-[11px] leading-4">
                {DECISION_HINTS[decision]}
              </Typography>
            </View>
          ))}
        </View>

        {items.isLoading ? (
          <View className="items-center py-10">
            <Spinner />
          </View>
        ) : null}

        {list.map((item) => (
          <View key={item.id} className="border-border bg-surface gap-2 rounded-2xl border p-3">
            <Typography className="text-foreground text-sm leading-5">{item.content}</Typography>
            <View className="flex-row flex-wrap gap-2">
              {DECISIONS.map((decision) => {
                const active = item.decision === decision;
                return (
                  <GesturePressable
                    key={decision}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`${DECISION_LABELS[decision]} for ${item.content}`}
                    onPress={() =>
                      setDecision.mutate({
                        itemId: item.id,
                        sessionId: item.session_id,
                        decision: active ? null : decision,
                      })
                    }
                    className={cn(
                      'rounded-full border px-3 py-1.5',
                      active
                        ? 'border-lavender bg-lavender'
                        : 'border-border bg-background-secondary',
                    )}
                  >
                    <Typography
                      className={cn(
                        'text-xs font-medium',
                        active ? 'text-white' : 'text-foreground',
                      )}
                    >
                      {DECISION_LABELS[decision]}
                    </Typography>
                  </GesturePressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      <View className="pb-safe-offset-3 border-border bg-surface gap-2 border-t px-5 pt-3">
        <Typography className="text-muted text-xs">
          {remaining === 0
            ? 'Everything is sorted.'
            : `${remaining} still to sort out of ${list.length}.`}
        </Typography>
        {remaining > 0 ? (
          <Button variant="ghost" size="sm" onPress={markRemaining}>
            <Button.Label>Put the rest under &quot;can wait&quot;</Button.Label>
          </Button>
        ) : null}
        <Button size="lg" isDisabled={remaining > 0} onPress={() => router.push('/reset/do')}>
          <Button.Label>Give me my next step</Button.Label>
        </Button>
      </View>
    </View>
  );
}
