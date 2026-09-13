import { ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Button, Spinner, Typography } from 'heroui-native';
import { ChevronLeft } from 'lucide-react-native';

import { ResetRecordView } from '@/components/ResetRecordView';
import { BRAND_HEX } from '@/lib/content';
import { goBackOrReplace } from '@/lib/navigation';
import { useResetActions, useResetItems, useResetSession } from '@/lib/queries';

export default function ResetDetailScreen() {
  const params = useLocalSearchParams<{ sessionId?: string | string[] }>();
  const sessionId = Array.isArray(params.sessionId) ? params.sessionId[0] : params.sessionId;
  const session = useResetSession(sessionId ?? null);
  const items = useResetItems(sessionId ?? null);
  const actions = useResetActions(sessionId ?? null);

  return (
    <View className="bg-background pt-safe flex-1">
      <View className="flex-row items-center gap-3 px-4 py-3">
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          accessibilityLabel="Go back"
          onPress={() => goBackOrReplace('/reset/history')}
        >
          <ChevronLeft size={22} color={BRAND_HEX.foreground} />
        </Button>
        <Typography className="text-foreground text-lg font-semibold">Reset details</Typography>
      </View>

      {session.isLoading || items.isLoading || actions.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Spinner />
        </View>
      ) : session.data ? (
        <ScrollView
          contentContainerClassName="px-4 pb-safe-offset-6"
          showsVerticalScrollIndicator={false}
        >
          <ResetRecordView
            session={session.data}
            items={items.data ?? []}
            actions={actions.data ?? []}
          />
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center gap-2 px-6">
          <Typography className="text-foreground text-lg font-semibold">Reset not found</Typography>
          <Typography className="text-muted text-center text-sm">
            This reset may no longer be available.
          </Typography>
        </View>
      )}
    </View>
  );
}
