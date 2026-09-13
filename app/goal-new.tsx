import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Button, Input, Label, Spinner, Typography } from 'heroui-native';

import { ChipSelect } from '@/components/ChipSelect';
import { GOAL_TEMPLATES } from '@/lib/content';
import { goBackOrReplace } from '@/lib/navigation';
import { useCreateGoal } from '@/lib/queries';
import type { Goal } from '@/lib/types';

const CATEGORIES = Array.from(new Set(GOAL_TEMPLATES.map((goal) => goal.category)));
const DAYS = [
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
  { label: 'Sun', value: 0 },
];

export default function NewGoalScreen() {
  const createGoal = useCreateGoal();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string[]>([]);
  const [kindChoice, setKindChoice] = useState<string[]>(['Habit']);
  const [days, setDays] = useState<string[]>(DAYS.map((day) => day.label));
  const [steps, setSteps] = useState(['', '', '']);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const kind: Goal['kind'] = kindChoice[0] === 'Outcome' ? 'outcome' : 'habit';

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setBusy(true);
    setError(null);
    try {
      await createGoal.mutateAsync({
        title: trimmed,
        category: category[0] ?? null,
        kind,
        habitDays: DAYS.filter((day) => days.includes(day.label)).map((day) => day.value),
        actions: steps,
      });
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
          Choose one practical habit or break a bigger outcome into small steps.
        </Typography>

        <ChipSelect
          label="Goal type"
          hint="Habits repeat. Outcomes have a finish line."
          options={['Habit', 'Outcome']}
          selected={kindChoice}
          onChange={setKindChoice}
          multiple={false}
        />

        <View className="gap-2">
          <Label className="text-foreground">{kind === 'habit' ? 'Habit' : 'Outcome'}</Label>
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder={
              kind === 'habit' ? 'Walk for ten minutes after lunch' : 'Prepare for my career change'
            }
            autoFocus
            returnKeyType="next"
          />
        </View>

        {kind === 'habit' ? (
          <ChipSelect
            label="Repeat on"
            hint="Pick the days this belongs on your Today list."
            options={DAYS.map((day) => day.label)}
            selected={days}
            onChange={setDays}
            multiple
          />
        ) : (
          <View className="gap-3">
            <View className="gap-1">
              <Label className="text-foreground">First small steps</Label>
              <Typography className="text-muted text-xs">
                Add up to three now. You can add or edit steps later.
              </Typography>
            </View>
            {steps.map((step, index) => (
              <Input
                key={index}
                value={step}
                onChangeText={(value) =>
                  setSteps((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)))
                }
                placeholder={`Step ${index + 1}`}
                returnKeyType={index === steps.length - 1 ? 'done' : 'next'}
              />
            ))}
          </View>
        )}

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
          isDisabled={
            title.trim().length === 0 ||
            busy ||
            (kind === 'habit' && days.length === 0) ||
            (kind === 'outcome' && steps.every((step) => !step.trim()))
          }
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
