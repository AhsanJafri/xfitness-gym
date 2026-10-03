import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scriptFonts, translate } from '@/lib/i18n';
import { useWorkout } from '@/lib/store';
import { colors, fonts } from '@/lib/theme';

export default function TabLayout() {
  const { language } = useWorkout();
  const insets = useSafeAreaInsets();
  const type = scriptFonts(language);
  const bottom = Math.max(insets.bottom, 10);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.line,
          height: 54 + bottom,
          paddingTop: 8,
          paddingBottom: bottom,
        },
        tabBarActiveTintColor: colors.lime,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontFamily: language === 'en' ? fonts.medium : type.medium,
          fontSize: 11,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: translate(language, 'tabToday'),
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 16 }}>●</Text>,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: translate(language, 'tabLibrary'),
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 16 }}>▣</Text>,
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: translate(language, 'tabPlan'),
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 16 }}>▤</Text>,
        }}
      />
      <Tabs.Screen
        name="cardio"
        options={{
          title: translate(language, 'tabCardio'),
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 16 }}>○</Text>,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: translate(language, 'tabProgress'),
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 16 }}>▲</Text>,
        }}
      />
    </Tabs>
  );
}
