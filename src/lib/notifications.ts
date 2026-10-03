import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { translate, weekdayLabel, type Language } from '@/lib/i18n';
import type { DayPlan } from '@/lib/model';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const CHANNEL = 'workout-ready';

function clock(hour: number, minute: number): string {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${`${minute}`.padStart(2, '0')} ${suffix}`;
}

export async function ensureNotificationAccess(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Workout ready',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 180, 80, 180],
      lightColor: '#D6F25C',
    });
  }
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function rescheduleWorkoutReminders(plans: DayPlan[], language: Language = 'en'): Promise<string> {
  const granted = await ensureNotificationAccess();
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!granted) {
    return translate(language, 'notifyOff');
  }

  let count = 0;
  for (const plan of plans) {
    if (!plan.remind || plan.rest || plan.exerciseIds.length === 0) continue;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: translate(language, 'notifyReady', { title: plan.title === 'Train' ? translate(language, 'train') : plan.title }),
        body: translate(language, 'notifyBody', {
          count: plan.exerciseIds.length,
          day: weekdayLabel(language, plan.weekday),
        }),
        data: { weekday: plan.weekday },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: plan.weekday + 1,
        hour: plan.hour,
        minute: plan.minute,
        channelId: CHANNEL,
      },
    });
    count += 1;
  }

  const sample = plans.find((plan) => plan.remind && !plan.rest);
  const time = clock(sample?.hour ?? 7, sample?.minute ?? 0);
  if (!count) return translate(language, 'notifyNone');
  return translate(language, count === 1 ? 'notifySetOne' : 'notifySet', { count, time });
}
