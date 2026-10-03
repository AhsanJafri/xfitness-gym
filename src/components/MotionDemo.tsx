import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { colors, fonts } from '@/lib/theme';

type Rig = {
  x: number;
  y: number;
  rot: number;
  torso: number;
  shoulder: number;
  elbow: number;
  hip: number;
  knee: number;
  shoulderF: number;
  elbowF: number;
  hipF: number;
  kneeF: number;
  bar: number;
};

const THIGH = 64;
const CALF = 50;
const UPPER = 50;
const FORE = 44;

const STEPS: Record<string, [string, string]> = {
  'bench-press': ['Lower to mid-chest', 'Drive the bar up'],
  'incline-db-press': ['Lower the dumbbells', 'Press up and in'],
  'push-up': ['Chest toward the floor', 'Press the floor away'],
  'cable-fly': ['Open the arms', 'Squeeze the hands in'],
  'chest-dip': ['Lean and lower', 'Press back up'],
  'pull-up': ['Dead hang', 'Chest toward the bar'],
  'bent-row': ['Arms long', 'Pull to the belly'],
  'lat-pulldown': ['Arms stretched', 'Elbows drive down'],
  'seated-row': ['Reach long', 'Squeeze the blades'],
  'straight-arm': ['Arms reach up', 'Pull toward the thighs'],
  ohp: ['Bar at the shoulders', 'Press overhead'],
  'lateral-raise': ['Arms at your sides', 'Lift to shoulder height'],
  'rear-delt': ['Arms hanging', 'Open wide'],
  'arnold-press': ['Palms toward you', 'Rotate and press'],
  'barbell-curl': ['Arms straight', 'Curl to the shoulders'],
  'hammer-curl': ['Thumbs forward', 'Curl without swinging'],
  'incline-curl': ['Arms hang long', 'Curl up from the stretch'],
  pushdown: ['Forearms high', 'Lock the elbows out'],
  'overhead-ext': ['Hands behind the head', 'Extend to the ceiling'],
  'close-grip': ['Bar low on the chest', 'Lock the elbows'],
  'skull-crusher': ['Bar toward the forehead', 'Extend to the ceiling'],
  squat: ['Sit between your hips', 'Stand the weight up'],
  rdl: ['Hips travel back', 'Stand tall'],
  lunge: ['Long step down', 'Drive through the front heel'],
  'leg-press': ['Knees travel in', 'Press the platform away'],
  'leg-curl': ['Legs long', 'Heels toward the glutes'],
  'calf-raise': ['Heels sink', 'Rise onto the toes'],
  'split-squat': ['Rear knee drops', 'Stand on the front heel'],
  'hip-thrust': ['Hips start low', 'Lock the hips through'],
  'glute-bridge': ['Ribs down', 'Squeeze at the top'],
  kickback: ['Knee bent', 'Kick the heel back'],
  plank: ['Hold one line', 'Brace a little harder'],
  'dead-bug': ['Limbs stacked', 'Reach opposite arm and leg'],
  'hanging-raise': ['Still hang', 'Lift the pelvis'],
  'cable-crunch': ['Tall under the cable', 'Curl the ribs down'],
  pallof: ['Hands at the chest', 'Press out and resist'],
  'jump-rope': ['Soft landing', 'Small bounce'],
  'row-intervals': ['Catch with the legs', 'Finish with the arms'],
  'bike-sprint': ['One pedal down', 'The other comes through'],
};

function lerp(a: number, b: number, t: number) {
  'worklet';
  return a + (b - a) * t;
}

function wave(phase: number) {
  'worklet';
  return phase < 0.5 ? phase * 2 : 2 - phase * 2;
}

function poseFor(id: string, phase: number): Rig {
  'worklet';
  const t = wave(phase);
  const spin = Math.sin(phase * Math.PI * 2);
  const rig: Rig = {
    x: 128,
    y: 168,
    rot: 0,
    torso: 0,
    shoulder: 12,
    elbow: -8,
    hip: 5,
    knee: 6,
    shoulderF: 16,
    elbowF: -6,
    hipF: 8,
    kneeF: 6,
    bar: 0,
  };

  if (id === 'squat') {
    rig.y = lerp(168, 206, t);
    rig.torso = lerp(4, 22, t);
    rig.hip = lerp(6, -72, t);
    rig.knee = lerp(8, 100, t);
    rig.hipF = rig.hip + 4;
    rig.kneeF = rig.knee - 6;
    rig.shoulder = lerp(28, 18, t);
    rig.elbow = lerp(-108, -88, t);
    rig.shoulderF = rig.shoulder;
    rig.elbowF = rig.elbow;
    rig.bar = 2;
  } else if (id === 'rdl') {
    rig.torso = lerp(4, 72, t);
    rig.hip = lerp(4, -18, t);
    rig.knee = lerp(6, 22, t);
    rig.hipF = rig.hip;
    rig.kneeF = rig.knee;
    rig.shoulder = 18;
    rig.elbow = -6;
    rig.bar = 1;
  } else if (id === 'lunge' || id === 'split-squat') {
    rig.y = lerp(168, 196, t);
    rig.torso = lerp(2, 10, t);
    rig.hip = lerp(8, -78, t);
    rig.knee = lerp(8, 95, t);
    rig.hipF = lerp(-8, 16, t);
    rig.kneeF = lerp(6, 88, t);
    rig.shoulder = 14;
    rig.bar = 1;
  } else if (id === 'bench-press' || id === 'close-grip' || id === 'incline-db-press') {
    rig.x = 150;
    rig.y = 168;
    rig.rot = id === 'incline-db-press' ? -58 : -78;
    rig.hip = 28;
    rig.knee = 70;
    rig.hipF = 28;
    rig.kneeF = 70;
    rig.shoulder = lerp(-24, -92, t);
    rig.elbow = lerp(-108, -6, t);
    rig.shoulderF = rig.shoulder + 6;
    rig.elbowF = rig.elbow;
    rig.bar = 1;
  } else if (id === 'push-up' || id === 'plank') {
    rig.x = 132;
    rig.y = 188;
    rig.rot = -78;
    rig.torso = id === 'plank' ? spin * 2 : 0;
    rig.hip = 8;
    rig.knee = 8;
    rig.hipF = 8;
    rig.kneeF = 8;
    rig.shoulder = id === 'plank' ? -18 : lerp(-18, -62, t);
    rig.elbow = id === 'plank' ? -16 : lerp(-18, -100, t);
    rig.shoulderF = rig.shoulder;
    rig.elbowF = rig.elbow;
  } else if (id === 'cable-fly' || id === 'rear-delt') {
    rig.torso = id === 'rear-delt' ? 28 : 0;
    rig.shoulder = lerp(16, -86, t);
    rig.elbow = -18;
    rig.shoulderF = lerp(22, -100, t);
    rig.elbowF = -14;
    rig.bar = 1;
  } else if (id === 'chest-dip') {
    rig.y = lerp(150, 188, t);
    rig.torso = lerp(8, 18, t);
    rig.shoulder = lerp(-120, -40, t);
    rig.elbow = lerp(-20, -95, t);
    rig.shoulderF = rig.shoulder;
    rig.elbowF = rig.elbow;
  } else if (id === 'pull-up') {
    rig.y = lerp(186, 142, t);
    rig.shoulder = -168;
    rig.elbow = lerp(-8, -115, t);
    rig.shoulderF = -164;
    rig.elbowF = rig.elbow + 6;
    rig.bar = 1;
  } else if (id === 'hanging-raise') {
    rig.y = 150;
    rig.shoulder = -170;
    rig.elbow = -8;
    rig.hip = lerp(8, -80, t);
    rig.knee = lerp(8, 110, t);
    rig.hipF = rig.hip;
    rig.kneeF = rig.knee;
    rig.bar = 1;
  } else if (id === 'bent-row' || id === 'seated-row') {
    rig.torso = 68;
    rig.hip = -16;
    rig.knee = 24;
    rig.hipF = -16;
    rig.kneeF = 24;
    rig.shoulder = lerp(24, -10, t);
    rig.elbow = lerp(-8, -120, t);
    rig.shoulderF = rig.shoulder;
    rig.elbowF = rig.elbow;
    rig.bar = 1;
  } else if (id === 'lat-pulldown' || id === 'straight-arm') {
    rig.y = 176;
    rig.hip = 36;
    rig.knee = 78;
    rig.hipF = 36;
    rig.kneeF = 78;
    rig.shoulder = id === 'straight-arm' ? lerp(-150, -20, t) : lerp(-158, -36, t);
    rig.elbow = id === 'straight-arm' ? -8 : lerp(-10, -100, t);
    rig.shoulderF = rig.shoulder + 4;
    rig.elbowF = rig.elbow;
    rig.bar = 1;
  } else if (id === 'ohp' || id === 'arnold-press') {
    rig.shoulder = lerp(-62, -168, t);
    rig.elbow = lerp(-95, -8, t);
    rig.shoulderF = rig.shoulder + 4;
    rig.elbowF = rig.elbow;
    rig.bar = 1;
  } else if (id === 'lateral-raise') {
    rig.shoulder = lerp(10, -100, t);
    rig.elbow = -6;
    rig.shoulderF = lerp(-10, 100, t);
    rig.elbowF = 6;
  } else if (id === 'barbell-curl' || id === 'hammer-curl' || id === 'incline-curl') {
    rig.torso = id === 'incline-curl' ? -16 : 0;
    rig.shoulder = lerp(10, 6, t);
    rig.elbow = lerp(-6, -138, t);
    rig.shoulderF = rig.shoulder + 4;
    rig.elbowF = rig.elbow + 4;
    rig.bar = 1;
  } else if (id === 'pushdown') {
    rig.shoulder = -18;
    rig.elbow = lerp(-130, -8, t);
    rig.shoulderF = -14;
    rig.elbowF = rig.elbow;
    rig.bar = 1;
  } else if (id === 'overhead-ext') {
    rig.shoulder = -158;
    rig.elbow = lerp(-120, -6, t);
    rig.shoulderF = -154;
    rig.elbowF = rig.elbow;
    rig.bar = 1;
  } else if (id === 'skull-crusher') {
    rig.x = 148;
    rig.y = 170;
    rig.rot = -78;
    rig.hip = 30;
    rig.knee = 72;
    rig.hipF = 30;
    rig.kneeF = 72;
    rig.shoulder = -78;
    rig.elbow = lerp(-110, -8, t);
    rig.shoulderF = -74;
    rig.elbowF = rig.elbow;
    rig.bar = 1;
  } else if (id === 'leg-press') {
    rig.x = 118;
    rig.y = 176;
    rig.rot = -48;
    rig.torso = 10;
    rig.hip = lerp(-20, -78, t);
    rig.knee = lerp(30, 110, t);
    rig.hipF = rig.hip;
    rig.kneeF = rig.knee - 4;
  } else if (id === 'leg-curl') {
    rig.x = 140;
    rig.y = 176;
    rig.rot = 78;
    rig.hip = 6;
    rig.knee = lerp(8, 110, t);
    rig.hipF = 6;
    rig.kneeF = rig.knee;
  } else if (id === 'calf-raise') {
    rig.y = lerp(176, 156, t);
    rig.knee = lerp(16, 4, t);
  } else if (id === 'hip-thrust' || id === 'glute-bridge') {
    rig.x = 146;
    rig.y = lerp(196, 168, t);
    rig.rot = lerp(-28, -8, t);
    rig.hip = lerp(20, -16, t);
    rig.knee = lerp(80, 78, t);
    rig.hipF = rig.hip;
    rig.kneeF = rig.knee;
    rig.bar = id === 'hip-thrust' ? 2 : 0;
  } else if (id === 'kickback') {
    rig.torso = 36;
    rig.hip = lerp(18, -18, t);
    rig.knee = lerp(80, 12, t);
    rig.hipF = 10;
    rig.kneeF = 12;
  } else if (id === 'dead-bug') {
    const side = phase < 0.5 ? wave(phase) : wave(phase + 0.5);
    rig.x = 150;
    rig.y = 176;
    rig.rot = -78;
    rig.shoulder = phase < 0.5 ? lerp(-20, -150, side) : -20;
    rig.elbow = -6;
    rig.hip = phase < 0.5 ? 10 : lerp(10, -70, side);
    rig.knee = phase < 0.5 ? 8 : lerp(8, 20, side);
    rig.shoulderF = phase >= 0.5 ? lerp(-20, -150, side) : -20;
    rig.hipF = phase >= 0.5 ? 10 : lerp(10, -70, side);
    rig.kneeF = 8;
  } else if (id === 'cable-crunch') {
    rig.y = 180;
    rig.hip = 40;
    rig.knee = 80;
    rig.hipF = 40;
    rig.kneeF = 80;
    rig.torso = lerp(0, 42, t);
    rig.shoulder = -150;
    rig.elbow = -20;
    rig.bar = 1;
  } else if (id === 'pallof') {
    rig.shoulder = lerp(-40, -78, t);
    rig.elbow = lerp(-90, -8, t);
    rig.torso = lerp(0, -8, t);
    rig.bar = 1;
  } else if (id === 'jump-rope') {
    rig.y = 168 + spin * 10;
    rig.elbow = -70;
    rig.shoulder = 20;
  } else if (id === 'row-intervals') {
    rig.torso = lerp(18, 48, t);
    rig.hip = lerp(10, -50, t);
    rig.knee = lerp(16, 80, t);
    rig.hipF = rig.hip;
    rig.kneeF = rig.knee;
    rig.shoulder = lerp(10, -20, t);
    rig.elbow = lerp(-10, -70, t);
  } else if (id === 'bike-sprint') {
    const crank = phase * Math.PI * 2;
    rig.y = 150;
    rig.hip = 34;
    rig.torso = 12;
    rig.hip = -20 + Math.sin(crank) * 28;
    rig.knee = 70 + Math.cos(crank) * 24;
    rig.hipF = -20 + Math.sin(crank + Math.PI) * 28;
    rig.kneeF = 70 + Math.cos(crank + Math.PI) * 24;
    rig.shoulder = -40;
    rig.elbow = -30;
  }

  return rig;
}

function SideAthlete({ rig }: { rig: Rig }) {
  return (
    <Svg width="100%" height="250" viewBox="0 0 260 300">
      <Defs>
        <LinearGradient id="skin" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#F0C29A" />
          <Stop offset="0.55" stopColor="#E0A878" />
          <Stop offset="1" stopColor="#C4845A" />
        </LinearGradient>
        <LinearGradient id="skinFar" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#C99268" />
          <Stop offset="1" stopColor="#A86B42" />
        </LinearGradient>
      </Defs>
      <Ellipse cx="130" cy="278" rx="46" ry="6" fill="rgba(0,0,0,0.28)" />
      <Rect x="28" y="274" width="204" height="3" rx="1.5" fill="rgba(243,240,231,0.14)" />
      <G x={rig.x} y={rig.y} rotation={rig.rot} originX={0} originY={0}>
        <Leg hip={rig.hipF} knee={rig.kneeF} fill="url(#skinFar)" shade="#8C5A38" x={-12} />
        <G rotation={rig.torso} originX={0} originY={0}>
          <Arm shoulder={rig.shoulderF} elbow={rig.elbowF} fill="url(#skinFar)" shade="#8C5A38" x={-4} y={-102} />
          <Path
            d="M-18-6 C-22-40 -18-74 -12-96 C-4-114 10-116 16-104 C30-86 34-58 26-30 C20-12 10-2 0 4 C-8 6 -14 2 -18-6 Z"
            fill="url(#skin)"
          />
          <Ellipse cx="16" cy="-78" rx="13" ry="10" fill="#C4845A" />
          <Path d="M4-62 C10-50 8-40 2-34" stroke="#A86B42" strokeWidth="2" fill="none" />
          <Path d="M2-30 C8-22 6-16 1-12" stroke="#A86B42" strokeWidth="2" fill="none" />
          <Circle cx="10" cy="-124" r="18" fill="url(#skin)" />
          <Path d="M-4-140 C4-150 22-148 26-132 C18-144 6-146 -4-140 Z" fill="#2C241F" />
          <Ellipse cx="6" cy="-124" rx="5" ry="7" fill="#D9A07A" />
          <Circle cx="16" cy="-126" r="2.2" fill="#2A211C" />
          <Path d="M22-124 C28-122 30-118 26-116" stroke="#C4845A" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <Path d="M-16 2 L-18 30 L22 28 L24-4 C10-12 -6-8 -16 2 Z" fill="#24302B" />
          <G opacity={rig.bar === 2 ? 1 : 0}>
            <Rect x="-28" y="-112" width="58" height="7" rx="3" fill="#D5D8DC" />
          </G>
        </G>
        <Leg hip={rig.hip} knee={rig.knee} fill="url(#skin)" shade="#C4845A" x={6} />
        <G rotation={rig.torso} originX={0} originY={0}>
          <Arm shoulder={rig.shoulder} elbow={rig.elbow} fill="url(#skin)" shade="#C4845A" x={12} y={-100} showBar={rig.bar === 1} />
        </G>
      </G>
    </Svg>
  );
}

function Leg({ hip, knee, fill, shade, x }: { hip: number; knee: number; fill: string; shade: string; x: number }) {
  return (
    <G rotation={hip} originX={0} originY={0} x={x} y={2}>
      <Path
        d="M-16 4 C-20 24 -18 48 -13 64 L14 64 C18 46 18 24 13 6 C6-2 -8-2 -16 4 Z"
        fill={fill}
      />
      <Ellipse cx="8" cy="34" rx="8" ry="16" fill={shade} opacity={0.45} />
      <G rotation={knee} originX={0} originY={0} y={THIGH}>
        <Path d="M-9 0 C-8 16 -14 34 -8 50 L9 50 C12 34 10 16 8 0 Z" fill={fill} />
        <Ellipse cx="-2" cy="30" rx="7" ry="12" fill={shade} opacity={0.4} />
        <Path d="M-10 46 L32 52 L34 64 L-12 60 Z" fill="#1A1E1C" />
        <Path d="M18 52 L34 54 L34 62 L16 60 Z" fill="#E8E4DC" />
      </G>
    </G>
  );
}

function Arm({
  shoulder,
  elbow,
  fill,
  shade,
  x,
  y,
  showBar,
}: {
  shoulder: number;
  elbow: number;
  fill: string;
  shade: string;
  x: number;
  y: number;
  showBar?: boolean;
}) {
  return (
    <G rotation={shoulder} originX={0} originY={0} x={x} y={y}>
      <Circle cx="0" cy="4" r="12" fill={fill} />
      <Path d="M-10 2 C-14 16 -12 34 -8 50 L9 50 C14 32 12 16 8 2 Z" fill={fill} />
      <Ellipse cx="8" cy="26" rx="7" ry="12" fill={shade} opacity={0.55} />
      <G rotation={elbow} originX={0} originY={0} y={UPPER}>
        <Path d="M-7 0 C-6 14 -8 30 -5 44 L6 44 C8 28 7 14 6 0 Z" fill={fill} />
        <Circle cx="0" cy={FORE} r="6.5" fill={fill} />
        {showBar ? <Rect x="-26" y={FORE - 4} width="52" height="7" rx="3" fill="#D5D8DC" /> : null}
      </G>
    </G>
  );
}

function FrontAthlete({ rig }: { rig: Rig }) {
  return (
    <Svg width="100%" height="250" viewBox="0 0 260 300">
      <Ellipse cx="130" cy="278" rx="40" ry="6" fill="rgba(0,0,0,0.28)" />
      <G x={130} y={168}>
        <Path d="M-16 8 L-22 78 L-8 78 L-6 8 Z" fill="#C4845A" />
        <Path d="M16 8 L22 78 L8 78 L6 8 Z" fill="#E0A878" />
        <Path d="M-22 74 L-8 86 L-30 92 L-34 82 Z" fill="#1A1E1C" />
        <Path d="M22 74 L8 86 L30 92 L34 82 Z" fill="#1A1E1C" />
        <Path d="M-28-8 C-32-70 -20-108 0-112 C20-108 32-70 28-8 C18 10 -18 10 -28-8 Z" fill="#E0A878" />
        <Ellipse cx="-12" cy="-78" rx="12" ry="9" fill="#C4845A" />
        <Ellipse cx="12" cy="-78" rx="12" ry="9" fill="#C98458" />
        <Path d="M0-64 L0-18" stroke="#C4845A" strokeWidth="2" />
        <Path d="M-16 6 L16 6 L14 28 L-14 28 Z" fill="#24302B" />
        <Circle cx="0" cy="-136" r="20" fill="#E8B892" />
        <Path d="M-16-148 C-8-162 18-160 20-140 C8-154 -8-156 -16-148 Z" fill="#2C241F" />
        <Circle cx="-7" cy="-138" r="2.1" fill="#2A211C" />
        <Circle cx="7" cy="-138" r="2.1" fill="#2A211C" />
        <Path d="M-4-128 Q0-124 4-128" stroke="#C4845A" strokeWidth="1.6" fill="none" />
        <Arm shoulder={rig.shoulder} elbow={rig.elbow} fill="#E0A878" shade="#C4845A" x={-30} y={-96} />
        <Arm shoulder={rig.shoulderF} elbow={rig.elbowF} fill="#E8B892" shade="#D09A68" x={30} y={-96} />
      </G>
    </Svg>
  );
}

export function MotionDemo({ exerciseId }: { exerciseId: string }) {
  const [phase, setPhase] = useState(0);
  const steps = STEPS[exerciseId] ?? ['Start position', 'Finish the rep'];
  const front = exerciseId === 'lateral-raise';
  const rig = poseFor(exerciseId, phase);

  useEffect(() => {
    const started = Date.now();
    const timer = setInterval(() => {
      setPhase(((Date.now() - started) % 2400) / 2400);
    }, 33);
    return () => clearInterval(timer);
  }, [exerciseId]);

  const caption = phase < 0.5 ? steps[0] : steps[1];

  return (
    <View style={styles.card}>
      <View style={styles.player}>
        <View style={styles.badgeRow}>
          <Text style={styles.badge}>Demo clip</Text>
          <Text style={styles.time}>{`${Math.floor(phase * 2.4)}s`}</Text>
        </View>
        {front ? <FrontAthlete rig={rig} /> : <SideAthlete rig={rig} />}
        <View style={styles.captionBar}>
          <Text style={styles.step}>{caption}</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.round(phase * 100)}%` }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 22,
    paddingTop: 14,
    paddingBottom: 16,
    overflow: 'hidden',
  },
  player: {
    backgroundColor: '#0B0E0C',
    marginHorizontal: 10,
    borderRadius: 16,
    overflow: 'hidden',
  },
  badgeRow: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    zIndex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    fontFamily: fonts.bold,
    color: colors.limeInk,
    backgroundColor: colors.lime,
    overflow: 'hidden',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  time: {
    fontFamily: fonts.medium,
    color: colors.ink,
    fontSize: 12,
  },
  captionBar: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  step: {
    fontFamily: fonts.bold,
    color: colors.ink,
    fontSize: 15,
    textAlign: 'center',
  },
  track: {
    height: 4,
    backgroundColor: 'rgba(243,240,231,0.16)',
  },
  fill: {
    height: 4,
    backgroundColor: colors.lime,
  },
});
