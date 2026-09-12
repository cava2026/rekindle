import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Button, Input, Label, Spinner, Typography } from 'heroui-native';

import { ChipSelect } from '@/components/ChipSelect';
import { AGE_RANGES, CHALLENGES, LIFE_STAGES, RESPONSIBILITIES } from '@/lib/content';
import { goBackOrReplace } from '@/lib/navigation';
import { useProfile, useSaveProfile } from '@/lib/queries';

export default function ProfileScreen() {
  const { data: profile } = useProfile();
  const saveProfile = useSaveProfile();

  const [firstName, setFirstName] = useState('');
  const [country, setCountry] = useState('');
  const [ageRange, setAgeRange] = useState<string[]>([]);
  const [lifeStage, setLifeStage] = useState<string[]>([]);
  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [challenges, setChallenges] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [syncedProfile, setSyncedProfile] = useState<typeof profile>(undefined);
  if (profile && syncedProfile !== profile) {
    setSyncedProfile(profile);
    setFirstName(profile.first_name ?? '');
    setCountry(profile.country ?? '');
    setAgeRange(profile.age_range ? [profile.age_range] : []);
    setLifeStage(profile.life_stage ? [profile.life_stage] : []);
    setResponsibilities(profile.responsibilities ?? []);
    setChallenges(profile.challenges ?? []);
  }

  const handleSave = async () => {
    setBusy(true);
    setError(null);
    try {
      await saveProfile.mutateAsync({
        first_name: firstName.trim() || null,
        country: country.trim() || null,
        age_range: ageRange[0] ?? null,
        life_stage: lifeStage[0] ?? null,
        responsibilities,
        challenges,
      });
      goBackOrReplace('/(tabs)/settings');
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
        contentContainerClassName="gap-5 px-5 pb-10 pt-5"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Typography className="text-muted text-sm leading-5">
          Buddy uses this to keep its suggestions relevant to the load you are actually carrying.
        </Typography>

        <View className="gap-2">
          <Label className="text-foreground">First name</Label>
          <Input value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
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
          <Input value={country} onChangeText={setCountry} autoCapitalize="words" />
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
          options={RESPONSIBILITIES}
          selected={responsibilities}
          onChange={setResponsibilities}
        />

        <ChipSelect
          label="Current challenges"
          options={CHALLENGES}
          selected={challenges}
          onChange={setChallenges}
        />

        {error ? <Typography className="text-danger text-xs">{error}</Typography> : null}

        <Button size="lg" isDisabled={busy} onPress={() => void handleSave()}>
          <Button.Label className="flex-row items-center gap-2">
            {busy ? <Spinner size="sm" /> : null}
            Save changes
          </Button.Label>
        </Button>
        <Button variant="ghost" onPress={() => goBackOrReplace('/(tabs)/settings')}>
          <Button.Label>Cancel</Button.Label>
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
