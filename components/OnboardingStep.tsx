import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Button, Spinner, Typography } from 'heroui-native';
import { ChevronLeft } from 'lucide-react-native';

import { cn } from '@/lib/utils';

type OnboardingStepProps = {
  step: number;
  total: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  busy?: boolean;
  onBack?: () => void;
  error?: string | null;
};

/** Shared shell for the onboarding steps: progress, scrollable body, sticky action. */
export function OnboardingStep({
  step,
  total,
  title,
  subtitle,
  children,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  busy,
  onBack,
  error,
}: OnboardingStepProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="bg-background flex-1"
    >
      <View className="pt-safe-offset-2 gap-4 px-5 pb-2">
        <View className="h-9 flex-row items-center">
          {onBack ? (
            <Button
              variant="ghost"
              size="sm"
              isIconOnly
              onPress={onBack}
              accessibilityLabel="Go back"
            >
              <Button.Label>
                <ChevronLeft size={22} color="#7c5cc4" />
              </Button.Label>
            </Button>
          ) : null}
          <Typography className="text-muted ml-auto text-xs font-medium">
            Step {step} of {total}
          </Typography>
        </View>

        <View className="flex-row gap-1.5">
          {Array.from({ length: total }, (_, index) => index + 1).map((index) => (
            <View
              key={index}
              className={cn(
                'h-1.5 flex-1 rounded-full',
                index <= step ? 'bg-lavender' : 'bg-background-tertiary',
              )}
            />
          ))}
        </View>

        <View className="gap-1.5">
          <Typography className="text-foreground text-2xl font-bold">{title}</Typography>
          {subtitle ? (
            <Typography className="text-muted text-sm leading-5">{subtitle}</Typography>
          ) : null}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-5 pb-8 pt-2"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>

      <View className="pb-safe-offset-3 border-border bg-surface gap-2 border-t px-5 pt-3">
        {error ? <Typography className="text-danger text-xs">{error}</Typography> : null}
        <Button size="lg" onPress={onPrimary} isDisabled={primaryDisabled || busy}>
          <Button.Label className="flex-row items-center gap-2">
            {busy ? <Spinner size="sm" /> : null}
            {primaryLabel}
          </Button.Label>
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
