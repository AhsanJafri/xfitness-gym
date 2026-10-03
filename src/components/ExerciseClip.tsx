import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet, Text, View } from 'react-native';
import { scriptFonts, translate } from '@/lib/i18n';
import { useWorkout } from '@/lib/store';
import { colors, fonts } from '@/lib/theme';

type Clip = { url: string; title: string };

const CLIPS: Record<string, Clip> = {
  'bench-press': { title: 'Bench press', url: 'https://wger.de/media/exercise-video/73/2bdb390c-312c-4497-a722-5eed2c823e5a.MOV' },
  'close-grip': { title: 'Bench press', url: 'https://wger.de/media/exercise-video/73/2bdb390c-312c-4497-a722-5eed2c823e5a.MOV' },
  'push-up': { title: 'Bench press', url: 'https://wger.de/media/exercise-video/73/2bdb390c-312c-4497-a722-5eed2c823e5a.MOV' },
  'incline-db-press': { title: 'Incline dumbbell press', url: 'https://wger.de/media/exercise-video/537/b9c937e9-daeb-42a9-be8e-7a77e368478c.MOV' },
  'chest-dip': { title: 'Dips', url: 'https://wger.de/media/exercise-video/194/dd9a663f-d8ba-4621-823b-13788ccb66bc.MOV' },
  'pull-up': { title: 'Pull-ups', url: 'https://wger.de/media/exercise-video/475/83067ffe-ccb9-4e22-8507-5131b211ce74.MOV' },
  'lat-pulldown': { title: 'Assisted pull-up', url: 'https://wger.de/media/exercise-video/477/2e23bb52-2782-40c8-bf88-fa2d2e2a9a0d.MOV' },
  'seated-row': { title: 'Seated row', url: 'https://wger.de/media/exercise-video/512/fff4c294-93f0-4926-b3a2-bf59ad4afaa5.MOV' },
  'bent-row': { title: 'Seated row', url: 'https://wger.de/media/exercise-video/512/fff4c294-93f0-4926-b3a2-bf59ad4afaa5.MOV' },
  'row-intervals': { title: 'Seated row', url: 'https://wger.de/media/exercise-video/512/fff4c294-93f0-4926-b3a2-bf59ad4afaa5.MOV' },
  ohp: { title: 'Dumbbell shoulder press', url: 'https://wger.de/media/exercise-video/567/64f33c19-1d96-4b7c-af17-6c6a4941c614.MOV' },
  'arnold-press': { title: 'Dumbbell shoulder press', url: 'https://wger.de/media/exercise-video/567/64f33c19-1d96-4b7c-af17-6c6a4941c614.MOV' },
  'lateral-raise': { title: 'Lateral raise', url: 'https://wger.de/media/exercise-video/348/de69928a-8a35-4096-821c-1f46de5e0e03.MOV' },
  'rear-delt': { title: 'Bent-over lateral raise', url: 'https://wger.de/media/exercise-video/82/28b53647-27e7-47cf-8852-2ee666c8b628.MOV' },
  'barbell-curl': { title: 'Barbell curl', url: 'https://wger.de/media/exercise-video/91/483f4bff-e108-41f1-8e7b-0caf24952552.MOV' },
  'hammer-curl': { title: 'Hammer curl', url: 'https://wger.de/media/exercise-video/272/df069052-2173-4f24-855f-a0eebe729f24.MOV' },
  'incline-curl': { title: 'Dumbbell curl', url: 'https://wger.de/media/exercise-video/92/8bfb917c-3d0d-49b9-8073-5d7e01c1b894.MOV' },
  pushdown: { title: 'Cable triceps extension', url: 'https://wger.de/media/exercise-video/659/1f2eb3b6-3185-429f-8330-26dc88f39aff.MOV' },
  'overhead-ext': { title: 'Overhead triceps extension', url: 'https://wger.de/media/exercise-video/211/85f6eb25-a76c-409e-9af9-497794ac0dfb.MOV' },
  'skull-crusher': { title: 'Skull crusher', url: 'https://wger.de/media/exercise-video/246/2a194d11-ff5d-4bdf-849e-1c441cf7b0b1.MOV' },
  squat: { title: 'Squat', url: 'https://wger.de/media/exercise-video/341/0cbfeace-dda9-4166-8424-f51358e88a4f.MOV' },
  rdl: { title: 'Romanian deadlift', url: 'https://wger.de/media/exercise-video/507/307e7276-a14d-4ea0-b579-f5b0dbc6f5af.MOV' },
  lunge: { title: 'Walking lunge', url: 'https://wger.de/media/exercise-video/206/47a65c45-6fd1-4181-b71a-3a6c882e516b.MOV' },
  'split-squat': { title: 'Lunge', url: 'https://wger.de/media/exercise-video/205/c167ac34-ddbc-4e1b-8edf-1192e9d00e22.MOV' },
  'leg-press': { title: 'Leg press', url: 'https://wger.de/media/exercise-video/371/6aae16b4-01b9-4eb4-935c-3250f84d2c59.MOV' },
  'leg-curl': { title: 'Lying leg curl', url: 'https://wger.de/media/exercise-video/365/becaf013-5044-40d0-bae9-7ed60c973737.MOV' },
  'calf-raise': { title: 'Standing calf raise', url: 'https://wger.de/media/exercise-video/622/461171e5-2b16-407d-bf27-27aeef43f105.MOV' },
  'hip-thrust': { title: 'Hip thrust', url: 'https://wger.de/media/exercise-video/294/45bacf4b-1bb6-4d47-8bd1-9f00eddd4019.MOV' },
  'glute-bridge': { title: 'Hip thrust', url: 'https://wger.de/media/exercise-video/294/45bacf4b-1bb6-4d47-8bd1-9f00eddd4019.MOV' },
};

function Player({ clip }: { clip: Clip }) {
  const { language } = useWorkout();
  const type = scriptFonts(language);
  const player = useVideoPlayer(clip.url, (instance) => {
    instance.loop = true;
    instance.muted = true;
    instance.play();
  });

  return (
    <View style={styles.card}>
      <VideoView player={player} style={styles.video} contentFit="cover" nativeControls />
      <Text style={[styles.caption, { fontFamily: type.bold }]}>{clip.title}</Text>
      <Text style={[styles.credit, { fontFamily: type.body }]}>{translate(language, 'videoCredit')}</Text>
    </View>
  );
}

export function ExerciseClip({ exerciseId }: { exerciseId: string }) {
  const { language } = useWorkout();
  const type = scriptFonts(language);
  const clip = CLIPS[exerciseId];
  if (!clip) {
    return (
      <View style={styles.card}>
        <Text style={[styles.caption, { fontFamily: type.body }]}>{translate(language, 'noVideo')}</Text>
      </View>
    );
  }
  return <Player clip={clip} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    overflow: 'hidden',
  },
  video: { width: '100%', height: 220, backgroundColor: '#000' },
  caption: {
    fontFamily: fonts.bold,
    color: colors.ink,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  credit: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 12,
    paddingHorizontal: 14,
    paddingBottom: 12,
    paddingTop: 4,
  },
});
