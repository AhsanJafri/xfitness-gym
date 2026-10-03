import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExerciseClip } from '@/components/ExerciseClip';
import { exerciseById } from '@/data/exercises';
import { weekdayForKey } from '@/lib/dates';
import { exerciseCopy, muscleLabel, scriptFonts, translate } from '@/lib/i18n';
import { useWorkout } from '@/lib/store';
import { colors, fonts } from '@/lib/theme';

export default function ExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const workout = useWorkout();
  const type = scriptFonts(workout.language);
  const exercise = exerciseById(String(id));
  if (!exercise) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={[styles.body, { fontFamily: type.body }]}>{translate(workout.language, 'missingExercise')}</Text>
      </SafeAreaView>
    );
  }
  const text = exerciseCopy(workout.language, exercise);

  const weekday = weekdayForKey(workout.today);
  const onPlan = workout.plans[weekday].exerciseIds.includes(exercise.id);

  const toggleToday = async () => {
    const plans = workout.plans.map((plan) => {
      if (plan.weekday !== weekday) return plan;
      const exerciseIds = onPlan
        ? plan.exerciseIds.filter((item) => item !== exercise.id)
        : [...plan.exerciseIds, exercise.id];
      return { ...plan, exerciseIds, rest: false, title: plan.rest ? muscleLabel(workout.language, exercise.muscle) : plan.title };
    });
    await workout.savePlans(plans);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/');
          }}
        >
          <Text style={[styles.back, { fontFamily: type.medium }]}>{translate(workout.language, 'close')}</Text>
        </Pressable>
        <Text style={[styles.kicker, { fontFamily: type.medium }]}>{muscleLabel(workout.language, exercise.muscle)} · {text.equipment}</Text>
        <Text style={[styles.title, { fontFamily: type.display }, workout.language !== 'en' && styles.scriptTitle]}>{text.name}</Text>
        <Text style={[styles.dose, { fontFamily: type.bold }]}>{translate(workout.language, 'setsDose', { sets: exercise.sets, reps: exercise.reps })}</Text>
        <ExerciseClip exerciseId={exercise.id} />
        <View style={styles.card}>
          <Text style={[styles.cardLabel, { fontFamily: type.medium }]}>{translate(workout.language, 'howTo')}</Text>
          <Text style={[styles.body, { fontFamily: type.body }]}>{text.cue}</Text>
        </View>
        <View style={styles.card}>
          <Text style={[styles.cardLabel, { fontFamily: type.medium }]}>{translate(workout.language, 'coachNote')}</Text>
          <Text style={[styles.body, { fontFamily: type.body }]}>{text.coachNote}</Text>
        </View>
        <Pressable style={styles.primary} onPress={toggleToday}>
          <Text style={[styles.primaryText, { fontFamily: type.bold }]}>{onPlan ? translate(workout.language, 'removeToday') : translate(workout.language, 'addToday')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 12, paddingBottom: 40 },
  back: { fontFamily: fonts.medium, color: colors.lime },
  kicker: { fontFamily: fonts.medium, color: colors.lime, letterSpacing: 1.2, textTransform: 'uppercase', fontSize: 12 },
  title: { fontFamily: fonts.display, color: colors.ink, fontSize: 48, lineHeight: 50 },
  scriptTitle: { fontSize: 32, lineHeight: 42 },
  dose: { fontFamily: fonts.bold, color: colors.ink, fontSize: 16 },
  card: { backgroundColor: colors.card, borderRadius: 18, padding: 16, gap: 6 },
  cardLabel: { fontFamily: fonts.medium, color: colors.muted, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' },
  body: { fontFamily: fonts.body, color: colors.ink, fontSize: 16, lineHeight: 23 },
  primary: { backgroundColor: colors.lime, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  primaryText: { fontFamily: fonts.bold, color: colors.limeInk, fontSize: 16 },
});
