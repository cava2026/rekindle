import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Spinner, TextArea, Typography } from 'heroui-native';

import { ResetStageHeader } from '@/components/ResetStageHeader';
import { CoachUnavailableError, localOrganize, organizeBrainDump } from '@/lib/coach';
import { COACH_UNAVAILABLE_MESSAGE } from '@/lib/content';
import {
  useCoachContext,
  useCreateResetSession,
  useSaveResetActions,
  useSaveResetItems,
  useUpdateResetSession,
} from '@/lib/queries';
import { resetRoute } from '@/lib/navigation';
import { useResetSessionFlow } from '@/hooks/useResetSessionFlow';
import { useResetFlow } from '@/lib/resetStore';
import { containsCrisisLanguage } from '@/lib/safety';
import type { CoachItem } from '@/lib/types';

const PROMPTS = [
  'What is looping in your head right now?',
  'Which deadlines are you carrying?',
  'What have you promised other people?',
  'What keeps getting pushed to tomorrow?',
  'What is quietly frustrating you?',
];

export default function BrainDumpScreen() {
  const flow = useResetSessionFlow();
  const context = useCoachContext();
  const createSession = useCreateResetSession();
  const saveActions = useSaveResetActions();
  const saveItems = useSaveResetItems();
  const updateSession = useUpdateResetSession();
  const start = useResetFlow((state) => state.start);
  const resetFlow = useResetFlow((state) => state.reset);

  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedSessionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!flow.session.data || loadedSessionRef.current === flow.session.data.id) return;
    loadedSessionRef.current = flow.session.data.id;
    setText(flow.session.data.brain_dump);
  }, [flow.session.data]);

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
      if (flow.sessionId && !flow.session.data) return;
      const session = flow.session.data ?? (await createSession.mutateAsync(text));

      if (flow.sessionId) {
        await updateSession.mutateAsync({
          sessionId: session.id,
          patch: {
            brain_dump: text,
            stage: 'unpack',
            completed_at: null,
            plan_generated_at: null,
            why_prompt: null,
            why_reflection: null,
            coach_summary: null,
            closing_line: null,
          },
        });
        await saveActions.mutateAsync({ sessionId: session.id, actions: [] });
      }

      let items: CoachItem[] = [];
      let reflection = '';
      let degraded = false;

      try {
        const organized = await organizeBrainDump(text, context);
        if (organized.crisis) {
          await updateSession.mutateAsync({
            sessionId: session.id,
            patch: { crisis_flagged: true },
          });
          router.replace('/crisis');
          return;
        }
        items = organized.items;
        reflection = organized.reflection;
      } catch (caught) {
        if (!(caught instanceof CoachUnavailableError)) throw caught;
        degraded = true;
      }

      if (items.length === 0) {
        items = localOrganize(text);
        degraded = degraded || items.length > 0;
      }

      await saveItems.mutateAsync({ sessionId: session.id, items });
      await updateSession.mutateAsync({
        sessionId: session.id,
        patch: { stage: 'unpack', coach_degraded: degraded },
      });
      start({
        sessionId: session.id,
        brainDump: text,
        reflection,
        items,
        degraded,
      });
      router.push(resetRoute(session.id, 'unpack'));
    } catch {
      setError('Buddy could not start this reset. Please try again in a moment.');
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
        stage={0}
        title="Empty it all out"
        subtitle="Thoughts, worries, projects, tasks, commitments, frustrations. No order, no judgement. Buddy sorts it next."
        maxStage={flow.maxStage}
        onStagePress={flow.onStagePress}
        onClose={close}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-5 pb-8 pt-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TextArea
          value={text}
          onChangeText={setText}
          placeholder={'Everything on my mind right now...\n\nOne line each is perfect.'}
          multiline
          autoFocus
          textAlignVertical="top"
          className="min-h-56"
        />

        <View className="bg-background-secondary gap-2 rounded-3xl p-4">
          <Typography className="text-foreground text-sm font-semibold">
            Stuck? Answer any of these
          </Typography>
          {PROMPTS.map((prompt) => (
            <Typography key={prompt} className="text-muted text-sm leading-5">
              • {prompt}
            </Typography>
          ))}
        </View>

        <Typography className="text-muted text-xs leading-5">
          {COACH_UNAVAILABLE_MESSAGE.split('.')[0]}. Buddy is a wellness companion, not a therapist
          or crisis service.
        </Typography>
      </ScrollView>

      <View className="pb-safe-offset-3 border-border bg-surface gap-2 border-t px-5 pt-3">
        {error ? <Typography className="text-danger text-xs">{error}</Typography> : null}
        <Button
          size="lg"
          isDisabled={text.trim().length < 8 || busy || flow.session.isLoading}
          onPress={() => void handleContinue()}
        >
          <Button.Label className="flex-row items-center gap-2">
            {busy ? <Spinner size="sm" /> : null}
            {busy ? 'Buddy is reading this' : 'That is everything'}
          </Button.Label>
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
