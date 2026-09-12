import { create } from 'zustand';

import type { PlanResult, ResetCategory } from '@/lib/types';

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
