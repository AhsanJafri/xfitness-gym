import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/ui';
import { WEEK_ORDER } from '@/lib/dates';
import { planTitle, scriptFonts, translate, weekdayLabel } from '@/lib/i18n';
import { useWorkout } from '@/lib/store';
import { colors, fonts } from '@/lib/theme';

export default function PlanScreen() {
  const workout = useWorkout();
  const type = scriptFonts(workout.language);
  const [hour, setHour] = useState(workout.plans[1]?.hour ?? 7);
  const [status, setStatus] = useState<string | null>(null);

  const applyTime = async () => {
    const plans = workout.plans.map((plan) => ({ ...plan, hour, minute: 0, remind: !plan.rest }));
    setStatus(await workout.savePlans(plans));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          kicker={translate(workout.language, 'yourWeek')}
          title={translate(workout.language, 'schedule')}
          detail={translate(workout.language, 'scheduleDetail')}
        />
        <View style={styles.timeRow}>
          {[6, 7, 8, 18].map((value) => (
            <Pressable key={value} style={[styles.chip, hour === value && styles.chipOn]} onPress={() => setHour(value)}>
              <Text style={[styles.chipText, hour === value && styles.chipTextOn]}>{value}:00</Text>
            </Pressable>
          ))}
        </View>
        <Pressable style={styles.primary} onPress={applyTime}>
          <Text style={[styles.primaryText, { fontFamily: type.bold }]}>{translate(workout.language, 'saveReminder')}</Text>
        </Pressable>
        {status ? <Text style={[styles.status, { fontFamily: type.body }]}>{status}</Text> : null}
        {WEEK_ORDER.map((weekday) => {
          const plan = workout.plans[weekday];
          return (
            <Pressable key={weekday} style={styles.day} onPress={() => router.push(`/day/${weekday}`)}>
              <View>
                <Text style={[styles.dow, { fontFamily: type.medium }]}>{weekdayLabel(workout.language, weekday)}</Text>
                <Text style={[styles.title, { fontFamily: type.display }, workout.language !== 'en' && styles.scriptTitle]}>{planTitle(workout.language, plan.title, plan.rest)}</Text>
              </View>
              <Text style={[styles.meta, { fontFamily: type.medium }]}>
                {plan.rest ? translate(workout.language, 'off') : translate(workout.language, 'exercises', { count: plan.exerciseIds.length })}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40, gap: 12 },
  timeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { borderRadius: 999, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 14, paddingVertical: 8 },
  chipOn: { backgroundColor: colors.lime, borderColor: colors.lime },
  chipText: { fontFamily: fonts.medium, color: colors.ink },
  chipTextOn: { color: colors.limeInk },
  primary: { backgroundColor: colors.lime, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  primaryText: { fontFamily: fonts.bold, color: colors.limeInk, fontSize: 16 },
  status: { fontFamily: fonts.body, color: colors.muted, lineHeight: 20 },
  day: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dow: { fontFamily: fonts.medium, color: colors.lime, fontSize: 12, letterSpacing: 1.1 },
  title: { fontFamily: fonts.display, color: colors.ink, fontSize: 32, lineHeight: 34 },
  scriptTitle: { fontSize: 26, lineHeight: 36 },
  meta: { fontFamily: fonts.medium, color: colors.muted },
});
