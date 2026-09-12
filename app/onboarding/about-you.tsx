import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Input, Label, Typography } from 'heroui-native';

import { ChipSelect } from '@/components/ChipSelect';
import { OnboardingStep } from '@/components/OnboardingStep';
import { AGE_RANGES, CHALLENGES, LIFE_STAGES, RESPONSIBILITIES } from '@/lib/content';
import { useSaveProfile } from '@/lib/queries';

function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
  } catch {
    return '';
  }
}

export default function AboutYouScreen() {
  const saveProfile = useSaveProfile();
  const timezone = useMemo(() => detectTimezone(), []);

  const [firstName, setFirstName] = useState('');
  const [ageRange, setAgeRange] = useState<string[]>([]);
  const [country, setCountry] = useState('');
  const [lifeStage, setLifeStage] = useState<string[]>([]);
  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [challenges, setChallenges] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canContinue = firstName.trim().length > 0 && ageRange.length > 0;

  const handleContinue = async () => {
    setBusy(true);
    setError(null);
    try {
      await saveProfile.mutateAsync({
        first_name: firstName.trim(),
        age_range: ageRange[0] ?? null,
        country: country.trim() || null,
        timezone: timezone || null,
        life_stage: lifeStage[0] ?? null,
        responsibilities,
        challenges,
      });
      router.push('/onboarding/baseline');
    } catch {
      setError('That did not save. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <OnboardingStep
      step={1}
      total={3}
      title="Let us get to know you"
      subtitle="This shapes the language Buddy uses and the suggestions it makes. Nothing here is shared with anyone."
      primaryLabel="Continue"
      onPrimary={() => void handleContinue()}
      primaryDisabled={!canContinue}
      busy={busy}
      error={error}
      onBack={() => router.back()}
    >
      <View className="gap-2">
        <Label className="text-foreground">First name</Label>
        <Input
          value={firstName}
          onChangeText={setFirstName}
          placeholder="What should Buddy call you?"
          autoCapitalize="words"
          autoComplete="given-name"
        />
      </View>

      <ChipSelect
        label="Age range"
        options={AGE_RANGES}
        selected={ageRange}
        onChange={setAgeRange}
        multiple={false}
      />

      <View className="gap-2">
        <Label className="text-foreground">Country</Label>
        <Input
          value={country}
          onChangeText={setCountry}
          placeholder="Where are you based?"
          autoCapitalize="words"
        />
        {timezone ? (
          <Typography className="text-muted text-xs">
            Time zone detected as {timezone}. Daily reminders and trends follow this.
          </Typography>
        ) : null}
      </View>

      <ChipSelect
        label="Life stage"
        options={LIFE_STAGES}
        selected={lifeStage}
        onChange={setLifeStage}
        multiple={false}
      />

      <ChipSelect
        label="Personal responsibilities"
        hint="Select everything you are carrying right now."
        options={RESPONSIBILITIES}
        selected={responsibilities}
        onChange={setResponsibilities}
      />

      <ChipSelect
        label="Current challenges"
        hint="Select all that apply. You can change these later."
        options={CHALLENGES}
        selected={challenges}
        onChange={setChallenges}
      />
    </OnboardingStep>
  );
}
