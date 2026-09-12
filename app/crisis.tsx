import { Linking, ScrollView, View } from 'react-native';
import { Button, Surface, Typography } from 'heroui-native';
import { PhoneCall } from 'lucide-react-native';

import { BRAND_HEX, CRISIS_BODY, CRISIS_HEADLINE, CRISIS_RESOURCES } from '@/lib/content';
import { goBackOrReplace } from '@/lib/navigation';

export default function CrisisScreen() {
  return (
    <ScrollView
      className="bg-surface flex-1"
      contentContainerClassName="gap-5 px-5 pb-10 pt-5"
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-3">
        <Typography className="text-foreground text-2xl leading-8 font-bold">
          {CRISIS_HEADLINE}
        </Typography>
        <Typography className="text-muted text-sm leading-6">{CRISIS_BODY}</Typography>
      </View>

      <View className="gap-3">
        {CRISIS_RESOURCES.map((resource) => (
          <Surface
            key={resource.name}
            className="border-border bg-background-secondary gap-3 rounded-3xl border p-4"
          >
            <View className="gap-1">
              <Typography className="text-foreground text-base font-semibold">
                {resource.name}
              </Typography>
              <Typography className="text-muted text-sm leading-5">{resource.detail}</Typography>
            </View>
            <Button
              variant="secondary"
              onPress={() => void Linking.openURL(resource.href)}
              accessibilityLabel={resource.action}
            >
              <Button.Label className="flex-row items-center gap-2">
                <PhoneCall size={16} color={BRAND_HEX.lavender} />
                {resource.action}
              </Button.Label>
            </Button>
          </Surface>
        ))}
      </View>

      <View className="bg-blush-soft rounded-3xl p-4">
        <Typography className="text-foreground text-sm leading-5">
          Buddy has paused coaching for now. Talking to a professional is the right next step, and
          Buddy will be here when you come back.
        </Typography>
      </View>

      <Button variant="ghost" onPress={() => goBackOrReplace('/(tabs)')}>
        <Button.Label>Back to Burnout Buddy</Button.Label>
      </Button>
    </ScrollView>
  );
}
