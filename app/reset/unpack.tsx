import { useEffect, useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Spinner, Typography } from 'heroui-native';
import { Sparkles, Trash2 } from 'lucide-react-native';

import { ResetStageHeader } from '@/components/ResetStageHeader';
import { GesturePressable } from '@/components/ui/primitives/GesturePressable';
import { BRAND_HEX, categoryLabel, COACH_UNAVAILABLE_MESSAGE } from '@/lib/content';
import { useDeleteResetItem, useResetItems, useSetItemCategory } from '@/lib/queries';
import { useResetFlow } from '@/lib/resetStore';
import { RESET_CATEGORIES, type ResetCategory } from '@/lib/types';

function nextCategory(current: string): ResetCategory {
  const index = RESET_CATEGORIES.findIndex((category) => category === current);
  return RESET_CATEGORIES[(index === -1 ? 0 : index + 1) % RESET_CATEGORIES.length];
}

export default function UnpackScreen() {
  const sessionId = useResetFlow((state) => state.sessionId);
  const reflection = useResetFlow((state) => state.reflection);
  const degraded = useResetFlow((state) => state.coachDegraded);
  const resetFlow = useResetFlow((state) => state.reset);

  const items = useResetItems(sessionId);
  const setCategory = useSetItemCategory();
  const deleteItem = useDeleteResetItem();

  useEffect(() => {
    if (!sessionId) router.replace('/reset/brain-dump');
  }, [sessionId]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof items.data>();
    for (const category of RESET_CATEGORIES) map.set(category, []);
    for (const item of items.data ?? []) {
      const key = map.has(item.category) ? item.category : 'personal';
      map.get(key)?.push(item);
    }
    return [...map.entries()].filter(([, list]) => (list?.length ?? 0) > 0);
  }, [items.data]);

  const close = () => {
    resetFlow();
    router.replace('/(tabs)');
  };

  return (
    <View className="bg-background flex-1">
      <ResetStageHeader
        stage={1}
        title="Here is what you are carrying"
        subtitle="Grouped so it stops feeling like one giant weight. Tap a label to move something, or remove what does not belong."
        onClose={close}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-5 pb-8 pt-1"
        showsVerticalScrollIndicator={false}
      >
        {degraded ? (
          <View className="bg-blush-soft rounded-2xl p-3">
            <Typography className="text-foreground text-xs leading-5">
              {COACH_UNAVAILABLE_MESSAGE}
            </Typography>
          </View>
        ) : null}

        {reflection ? (
          <View className="bg-lavender-soft flex-row gap-3 rounded-3xl p-4">
            <Sparkles size={18} color={BRAND_HEX.lavenderDeep} />
            <Typography className="text-lavender-deep flex-1 text-sm leading-5">
              {reflection}
            </Typography>
          </View>
        ) : null}

        {items.isLoading ? (
          <View className="items-center py-10">
            <Spinner />
          </View>
        ) : null}

        {grouped.map(([category, list]) => (
          <View key={category} className="gap-2">
            <View className="flex-row items-center justify-between">
              <Typography className="text-foreground text-sm font-semibold">
                {categoryLabel(category)}
              </Typography>
              <Typography className="text-muted text-xs">{list?.length ?? 0}</Typography>
            </View>

            {(list ?? []).map((item) => (
              <View
                key={item.id}
                className="border-border bg-surface gap-2 rounded-2xl border px-3 py-3"
              >
                <Typography className="text-foreground text-sm leading-5">
                  {item.content}
                </Typography>
                <View className="flex-row items-center gap-2">
                  <GesturePressable
                    accessibilityRole="button"
                    accessibilityLabel={`Move ${item.content} to another area`}
                    onPress={() =>
                      setCategory.mutate({
                        itemId: item.id,
                        sessionId: item.session_id,
                        category: nextCategory(item.category),
                      })
                    }
                    className="bg-lavender-soft rounded-full px-3 py-1"
                  >
                    <Typography className="text-lavender-deep text-xs font-medium">
                      {categoryLabel(item.category)}
                    </Typography>
                  </GesturePressable>

                  <GesturePressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${item.content}`}
                    onPress={() =>
                      deleteItem.mutate({ itemId: item.id, sessionId: item.session_id })
                    }
                    className="bg-background-secondary ml-auto h-8 w-8 items-center justify-center rounded-full"
                  >
                    <Trash2 size={15} color={BRAND_HEX.muted} />
                  </GesturePressable>
                </View>
              </View>
            ))}
          </View>
        ))}

        {!items.isLoading && (items.data?.length ?? 0) === 0 ? (
          <Typography className="text-muted text-sm leading-5">
            Nothing left here. Go back and add anything that is still on your mind.
          </Typography>
        ) : null}
      </ScrollView>

      <View className="pb-safe-offset-3 border-border bg-surface border-t px-5 pt-3">
        <Button
          size="lg"
          isDisabled={(items.data?.length ?? 0) === 0}
          onPress={() => router.push('/reset/decide')}
        >
          <Button.Label>This looks right</Button.Label>
        </Button>
      </View>
    </View>
  );
}
