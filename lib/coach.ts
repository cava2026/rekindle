import { bilt } from '@/lib/bilt';
import {
  type AlignResult,
  type Baseline,
  type Checkin,
  type CoachContext,
  type CoachItem,
  type OrganizeResult,
  type PlanResult,
  type ReflectResult,
  type ResetCategory,
  RESET_CATEGORIES,
} from '@/lib/types';
import { containsCrisisLanguage } from '@/lib/safety';

export class CoachUnavailableError extends Error {
  constructor() {
    super('coach_unavailable');
    this.name = 'CoachUnavailableError';
  }
}

async function invoke<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await bilt.functions.invoke(name, { body });
  if (error) throw new CoachUnavailableError();
  if (data && typeof data === 'object' && 'error' in data) throw new CoachUnavailableError();
  return data as T;
}

const CATEGORY_HINTS: { category: ResetCategory; words: string[] }[] = [
  {
    category: 'work',
    words: [
      'work',
      'boss',
      'client',
      'meeting',
      'deadline',
      'project',
      'email',
      'presentation',
      'team',
      'launch',
    ],
  },
  {
    category: 'family',
    words: [
      'kid',
      'kids',
      'child',
      'son',
      'daughter',
      'mom',
      'mum',
      'dad',
      'partner',
      'husband',
      'wife',
      'school',
      'family',
    ],
  },
  {
    category: 'health',
    words: [
      'sleep',
      'gym',
      'doctor',
      'dentist',
      'workout',
      'tired',
      'exhausted',
      'eat',
      'water',
      'appointment',
      'body',
    ],
  },
  {
    category: 'financial',
    words: [
      'money',
      'bill',
      'rent',
      'mortgage',
      'invoice',
      'tax',
      'budget',
      'debt',
      'salary',
      'pay',
    ],
  },
  {
    category: 'administrative',
    words: [
      'form',
      'renew',
      'insurance',
      'paperwork',
      'admin',
      'licence',
      'license',
      'passport',
      'booking',
      'cancel',
    ],
  },
];

function guessCategory(text: string): ResetCategory {
  const lower = text.toLowerCase();
  for (const hint of CATEGORY_HINTS) {
    if (hint.words.some((word) => lower.includes(word))) return hint.category;
  }
  return 'personal';
}

/** Local, offline split used when the coach cannot be reached, so the flow never dead-ends. */
export function localOrganize(brainDump: string): CoachItem[] {
  return brainDump
    .split(/\n|(?:[.;!?]+\s)|,\s(?=[A-Za-z]{4})/)
    .map((line) => line.replace(/^[\s\-*•\d.)]+/, '').trim())
    .filter((line) => line.length > 2)
    .slice(0, 25)
    .map((content) => ({ content: content.slice(0, 300), category: guessCategory(content) }));
}

export async function organizeBrainDump(
  brainDump: string,
  context: CoachContext,
): Promise<OrganizeResult> {
  if (containsCrisisLanguage(brainDump)) {
    return { crisis: true, reflection: '', items: [] };
  }
  const result = await invoke<OrganizeResult>('coach-reset', {
    action: 'organize',
    brainDump,
    context,
  });
  return {
    crisis: result.crisis,
    reflection: result.reflection ?? '',
    items: (result.items ?? []).map((item) => ({
      content: item.content,
      category: RESET_CATEGORIES.includes(item.category) ? item.category : 'personal',
    })),
  };
}

export function localPlan(items: { content: string; decision: string | null }[]): PlanResult {
  const priority = items.filter((i) => i.decision === 'matters_most');
  const later = items.filter((i) => i.decision === 'can_wait');
  const delegate = items.filter((i) => i.decision === 'delegate');
  const pool = priority.length > 0 ? priority : items;

  const today = pool.slice(0, 3).map((i) => `Spend 15 focused minutes on: ${i.content}`);
  while (today.length < 3) {
    today.push(
      [
        'Step outside for a five minute walk',
        'Write down tomorrow’s single priority',
        'Drink a full glass of water',
      ][today.length],
    );
  }

  const week: string[] = [];
  if (delegate[0]) week.push(`Ask someone to take on: ${delegate[0].content}`);
  if (pool[0]) week.push(`Block one hour this week for: ${pool[0].content}`);
  if (later[0]) week.push(`Park until next week, on paper: ${later[0].content}`);
  while (week.length < 3) {
    week.push(
      [
        'Protect one evening with nothing scheduled',
        'Plan one meal you actually enjoy',
        'Choose one thing to say no to',
      ][week.length],
    );
  }

  return {
    next_five_minutes: 'Get a glass of water and drink it slowly, without your phone.',
    today: today.slice(0, 3),
    this_week: week.slice(0, 3),
    why_prompt: 'Which of these commitments is most connected to the life you want to build?',
  };
}

export async function planFromItems(
  items: { content: string; category: string; decision: string | null }[],
  context: CoachContext,
): Promise<PlanResult> {
  return invoke<PlanResult>('coach-reset', { action: 'plan', items, context });
}

export async function reflectOnWhy(
  reflection: string,
  prompt: string,
  context: CoachContext,
): Promise<ReflectResult> {
  if (containsCrisisLanguage(reflection)) return { crisis: true, response: '', closing_line: '' };
  return invoke<ReflectResult>('coach-reset', { action: 'reflect', reflection, prompt, context });
}

export async function alignInsights(args: {
  checkins: Checkin[];
  baseline: Baseline | null;
  goals: string[];
  goalProgress: string;
  band: string;
  score: number;
}): Promise<AlignResult> {
  return invoke<AlignResult>('coach-align', {
    checkins: args.checkins.map((c) => ({
      checkin_date: c.checkin_date,
      mood: c.mood,
      energy: c.energy,
      stress: c.stress,
      focus: c.focus,
      sleep_hours: c.sleep_hours,
      activity_minutes: c.activity_minutes,
      meeting_count: c.meeting_count,
      work_hours: c.work_hours,
    })),
    baseline: args.baseline,
    goals: args.goals,
    goalProgress: args.goalProgress,
    band: args.band,
    score: args.score,
  });
}
