import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Checkbox, Spinner, Surface, Typography } from 'heroui-native';

import { AI_DISCLAIMER, MEDICAL_DISCLAIMER } from '@/lib/content';
import { useSaveProfile } from '@/lib/queries';

const PROMISES = [
  'Buddy helps you organise, prioritise and reflect.',
  'Buddy suggests small, healthy next steps.',
  'Buddy encourages professional support when that is the right call.',
];

const LIMITS = [
  'Buddy does not diagnose, treat or claim that burnout is happening.',
  'Buddy is not a therapist, physician or crisis service.',
  'Buddy never recommends medication or changes to prescribed care.',
];

export default function DisclaimerScreen() {
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveProfile = useSaveProfile();

  const handleContinue = async () => {
    setBusy(true);
    setError(null);
    try {
      await saveProfile.mutateAsync({ disclaimer_accepted_at: new Date().toISOString() });
      router.push('/onboarding/about-you');
    } catch {
      setError('That did not save. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="bg-background flex-1">
      <ScrollView
        contentContainerClassName="gap-5 px-5 pb-8 pt-safe-offset-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-2">
          <Typography className="text-lavender text-xs font-semibold tracking-wide uppercase">
            Before we begin
          </Typography>
          <Typography className="text-foreground text-3xl font-bold">
            What Buddy is, and what it is not
          </Typography>
          <Typography className="text-muted text-sm leading-5">{AI_DISCLAIMER}</Typography>
        </View>

        <Surface className="border-border bg-surface gap-3 rounded-3xl border p-4">
          <Typography className="text-foreground text-base font-semibold">
            Here is how Buddy helps
          </Typography>
          {PROMISES.map((line) => (
            <View key={line} className="flex-row gap-2">
              <View className="bg-lavender mt-1.5 h-1.5 w-1.5 rounded-full" />
              <Typography className="text-foreground flex-1 text-sm leading-5">{line}</Typography>
            </View>
          ))}
        </Surface>

        <Surface className="border-border bg-blush-soft gap-3 rounded-3xl border p-4">
          <Typography className="text-foreground text-base font-semibold">
            And where Buddy stops
          </Typography>
          {LIMITS.map((line) => (
            <View key={line} className="flex-row gap-2">
              <View className="bg-blush-deep mt-1.5 h-1.5 w-1.5 rounded-full" />
              <Typography className="text-foreground flex-1 text-sm leading-5">{line}</Typography>
            </View>
          ))}
        </Surface>

        <View className="bg-background-secondary rounded-3xl p-4">
          <Typography className="text-muted text-xs leading-5">{MEDICAL_DISCLAIMER}</Typography>
        </View>

        <View className="flex-row items-start gap-3">
          <Checkbox
            isSelected={accepted}
            onSelectedChange={setAccepted}
            accessibilityLabel="I have read and understand this"
          />
          <Typography
            className="text-foreground flex-1 text-sm leading-5"
            onPress={() => setAccepted(!accepted)}
          >
            I have read this and understand that Burnout Buddy is a wellness and educational tool,
            not medical or psychological care.
          </Typography>
        </View>
      </ScrollView>

      <View className="pb-safe-offset-3 border-border bg-surface gap-2 border-t px-5 pt-3">
        {error ? <Typography className="text-danger text-xs">{error}</Typography> : null}
        <Button size="lg" isDisabled={!accepted || busy} onPress={() => void handleContinue()}>
          <Button.Label className="flex-row items-center gap-2">
            {busy ? <Spinner size="sm" /> : null}
            I understand, let us start
          </Button.Label>
        </Button>
      </View>
    </View>
  );
}
