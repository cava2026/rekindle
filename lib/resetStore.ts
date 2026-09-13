import { create } from 'zustand';

import type { PlanResult, ResetAction, ResetCategory, ResetItem, ResetSession } from '@/lib/types';

type DraftItem = { content: string; category: ResetCategory };

type ResetFlowState = {
  sessionId: string | null;
  brainDump: string;
  reflection: string;
  draftItems: DraftItem[];
  plan: PlanResult | null;
  coachDegraded: boolean;
  whyResponse: string;
  closingLine: string;
  setSessionId: (sessionId: string) => void;
  hydrate: (session: ResetSession, items: ResetItem[], actions: ResetAction[]) => void;
  start: (args: {
    sessionId: string;
    brainDump: string;
    reflection: string;
    items: DraftItem[];
    degraded: boolean;
  }) => void;
  setPlan: (plan: PlanResult, degraded: boolean) => void;
  setWhyResponse: (response: string, closingLine: string) => void;
  reset: () => void;
};

export const useResetFlow = create<ResetFlowState>((set) => ({
  sessionId: null,
  brainDump: '',
  reflection: '',
  draftItems: [],
  plan: null,
  coachDegraded: false,
  whyResponse: '',
  closingLine: '',
  setSessionId: (sessionId) => set({ sessionId }),
  hydrate: (session, items, actions) => {
    const now = actions.find((action) => action.horizon === 'next_five_minutes');
    const today = actions.filter((action) => action.horizon === 'today');
    const week = actions.filter((action) => action.horizon === 'this_week');
    const hasPlan = Boolean(now || today.length > 0 || week.length > 0);
    set({
      sessionId: session.id,
      brainDump: session.brain_dump,
      draftItems: items.map((item) => ({
        content: item.content,
        category: item.category as ResetCategory,
      })),
      plan: hasPlan
        ? {
            next_five_minutes: now?.title ?? '',
            today: today.map((action) => action.title),
            this_week: week.map((action) => action.title),
            why_prompt: session.why_prompt ?? '',
          }
        : null,
      coachDegraded: session.coach_degraded,
      whyResponse: session.coach_summary ?? '',
      closingLine: session.closing_line ?? '',
    });
  },
  start: ({ sessionId, brainDump, reflection, items, degraded }) =>
    set({
      sessionId,
      brainDump,
      reflection,
      draftItems: items,
      coachDegraded: degraded,
      plan: null,
      whyResponse: '',
      closingLine: '',
    }),
  setPlan: (plan, degraded) =>
    set((state) => ({ plan, coachDegraded: state.coachDegraded || degraded })),
  setWhyResponse: (whyResponse, closingLine) => set({ whyResponse, closingLine }),
  reset: () =>
    set({
      sessionId: null,
      brainDump: '',
      reflection: '',
      draftItems: [],
      plan: null,
      coachDegraded: false,
      whyResponse: '',
      closingLine: '',
    }),
}));
