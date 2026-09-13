import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Spinner, Typography } from 'heroui-native';
import { ArrowRight, CheckCircle2 } from 'lucide-react-native';

import { ResetRecordView } from '@/components/ResetRecordView';
import { useResetSessionFlow } from '@/hooks/useResetSessionFlow';
import { BRAND_HEX } from '@/lib/content';
import { useResetActions, useResetItems, useUpdateResetSession } from '@/lib/queries';
import { useResetFlow } from '@/lib/resetStore';

export default function SummaryScreen() {
  const flow = useResetSessionFlow();
  const updateSession = useUpdateResetSession();
  const resetFlow = useResetFlow((state) => state.reset);
  const items = useResetItems(flow.sessionId);
  const actions = useResetActions(flow.sessionId);
  const [error, setError] = useState('');

  const handleBackToDay = async () => {
    if (!flow.sessionId || !flow.session.data) return;
    setError('');
    try {
      if (!flow.session.data.completed_at) {
        await updateSession.mutateAsync({
          sessionId: flow.sessionId,
          patch: {
            stage: 'complete',
            completed_at: new Date().toISOString(),
            coach_summary: flow.session.data.closing_line,
          },
        });
      }
      resetFlow();
      router.replace('/(tabs)');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Your reset could not be finished yet.');
    }
  };

  if (flow.session.isLoading || items.isLoading || actions.isLoading) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <Spinner />
      </View>
    );
  }

  if (!flow.session.data) {
    return (
      <View className="bg-background flex-1 items-center justify-center gap-3 px-6">
        <Typography className="text-foreground text-lg font-semibold">Reset not found</Typography>
        <Button variant="secondary" onPress={() => router.replace('/(tabs)')}>
          <Button.Label>Back to Today</Button.Label>
        </Button>
      </View>
    );
  }

  return (
    <View className="bg-background flex-1">
      <ScrollView
        contentContainerClassName="gap-5 px-4 pb-32 pt-safe-offset-5"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center gap-2 py-2">
          <View className="bg-success-soft h-14 w-14 items-center justify-center rounded-full">
            <CheckCircle2 size={30} color={BRAND_HEX.lavender} />
          </View>
          <Typography className="text-foreground text-center text-xl font-bold">
            You made space for what matters
          </Typography>
          <Typography className="text-muted text-center text-sm leading-5">
            This reset and its action progress are saved for you.
          </Typography>
        </View>

        <ResetRecordView
          session={flow.session.data}
          items={items.data ?? []}
          actions={actions.data ?? []}
        />
      </ScrollView>

      <View className="pb-safe-offset-3 border-border bg-surface gap-2 border-t px-5 pt-3">
        {error ? <Typography className="text-danger text-xs">{error}</Typography> : null}
        <Button
          size="lg"
          isDisabled={updateSession.isPending}
          onPress={() => void handleBackToDay()}
        >
          <Button.Label className="flex-row items-center gap-2">
            {updateSession.isPending ? <Spinner size="sm" /> : null}
            Back to your day
            {!updateSession.isPending ? <ArrowRight size={17} color={BRAND_HEX.surface} /> : null}
          </Button.Label>
        </Button>
      </View>
    </View>
  );
}
