import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';

import { bilt } from '@/lib/bilt';
import { useAuth } from '@/lib/auth';
import { alignInsights } from '@/lib/coach';
import { capacityScore } from '@/lib/capacity';
import type {
  Baseline,
  Checkin,
  CheckinDraft,
  CoachContext,
  Decision,
  Goal,
  GoalLog,
  Insight,
  Profile,
  ResetItem,
  ResetSession,
} from '@/lib/types';

export const todayKey = () => format(new Date(), 'yyyy-MM-dd');
export const dayKey = (date: Date) => format(date, 'yyyy-MM-dd');

export const qk = {
  profile: (uid: string) => ['profile', uid] as const,
  baseline: (uid: string) => ['baseline', uid] as const,
  goals: (uid: string) => ['goals', uid] as const,
  goalLogs: (uid: string) => ['goalLogs', uid] as const,
  checkins: (uid: string) => ['checkins', uid] as const,
  insights: (uid: string) => ['insights', uid] as const,
  resetSession: (id: string) => ['resetSession', id] as const,
  resetItems: (id: string) => ['resetItems', id] as const,
};

function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

export function useProfile() {
  const { userId } = useAuth();
  return useQuery({
    queryKey: qk.profile(userId ?? 'anon'),
    enabled: Boolean(userId),
    queryFn: async (): Promise<Profile | null> =>
      unwrap(await bilt.from('profiles').select('*').eq('id', userId!).maybeSingle()),
  });
}

export function useSaveProfile() {
  const { userId } = useAuth();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Profile>) => {
      const { error } = await bilt
        .from('profiles')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', userId!);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: qk.profile(userId ?? 'anon') }),
  });
}

export function useBaseline() {
  const { userId } = useAuth();
  return useQuery({
    queryKey: qk.baseline(userId ?? 'anon'),
    enabled: Boolean(userId),
    queryFn: async (): Promise<Baseline | null> =>
      unwrap(
        await bilt.from('wellbeing_baseline').select('*').eq('user_id', userId!).maybeSingle(),
      ),
  });
}

export function useSaveBaseline() {
  const { userId } = useAuth();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (values: Omit<Baseline, 'user_id' | 'created_at'>) => {
      const { error } = await bilt
        .from('wellbeing_baseline')
        .upsert({ ...values, user_id: userId! }, { onConflict: 'user_id' });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: qk.baseline(userId ?? 'anon') }),
  });
}

export function useGoals() {
  const { userId } = useAuth();
  return useQuery({
    queryKey: qk.goals(userId ?? 'anon'),
    enabled: Boolean(userId),
    queryFn: async (): Promise<Goal[]> =>
      unwrap(
        await bilt
          .from('goals')
          .select('*')
          .eq('user_id', userId!)
          .is('archived_at', null)
          .order('sort', { ascending: true }),
      ) ?? [],
  });
}

export function useAddGoals() {
  const { userId } = useAuth();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (
      goals: { title: string; category?: string | null; is_custom?: boolean }[],
    ) => {
      if (goals.length === 0) return;
      const { error } = await bilt.from('goals').insert(
        goals.map((goal, index) => ({
          user_id: userId!,
          title: goal.title,
          category: goal.category ?? null,
          is_custom: goal.is_custom ?? false,
          sort: index,
        })),
      );
      if (error) throw new Error(error.message);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: qk.goals(userId ?? 'anon') }),
  });
}

export function useArchiveGoal() {
  const { userId } = useAuth();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (goalId: string) => {
      const { error } = await bilt
        .from('goals')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', goalId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: qk.goals(userId ?? 'anon') }),
  });
}

export function useGoalLogs(days = 14) {
  const { userId } = useAuth();
  return useQuery({
    queryKey: qk.goalLogs(userId ?? 'anon'),
    enabled: Boolean(userId),
    queryFn: async (): Promise<GoalLog[]> =>
      unwrap(
        await bilt
          .from('goal_logs')
          .select('*')
          .eq('user_id', userId!)
          .gte('log_date', dayKey(subDays(new Date(), days)))
          .order('log_date', { ascending: false }),
      ) ?? [],
  });
}

export function useToggleGoalLog() {
  const { userId } = useAuth();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ goalId, done }: { goalId: string; done: boolean }) => {
      if (done) {
        const { error } = await bilt
          .from('goal_logs')
          .insert({ user_id: userId!, goal_id: goalId, log_date: todayKey() });
        if (error && !error.message.includes('duplicate')) throw new Error(error.message);
        return;
      }
      const { error } = await bilt
        .from('goal_logs')
        .delete()
        .eq('goal_id', goalId)
        .eq('log_date', todayKey());
      if (error) throw new Error(error.message);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: qk.goalLogs(userId ?? 'anon') }),
  });
}

export function useCheckins(days = 30) {
  const { userId } = useAuth();
  return useQuery({
    queryKey: qk.checkins(userId ?? 'anon'),
    enabled: Boolean(userId),
    queryFn: async (): Promise<Checkin[]> =>
      unwrap(
        await bilt
          .from('checkins')
          .select('*')
          .eq('user_id', userId!)
          .gte('checkin_date', dayKey(subDays(new Date(), days)))
          .order('checkin_date', { ascending: false }),
      ) ?? [],
  });
}

export function useSaveCheckin() {
  const { userId } = useAuth();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (draft: CheckinDraft & { checkin_date?: string }) => {
      const { error } = await bilt.from('checkins').upsert(
        {
          ...draft,
          user_id: userId!,
          checkin_date: draft.checkin_date ?? todayKey(),
        },
        { onConflict: 'user_id,checkin_date' },
      );
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: qk.checkins(userId ?? 'anon') });
    },
  });
}

export function useInsights() {
  const { userId } = useAuth();
  return useQuery({
    queryKey: qk.insights(userId ?? 'anon'),
    enabled: Boolean(userId),
    queryFn: async (): Promise<Insight[]> =>
      unwrap(
        await bilt
          .from('insights')
          .select('*')
          .eq('user_id', userId!)
          .order('created_at', { ascending: false })
          .limit(12),
      ) ?? [],
  });
}

/** Asks the ALIGN coach for fresh observations, then stores them. */
export function useGenerateInsights() {
  const { userId } = useAuth();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      checkins: Checkin[];
      baseline: Baseline | null;
      goals: Goal[];
      goalLogs: GoalLog[];
    }) => {
      const reading = capacityScore(args.checkins, args.goalLogs, args.goals.length);
      const goalProgress = args.goals
        .map((goal) => {
          const count = args.goalLogs.filter((log) => log.goal_id === goal.id).length;
          return `${goal.title}: ${count} of the last 14 days`;
        })
        .join('; ');

      const result = await alignInsights({
        checkins: args.checkins.slice(0, 14),
        baseline: args.baseline,
        goals: args.goals.map((goal) => goal.title),
        goalProgress,
        band: reading.band,
        score: reading.score,
      });

      if (result.insights.length > 0) {
        const { error } = await bilt.from('insights').insert(
          result.insights.map((insight) => ({
            user_id: userId!,
            kind: 'align',
            title: insight.title,
            body: insight.body,
            action: insight.action,
            insight_date: todayKey(),
          })),
        );
        if (error) throw new Error(error.message);
      }
      return result;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: qk.insights(userId ?? 'anon') }),
  });
}

export function useResetSession(sessionId: string | null) {
  return useQuery({
    queryKey: qk.resetSession(sessionId ?? 'none'),
    enabled: Boolean(sessionId),
    queryFn: async (): Promise<ResetSession | null> =>
      unwrap(await bilt.from('reset_sessions').select('*').eq('id', sessionId!).maybeSingle()),
  });
}

export function useResetItems(sessionId: string | null) {
  return useQuery({
    queryKey: qk.resetItems(sessionId ?? 'none'),
    enabled: Boolean(sessionId),
    queryFn: async (): Promise<ResetItem[]> =>
      unwrap(
        await bilt
          .from('reset_items')
          .select('*')
          .eq('session_id', sessionId!)
          .order('sort', { ascending: true }),
      ) ?? [],
  });
}

export function useCreateResetSession() {
  const { userId } = useAuth();
  return useMutation({
    mutationFn: async (brainDump: string): Promise<ResetSession> => {
      const row = unwrap<ResetSession>(
        await bilt
          .from('reset_sessions')
          .insert({ user_id: userId!, brain_dump: brainDump, stage: 'unpack' })
          .select('*')
          .single(),
      );
      return row;
    },
  });
}

export function useSaveResetItems() {
  const client = useQueryClient();
  const { userId } = useAuth();
  return useMutation({
    mutationFn: async ({
      sessionId,
      items,
    }: {
      sessionId: string;
      items: { content: string; category: string }[];
    }) => {
      await bilt.from('reset_items').delete().eq('session_id', sessionId);
      if (items.length === 0) return;
      const { error } = await bilt.from('reset_items').insert(
        items.map((item, index) => ({
          user_id: userId!,
          session_id: sessionId,
          content: item.content,
          category: item.category,
          sort: index,
        })),
      );
      if (error) throw new Error(error.message);
    },
    onSuccess: (_data, variables) =>
      client.invalidateQueries({ queryKey: qk.resetItems(variables.sessionId) }),
  });
}

export function useSetItemDecision() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({
      itemId,
      decision,
    }: {
      itemId: string;
      sessionId: string;
      decision: Decision | null;
    }) => {
      const { error } = await bilt.from('reset_items').update({ decision }).eq('id', itemId);
      if (error) throw new Error(error.message);
    },
    onSuccess: (_data, variables) =>
      client.invalidateQueries({ queryKey: qk.resetItems(variables.sessionId) }),
  });
}

export function useSetItemCategory() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({
      itemId,
      category,
    }: {
      itemId: string;
      sessionId: string;
      category: string;
    }) => {
      const { error } = await bilt.from('reset_items').update({ category }).eq('id', itemId);
      if (error) throw new Error(error.message);
    },
    onSuccess: (_data, variables) =>
      client.invalidateQueries({ queryKey: qk.resetItems(variables.sessionId) }),
  });
}

export function useDeleteResetItem() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId }: { itemId: string; sessionId: string }) => {
      const { error } = await bilt.from('reset_items').delete().eq('id', itemId);
      if (error) throw new Error(error.message);
    },
    onSuccess: (_data, variables) =>
      client.invalidateQueries({ queryKey: qk.resetItems(variables.sessionId) }),
  });
}

export function useUpdateResetSession() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sessionId,
      patch,
    }: {
      sessionId: string;
      patch: Partial<ResetSession>;
    }) => {
      const { error } = await bilt.from('reset_sessions').update(patch).eq('id', sessionId);
      if (error) throw new Error(error.message);
    },
    onSuccess: (_data, variables) =>
      client.invalidateQueries({ queryKey: qk.resetSession(variables.sessionId) }),
  });
}

export function useRecentResetSessions() {
  const { userId } = useAuth();
  return useQuery({
    queryKey: ['resetSessions', userId ?? 'anon'] as const,
    enabled: Boolean(userId),
    queryFn: async (): Promise<ResetSession[]> =>
      unwrap(
        await bilt
          .from('reset_sessions')
          .select('*')
          .eq('user_id', userId!)
          .not('completed_at', 'is', null)
          .order('created_at', { ascending: false })
          .limit(10),
      ) ?? [],
  });
}

/** Profile and goal detail the coach functions use to personalise their replies. */
export function useCoachContext(): CoachContext {
  const { data: profile } = useProfile();
  const { data: goals } = useGoals();

  return useMemo(
    () => ({
      firstName: profile?.first_name ?? null,
      lifeStage: profile?.life_stage ?? null,
      responsibilities: profile?.responsibilities ?? [],
      challenges: profile?.challenges ?? [],
      goals: (goals ?? []).map((goal) => goal.title),
    }),
    [profile, goals],
  );
}
