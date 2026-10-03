import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LANGUAGE_LABELS, languagesForCountry, scriptFonts, type Country, type Language } from '@/lib/i18n';
import { colors } from '@/lib/theme';

export function LanguageSwitch({
  language,
  country,
  onChange,
}: {
  language: Language;
  country: Country;
  onChange: (language: Language) => void;
}) {
  const type = scriptFonts(language);
  return (
    <View style={styles.row}>
      {languagesForCountry(country).map((item) => {
        const active = item === language;
        return (
          <Pressable key={item} style={[styles.chip, active && styles.chipOn]} onPress={() => onChange(item)}>
            <Text style={[styles.label, { fontFamily: scriptFonts(item).medium }, active && styles.labelOn]}>
              {LANGUAGE_LABELS[item]}
            </Text>
          </Pressable>
        );
      })}
      <Text style={{ display: 'none', fontFamily: type.body }} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 999, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 14, paddingVertical: 8 },
  chipOn: { backgroundColor: colors.lime, borderColor: colors.lime },
  label: { color: colors.ink, fontSize: 15 },
  labelOn: { color: colors.limeInk },
});
