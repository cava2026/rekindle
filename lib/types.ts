import type { Tables } from '@biltme/backend';

export type Profile = Tables<'profiles'>;
export type Baseline = Tables<'wellbeing_baseline'>;
export type Goal = Tables<'goals'>;
export type GoalLog = Tables<'goal_logs'>;
export type Checkin = Tables<'checkins'>;
export type ResetSession = Tables<'reset_sessions'>;
export type ResetItem = Tables<'reset_items'>;
export type Insight = Tables<'insights'>;

export const RESET_CATEGORIES = [
  'work',
  'personal',
  'family',
  'health',
  'financial',
  'administrative',
] as const;
export type ResetCategory = (typeof RESET_CATEGORIES)[number];

export const DECISIONS = ['matters_most', 'can_wait', 'delegate', 'eliminate'] as const;
export type Decision = (typeof DECISIONS)[number];

export type Band = 'sustainable' | 'elevated' | 'overloaded' | 'recovery';

export type CapacityReading = {
  score: number;
  band: Band;
  hasData: boolean;
  days: number;
};

/** Context the coach functions use to personalise their answers. */
export type CoachContext = {
  firstName?: string | null;
  lifeStage?: string | null;
  responsibilities?: string[];
  challenges?: string[];
  goals?: string[];
};

export type CoachItem = { content: string; category: ResetCategory };

export type OrganizeResult = {
  crisis: boolean;
  reflection: string;
  items: CoachItem[];
};

export type PlanResult = {
  next_five_minutes: string;
  today: string[];
  this_week: string[];
  why_prompt: string;
};

export type ReflectResult = {
  crisis: boolean;
  response: string;
  closing_line: string;
};

export type AlignInsight = { title: string; body: string; action: string };

export type AlignResult = {
  capacity_note: string;
  insights: AlignInsight[];
};

export type CheckinDraft = {
  mood: number;
  energy: number;
  stress: number;
  focus: number;
  sleep_hours: number | null;
  activity_minutes: number | null;
  meeting_count: number | null;
  work_hours: number | null;
  note: string | null;
};
