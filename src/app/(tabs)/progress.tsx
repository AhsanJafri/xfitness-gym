import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { ScreenHeader } from '@/components/ui';
import { WeightGraph } from '@/components/WeightGraph';
import { addDays, weekdayForKey } from '@/lib/dates';
import { scriptFonts, translate, weekdayLabel } from '@/lib/i18n';
import type { Currency } from '@/lib/model';
import { dayIsSatisfied, membershipMonth, missedDays, useWorkout } from '@/lib/store';
import { colors, fonts } from '@/lib/theme';

export default function ProgressScreen() {
  const workout = useWorkout();
  const type = scriptFonts(workout.language);
  const t = (key: Parameters<typeof translate>[1], vars?: Parameters<typeof translate>[2]) => translate(workout.language, key, vars);
  const [height, setHeight] = useState(workout.heightCm ? String(workout.heightCm) : '');
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState<string | null>(null);
  const [feeText, setFeeText] = useState(workout.fee ? String(workout.fee) : '');
  const [currency, setCurrency] = useState<Currency>(workout.currency);
  const math = membershipMonth(workout, workout.today, workout.fee ?? 0);
  const missed = missedDays(workout, workout.today, 14);
  const recent = Array.from({ length: 7 }, (_, index) => addDays(workout.today, -(6 - index)));
  const trained = workout.logs.reduce((count, entry) => count + (entry.setsDone > 0 ? 1 : 0), 0);
  const cardioSeconds = workout.cardio.reduce((sum, entry) => sum + entry.seconds, 0);

  const money = (amount: number) => {
    const rounded = Math.round(amount);
    const symbol = workout.currency === 'usd' ? '$' : workout.currency === 'inr' ? '₹' : 'Rs ';
    return `${symbol}${rounded.toLocaleString('en-US')}`;
  };

  const saveFee = async () => {
    const fee = Number(feeText);
    if (!Number.isFinite(fee) || fee <= 0 || fee > 1000000) return;
    await workout.setMembership(fee, currency);
    setNote(t('savedLocal'));
  };

  const saveBody = async () => {
    const cm = Number(height);
    const kg = Number(weight);
    if (Number.isFinite(cm) && cm > 50 && cm < 260) await workout.setHeight(cm);
    if (Number.isFinite(kg) && kg > 20 && kg < 400) await workout.logWeight(kg);
    setWeight('');
    setNote(t('savedLocal'));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          kicker={t('journey')}
          title={t('progress')}
          detail={missed.length ? t(missed.length === 1 ? 'missedOne' : 'missedMany', { count: missed.length }) : t('noMiss')}
        />
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { fontFamily: type.display }]}>{t('feeTitle')}</Text>
          <Text style={[styles.body, { fontFamily: type.body }]}>{t('feeHelp')}</Text>
          <View style={styles.week}>
            {(['pkr', 'inr', 'usd'] as const).map((item) => (
              <Pressable key={item} style={[styles.chip, currency === item && styles.chipOn]} onPress={() => setCurrency(item)}>
                <Text style={[styles.chipText, { fontFamily: type.medium }, currency === item && styles.chipTextOn]}>{item.toUpperCase()}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            value={feeText}
            onChangeText={setFeeText}
            keyboardType="number-pad"
            placeholder={t('feePh')}
            placeholderTextColor={colors.muted}
            style={[styles.input, { fontFamily: type.medium }]}
          />
          <Pressable style={styles.primary} onPress={saveFee}>
            <Text style={[styles.primaryText, { fontFamily: type.bold }]}>{t('save')}</Text>
          </Pressable>
          {workout.fee ? (
            <>
              <Text style={[styles.body, { fontFamily: type.body }]}>{t('monthLine', math)}</Text>
              <Text style={[styles.worth, { fontFamily: type.bold }]}>{t('perVisit', { money: money(math.perVisit) })}</Text>
              <Text style={[styles.miss, { fontFamily: type.medium }]}>{t('wasted', { money: money(math.wasted) })}</Text>
            </>
          ) : (
            <Text style={[styles.body, { fontFamily: type.body }]}>{t('feeEmpty')}</Text>
          )}
        </View>
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { fontFamily: type.display }]}>{t('language')}</Text>
          <Text style={[styles.body, { fontFamily: type.body }]}>{t('languageHelp')}</Text>
          <LanguageSwitch language={workout.language} country={workout.country} onChange={workout.setLanguage} />
        </View>
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { fontFamily: type.display }]}>{t('body')}</Text>
          <Text style={[styles.body, { fontFamily: type.body }]}>{t('bodyHelp')}</Text>
          <TextInput
            value={height}
            onChangeText={setHeight}
            keyboardType="decimal-pad"
            placeholder={workout.heightCm ? t('heightKnown', { cm: workout.heightCm }) : t('heightPh')}
            placeholderTextColor={colors.muted}
            style={[styles.input, { fontFamily: type.medium }]}
          />
          <TextInput
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            placeholder={t('weightPh')}
            placeholderTextColor={colors.muted}
            style={[styles.input, { fontFamily: type.medium }]}
          />
          <Pressable style={styles.primary} onPress={saveBody}>
            <Text style={[styles.primaryText, { fontFamily: type.bold }]}>{t('save')}</Text>
          </Pressable>
          {note ? <Text style={styles.body}>{note}</Text> : null}
        </View>
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { fontFamily: type.display }]}>{t('weight')}</Text>
          <WeightGraph weights={workout.weights} />
        </View>
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { fontFamily: type.display }]}>{t('last7')}</Text>
          <View style={styles.week}>
            {recent.map((date) => {
              const plan = workout.plans[weekdayForKey(date)];
              const planned = Boolean(plan && !plan.rest && plan.exerciseIds.length > 0);
              const done = dayIsSatisfied(workout, date);
              const missedDay = planned && date < workout.today && !done;
              return (
                <View key={date} style={styles.dotCol}>
                  <View style={[styles.dot, done && styles.dotOn, missedDay && styles.dotMiss]} />
                  <Text style={[styles.dotLabel, { fontFamily: type.medium }]}>{weekdayLabel(workout.language, weekdayForKey(date))}</Text>
                </View>
              );
            })}
          </View>
          <Text style={[styles.body, { fontFamily: type.body }]}>
            {t('progressSummary', { trained, minutes: Math.floor(cardioSeconds / 60) })}
          </Text>
          {missed.slice(0, 5).map((date) => (
            <Text key={date} style={[styles.miss, { fontFamily: type.medium }]}>{t('missedDate', { date })}</Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40, gap: 14 },
  card: { backgroundColor: colors.card, borderRadius: 18, padding: 16, gap: 10 },
  cardTitle: { fontFamily: fonts.display, color: colors.ink, fontSize: 32, lineHeight: 40 },
  body: { fontFamily: fonts.body, color: colors.muted, fontSize: 15, lineHeight: 21 },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: colors.ink,
    fontFamily: fonts.medium,
    fontSize: 16,
  },
  primary: { backgroundColor: colors.lime, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  primaryText: { fontFamily: fonts.bold, color: colors.limeInk, fontSize: 16 },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  dotCol: { alignItems: 'center', gap: 6 },
  dot: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.cardRaised },
  dotOn: { backgroundColor: colors.lime },
  dotMiss: { backgroundColor: colors.ember },
  dotLabel: { fontFamily: fonts.medium, color: colors.muted, fontSize: 11 },
  miss: { fontFamily: fonts.medium, color: colors.ember, fontSize: 14 },
  worth: { color: colors.lime, fontSize: 16, lineHeight: 22 },
  chip: { borderRadius: 999, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 14, paddingVertical: 8 },
  chipOn: { backgroundColor: colors.lime, borderColor: colors.lime },
  chipText: { color: colors.ink },
  chipTextOn: { color: colors.limeInk },
});
