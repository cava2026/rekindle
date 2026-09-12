import type { Band, Decision, ResetCategory } from '@/lib/types';

export const MEDICAL_DISCLAIMER =
  'Burnout Buddy is an educational and wellness support tool. It is not a medical device, therapist, psychologist, physician, or crisis service. The information provided is for informational purposes only and should not be considered medical, psychological, legal, or financial advice.';

export const AI_DISCLAIMER =
  'Buddy is an AI wellness companion. It supports self-reflection, organisation and healthy habits. It does not diagnose or treat anything, and it is not a substitute for a qualified professional.';

export const CRISIS_HEADLINE =
  'It sounds like you may be experiencing a situation that requires professional support.';

export const CRISIS_BODY =
  'Burnout Buddy is not equipped to provide crisis or medical care. Please reach out to one of the services below, or contact a healthcare professional you trust. If you are in immediate danger, call your local emergency number.';

export type CrisisResource = {
  name: string;
  detail: string;
  action: string;
  href: string;
};

export const CRISIS_RESOURCES: CrisisResource[] = [
  {
    name: 'Emergency services',
    detail: 'Immediate danger, in the US and Canada. In the UK dial 999, in the EU dial 112.',
    action: 'Call 911',
    href: 'tel:911',
  },
  {
    name: '988 Suicide & Crisis Lifeline',
    detail: 'Free, confidential support 24/7 in the US. Call or text 988.',
    action: 'Call 988',
    href: 'tel:988',
  },
  {
    name: 'Crisis Text Line',
    detail: 'Text HOME to 741741 in the US and Canada, 85258 in the UK.',
    action: 'Text 741741',
    href: 'sms:741741',
  },
  {
    name: 'International helplines',
    detail: 'Find a crisis line in your country through Find A Helpline.',
    action: 'Open directory',
    href: 'https://findahelpline.com',
  },
  {
    name: 'Domestic violence support',
    detail: 'US National Hotline, confidential, 24/7.',
    action: 'Call 1-800-799-7233',
    href: 'tel:18007997233',
  },
];

/**
 * Hex equivalents of the brand tokens, for native props that cannot read
 * Uniwind classes (icons, status bar, navigation tints).
 */
export const BRAND_HEX = {
  lavender: '#7c5cc4',
  lavenderDeep: '#5b3f96',
  lavenderSoft: '#efe7fb',
  blush: '#e79aa0',
  blushDeep: '#b8555f',
  muted: '#8b7aa8',
  foreground: '#3a3050',
  surface: '#ffffff',
  background: '#faf7fd',
  border: '#e8e2f0',
} as const;

export const AGE_RANGES = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];

export const LIFE_STAGES = [
  'Student',
  'Early Career Professional',
  'Manager',
  'Director',
  'Executive',
  'Business Owner',
  'Retired',
  'Other',
];

export const RESPONSIBILITIES = [
  'Parent',
  'Caregiver',
  'Student',
  'Full-Time Worker',
  'Part-Time Worker',
  'Entrepreneur',
];

export const CHALLENGES = [
  'Work stress',
  'Financial stress',
  'Relationship stress',
  'Parenting stress',
  'Health concerns',
  'Sleep challenges',
  'Academic pressure',
  'Time management',
  'Feeling overwhelmed',
];

export const BASELINE_QUESTIONS = [
  { key: 'energy', label: 'Energy level', low: 'Depleted', high: 'Energised' },
  { key: 'stress', label: 'Stress level', low: 'Calm', high: 'Very stressed' },
  { key: 'motivation', label: 'Motivation', low: 'Flat', high: 'Driven' },
  { key: 'sleep_quality', label: 'Sleep quality', low: 'Restless', high: 'Restful' },
  { key: 'physical_activity', label: 'Physical activity', low: 'Sedentary', high: 'Very active' },
  { key: 'life_satisfaction', label: 'Life satisfaction', low: 'Unhappy', high: 'Content' },
  { key: 'work_satisfaction', label: 'Work satisfaction', low: 'Draining', high: 'Fulfilling' },
] as const;

export type BaselineKey = (typeof BASELINE_QUESTIONS)[number]['key'];

export const GOAL_TEMPLATES: { title: string; category: string }[] = [
  { title: 'Drink more water', category: 'Health' },
  { title: 'Improve sleep', category: 'Health' },
  { title: 'Exercise consistently', category: 'Health' },
  { title: 'Learn a new skill', category: 'Growth' },
  { title: 'Spend more time with family', category: 'Relationships' },
  { title: 'Reduce stress', category: 'Wellbeing' },
  { title: 'Read more', category: 'Growth' },
  { title: 'Build a side business', category: 'Work' },
  { title: 'Improve work-life balance', category: 'Work' },
];

export const CATEGORY_LABELS: Record<ResetCategory, string> = {
  work: 'Work',
  personal: 'Personal',
  family: 'Family',
  health: 'Health',
  financial: 'Financial',
  administrative: 'Administrative',
};

/** Safe label lookup for a category string coming back from the database. */
export function categoryLabel(value: string): string {
  const labels: Record<string, string> = CATEGORY_LABELS;
  return labels[value] ?? value;
}

export const DECISION_LABELS: Record<Decision, string> = {
  matters_most: 'Matters most',
  can_wait: 'Can wait',
  delegate: 'Delegate',
  eliminate: 'Let go',
};

export const DECISION_HINTS: Record<Decision, string> = {
  matters_most: 'Needs your attention now',
  can_wait: 'Real, but not this week',
  delegate: 'Someone else can carry this',
  eliminate: 'Drop it without guilt',
};

export const BAND_COPY: Record<
  Band,
  { label: string; description: string; colorClass: string; softClass: string; hex: string }
> = {
  sustainable: {
    label: 'Sustainable',
    description: 'Your reported pace looks manageable. Keep protecting what is working.',
    colorClass: 'bg-band-sustainable',
    softClass: 'bg-band-sustainable-soft',
    hex: '#5fa578',
  },
  elevated: {
    label: 'Elevated stress',
    description: 'A few signs of strain in your check-ins. Worth a small adjustment.',
    colorClass: 'bg-band-elevated',
    softClass: 'bg-band-elevated-soft',
    hex: '#dcb04a',
  },
  overloaded: {
    label: 'Overloaded',
    description: 'Your load looks heavier than your capacity right now. Time to subtract.',
    colorClass: 'bg-band-overloaded',
    softClass: 'bg-band-overloaded-soft',
    hex: '#d98a4e',
  },
  recovery: {
    label: 'Recovery recommended',
    description: 'Rest and recovery deserve priority over anything new.',
    colorClass: 'bg-band-recovery',
    softClass: 'bg-band-recovery-soft',
    hex: '#cf5f52',
  },
};

export const CHECKIN_SCALES = [
  { key: 'mood', label: 'Mood', low: 'Low', high: 'Bright' },
  { key: 'energy', label: 'Energy', low: 'Empty', high: 'Full' },
  { key: 'stress', label: 'Stress', low: 'Calm', high: 'Frazzled' },
  { key: 'focus', label: 'Focus', low: 'Scattered', high: 'Clear' },
] as const;

export const COACH_UNAVAILABLE_MESSAGE =
  'Buddy could not reach the coach just now, so this was organised locally. You can carry on, or try again in a moment.';
