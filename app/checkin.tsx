import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Button, Input, Label, Separator, Spinner, TextArea, Typography } from 'heroui-native';

import { ScaleField } from '@/components/ScaleField';
import { CHECKIN_SCALES } from '@/lib/content';
import { goBackOrReplace } from '@/lib/navigation';
import { todayKey, useCheckins, useSaveCheckin } from '@/lib/queries';
import type { CheckinDraft } from '@/lib/types';

const EMPTY: CheckinDraft = {
  mood: 5,
  energy: 5,
  stress: 5,
  focus: 5,
  sleep_hours: null,
  activity_minutes: null,
  meeting_count: null,
  work_hours: null,
  note: null,
};

function parseNumber(text: string): number | null {
  const cleaned = text.replace(',', '.').trim();
  if (cleaned.length === 0) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

export default function CheckinScreen() {
  const checkins = useCheckins(30);
  const saveCheckin = useSaveCheckin();
  const [draft, setDraft] = useState<CheckinDraft>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const existing = useMemo(
    () => checkins.data?.find((checkin) => checkin.checkin_date === todayKey()) ?? null,
    [checkins.data],
  );

  const [syncedDate, setSyncedDate] = useState<string | null>(null);
  if (existing && syncedDate !== existing.checkin_date) {
    setSyncedDate(existing.checkin_date);
    setDraft({
      mood: existing.mood,
      energy: existing.energy,
      stress: existing.stress,
      focus: existing.focus,
      sleep_hours: existing.sleep_hours,
      activity_minutes: existing.activity_minutes,
      meeting_count: existing.meeting_count,
      work_hours: existing.work_hours,
      note: existing.note,
    });
  }

  const handleSave = async () => {
    setBusy(true);
    setError(null);
    try {
      await saveCheckin.mutateAsync(draft);
      goBackOrReplace('/(tabs)');
    } catch {
      setError('That did not save. Please try again.');
      setBusy(false);
    }
  };

  const setField = <K extends keyof CheckinDraft>(key: K, value: CheckinDraft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="bg-surface flex-1"
    >
      <ScrollView
        contentContainerClassName="gap-6 px-5 pb-10 pt-5"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Typography className="text-muted text-sm leading-5">
          How today actually felt. Honest beats impressive here.
        </Typography>

        <View className="gap-5">
          {CHECKIN_SCALES.map((scale) => (
            <ScaleField
              key={scale.key}
              label={scale.label}
              low={scale.low}
              high={scale.high}
              value={draft[scale.key]}
              onChange={(value) => setField(scale.key, value)}
            />
          ))}
        </View>

        <Separator />

        <View className="gap-4">
          <View className="gap-1">
            <Typography className="text-foreground text-base font-semibold">
              Optional context
            </Typography>
            <Typography className="text-muted text-xs leading-5">
              Add what you know. Health and calendar connections can fill these in later.
            </Typography>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 gap-2">
              <Label className="text-foreground">Sleep (hours)</Label>
              <Input
                value={draft.sleep_hours == null ? '' : String(draft.sleep_hours)}
                onChangeText={(text) => setField('sleep_hours', parseNumber(text))}
                placeholder="7.5"
                keyboardType="decimal-pad"
                inputMode="decimal"
              />
            </View>
            <View className="flex-1 gap-2">
              <Label className="text-foreground">Activity (min)</Label>
              <Input
                value={draft.activity_minutes == null ? '' : String(draft.activity_minutes)}
                onChangeText={(text) => setField('activity_minutes', parseNumber(text))}
                placeholder="30"
                keyboardType="number-pad"
                inputMode="numeric"
              />
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 gap-2">
              <Label className="text-foreground">Meetings</Label>
              <Input
                value={draft.meeting_count == null ? '' : String(draft.meeting_count)}
                onChangeText={(text) => setField('meeting_count', parseNumber(text))}
                placeholder="4"
                keyboardType="number-pad"
                inputMode="numeric"
              />
            </View>
            <View className="flex-1 gap-2">
              <Label className="text-foreground">Work hours</Label>
              <Input
                value={draft.work_hours == null ? '' : String(draft.work_hours)}
                onChangeText={(text) => setField('work_hours', parseNumber(text))}
                placeholder="8"
                keyboardType="decimal-pad"
                inputMode="decimal"
              />
            </View>
          </View>

          <View className="gap-2">
            <Label className="text-foreground">Anything worth noting?</Label>
            <TextArea
              value={draft.note ?? ''}
              onChangeText={(text) => setField('note', text.length === 0 ? null : text)}
              placeholder="One line is plenty."
              multiline
              numberOfLines={3}
              className="min-h-20"
            />
          </View>
        </View>

        {error ? <Typography className="text-danger text-xs">{error}</Typography> : null}

        <View className="gap-2">
          <Button size="lg" isDisabled={busy} onPress={() => void handleSave()}>
            <Button.Label className="flex-row items-center gap-2">
              {busy ? <Spinner size="sm" /> : null}
              {existing ? 'Update today' : 'Save check-in'}
            </Button.Label>
          </Button>
          <Button variant="ghost" onPress={() => goBackOrReplace('/(tabs)')}>
            <Button.Label>Not now</Button.Label>
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
