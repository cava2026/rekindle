import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Spinner, Typography } from 'heroui-native';
import { Heart, Timer } from 'lucide-react-native';

import { DisclaimerNote } from '@/components/DisclaimerNote';
import { ResetStageHeader } from '@/components/ResetStageHeader';
import { SectionCard } from '@/components/SectionCard';
import { BRAND_HEX } from '@/lib/content';
import { useUpdateResetSession } from '@/lib/queries';
import { useResetFlow } from '@/lib/resetStore';

export default function SummaryScreen() {
  const sessionId = useResetFlow((state) => state.sessionId);
  const plan = useResetFlow((state) => state.plan);
  const whyResponse = useResetFlow((state) => state.whyResponse);
  const closingLine = useResetFlow((state) => state.closingLine);
  const resetFlow = useResetFlow((state) => state.reset);

  const updateSession = useUpdateResetSession();
  const [busy, setBusy] = useState(false);

  const finish = async () => {
    setBusy(true);
    if (sessionId) {
      try {
        await updateSession.mutateAsync({
          sessionId,
          patch: {
            stage: 'complete',
            completed_at: new Date().toISOString(),
            coach_summary: whyResponse || null,
          },
        });
      } catch {
        // Finishing the flow should never trap the user; the session simply stays open.
      }
    }
    resetFlow();
    router.replace('/(tabs)');
  };

  return (
    <View className="bg-background flex-1">
      <ResetStageHeader stage={4} title="You did the hard part" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-5 pb-8 pt-1"
        showsVerticalScrollIndicator={false}
      >
        {whyResponse ? (
          <View className="bg-lavender-soft gap-3 rounded-3xl p-4">
            <View className="flex-row items-center gap-2">
              <Heart size={16} color={BRAND_HEX.lavenderDeep} />
              <Typography className="text-lavender-deep text-xs font-bold tracking-wide uppercase">
                From Buddy
              </Typography>
            </View>
            <Typography className="text-lavender-deep text-sm leading-6">{whyResponse}</Typography>
            {closingLine ? (
              <Typography className="text-lavender-deep text-sm leading-5 font-semibold">
                {closingLine}
              </Typography>
            ) : null}
          </View>
        ) : (
          <View className="bg-lavender-soft rounded-3xl p-4">
            <Typography className="text-lavender-deep text-sm leading-6">
              Your head is emptier than it was ten minutes ago, and you have one small step to take.
              That is enough for now.
            </Typography>
          </View>
        )}

        {plan ? (
          <>
            <SectionCard title="Right now">
              <View className="flex-row items-start gap-2">
                <Timer size={16} color={BRAND_HEX.lavender} />
                <Typography className="text-foreground flex-1 text-sm leading-5">
                  {plan.next_five_minutes}
                </Typography>
              </View>
            </SectionCard>

            <SectionCard title="Today">
              <View className="gap-2">
                {plan.today.map((action) => (
                  <Typography key={action} className="text-muted text-sm leading-5">
                    • {action}
                  </Typography>
                ))}
              </View>
            </SectionCard>

            <SectionCard title="This week">
              <View className="gap-2">
                {plan.this_week.map((action) => (
                  <Typography key={action} className="text-muted text-sm leading-5">
                    • {action}
                  </Typography>
                ))}
              </View>
            </SectionCard>
          </>
        ) : null}

        <DisclaimerNote />
      </ScrollView>

      <View className="pb-safe-offset-3 border-border bg-surface border-t px-5 pt-3">
        <Button size="lg" isDisabled={busy} onPress={() => void finish()}>
          <Button.Label className="flex-row items-center gap-2">
            {busy ? <Spinner size="sm" /> : null}
            Back to Today
          </Button.Label>
        </Button>
      </View>
    </View>
  );
}
