import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Button, Input, Label, Spinner, Typography } from 'heroui-native';

import { ChipSelect } from '@/components/ChipSelect';
import { GOAL_TEMPLATES } from '@/lib/content';
import { goBackOrReplace } from '@/lib/navigation';
import { useAddGoals } from '@/lib/queries';

const CATEGORIES = Array.from(new Set(GOAL_TEMPLATES.map((goal) => goal.category)));

export default function NewGoalScreen() {
  const addGoals = useAddGoals();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setBusy(true);
    setError(null);
    try {
      await addGoals.mutateAsync([
        { title: trimmed, category: category[0] ?? null, is_custom: true },
      ]);
      goBackOrReplace('/(tabs)/goals');
    } catch {
      setError('That did not save. Please try again.');
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="bg-surface flex-1"
    >
      <ScrollView
        contentContainerClassName="gap-5 px-5 pb-8 pt-5"
        keyboardShouldPersistTaps="handled"
      >
        <Typography className="text-muted text-sm leading-5">
          Keep it small enough to do on a hard day.
        </Typography>

        <View className="gap-2">
          <Label className="text-foreground">Goal</Label>
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder="Walk for ten minutes after lunch"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={() => void handleSave()}
          />
        </View>

        <ChipSelect
          label="Area of life"
          hint="Optional, it helps Buddy group things."
          options={CATEGORIES}
          selected={category}
          onChange={setCategory}
          multiple={false}
        />

        {error ? <Typography className="text-danger text-xs">{error}</Typography> : null}

        <Button
          size="lg"
          isDisabled={title.trim().length === 0 || busy}
          onPress={() => void handleSave()}
        >
          <Button.Label className="flex-row items-center gap-2">
            {busy ? <Spinner size="sm" /> : null}
            Save goal
          </Button.Label>
        </Button>
        <Button variant="ghost" onPress={() => goBackOrReplace('/(tabs)/goals')}>
          <Button.Label>Cancel</Button.Label>
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
