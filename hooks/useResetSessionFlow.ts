import { useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';

import { resetRouteAtIndex, resetStageIndex } from '@/lib/navigation';
import { useResetActions, useResetItems, useResetSession } from '@/lib/queries';
import { useResetFlow } from '@/lib/resetStore';

export function useResetSessionFlow() {
  const params = useLocalSearchParams<{ sessionId?: string | string[] }>();
  const storedSessionId = useResetFlow((state) => state.sessionId);
  const setSessionId = useResetFlow((state) => state.setSessionId);
  const hydrate = useResetFlow((state) => state.hydrate);
  const paramSessionId = Array.isArray(params.sessionId) ? params.sessionId[0] : params.sessionId;
  const sessionId = paramSessionId ?? storedSessionId;

  const session = useResetSession(sessionId);
  const items = useResetItems(sessionId);
  const actions = useResetActions(sessionId);

  useEffect(() => {
    if (paramSessionId && paramSessionId !== storedSessionId) setSessionId(paramSessionId);
  }, [paramSessionId, setSessionId, storedSessionId]);

  useEffect(() => {
    if (!session.data || !items.data || !actions.data) return;
    hydrate(session.data, items.data, actions.data);
  }, [actions.data, hydrate, items.data, session.data]);

  const maxStage = resetStageIndex(session.data?.stage);
  const onStagePress = (stage: number) => {
    if (!sessionId || stage > maxStage) return;
    router.push(resetRouteAtIndex(sessionId, stage));
  };

  return { sessionId, session, items, actions, maxStage, onStagePress };
}
