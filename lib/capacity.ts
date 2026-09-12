import type { Band, CapacityReading, Checkin, GoalLog } from '@/lib/types';

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Sleep contributes most between 7 and 9 hours, tapering either side. */
function sleepScore(hours: number | null | undefined): number | null {
  if (hours == null) return null;
  if (hours >= 7 && hours <= 9) return 1;
  if (hours < 7) return clamp01(hours / 7);
  return clamp01(1 - (hours - 9) / 4);
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * Alignment & Capacity Score: a self-report summary of how sustainable the
 * user's own reported pace looks. Not a burnout score, not a health measure.
 */
export function capacityScore(
  checkins: Checkin[],
  goalLogs: GoalLog[] = [],
  goalCount = 0,
): CapacityReading {
  const recent = checkins.slice(0, 7);
  if (recent.length === 0) {
    return { score: 0, band: 'elevated', hasData: false, days: 0 };
  }

  const energy = average(recent.map((c) => c.energy)) ?? 5;
  const stress = average(recent.map((c) => c.stress)) ?? 5;
  const mood = average(recent.map((c) => c.mood)) ?? 5;
  const focus = average(recent.map((c) => c.focus)) ?? 5;
  const sleep = average(
    recent.map((c) => sleepScore(c.sleep_hours)).filter((v): v is number => v != null),
  );

  const parts: { value: number; weight: number }[] = [
    { value: clamp01((energy - 1) / 9), weight: 0.26 },
    { value: clamp01((10 - stress) / 9), weight: 0.32 },
    { value: clamp01((mood - 1) / 9), weight: 0.16 },
    { value: clamp01((focus - 1) / 9), weight: 0.1 },
  ];

  if (sleep != null) parts.push({ value: sleep, weight: 0.12 });

  if (goalCount > 0 && recent.length > 0) {
    const days = Math.min(7, recent.length);
    const possible = goalCount * days;
    const done = goalLogs.length;
    parts.push({ value: clamp01(done / possible), weight: 0.08 });
  }

  const totalWeight = parts.reduce((sum, part) => sum + part.weight, 0);
  const weighted = parts.reduce((sum, part) => sum + part.value * part.weight, 0);
  const score = Math.round((weighted / totalWeight) * 100);

  return { score, band: bandForScore(score), hasData: true, days: recent.length };
}

export function bandForScore(score: number): Band {
  if (score >= 75) return 'sustainable';
  if (score >= 60) return 'elevated';
  if (score >= 45) return 'overloaded';
  return 'recovery';
}

export type TrendDirection = 'up' | 'down' | 'flat';

export type Trend = {
  label: string;
  current: number | null;
  previous: number | null;
  direction: TrendDirection;
  unit: string;
  /** True when a rise in this metric is a good sign. */
  higherIsBetter: boolean;
};

function windowAverage(
  checkins: Checkin[],
  pick: (c: Checkin) => number | null | undefined,
  from: number,
  to: number,
): number | null {
  const values = checkins
    .slice(from, to)
    .map(pick)
    .filter((v): v is number => v != null);
  return average(values);
}

function direction(current: number | null, previous: number | null): TrendDirection {
  if (current == null || previous == null) return 'flat';
  const delta = current - previous;
  if (Math.abs(delta) < 0.35) return 'flat';
  return delta > 0 ? 'up' : 'down';
}

/** Compares the last 7 days of check-ins with the 7 before them. */
export function buildTrends(checkins: Checkin[]): Trend[] {
  const spec: {
    label: string;
    pick: (c: Checkin) => number | null | undefined;
    unit: string;
    higherIsBetter: boolean;
  }[] = [
    { label: 'Sleep', pick: (c) => c.sleep_hours, unit: 'h', higherIsBetter: true },
    { label: 'Activity', pick: (c) => c.activity_minutes, unit: 'min', higherIsBetter: true },
    { label: 'Stress', pick: (c) => c.stress, unit: '/10', higherIsBetter: false },
    { label: 'Energy', pick: (c) => c.energy, unit: '/10', higherIsBetter: true },
    { label: 'Meetings', pick: (c) => c.meeting_count, unit: '/day', higherIsBetter: false },
    { label: 'Work hours', pick: (c) => c.work_hours, unit: 'h', higherIsBetter: false },
  ];

  return spec.map(({ label, pick, unit, higherIsBetter }) => {
    const current = windowAverage(checkins, pick, 0, 7);
    const previous = windowAverage(checkins, pick, 7, 14);
    return {
      label,
      current,
      previous,
      direction: direction(current, previous),
      unit,
      higherIsBetter,
    };
  });
}

export function trendIsPositive(trend: Trend): boolean | null {
  if (trend.direction === 'flat') return null;
  return trend.higherIsBetter ? trend.direction === 'up' : trend.direction === 'down';
}

/** Longest run of consecutive nights below the user's own sleep average. */
export function belowAverageSleepStreak(
  checkins: Checkin[],
): { streak: number; average: number } | null {
  const withSleep = checkins.filter(
    (c): c is Checkin & { sleep_hours: number } => c.sleep_hours != null,
  );
  if (withSleep.length < 3) return null;
  const avg = average(withSleep.map((c) => c.sleep_hours)) ?? 0;
  let streak = 0;
  for (const checkin of checkins) {
    if (checkin.sleep_hours == null) break;
    if (checkin.sleep_hours < avg - 0.25) streak += 1;
    else break;
  }
  return { streak, average: Math.round(avg * 10) / 10 };
}
