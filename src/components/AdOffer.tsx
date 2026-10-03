import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { adsNativeAvailable, watchRewardedAd, watchRewardedInterstitial } from '@/lib/ads';
import { scriptFonts, translate, type Language } from '@/lib/i18n';
import { colors } from '@/lib/theme';

export function AdOffer({ language }: { language: Language }) {
  const type = scriptFonts(language);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

  const play = async (kind: 'reward' | 'break') => {
    if (busy) return;
    setBusy(true);
    const result = kind === 'reward' ? await watchRewardedAd() : await watchRewardedInterstitial();
    if (!adsNativeAvailable() || result.preview) setNote(t('adUnavailable'));
    else setNote(t(result.earned ? 'adEarned' : 'adClosed'));
    setBusy(false);
  };

  return (
    <View style={styles.card}>
      <Text style={[styles.title, { fontFamily: type.bold }]}>{t('ads')}</Text>
      <Text style={[styles.detail, { fontFamily: type.body }]}>{t('adDetail')}</Text>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={() => play('reward')}>
          <Text style={[styles.buttonText, { fontFamily: type.bold }]}>{t('watchReward')}</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => play('break')}>
          <Text style={[styles.buttonText, { fontFamily: type.bold }]}>{t('watchBreak')}</Text>
        </Pressable>
      </View>
      {note ? <Text style={[styles.detail, { fontFamily: type.body }]}>{note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, gap: 10 },
  title: { color: colors.ink, fontSize: 16 },
  detail: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  row: { flexDirection: 'row', gap: 8 },
  button: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  buttonText: { color: colors.ink, fontSize: 13, textAlign: 'center' },
});
