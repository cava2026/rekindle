import { View } from 'react-native';
import { Check, Circle } from 'lucide-react-native';
import { Typography } from 'heroui-native';
import { format } from 'date-fns';

import { SectionCard } from '@/components/SectionCard';
import { BRAND_HEX, categoryLabel, DECISION_LABELS } from '@/lib/content';
import { DECISIONS, type ResetAction, type ResetItem, type ResetSession } from '@/lib/types';

const HORIZON_LABELS: Record<ResetAction['horizon'], string> = {
  next_five_minutes: 'Your 5-minute start',
  today: 'For today',
  this_week: 'For this week',
};

export function ResetRecordView({
  session,
  items,
  actions,
}: {
  session: ResetSession;
  items: ResetItem[];
  actions: ResetAction[];
}) {
  const priorities = items.filter((item) => item.decision === 'matters_most');

  return (
    <View className="gap-4">
      <View className="gap-1 px-1">
        <Typography className="text-foreground text-2xl font-bold">
          Your B.U.D.D.Y. reset
        </Typography>
        <Typography className="text-muted text-sm">
          {format(new Date(session.completed_at ?? session.created_at), "d MMMM yyyy 'at' h:mm a")}
        </Typography>
      </View>

      <SectionCard title="What was on your mind">
        <Typography className="text-foreground text-sm leading-6">{session.brain_dump}</Typography>
      </SectionCard>

      {items.length > 0 ? (
        <SectionCard title="What you sorted" subtitle="The decisions you made during this reset">
          <View className="gap-3">
            {items.map((item) => (
              <View key={item.id} className="border-border border-b pb-3 last:border-b-0 last:pb-0">
                <Typography className="text-foreground text-sm font-medium">
                  {item.content}
                </Typography>
                <Typography className="text-muted mt-1 text-xs">
                  {categoryLabel(item.category)} ·{' '}
                  {
                    DECISION_LABELS[
                      DECISIONS.find((decision) => decision === item.decision) ?? 'matters_most'
                    ]
                  }
                </Typography>
              </View>
            ))}
          </View>
        </SectionCard>
      ) : null}

      {priorities.length > 0 ? (
        <SectionCard title="What mattered most">
          <View className="gap-2">
            {priorities.map((item) => (
              <Typography key={item.id} className="text-foreground text-sm leading-5">
                • {item.content}
              </Typography>
            ))}
          </View>
        </SectionCard>
      ) : null}

      {actions.length > 0 ? (
        <SectionCard title="Your action plan">
          <View className="gap-4">
            {(['next_five_minutes', 'today', 'this_week'] as const).map((horizon) => {
              const horizonActions = actions.filter((action) => action.horizon === horizon);
              if (horizonActions.length === 0) return null;
              return (
                <View key={horizon} className="gap-2">
                  <Typography className="text-muted text-xs font-semibold tracking-wider uppercase">
                    {HORIZON_LABELS[horizon]}
                  </Typography>
                  {horizonActions.map((action) => (
                    <View key={action.id} className="flex-row items-start gap-2">
                      {action.completed_at ? (
                        <Check size={17} color={BRAND_HEX.lavender} />
                      ) : (
                        <Circle size={17} color={BRAND_HEX.muted} />
                      )}
                      <Typography
                        className={
                          action.completed_at
                            ? 'text-muted flex-1 text-sm line-through'
                            : 'text-foreground flex-1 text-sm'
                        }
                      >
                        {action.title}
                      </Typography>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        </SectionCard>
      ) : null}

      {session.why_reflection || session.closing_line ? (
        <SectionCard title="Your why">
          {session.why_reflection ? (
            <Typography className="text-foreground text-sm leading-6">
              {session.why_reflection}
            </Typography>
          ) : null}
          {session.closing_line ? (
            <View className="bg-accent-soft mt-3 rounded-2xl p-3">
              <Typography className="text-accent text-sm leading-5 font-semibold">
                {session.closing_line}
              </Typography>
            </View>
          ) : null}
        </SectionCard>
      ) : null}
    </View>
  );
}
