export type Muscle = 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'legs' | 'core';

export type Exercise = {
  id: string;
  name: string;
  muscle: Muscle;
  equipment: string;
  sets: number;
  reps: string;
  cue: string;
  coachNote: string;
};

export const MUSCLE_LABELS: Record<Muscle, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  legs: 'Legs',
  core: 'Core',
};

export const MUSCLES: Muscle[] = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core'];

const base = (muscle: Muscle, equipment: string, sets = 3, reps = '8–12'): Pick<Exercise, 'muscle' | 'equipment' | 'sets' | 'reps'> => ({
  muscle,
  equipment,
  sets,
  reps,
});

export const EXERCISES: Exercise[] = [
  { id: 'bench-press', name: 'Bench Press', ...base('chest', 'Barbell', 4, '6–8'), cue: 'Feet down, bar to mid-chest, press up.', coachNote: 'Pause on the chest, then drive.' },
  { id: 'incline-press', name: 'Incline Press', ...base('chest', 'Dumbbells'), cue: 'Bench at 30 degrees. Lower until the elbows sit just below the chest.', coachNote: 'Wrists stay stacked over the elbows.' },
  { id: 'push-up', name: 'Push-up', ...base('chest', 'Bodyweight', 3, 'AMRAP'), cue: 'Body in one line. Chest reaches the floor.', coachNote: 'Elevate the hands if the reps fall apart.' },
  { id: 'cable-fly', name: 'Cable Fly', ...base('chest', 'Cables', 3, '12'), cue: 'Soft elbows. Squeeze as the hands meet.', coachNote: 'Wrap the arms around a barrel.' },
  { id: 'chest-dip', name: 'Chest Dip', ...base('chest', 'Dip bars'), cue: 'Lean forward. Stop while the shoulders stay comfortable.', coachNote: 'The lean puts the work on the chest.' },
  { id: 'db-press', name: 'Dumbbell Press', ...base('chest', 'Dumbbells'), cue: 'Lower the dumbbells to the sides of the chest, then press.', coachNote: 'Do not bounce them off the chest.' },

  { id: 'pull-up', name: 'Pull-up', ...base('back', 'Bar', 4, '5–8'), cue: 'Dead hang, then chest toward the bar.', coachNote: 'Lower under control.' },
  { id: 'bent-row', name: 'Bent-over Row', ...base('back', 'Barbell', 4, '6–10'), cue: 'Hinge, flat back, pull to the belly.', coachNote: 'If the back rounds, drop the load.' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', ...base('back', 'Cable'), cue: 'Pull the bar to the collarbone without swinging.', coachNote: 'Drive the elbows down.' },
  { id: 'row', name: 'Seated Row', ...base('back', 'Cable', 3, '10'), cue: 'Tall chest, pull to the belly, then reach long.', coachNote: 'Squeeze the shoulder blades.' },
  { id: 'one-arm-row', name: 'One-arm Row', ...base('back', 'Dumbbell'), cue: 'Brace on the bench. Pull the dumbbell to the hip.', coachNote: 'Keep the shoulder from shrugging.' },
  { id: 'straight-arm', name: 'Straight-arm Pulldown', ...base('back', 'Cable', 3, '12'), cue: 'Arms nearly straight. Pull from the lats.', coachNote: 'Exhale as the bar passes the thighs.' },

  { id: 'ohp', name: 'Shoulder Press', ...base('shoulders', 'Dumbbells'), cue: 'Ribs down, press the weights overhead.', coachNote: 'Do not lean back.' },
  { id: 'lateral-raise', name: 'Lateral Raise', ...base('shoulders', 'Dumbbells', 3, '12'), cue: 'Lead with the elbows. Stop at shoulder height.', coachNote: 'A light weight done cleanly beats a swing.' },
  { id: 'rear-delt', name: 'Rear Delt Fly', ...base('shoulders', 'Dumbbells', 3, '12'), cue: 'Hinge forward and open the arms wide.', coachNote: 'Do not shrug the set away.' },
  { id: 'arnold-press', name: 'Arnold Press', ...base('shoulders', 'Dumbbells'), cue: 'Start palms in, rotate them out as you press.', coachNote: 'Control the lower half.' },
  { id: 'front-raise', name: 'Front Raise', ...base('shoulders', 'Dumbbells', 3, '12'), cue: 'Lift to eye level with soft elbows.', coachNote: 'Keep the ribs down.' },
  { id: 'upright-row', name: 'Upright Row', ...base('shoulders', 'Barbell', 3, '10'), cue: 'Lead with the elbows to chest height.', coachNote: 'Stop if the shoulders pinch.' },

  { id: 'curl', name: 'Barbell Curl', ...base('biceps', 'Barbell', 3, '8–10'), cue: 'Elbows still, curl up, lower slow.', coachNote: 'Stop if the hips start swinging.' },
  { id: 'hammer-curl', name: 'Hammer Curl', ...base('biceps', 'Dumbbells', 3, '10'), cue: 'Thumbs up. Curl without the elbows drifting forward.', coachNote: 'Keep the wrists quiet.' },
  { id: 'incline-curl', name: 'Incline Curl', ...base('biceps', 'Dumbbells'), cue: 'Arms hang from a 45 degree bench, then curl.', coachNote: 'Keep the stretch at the bottom.' },
  { id: 'cable-curl', name: 'Cable Curl', ...base('biceps', 'Cable', 3, '10'), cue: 'Pin the elbows and curl the bar up.', coachNote: 'The cable keeps tension at the bottom.' },
  { id: 'preacher-curl', name: 'Preacher Curl', ...base('biceps', 'Dumbbell', 3, '10'), cue: 'Upper arm on the pad. Curl without lifting the elbow.', coachNote: 'Lower until the arm is almost straight.' },
  { id: 'concentration-curl', name: 'Concentration Curl', ...base('biceps', 'Dumbbell', 3, '10'), cue: 'Elbow braced on the thigh. Curl to the shoulder.', coachNote: 'Squeeze at the top.' },

  { id: 'pushdown', name: 'Triceps Pushdown', ...base('triceps', 'Cable', 3, '12'), cue: 'Elbows at your sides, lock out.', coachNote: 'Only the forearms move.' },
  { id: 'overhead-ext', name: 'Overhead Extension', ...base('triceps', 'Dumbbell', 3, '10'), cue: 'Elbows point forward. Extend overhead.', coachNote: 'Keep the upper arms still.' },
  { id: 'skull-crusher', name: 'Skull Crusher', ...base('triceps', 'EZ bar'), cue: 'Lower toward the forehead, then extend.', coachNote: 'If the elbows drift, it becomes a press.' },
  { id: 'close-grip', name: 'Close-grip Bench', ...base('triceps', 'Barbell', 4, '6–8'), cue: 'Hands just inside the shoulders. Elbows tucked.', coachNote: 'Touch lower than a normal bench.' },
  { id: 'tricep-dip', name: 'Bench Dip', ...base('triceps', 'Bench', 3, '10'), cue: 'Hands on the bench, lower until the arms reach 90 degrees.', coachNote: 'Keep the hips close to the bench.' },
  { id: 'kickback', name: 'Triceps Kickback', ...base('triceps', 'Dumbbell', 3, '12'), cue: 'Hinge, upper arm still, extend the forearm back.', coachNote: 'Pause at the lockout.' },

  { id: 'squat', name: 'Squat', ...base('legs', 'Barbell', 4, '6–8'), cue: 'Sit between the hips, then stand.', coachNote: 'Knees track over the toes.' },
  { id: 'rdl', name: 'Romanian Deadlift', ...base('legs', 'Barbell', 3, '8'), cue: 'Hips back, soft knees, stand tall.', coachNote: 'Stop at a firm hamstring stretch.' },
  { id: 'lunge', name: 'Lunge', ...base('legs', 'Dumbbells', 3, '8 / leg'), cue: 'Long step, front heel stays down.', coachNote: 'Back knee drops, torso stays tall.' },
  { id: 'leg-press', name: 'Leg Press', ...base('legs', 'Machine', 3, '10'), cue: 'Feet mid-platform. Do not lock the knees hard.', coachNote: 'Hips stay on the pad.' },
  { id: 'leg-curl', name: 'Leg Curl', ...base('legs', 'Machine', 3, '12'), cue: 'Curl the heels toward the glutes.', coachNote: 'Pause at the top.' },
  { id: 'calf-raise', name: 'Calf Raise', ...base('legs', 'Machine', 3, '12'), cue: 'Full stretch, then rise onto the toes.', coachNote: 'Pause at the top.' },

  { id: 'plank', name: 'Plank', ...base('core', 'Bodyweight', 3, '30–45s'), cue: 'Body in one line, glutes tight.', coachNote: 'If the back sags, drop to the knees.' },
  { id: 'dead-bug', name: 'Dead Bug', ...base('core', 'Bodyweight', 3, '8 / side'), cue: 'Low back stays on the floor as the limbs reach.', coachNote: 'Exhale as you extend.' },
  { id: 'hanging-raise', name: 'Hanging Leg Raise', ...base('core', 'Bar', 3, '8–12'), cue: 'Still hang, then lift the pelvis.', coachNote: 'A slow lower beats a swing.' },
  { id: 'cable-crunch', name: 'Cable Crunch', ...base('core', 'Cable', 3, '12'), cue: 'Hips stay put. Curl the ribs toward the hips.', coachNote: 'This is a crunch, not a hip hinge.' },
  { id: 'pallof', name: 'Pallof Press', ...base('core', 'Cable', 3, '10 / side'), cue: 'Press straight out and resist the twist.', coachNote: 'Hold the lockout for a second.' },
  { id: 'ab-wheel', name: 'Ab Wheel', ...base('core', 'Wheel', 3, '6–10'), cue: 'Roll out until the hips stay tucked, then pull back.', coachNote: 'Shorten the roll if the back arches.' },
];

export function exerciseById(id: string): Exercise | undefined {
  return EXERCISES.find((exercise) => exercise.id === id);
}
