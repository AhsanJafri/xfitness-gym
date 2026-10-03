import { StyleSheet, Text, View } from 'react-native';
import Svg, { Polyline, Circle, Line } from 'react-native-svg';
import type { WeightEntry } from '@/lib/model';
import { colors, fonts } from '@/lib/theme';

export function WeightGraph({ weights }: { weights: WeightEntry[] }) {
  const points = weights.slice(-8);
  if (points.length === 0) {
    return <Text style={styles.empty}>Log a weight and it will show up here.</Text>;
  }
  const width = 300;
  const height = 140;
  const pad = 16;
  const values = points.map((point) => point.kg);
  const min = Math.min(...values) - 1;
  const max = Math.max(...values) + 1;
  const coords = points.map((point, index) => {
    const x = pad + (index * (width - pad * 2)) / Math.max(points.length - 1, 1);
    const y = pad + ((max - point.kg) / (max - min)) * (height - pad * 2);
    return { x, y, kg: point.kg };
  });
  const line = coords.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <View>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="rgba(243,240,231,0.15)" strokeWidth={1} />
        <Polyline points={line} fill="none" stroke="#D6F25C" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
        {coords.map((point) => (
          <Circle key={`${point.x}-${point.kg}`} cx={point.x} cy={point.y} r={4} fill="#D6F25C" />
        ))}
      </Svg>
      <Text style={styles.caption}>
        {points[0].date.slice(5)} → {points[points.length - 1].date.slice(5)} · {points[points.length - 1].kg} kg
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { fontFamily: fonts.body, color: colors.muted, fontSize: 15, lineHeight: 21 },
  caption: { fontFamily: fonts.medium, color: colors.muted, fontSize: 13, textAlign: 'center' },
});
