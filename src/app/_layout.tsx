import 'react-native-gesture-handler';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { Outfit_400Regular, Outfit_500Medium, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { WorkoutProvider } from '@/lib/store';
import { colors, fonts } from '@/lib/theme';

SplashScreen.setOptions({ duration: 400, fade: true });
SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [loaded] = useFonts({
    BebasNeue_400Regular,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_700Bold,
  });
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => undefined);
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <WorkoutProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="exercise/[id]" options={{ presentation: 'card' }} />
            <Stack.Screen name="day/[weekday]" options={{ presentation: 'modal' }} />
          </Stack>
          {splash ? <LaunchSplash onDone={setSplash} /> : null}
        </WorkoutProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function LaunchSplash({ onDone }: { onDone: (visible: boolean) => void }) {
  const opacity = useSharedValue(1);
  useEffect(() => {
    opacity.value = withDelay(900, withTiming(0, { duration: 420 }, (finished) => {
      if (finished) runOnJS(onDone)(false);
    }));
  }, [opacity, onDone]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View style={[styles.splash, style]} pointerEvents="none">
      <Image source={require('../../assets/splash-icon.png')} style={styles.mark} />
      <Text style={styles.word}>XFACTORY</Text>
      <View style={styles.rule} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  splash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: { width: 168, height: 168 },
  word: {
    marginTop: 8,
    fontFamily: fonts.display,
    color: colors.ink,
    fontSize: 28,
    letterSpacing: 6,
  },
  rule: { marginTop: 10, width: 36, height: 3, borderRadius: 2, backgroundColor: colors.lime },
});
