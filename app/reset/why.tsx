import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Spinner, TextArea, Typography } from 'heroui-native';

import { ResetStageHeader } from '@/components/ResetStageHeader';
import { CoachUnavailableError, reflectOnWhy } from '@/lib/coach';
import { useCoachContext, useGoals, useUpdateResetSession } from '@/lib/queries';
import { useResetFlow } from '@/lib/resetStore';
import { containsCrisisLanguage } from '@/lib/safety';

const DEFAULT_PROMPT =
  'Which of these commitments is most connected to the life you want to build?';

export default function WhyScreen() {
  const sessionId = useResetFlow((state) => state.sessionId);
  const plan = useResetFlow((state) => state.plan);
  const setWhyResponse = useResetFlow((state) => state.setWhyResponse);
  const resetFlow = useResetFlow((state) => state.reset);

  const goals = useGoals();
  const context = useCoachContext();
  const updateSession = useUpdateResetSession();

  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prompt = plan?.why_prompt ?? DEFAULT_PROMPT;

  const close = () => {
    resetFlow();
    router.replace('/(tabs)');
  };

  const handleContinue = async () => {
    if (containsCrisisLanguage(text)) {
      router.replace('/crisis');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      if (sessionId) {
        await updateSession.mutateAsync({
          sessionId,
          patch: { stage: 'why', why_prompt: prompt, why_reflection: text },
        });
      }

      try {
        const result = await reflectOnWhy(text, prompt, context);
        if (result.crisis) {
          router.replace('/crisis');
          return;
        }
        setWhyResponse(result.response, result.closing_line);
      } catch (caught) {
        if (!(caught instanceof CoachUnavailableError)) throw caught;
        setWhyResponse('', '');
      }

      router.push('/reset/summary');
    } catch {
      setError('That did not save. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="bg-background flex-1"
    >
      <ResetStageHeader
        stage={4}
        title="Your why"
        subtitle="The part that makes the rest worth it."
        onClose={close}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-5 pb-8 pt-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-lavender-soft rounded-3xl p-4">
          <Typography className="text-lavender-deep text-base leading-6 font-semibold">
            {prompt}
          </Typography>
        </View>

        {(goals.data?.length ?? 0) > 0 ? (
          <View className="gap-2">
            <Typography className="text-muted text-xs font-medium tracking-wide uppercase">
              Goals you chose
            </Typography>
            <View className="flex-row flex-wrap gap-2">
              {(goals.data ?? []).map((goal) => (
                <View key={goal.id} className="bg-background-secondary rounded-full px-3 py-1.5">
                  <Typography className="text-foreground text-xs">{goal.title}</Typography>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <TextArea
          value={text}
          onChangeText={setText}
          placeholder="Write freely. Values, people, the version of your life you are working toward."
          multiline
          textAlignVertical="top"
          className="min-h-40"
        />

        <Typography className="text-muted text-xs leading-5">
          This stays in your account. Buddy uses it to reflect your own words back to you, nothing
          more.
        </Typography>
      </ScrollView>

      <View className="pb-safe-offset-3 border-border bg-surface gap-2 border-t px-5 pt-3">
        {error ? <Typography className="text-danger text-xs">{error}</Typography> : null}
        <Button
          size="lg"
          isDisabled={text.trim().length < 3 || busy}
          onPress={() => void handleContinue()}
        >
          <Button.Label className="flex-row items-center gap-2">
            {busy ? <Spinner size="sm" /> : null}
            Finish my reset
          </Button.Label>
        </Button>
        <Button variant="ghost" onPress={() => router.push('/reset/summary')}>
          <Button.Label>Skip this part</Button.Label>
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
