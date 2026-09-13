import { router, type Href } from 'expo-router';

import type { ResetSession, ResetStage } from '@/lib/types';
import { RESET_STAGE_ORDER } from '@/lib/types';

export function goBackOrReplace(fallback: Href) {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}

const RESET_STAGE_PATHS = {
  unpack: '/reset/unpack',
  decide: '/reset/decide',
  do: '/reset/do',
  why: '/reset/why',
  complete: '/reset/summary',
} as const;

export function resetRoute(sessionId: string, stage: ResetStage): Href {
  return { pathname: RESET_STAGE_PATHS[stage], params: { sessionId } };
}

export function resetBrainDumpRoute(sessionId?: string): Href {
  return sessionId ? { pathname: '/reset/brain-dump', params: { sessionId } } : '/reset/brain-dump';
}

export function resetStageIndex(stage?: string | null): number {
  const index = RESET_STAGE_ORDER.indexOf(stage as ResetStage);
  return index < 0 ? 0 : Math.min(index + 1, 4);
}

export function resetRouteAtIndex(sessionId: string, index: number): Href {
  if (index <= 0) return resetBrainDumpRoute(sessionId);
  return resetRoute(
    sessionId,
    RESET_STAGE_ORDER[Math.min(index - 1, RESET_STAGE_ORDER.length - 1)],
  );
}

export function resetRouteForSession(session: ResetSession): Href {
  const stage = (
    Object.hasOwn(RESET_STAGE_PATHS, session.stage) ? session.stage : 'unpack'
  ) as ResetStage;
  return resetRoute(session.id, stage);
}
