import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/ui';
import { cardioKindLabel, scriptFonts, translate } from '@/lib/i18n';
import { useWorkout } from '@/lib/store';
import { colors, fonts } from '@/lib/theme';

const KINDS = ['Run', 'Bike', 'Row', 'Walk'] as const;

function clock(ms: number): string {
  const total = Math.floor(ms / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const body = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return hours > 0 ? `${hours}:${body}` : body;
}

function savedClock(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

export default function CardioScreen() {
  const workout = useWorkout();
  const type = scriptFonts(workout.language);
  const t = (key: Parameters<typeof translate>[1], vars?: Parameters<typeof translate>[2]) => translate(workout.language, key, vars);
  const [kind, setKind] = useState<(typeof KINDS)[number]>('Run');
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const accumulated = useRef(0);
  const started = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setElapsed(accumulated.current + (Date.now() - (started.current ?? Date.now())));
    }, 200);
    return () => clearInterval(timer);
  }, [running]);

  const start = () => {
    started.current = Date.now();
    setRunning(true);
  };

  const pause = () => {
    accumulated.current = elapsed;
    started.current = null;
    setRunning(false);
  };

  const reset = () => {
    accumulated.current = 0;
    started.current = null;
    setElapsed(0);
    setRunning(false);
  };

  const save = async () => {
    const seconds = Math.round(elapsed / 1000);
    if (seconds < 1) {
      setNote(t('clockFirst'));
      return;
    }
    if (running) pause();
    await workout.recordCardio(seconds, kind);
    reset();
    setNote(t('savedSession', { kind: cardioKindLabel(workout.language, kind), time: savedClock(seconds) }));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader kicker={t('conditioning')} title={t('cardio')} detail={t('cardioDetail')} />
        <View style={styles.kinds}>
          {KINDS.map((item) => (
            <Pressable key={item} style={[styles.chip, kind === item && styles.chipOn]} onPress={() => setKind(item)}>
              <Text style={[styles.chipText, { fontFamily: type.medium }, kind === item && styles.chipTextOn]}>{cardioKindLabel(workout.language, item)}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.clock}>{clock(elapsed)}</Text>
        <View style={styles.actions}>
          <Pressable style={styles.primary} onPress={running ? pause : start}>
            <Text style={[styles.primaryText, { fontFamily: type.bold }]}>{running ? t('pause') : elapsed > 0 ? t('resume') : t('start')}</Text>
          </Pressable>
          <Pressable style={styles.secondary} onPress={reset}>
            <Text style={[styles.secondaryText, { fontFamily: type.bold }]}>{t('reset')}</Text>
          </Pressable>
        </View>
        <Pressable style={styles.save} onPress={save}>
          <Text style={[styles.primaryText, { fontFamily: type.bold }]}>{t('saveTime')}</Text>
        </Pressable>
        {note ? <Text style={[styles.note, { fontFamily: type.body }]}>{note}</Text> : null}
        <Text style={[styles.listTitle, { fontFamily: type.display }]}>{t('savedSessions')}</Text>
        {workout.cardio.length === 0 ? <Text style={[styles.note, { fontFamily: type.body }]}>{t('nothingSaved')}</Text> : null}
        {workout.cardio.slice(0, 8).map((entry) => (
          <View key={entry.id} style={styles.row}>
            <Text style={[styles.rowName, { fontFamily: type.bold }]}>{cardioKindLabel(workout.language, entry.kind)}</Text>
            <Text style={[styles.rowMeta, { fontFamily: type.medium }]}>{entry.date} · {savedClock(entry.seconds)}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40, gap: 12 },
  kinds: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 999, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 14, paddingVertical: 8 },
  chipOn: { backgroundColor: colors.lime, borderColor: colors.lime },
  chipText: { fontFamily: fonts.medium, color: colors.ink },
  chipTextOn: { color: colors.limeInk },
  clock: { fontFamily: fonts.display, color: colors.ink, fontSize: 84, lineHeight: 88, textAlign: 'center', marginTop: 8 },
  actions: { flexDirection: 'row', gap: 10 },
  primary: { flex: 1, backgroundColor: colors.lime, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  primaryText: { fontFamily: fonts.bold, color: colors.limeInk, fontSize: 16 },
  secondary: { flex: 1, borderRadius: 14, borderWidth: 1, borderColor: colors.line, paddingVertical: 14, alignItems: 'center' },
  secondaryText: { fontFamily: fonts.bold, color: colors.ink, fontSize: 16 },
  save: { backgroundColor: colors.lime, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  note: { fontFamily: fonts.body, color: colors.muted, fontSize: 15 },
  listTitle: { fontFamily: fonts.display, color: colors.ink, fontSize: 32, lineHeight: 42, marginTop: 8 },
  row: { backgroundColor: colors.card, borderRadius: 14, padding: 14, flexDirection: 'row', justifyContent: 'space-between' },
  rowName: { fontFamily: fonts.bold, color: colors.ink, fontSize: 16 },
  rowMeta: { fontFamily: fonts.medium, color: colors.muted },
});
