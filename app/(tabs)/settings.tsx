import { useState } from 'react';
import { Alert, Platform, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Separator, Switch, Typography } from 'heroui-native';
import { CalendarClock, HeartPulse, LifeBuoy, ShieldCheck, UserRound } from 'lucide-react-native';
import { format } from 'date-fns';

import { SectionCard } from '@/components/SectionCard';
import { useAuth } from '@/lib/auth';
import { BRAND_HEX, MEDICAL_DISCLAIMER } from '@/lib/content';
import { useProfile, useRecentResetSessions } from '@/lib/queries';

const PRIVACY_POINTS = [
  'Your check-ins, goals and reset notes live in your own account and are only visible to you.',
  'Buddy sends the text you write to its AI coach to organise it. Nothing is sold or shared.',
  'Future releases plan de-identified analytics, user-controlled sharing and consent management.',
  'You can ask for your account and its data to be deleted at any time.',
];

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <View className="flex-row items-center justify-between gap-3 py-2">
      <Typography className="text-muted text-sm">{label}</Typography>
      <Typography className="text-foreground flex-1 text-right text-sm font-medium">
        {value && value.length > 0 ? value : 'Not set'}
      </Typography>
    </View>
  );
}

export default function SettingsScreen() {
  const { email, signOut } = useAuth();
  const { data: profile } = useProfile();
  const resets = useRecentResetSessions();
  const [health, setHealth] = useState(false);
  const [calendar, setCalendar] = useState(false);

  const confirmSignOut = () => {
    if (Platform.OS === 'web') {
      void signOut();
      return;
    }
    Alert.alert('Sign out?', 'You can sign back in with a new code any time.', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => void signOut() },
    ]);
  };

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="gap-4 px-4 pb-12 pt-4"
      showsVerticalScrollIndicator={false}
    >
      <SectionCard
        title="You"
        subtitle={email ?? undefined}
        right={
          <Button size="sm" variant="secondary" onPress={() => router.push('/profile')}>
            <Button.Label className="flex-row items-center gap-1.5">
              <UserRound size={15} color={BRAND_HEX.lavender} />
              Edit
            </Button.Label>
          </Button>
        }
      >
        <View>
          <DetailRow label="First name" value={profile?.first_name} />
          <Separator />
          <DetailRow label="Age range" value={profile?.age_range} />
          <Separator />
          <DetailRow label="Life stage" value={profile?.life_stage} />
          <Separator />
          <DetailRow label="Country" value={profile?.country} />
          <Separator />
          <DetailRow label="Time zone" value={profile?.timezone} />
          <Separator />
          <DetailRow
            label="Responsibilities"
            value={profile?.responsibilities?.length ? profile.responsibilities.join(', ') : null}
          />
          <Separator />
          <DetailRow
            label="Challenges"
            value={profile?.challenges?.length ? profile.challenges.join(', ') : null}
          />
        </View>
      </SectionCard>

      <SectionCard
        title="Connections"
        subtitle="Not available yet. When they arrive you decide what to switch on."
      >
        <View className="gap-3">
          <View className="flex-row items-center gap-3">
            <HeartPulse size={18} color={BRAND_HEX.lavender} />
            <View className="flex-1">
              <Typography className="text-foreground text-sm font-medium">
                Apple Health & Fitness
              </Typography>
              <Typography className="text-muted text-xs">
                Sleep duration and consistency, activity, heart rate and HRV where available.
              </Typography>
            </View>
            <Switch isSelected={health} onSelectedChange={setHealth} isDisabled />
          </View>
          <Separator />
          <View className="flex-row items-center gap-3">
            <CalendarClock size={18} color={BRAND_HEX.lavender} />
            <View className="flex-1">
              <Typography className="text-foreground text-sm font-medium">Calendar</Typography>
              <Typography className="text-muted text-xs">
                Meeting load, work hours, back-to-back blocks and travel days.
              </Typography>
            </View>
            <Switch isSelected={calendar} onSelectedChange={setCalendar} isDisabled />
          </View>
          <View className="bg-background-secondary rounded-2xl p-3">
            <Typography className="text-muted text-xs leading-5">
              Until then, sleep, activity, meetings and work hours are optional fields in your daily
              check-in.
            </Typography>
          </View>
        </View>
      </SectionCard>

      <SectionCard
        title="Your resets"
        subtitle="Sessions you completed with the B.U.D.D.Y. method"
        right={
          <Button size="sm" variant="secondary" onPress={() => router.push('/reset/history')}>
            <Button.Label>Review</Button.Label>
          </Button>
        }
      >
        <Typography className="text-muted text-sm leading-5">
          {(resets.data?.length ?? 0) === 0
            ? 'No completed resets yet. The overwhelmed button on Today starts one.'
            : `${resets.data?.length} completed. Most recent ${format(
                new Date(resets.data![0].created_at),
                'd MMM',
              )}.`}
        </Typography>
      </SectionCard>

      <SectionCard title="Privacy and your data">
        <View className="gap-2">
          {PRIVACY_POINTS.map((point) => (
            <View key={point} className="flex-row gap-2">
              <ShieldCheck size={16} color={BRAND_HEX.lavender} />
              <Typography className="text-muted flex-1 text-sm leading-5">{point}</Typography>
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard title="If you need urgent support">
        <View className="gap-3">
          <Typography className="text-muted text-sm leading-5">
            Buddy is not a crisis service. These lines are staffed by people who are trained for it.
          </Typography>
          <Button variant="secondary" onPress={() => router.push('/crisis')}>
            <Button.Label className="flex-row items-center gap-2">
              <LifeBuoy size={16} color={BRAND_HEX.lavender} />
              See support resources
            </Button.Label>
          </Button>
        </View>
      </SectionCard>

      <SectionCard title="About Burnout Buddy">
        <Typography className="text-muted text-xs leading-5">{MEDICAL_DISCLAIMER}</Typography>
      </SectionCard>

      <Button variant="danger-soft" onPress={confirmSignOut}>
        <Button.Label>Sign out</Button.Label>
      </Button>
    </ScrollView>
  );
}
