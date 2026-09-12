import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Button, Input, Label, Spinner, Typography } from 'heroui-native';

import { DisclaimerNote } from '@/components/DisclaimerNote';
import { useAuth } from '@/lib/auth';

export default function SignInScreen() {
  const { sendCode, verifyCode } = useAuth();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  const handleSend = async () => {
    setBusy(true);
    setError(null);
    try {
      await sendCode(email);
      setStep('code');
    } catch {
      setError('That did not go through. Check the address and try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async () => {
    setBusy(true);
    setError(null);
    try {
      await verifyCode(email, code);
    } catch {
      setError('That code did not match. Codes expire after a few minutes.');
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="bg-background flex-1"
    >
      <ScrollView
        contentContainerClassName="grow justify-center gap-8 px-6 py-safe-offset-8"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-3">
          <View className="bg-lavender-soft h-14 w-14 items-center justify-center rounded-2xl">
            <Typography className="text-2xl">🌿</Typography>
          </View>
          <Typography className="text-foreground text-3xl font-bold">Burnout Buddy</Typography>
          <Typography className="text-muted text-base leading-6">
            A calm place to sort through the overwhelm and stay close to what matters to you.
          </Typography>
        </View>

        {step === 'email' ? (
          <View className="gap-3">
            <Label className="text-foreground">Your email</Label>
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              inputMode="email"
              returnKeyType="go"
              onSubmitEditing={() => {
                if (emailValid && !busy) void handleSend();
              }}
            />
            <Typography className="text-muted text-xs">
              We send a six digit code. No password to remember.
            </Typography>
            {error ? <Typography className="text-danger text-xs">{error}</Typography> : null}
            <Button
              size="lg"
              className="mt-1"
              isDisabled={!emailValid || busy}
              onPress={() => void handleSend()}
            >
              <Button.Label className="flex-row items-center gap-2">
                {busy ? <Spinner size="sm" /> : null}
                Send my code
              </Button.Label>
            </Button>
          </View>
        ) : (
          <View className="gap-3">
            <Label className="text-foreground">Enter the code</Label>
            <Typography className="text-muted text-sm">
              Sent to {email.trim().toLowerCase()}
            </Typography>
            <Input
              value={code}
              onChangeText={(next) => setCode(next.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              keyboardType="number-pad"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              className="text-center text-2xl tracking-[8px]"
              returnKeyType="go"
              onSubmitEditing={() => {
                if (code.length === 6 && !busy) void handleVerify();
              }}
            />
            {error ? <Typography className="text-danger text-xs">{error}</Typography> : null}
            <Button
              size="lg"
              className="mt-1"
              isDisabled={code.length !== 6 || busy}
              onPress={() => void handleVerify()}
            >
              <Button.Label className="flex-row items-center gap-2">
                {busy ? <Spinner size="sm" /> : null}
                Continue
              </Button.Label>
            </Button>
            <Button
              variant="ghost"
              onPress={() => {
                setStep('email');
                setCode('');
                setError(null);
              }}
            >
              <Button.Label>Use a different email</Button.Label>
            </Button>
          </View>
        )}

        <DisclaimerNote variant="full" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
