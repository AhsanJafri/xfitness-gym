import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pill, ScreenHeader } from '@/components/ui';
import { EXERCISES, MUSCLES, type Muscle } from '@/data/exercises';
import { exerciseCopy, muscleLabel, scriptFonts, translate } from '@/lib/i18n';
import { useWorkout } from '@/lib/store';
import { colors, fonts } from '@/lib/theme';

export default function LibraryScreen() {
  const workout = useWorkout();
  const type = scriptFonts(workout.language);
  const [muscle, setMuscle] = useState<Muscle | 'all'>('all');
  const list = useMemo(
    () => (muscle === 'all' ? EXERCISES : EXERCISES.filter((exercise) => exercise.muscle === muscle)),
    [muscle],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          kicker={translate(workout.language, 'movements')}
          title={translate(workout.language, 'library')}
          detail={translate(workout.language, 'libraryDetail')}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Pill label={translate(workout.language, 'all')} active={muscle === 'all'} onPress={() => setMuscle('all')} />
          {MUSCLES.map((item) => (
            <Pill key={item} label={muscleLabel(workout.language, item)} active={muscle === item} onPress={() => setMuscle(item)} />
          ))}
        </ScrollView>
        {list.map((exercise) => {
          const text = exerciseCopy(workout.language, exercise);
          return (
            <Pressable key={exercise.id} style={styles.card} onPress={() => router.push(`/exercise/${exercise.id}`)}>
              <Text style={[styles.muscle, { fontFamily: type.medium }]}>{muscleLabel(workout.language, exercise.muscle)}</Text>
              <Text style={[styles.name, { fontFamily: type.bold }]}>{text.name}</Text>
              <Text style={[styles.meta, { fontFamily: type.body }]}>{text.equipment} · {exercise.sets} × {exercise.reps}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40, gap: 10 },
  chips: { gap: 8, paddingVertical: 8 },
  card: { backgroundColor: colors.card, borderRadius: 18, padding: 16, gap: 4 },
  muscle: { fontFamily: fonts.medium, color: colors.lime, fontSize: 12, letterSpacing: 1.1, textTransform: 'uppercase' },
  name: { fontFamily: fonts.bold, color: colors.ink, fontSize: 18 },
  meta: { fontFamily: fonts.body, color: colors.muted, fontSize: 14 },
});
