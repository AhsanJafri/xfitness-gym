import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EXERCISES, MUSCLES, type Muscle } from '@/data/exercises';
import { exerciseCopy, muscleLabel, scriptFonts, translate, weekdayLabel } from '@/lib/i18n';
import { useWorkout } from '@/lib/store';
import { colors, fonts } from '@/lib/theme';

export default function DayEditorScreen() {
  const params = useLocalSearchParams<{ weekday: string }>();
  const weekday = Number(params.weekday);
  const workout = useWorkout();
  const type = scriptFonts(workout.language);
  const t = (key: Parameters<typeof translate>[1], vars?: Parameters<typeof translate>[2]) => translate(workout.language, key, vars);
  const existing = workout.plans[weekday];
  const [title, setTitle] = useState(existing?.title ?? 'Train');
  const [rest, setRest] = useState(existing?.rest ?? false);
  const [remind, setRemind] = useState(existing?.remind ?? true);
  const [hour, setHour] = useState(existing?.hour ?? 7);
  const [minute, setMinute] = useState(existing?.minute ?? 0);
  const [ids, setIds] = useState<string[]>(existing?.exerciseIds ?? []);
  const [muscle, setMuscle] = useState<Muscle>('chest');
  const [status, setStatus] = useState<string | null>(null);

  const toggle = (id: string) => {
    setIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const save = async () => {
    const plans = workout.plans.map((plan) =>
      plan.weekday === weekday
        ? { ...plan, title: title.trim() || 'Train', rest, remind, hour, minute, exerciseIds: rest ? [] : ids, }
        : plan,
    );
    setStatus(await workout.savePlans(plans));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/plan');
          }}
        >
          <Text style={[styles.back, { fontFamily: type.medium }]}>{t('close')}</Text>
        </Pressable>
        <Text style={[styles.kicker, { fontFamily: type.medium }]}>{weekdayLabel(workout.language, weekday)}</Text>
        <TextInput value={title === 'Train' ? t('train') : title} onChangeText={setTitle} style={[styles.input, { fontFamily: type.display }]} placeholder={t('dayName')} placeholderTextColor={colors.muted} />
        <View style={styles.row}>
          <Pressable style={[styles.chip, rest && styles.chipOn]} onPress={() => setRest((value) => !value)}>
            <Text style={[styles.chipText, { fontFamily: type.medium }, rest && styles.chipTextOn]}>{rest ? t('restDay') : t('trainingDay')}</Text>
          </Pressable>
          <Pressable style={[styles.chip, remind && styles.chipOn]} onPress={() => setRemind((value) => !value)}>
            <Text style={[styles.chipText, { fontFamily: type.medium }, remind && styles.chipTextOn]}>{remind ? t('reminderOn') : t('reminderOff')}</Text>
          </Pressable>
        </View>
        <View style={styles.row}>
          <Pressable style={styles.chip} onPress={() => setHour((value) => (value + 23) % 24)}><Text style={[styles.chipText, { fontFamily: type.medium }]}>{t('hour', { value: `${hour}`.padStart(2, '0') })}</Text></Pressable>
          <Pressable style={styles.chip} onPress={() => setMinute((value) => (value + 15) % 60)}><Text style={[styles.chipText, { fontFamily: type.medium }]}>{t('minute', { value: `${minute}`.padStart(2, '0') })}</Text></Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {MUSCLES.map((item) => (
            <Pressable key={item} style={[styles.chip, muscle === item && styles.chipOn]} onPress={() => setMuscle(item)}>
              <Text style={[styles.chipText, { fontFamily: type.medium }, muscle === item && styles.chipTextOn]}>{muscleLabel(workout.language, item)}</Text>
            </Pressable>
          ))}
        </ScrollView>
        {EXERCISES.filter((exercise) => exercise.muscle === muscle).map((exercise) => {
          const on = ids.includes(exercise.id);
          return (
            <Pressable key={exercise.id} style={[styles.item, on && styles.itemOn]} onPress={() => toggle(exercise.id)}>
              <Text style={[styles.itemText, { fontFamily: type.medium }, on && styles.itemTextOn]}>{exerciseCopy(workout.language, exercise).name}</Text>
            </Pressable>
          );
        })}
        <Pressable style={styles.primary} onPress={save}>
          <Text style={[styles.primaryText, { fontFamily: type.bold }]}>{t('saveDay')}</Text>
        </Pressable>
        {status ? <Text style={styles.status}>{status}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 10, paddingBottom: 48 },
  back: { fontFamily: fonts.medium, color: colors.lime },
  kicker: { fontFamily: fonts.medium, color: colors.muted, letterSpacing: 1.2, textTransform: 'uppercase' },
  input: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 44,
    color: colors.ink,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: 6,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 999, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 12, paddingVertical: 8 },
  chipOn: { backgroundColor: colors.lime, borderColor: colors.lime },
  chipText: { fontFamily: fonts.medium, color: colors.ink },
  chipTextOn: { color: colors.limeInk },
  item: { backgroundColor: colors.card, borderRadius: 14, padding: 14 },
  itemOn: { backgroundColor: colors.lime },
  itemText: { fontFamily: fonts.medium, color: colors.ink },
  itemTextOn: { color: colors.limeInk },
  primary: { backgroundColor: colors.lime, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  primaryText: { fontFamily: fonts.bold, color: colors.limeInk, fontSize: 16 },
  status: { fontFamily: fonts.body, color: colors.muted, lineHeight: 20 },
});
