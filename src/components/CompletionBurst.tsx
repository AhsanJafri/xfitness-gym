import { useEffect } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, fonts } from '@/lib/theme';

const DOTS = [0, 45, 90, 135, 180, 225, 270, 315];

export function CompletionBurst({
  visible,
  title,
  onDone,
}: {
  visible: boolean;
  title: string;
  onDone: () => void;
}) {
  const scale = useSharedValue(0.4);
  const ring = useSharedValue(0.6);
  const fade = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;
    scale.value = 0.4;
    ring.value = 0.6;
    fade.value = 0;
    scale.value = withSpring(1, { damping: 12, stiffness: 180 });
    ring.value = withTiming(1.8, { duration: 700, easing: Easing.out(Easing.cubic) });
    fade.value = withDelay(120, withTiming(1, { duration: 280 }));
    const timer = setTimeout(onDone, 1400);
    return () => clearTimeout(timer);
  }, [visible, title, fade, onDone, ring, scale]);

  const medal = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const halo = useAnimatedStyle(() => ({
    opacity: 1.4 - ring.value,
    transform: [{ scale: ring.value }],
  }));
  const label = useAnimatedStyle(() => ({ opacity: fade.value }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDone}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.halo, halo]} />
        {DOTS.map((deg) => (
          <BurstDot key={deg} degrees={deg} play={visible} />
        ))}
        <Animated.View style={[styles.medal, medal]}>
          <Text style={styles.check}>✓</Text>
        </Animated.View>
        <Animated.Text style={[styles.kicker, label]}>Exercise done</Animated.Text>
        <Animated.Text style={[styles.title, label]}>{title}</Animated.Text>
      </View>
    </Modal>
  );
}

function BurstDot({ degrees, play }: { degrees: number; play: boolean }) {
  const travel = useSharedValue(0);
  useEffect(() => {
    if (!play) return;
    travel.value = 0;
    travel.value = withTiming(1, { duration: 680, easing: Easing.out(Easing.cubic) });
  }, [play, travel]);
  const style = useAnimatedStyle(() => {
    const rad = (degrees * Math.PI) / 180;
    const distance = 36 + travel.value * 78;
    return {
      opacity: 1 - travel.value,
      transform: [
        { translateX: Math.cos(rad) * distance },
        { translateY: Math.sin(rad) * distance },
        { scale: 1 - travel.value * 0.4 },
      ],
    };
  });
  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(16,20,18,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: colors.lime,
  },
  medal: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    fontFamily: fonts.display,
    fontSize: 64,
    color: colors.limeInk,
    lineHeight: 70,
  },
  kicker: {
    marginTop: 28,
    fontFamily: fonts.medium,
    color: colors.lime,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontSize: 13,
  },
  title: {
    marginTop: 6,
    fontFamily: fonts.display,
    fontSize: 42,
    color: colors.ink,
    letterSpacing: 0.6,
    textAlign: 'center',
    paddingHorizontal: 28,
  },
  dot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.lime,
  },
});
