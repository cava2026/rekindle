import { FlatList, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Spinner, Typography } from 'heroui-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { format } from 'date-fns';

import { SectionCard } from '@/components/SectionCard';
import { BRAND_HEX } from '@/lib/content';
import { goBackOrReplace } from '@/lib/navigation';
import { useResetSessions } from '@/lib/queries';
import type { ResetSession } from '@/lib/types';

function ResetRow({ session }: { session: ResetSession }) {
  return (
    <Button
      variant="ghost"
      className="h-auto justify-start px-0 py-3"
      onPress={() =>
        router.push({ pathname: '/reset/[sessionId]', params: { sessionId: session.id } })
      }
    >
      <Button.Label className="flex-1 flex-row items-center gap-3">
        <View className="bg-accent-soft h-10 w-10 items-center justify-center rounded-2xl">
          <Typography className="text-accent font-bold">B</Typography>
        </View>
        <View className="flex-1 gap-0.5">
          <Typography className="text-foreground text-left text-sm font-semibold" numberOfLines={1}>
            {session.brain_dump}
          </Typography>
          <Typography className="text-muted text-left text-xs">
            {format(new Date(session.completed_at ?? session.created_at), 'd MMM yyyy')}
          </Typography>
        </View>
        <ChevronRight size={18} color={BRAND_HEX.muted} />
      </Button.Label>
    </Button>
  );
}

export default function ResetHistoryScreen() {
  const resets = useResetSessions();
  const completedResets = (resets.data ?? []).filter((session) => Boolean(session.completed_at));

  return (
    <View className="bg-background pt-safe flex-1">
      <View className="flex-row items-center gap-3 px-4 py-3">
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          accessibilityLabel="Go back"
          onPress={() => goBackOrReplace('/(tabs)/settings')}
        >
          <ChevronLeft size={22} color={BRAND_HEX.foreground} />
        </Button>
        <View className="flex-1">
          <Typography className="text-foreground text-xl font-bold">Your resets</Typography>
          <Typography className="text-muted text-xs">Review what you worked through</Typography>
        </View>
      </View>

      {resets.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Spinner />
        </View>
      ) : (
        <FlatList
          data={completedResets}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3 px-4 pb-safe-offset-6"
          renderItem={({ item }) => (
            <SectionCard>
              <ResetRow session={item} />
            </SectionCard>
          )}
          ListEmptyComponent={
            <SectionCard title="No completed resets yet">
              <Typography className="text-muted text-sm leading-5">
                When you complete a B.U.D.D.Y. reset, you can return here to review it.
              </Typography>
            </SectionCard>
          }
        />
      )}
    </View>
  );
}
