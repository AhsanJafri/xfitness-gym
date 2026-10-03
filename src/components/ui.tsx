import { Pressable, StyleSheet, Text, View } from 'react-native';
import { scriptFonts } from '@/lib/i18n';
import { useWorkout } from '@/lib/store';
import { colors, fonts } from '@/lib/theme';

export function ScreenHeader({ kicker, title, detail }: { kicker: string; title: string; detail?: string }) {
  const { language } = useWorkout();
  const type = scriptFonts(language);
  const script = language !== 'en';
  return (
    <View style={[styles.wrap, script && styles.wrapRtl]}>
      <Text style={[styles.kicker, { fontFamily: type.medium }, script && styles.scriptKicker]}>{kicker}</Text>
      <Text style={[styles.title, { fontFamily: type.display }, script && styles.scriptTitle]}>{title}</Text>
      {detail ? <Text style={[styles.detail, { fontFamily: type.body }, script && styles.scriptDetail]}>{detail}</Text> : null}
    </View>
  );
}

export function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  const { language } = useWorkout();
  const type = scriptFonts(language);
  return (
    <Pressable onPress={onPress} style={[styles.pill, active && styles.pillOn]}>
      <Text style={[styles.pillText, { fontFamily: type.medium }, active && styles.pillTextOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: 8 },
  kicker: {
    fontFamily: fonts.medium,
    color: colors.lime,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  title: {
    fontFamily: fonts.display,
    color: colors.ink,
    fontSize: 48,
    lineHeight: 50,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  detail: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 6,
  },
  wrapRtl: { alignItems: 'flex-start' },
  scriptKicker: { letterSpacing: 0, textTransform: 'none', fontSize: 14 },
  scriptTitle: { fontSize: 30, lineHeight: 48, letterSpacing: 0, paddingTop: 4 },
  scriptDetail: { fontSize: 16, lineHeight: 26, textAlign: 'left' },
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.card,
  },
  pillOn: { backgroundColor: colors.lime, borderColor: colors.lime },
  pillText: { fontFamily: fonts.medium, color: colors.ink, fontSize: 14 },
  pillTextOn: { color: colors.limeInk },
});
