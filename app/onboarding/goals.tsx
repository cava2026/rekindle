import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Button, Input, Label, Typography } from 'heroui-native';
import { Plus, X } from 'lucide-react-native';

import { ChipSelect } from '@/components/ChipSelect';
import { OnboardingStep } from '@/components/OnboardingStep';
import { GOAL_TEMPLATES } from '@/lib/content';
import { useAddGoals, useSaveProfile } from '@/lib/queries';

export default function GoalsScreen() {
  const addGoals = useAddGoals();
  const saveProfile = useSaveProfile();

  const [picked, setPicked] = useState<string[]>([]);
  const [customGoals, setCustomGoals] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = picked.length + customGoals.length;

  const addCustom = () => {
    const title = draft.trim();
    if (!title) return;
    if (customGoals.includes(title) || picked.includes(title)) {
      setDraft('');
      return;
    }
    setCustomGoals((prev) => [...prev, title]);
    setDraft('');
  };

  const handleFinish = async () => {
    setBusy(true);
    setError(null);
    try {
      await addGoals.mutateAsync([
        ...picked.map((title) => ({
          title,
          category: GOAL_TEMPLATES.find((goal) => goal.title === title)?.category ?? null,
          is_custom: false,
        })),
        ...customGoals.map((title) => ({ title, category: null, is_custom: true })),
      ]);
      await saveProfile.mutateAsync({ onboarding_completed_at: new Date().toISOString() });
      router.replace('/(tabs)');
    } catch {
      setError('That did not save. Please try again.');
      setBusy(false);
    }
  };

  return (
    <OnboardingStep
      step={3}
      total={3}
      title="What matters to you right now?"
      subtitle="Pick a few goals worth protecting. Two or three is plenty to start, and you can change them any time."
      primaryLabel={
        total > 0 ? `Start with ${total} ${total === 1 ? 'goal' : 'goals'}` : 'Continue'
      }
      onPrimary={() => void handleFinish()}
      busy={busy}
      error={error}
      onBack={() => router.back()}
    >
      <ChipSelect
        options={GOAL_TEMPLATES.map((goal) => goal.title)}
        selected={picked}
        onChange={setPicked}
      />

      <View className="gap-2">
        <Label className="text-foreground">Add your own</Label>
        <View className="flex-row items-center gap-2">
          <Input
            containerClassName="flex-1"
            value={draft}
            onChangeText={setDraft}
            placeholder="Something that matters to you"
            returnKeyType="done"
            onSubmitEditing={addCustom}
          />
          <Button isIconOnly variant="secondary" onPress={addCustom} accessibilityLabel="Add goal">
            <Button.Label>
              <Plus size={20} color="#7c5cc4" />
            </Button.Label>
          </Button>
        </View>

        {customGoals.length > 0 && (
          <View className="gap-2 pt-1">
            {customGoals.map((goal) => (
              <View
                key={goal}
                className="border-border bg-surface flex-row items-center justify-between gap-3 rounded-2xl border px-3 py-2.5"
              >
                <Typography className="text-foreground flex-1 text-sm">{goal}</Typography>
                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  accessibilityLabel={`Remove ${goal}`}
                  onPress={() => setCustomGoals((prev) => prev.filter((item) => item !== goal))}
                >
                  <Button.Label>
                    <X size={16} color="#8b7aa8" />
                  </Button.Label>
                </Button>
              </View>
            ))}
          </View>
        )}
      </View>

      <View className="bg-background-secondary rounded-2xl p-3">
        <Typography className="text-muted text-xs leading-5">
          Goals are yours to keep or let go of. Buddy uses them to reconnect you with your why when
          things feel heavy.
        </Typography>
      </View>
    </OnboardingStep>
  );
}
