import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session } from '@biltme/backend';

import { bilt } from '@/lib/bilt';

type AuthValue = {
  session: Session | null;
  userId: string | null;
  email: string | null;
  initializing: boolean;
  sendCode: (email: string) => Promise<void>;
  verifyCode: (email: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

async function ensureProfileRow(userId: string) {
  const { error } = await bilt
    .from('profiles')
    .upsert({ id: userId }, { onConflict: 'id', ignoreDuplicates: true });
  if (error) console.warn('profile row not ready', error.message);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let active = true;

    void bilt.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session ?? null);
      setInitializing(false);
      if (data.session?.user.id) void ensureProfileRow(data.session.user.id);
    });

    const { data: subscription } = bilt.auth.onAuthStateChange((_event, next) => {
      setSession(next ?? null);
      if (next?.user.id) void ensureProfileRow(next.user.id);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const sendCode = useCallback(async (email: string) => {
    const { error } = await bilt.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true },
    });
    if (error) throw new Error(error.message);
  }, []);

  const verifyCode = useCallback(async (email: string, token: string) => {
    const { error } = await bilt.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      type: 'email',
    });
    if (error) throw new Error(error.message);
  }, []);

  const signOut = useCallback(async () => {
    await bilt.auth.signOut();
    setSession(null);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      session,
      userId: session?.user.id ?? null,
      email: session?.user.email ?? null,
      initializing,
      sendCode,
      verifyCode,
      signOut,
    }),
    [session, initializing, sendCode, verifyCode, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
