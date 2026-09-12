import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Typography } from 'heroui-native';

import { OnboardingStep } from '@/components/OnboardingStep';
import { ScaleField } from '@/components/ScaleField';
import { BASELINE_QUESTIONS, type BaselineKey } from '@/lib/content';
import { useSaveBaseline } from '@/lib/queries';

type Answers = Record<BaselineKey, number>;

const INITIAL: Answers = {
  energy: 5,
  stress: 5,
  motivation: 5,
  sleep_quality: 5,
  physical_activity: 5,
  life_satisfaction: 5,
  work_satisfaction: 5,
};

export default function BaselineScreen() {
  const saveBaseline = useSaveBaseline();
  const [answers, setAnswers] = useState<Answers>(INITIAL);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    setBusy(true);
    setError(null);
    try {
      await saveBaseline.mutateAsync(answers);
      router.push('/onboarding/goals');
    } catch {
      setError('That did not save. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <OnboardingStep
      step={2}
      total={3}
      title="How are things right now?"
      subtitle="A starting point Buddy can compare your daily check-ins against. There is no right answer, and no score to pass."
      primaryLabel="Continue"
      onPrimary={() => void handleContinue()}
      busy={busy}
      error={error}
      onBack={() => router.back()}
    >
      {BASELINE_QUESTIONS.map((question) => (
        <ScaleField
          key={question.key}
          label={question.label}
          low={question.low}
          high={question.high}
          value={answers[question.key]}
          onChange={(value) => setAnswers((prev) => ({ ...prev, [question.key]: value }))}
        />
      ))}

      <View className="bg-background-secondary rounded-2xl p-3">
        <Typography className="text-muted text-xs leading-5">
          This is a self-reflection snapshot, not an assessment. Buddy uses it to notice changes in
          the patterns you report over time.
        </Typography>
      </View>
    </OnboardingStep>
  );
}
