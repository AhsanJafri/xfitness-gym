import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdOffer } from '@/components/AdOffer';
import { CompletionBurst } from '@/components/CompletionBurst';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { ScreenHeader } from '@/components/ui';
import { exerciseById } from '@/data/exercises';
import { weekdayForKey } from '@/lib/dates';
import { exerciseCopy, planTitle, scriptFonts, translate, weekdayLabel } from '@/lib/i18n';
import { setsDoneToday, useWorkout } from '@/lib/store';
import { colors, fonts } from '@/lib/theme';

export default function TodayScreen() {
  const workout = useWorkout();
  const copy = exerciseCopy.bind(null, workout.language);
  const type = scriptFonts(workout.language);
  const weekday = weekdayForKey(workout.today);
  const plan = workout.plans[weekday];
  const [burst, setBurst] = useState<string | null>(null);
  const exercises = plan.exerciseIds.map((id) => exerciseById(id)).filter((item) => item != null);
  const doneCount = exercises.filter((item) => setsDoneToday(workout, workout.today, item.id) >= item.sets).length;
  const scheduled = workout.plans.some((item) => !item.rest && item.exerciseIds.length > 0);

  const finish = (id: string, name: string, already: boolean) => {
    workout.toggleDone(id);
    if (!already) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      setBurst(name);
    }
  };

  if (!workout.hydrated) return <SafeAreaView style={styles.safe} />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          kicker={weekdayLabel(workout.language, weekday)}
          title={planTitle(workout.language, plan.title, plan.rest)}
          detail={
            plan.rest
              ? translate(workout.language, 'restDetail')
              : exercises.length
                ? translate(workout.language, 'doneOf', { done: doneCount, total: exercises.length })
                : translate(workout.language, 'emptyDay')
          }
        />
        <LanguageSwitch language={workout.language} country={workout.country} onChange={workout.setLanguage} />
        {exercises.length === 0 ? (
          <View style={styles.motivation}>
            <Text style={[styles.motivationText, { fontFamily: type.body }]}>{translate(workout.language, 'motivate')}</Text>
          </View>
        ) : null}
        <AdOffer language={workout.language} />
        {!scheduled ? (
          <Pressable style={styles.primary} onPress={() => router.push('/plan')}>
            <Text style={[styles.primaryText, { fontFamily: type.bold }]}>{translate(workout.language, 'setWeek')}</Text>
          </Pressable>
        ) : null}
        {exercises.map((exercise) => {
          const done = setsDoneToday(workout, workout.today, exercise.id) >= exercise.sets;
          const text = copy(exercise);
          return (
            <Pressable key={exercise.id} style={styles.row} onPress={() => router.push(`/exercise/${exercise.id}`)}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { fontFamily: type.bold }]}>{text.name}</Text>
                <Text style={[styles.meta, { fontFamily: type.body }]}>{exercise.sets} × {exercise.reps}</Text>
              </View>
              <Pressable
                style={[styles.done, done && styles.doneOn]}
                onPress={() => finish(exercise.id, text.name, done)}
              >
                <Text style={[styles.doneText, { fontFamily: type.bold }, done && styles.doneTextOn]}>
                  {done ? translate(workout.language, 'done') : translate(workout.language, 'markDone')}
                </Text>
              </Pressable>
            </Pressable>
          );
        })}
      </ScrollView>
      <CompletionBurst visible={Boolean(burst)} title={burst ?? ''} onDone={() => setBurst(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40, gap: 12 },
  primary: { backgroundColor: colors.lime, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  primaryText: { fontFamily: fonts.bold, color: colors.limeInk, fontSize: 16 },
  motivation: { backgroundColor: colors.card, borderRadius: 16, padding: 16 },
  motivationText: { fontFamily: fonts.body, color: colors.ink, fontSize: 16, lineHeight: 24 },
  row: { backgroundColor: colors.card, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontFamily: fonts.bold, color: colors.ink, fontSize: 17 },
  meta: { fontFamily: fonts.body, color: colors.muted, marginTop: 2 },
  done: { borderRadius: 12, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 12, paddingVertical: 10 },
  doneOn: { backgroundColor: colors.lime, borderColor: colors.lime },
  doneText: { fontFamily: fonts.bold, color: colors.ink },
  doneTextOn: { color: colors.limeInk },
});
