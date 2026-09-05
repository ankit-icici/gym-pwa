/*
 * data/back.js — the Back muscle group.
 *
 * CURATION RULES (set by the user — do not quietly relax them):
 *  - Every exercise lives under its PRIMARY muscle only, and appears exactly
 *    once in the whole app. No duplicates across regions or groups.
 *  - Shoulder-primary movements (shrugs, upright rows, carries) do NOT belong
 *    to Back; they go to the Shoulders group when it is built.
 *  - At least 10 exercises per region, with at least three distinct
 *    equipment types among machine, cable, barbell, dumbbell and bodyweight.
 *
 * Demonstrations are photo pairs of real lifters (start + peak) in
 * img/demo/<id>-0.jpg and <id>-1.jpg, from the public-domain
 * free-exercise-db. `regions` is PRIORITY ORDER: the workout generator walks
 * it (wrapping around for longer sessions), so priorities double up first.
 */

export const group = {
  id: 'back',
  name: 'Back',
  tagline: 'Width, thickness and a spine that holds up',
  regions: ['lats', 'rhomboids', 'erectors', 'rear_delts'],
};

export const exercises = [
  /* ─────  LATS  (12)  ───── */
  {
    id: "wide-grip-lat-pulldown", name: "Wide-Grip Lat Pulldown",
    equipment: "Cable", target: "lats",
    secondary: ["biceps", "rhomboids", "rear_delts"],
    level: "Beginner", setsReps: "3–4 × 8–12",
    cues: ["Lead with the elbows, not the hands", "Bar to the collarbone, slight lean back", "Control it all the way up — full stretch"],
  },
  {
    id: "close-grip-pulldown", name: "Close-Grip Pulldown",
    equipment: "Cable", target: "lats",
    secondary: ["biceps", "rhomboids", "rear_delts"],
    level: "Beginner", setsReps: "3 × 10–12",
    cues: ["Elbows drive straight down", "Chest up to meet the handle", "Squeeze at the bottom, stretch at the top"],
  },
  {
    id: "v-bar-pulldown", name: "V-Bar Pulldown",
    equipment: "Cable", target: "lats",
    secondary: ["biceps", "rhomboids", "rear_delts"],
    level: "Intermediate", setsReps: "3 × 10–12",
    cues: ["Palms face each other, pull to the upper chest", "Torso tall, tiny lean only", "Do not let the weight yank you up"],
  },
  {
    id: "underhand-pulldown", name: "Underhand Pulldown",
    equipment: "Cable", target: "lats",
    secondary: ["biceps", "rhomboids", "rear_delts"],
    level: "Beginner", setsReps: "3 × 10–12",
    cues: ["Underhand grip at shoulder width", "Pull the bar to the lower chest", "Biceps help, but pull with the elbows"],
  },
  {
    id: "one-arm-pulldown", name: "One-Arm Pulldown",
    equipment: "Cable", target: "lats",
    secondary: ["biceps", "rhomboids"],
    level: "Beginner", setsReps: "3 × 10–12 each side",
    cues: ["One side at a time, zero twisting", "Elbow to your hip pocket", "Match reps on both sides"],
  },
  {
    id: "straight-arm-pulldown", name: "Straight-Arm Pulldown",
    equipment: "Cable", target: "lats",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Elbows locked in a soft bend", "Sweep the bar down to your thighs", "Lats only — go lighter than you think"],
  },
  {
    id: "pull-up", name: "Pull-Up",
    equipment: "Bodyweight", target: "lats",
    secondary: ["biceps", "rhomboids"],
    level: "Beginner", setsReps: "4 × as many as you can",
    cues: ["Full hang at the bottom", "Chin over the bar, chest to it", "No swinging — ribs down"],
  },
  {
    id: "chin-up", name: "Chin-Up",
    equipment: "Bodyweight", target: "lats",
    secondary: ["biceps", "forearms", "rhomboids"],
    level: "Beginner", setsReps: "4 × as many as you can",
    cues: ["Palms facing you, shoulder width", "Pull the chest to the bar", "Slow negative on every rep"],
  },
  {
    id: "v-bar-pull-up", name: "V-Bar Pull-Up",
    equipment: "Bodyweight", target: "lats",
    secondary: ["biceps", "rhomboids", "rear_delts"],
    level: "Beginner", setsReps: "3 × 6–10",
    cues: ["Narrow neutral grip, chest to the hands", "Lean back slightly as you rise", "Do not drop into the bottom"],
  },
  {
    id: "weighted-pull-up", name: "Weighted Pull-Up",
    equipment: "Bodyweight", target: "lats",
    secondary: ["biceps", "rhomboids"],
    level: "Intermediate", setsReps: "4 × 5–8",
    cues: ["Earn it: 10 clean bodyweight reps first", "Small plates, perfect form", "Full range or drop the weight"],
  },
  {
    id: "barbell-pullover", name: "Barbell Pullover",
    equipment: "Barbell", target: "lats",
    secondary: ["chest", "rear_delts", "triceps"],
    level: "Intermediate", setsReps: "3 × 10–12",
    cues: ["Bent arms, bar from chest to behind the head", "Ribs down, lower back on the bench", "Big stretch, controlled return"],
  },
  {
    id: "iso-lateral-machine-row", name: "Iso-Lateral Machine Row",
    equipment: "Machine", target: "lats",
    secondary: ["biceps", "rhomboids"],
    level: "Beginner", setsReps: "3–4 × 10–12",
    cues: ["Chest on the pad the whole set", "Drive the elbows down and back", "Slow on the way out"],
  },

  /* ─────  UPPER BACK  (13)  ───── */
  {
    id: "bent-over-barbell-row", name: "Bent-Over Barbell Row",
    equipment: "Barbell", target: "rhomboids",
    secondary: ["biceps", "lats", "rear_delts"],
    level: "Beginner", setsReps: "4 × 6–10",
    cues: ["Torso angle stays fixed all set", "Bar to the belly button", "Brace hard — no jerking"],
  },
  {
    id: "t-bar-row", name: "T-Bar Row",
    equipment: "Barbell", target: "rhomboids",
    secondary: ["biceps", "lats"],
    level: "Beginner", setsReps: "3–4 × 8–12",
    cues: ["Chest proud, back flat", "Elbows drive back, not up", "Pause a beat at the top"],
  },
  {
    id: "reverse-grip-barbell-row", name: "Reverse-Grip Barbell Row",
    equipment: "Barbell", target: "rhomboids",
    secondary: ["biceps", "lats", "rear_delts"],
    level: "Intermediate", setsReps: "3–4 × 8–12",
    cues: ["Underhand grip, elbows tight to the ribs", "Pull to the belt line", "Wrists stay straight"],
  },
  {
    id: "chest-supported-barbell-row", name: "Chest-Supported Barbell Row",
    equipment: "Barbell", target: "rhomboids",
    secondary: ["lats", "rear_delts"],
    level: "Beginner", setsReps: "3 × 10–12",
    cues: ["Chest glued to the bench", "Zero body English — all back", "Squeeze the blades for a second"],
  },
  {
    id: "one-arm-landmine-row", name: "One-Arm Landmine Row",
    equipment: "Barbell", target: "rhomboids",
    secondary: ["biceps", "lats", "erectors"],
    level: "Beginner", setsReps: "3 × 8–10 each side",
    cues: ["Row up and back toward the hip", "Let the blade reach at the bottom", "Hips stay square"],
  },
  {
    id: "seated-cable-row", name: "Seated Cable Row",
    equipment: "Cable", target: "rhomboids",
    secondary: ["biceps", "lats", "rear_delts"],
    level: "Beginner", setsReps: "3–4 × 10–12",
    cues: ["Chest up, torso still", "Pull to the belly, elbows past the ribs", "Full stretch forward between reps"],
  },
  {
    id: "one-arm-cable-row", name: "One-Arm Cable Row",
    equipment: "Cable", target: "rhomboids",
    secondary: ["biceps", "lats", "traps"],
    level: "Intermediate", setsReps: "3 × 10–12 each side",
    cues: ["Pull to the side of the waist", "No torso rotation", "Slow return, full reach"],
  },
  {
    id: "one-arm-dumbbell-row", name: "One-Arm Dumbbell Row",
    equipment: "Dumbbell", target: "rhomboids",
    secondary: ["biceps", "lats", "rear_delts"],
    level: "Beginner", setsReps: "3 × 10–12 each side",
    cues: ["Hips square — no twisting", "Row to the hip, not the armpit", "Full stretch at the bottom"],
  },
  {
    id: "bent-over-dumbbell-row", name: "Bent-Over Dumbbell Row",
    equipment: "Dumbbell", target: "rhomboids",
    secondary: ["biceps", "lats", "rear_delts"],
    level: "Beginner", setsReps: "3–4 × 8–12",
    cues: ["Flat back, hinge to 45 degrees", "Both elbows brush the ribs", "Squeeze the blades together up top"],
  },
  {
    id: "chest-supported-dumbbell-row", name: "Chest-Supported Dumbbell Row",
    equipment: "Dumbbell", target: "rhomboids",
    secondary: ["biceps", "forearms", "lats"],
    level: "Beginner", setsReps: "3 × 10–12",
    cues: ["Chest on the incline bench", "Row without lifting the chest", "Dead stop at the bottom kills momentum"],
  },
  {
    id: "machine-high-row", name: "Machine High Row",
    equipment: "Machine", target: "rhomboids",
    secondary: ["lats"],
    level: "Beginner", setsReps: "3 × 10–12",
    cues: ["Chest on the pad", "Pull down and back to the armpits", "Elbows to the back pockets"],
  },
  {
    id: "smith-machine-row", name: "Smith Machine Row",
    equipment: "Machine", target: "rhomboids",
    secondary: ["biceps", "lats", "rear_delts"],
    level: "Beginner", setsReps: "3–4 × 8–12",
    cues: ["Hinge and hold — the bar path is fixed", "Pull to the lower ribs", "Stay hinged between reps"],
  },
  {
    id: "inverted-row", name: "Inverted Row",
    equipment: "Bodyweight", target: "rhomboids",
    secondary: ["lats"],
    level: "Beginner", setsReps: "3 × as many as you can",
    cues: ["Body straight as a plank", "Pull the chest to the bar", "Walk the feet forward to make it harder"],
  },

  /* ─────  LOWER BACK  (9)  ───── */
  {
    id: "deadlift", name: "Deadlift",
    equipment: "Barbell", target: "erectors",
    secondary: ["forearms", "glutes", "hamstrings"],
    level: "Intermediate", setsReps: "3–5 × 3–6",
    cues: ["Back flat from start to finish", "Bar drags up the legs", "Finish tall — do not lean back"],
  },
  {
    id: "rack-pull", name: "Rack Pull",
    equipment: "Barbell", target: "erectors",
    secondary: ["forearms", "glutes", "hamstrings"],
    level: "Intermediate", setsReps: "3–4 × 5–8",
    cues: ["Pins at knee height, deadlift rules", "No bouncing off the pins", "Heavier than a deadlift — respect it"],
  },
  {
    id: "deficit-deadlift", name: "Deficit Deadlift",
    equipment: "Barbell", target: "erectors",
    secondary: ["forearms", "glutes", "hamstrings"],
    level: "Intermediate", setsReps: "3 × 5–8",
    cues: ["Stand on a low platform — longer pull", "Extra range means a lighter bar", "Flat back is non-negotiable"],
  },
  {
    id: "good-morning", name: "Good Morning",
    equipment: "Barbell", target: "erectors",
    secondary: ["abs", "glutes"],
    level: "Intermediate", setsReps: "3 × 8–10",
    cues: ["Start much lighter than you expect", "Hips back, not down", "The moment the back rounds, the set is over"],
  },
  {
    id: "seated-good-morning", name: "Seated Good Morning",
    equipment: "Barbell", target: "erectors",
    secondary: ["glutes"],
    level: "Intermediate", setsReps: "3 × 8–10",
    cues: ["Sit tall, bar on the traps", "Hinge only as far as the back stays flat", "Great way to learn the hinge"],
  },
  {
    id: "back-extension", name: "Back Extension",
    equipment: "Machine", target: "erectors",
    secondary: ["glutes", "hamstrings"],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Stop at a straight line — never beyond", "Squeeze the glutes to finish", "Hug a plate when it gets easy"],
  },
  {
    id: "floor-back-extension", name: "Floor Back Extension",
    equipment: "Bodyweight", target: "erectors",
    secondary: ["glutes", "hamstrings"],
    level: "Intermediate", setsReps: "3 × 12–15",
    cues: ["Partner or couch holds the ankles", "Slow and controlled, no jerking", "Squeeze at the top for two seconds"],
  },
  {
    id: "ball-back-extension", name: "Ball Back Extension",
    equipment: "Bodyweight", target: "erectors",
    secondary: ["glutes", "hamstrings", "rhomboids"],
    level: "Intermediate", setsReps: "3 × 12–15",
    cues: ["Hips on the ball, feet braced", "Curl up until the body is straight", "Hold a plate to progress"],
  },
  {
    id: "superman", name: "Superman",
    equipment: "Bodyweight", target: "erectors",
    secondary: ["glutes", "hamstrings"],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Arms and legs lift together", "Reach long, not high", "Two-second hold every rep"],
  },

  {
    id: "stiff-leg-good-morning", name: "Stiff-Leg Good Morning",
    equipment: "Barbell", target: "erectors",
    secondary: ["hamstrings", "glutes"],
    level: "Beginner", setsReps: "3 × 8–10",
    cues: ["Knees straight but never locked", "Fold at the hips only", "Deeper stretch than the bent-knee version — go light"],
  },

  /* ─────  REAR DELTS  (10)  ───── */
  {
    id: "cable-face-pull", name: "Cable Face Pull",
    equipment: "Cable", target: "rear_delts",
    secondary: ["rhomboids"],
    level: "Intermediate", setsReps: "3 × 15–20",
    cues: ["Pull to the face, elbows high", "Split the rope apart as it arrives", "The best shoulder-health exercise there is"],
  },
  {
    id: "cable-rear-delt-fly", name: "Cable Rear Delt Fly",
    equipment: "Cable", target: "rear_delts",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Cross the cables, opposite hand to pulley", "Arms stay long through the arc", "Constant tension — no resting"],
  },
  {
    id: "reverse-machine-fly", name: "Reverse Machine Fly",
    equipment: "Machine", target: "rear_delts",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Almost-straight arms, no curling", "Stop at the body line", "Light and strict beats heavy and sloppy"],
  },
  {
    id: "barbell-rear-delt-row", name: "Barbell Rear Delt Row",
    equipment: "Barbell", target: "rear_delts",
    secondary: ["biceps", "lats", "rhomboids"],
    level: "Beginner", setsReps: "3 × 10–12",
    cues: ["Wide grip, elbows flared high", "Pull to the lower chest", "A rear-delt move — stay strict"],
  },
  {
    id: "bent-over-reverse-fly", name: "Bent-Over Reverse Fly",
    equipment: "Dumbbell", target: "rear_delts",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Hinge flat, let the arms hang", "Lead with the pinkies", "No swinging"],
  },
  {
    id: "seated-rear-delt-raise", name: "Seated Rear Delt Raise",
    equipment: "Dumbbell", target: "rear_delts",
    secondary: [],
    level: "Intermediate", setsReps: "3 × 12–15",
    cues: ["Chest to the thighs, stay folded", "Raise out to a T", "Pause at the top"],
  },
  {
    id: "head-supported-rear-delt-raise", name: "Head-Supported Rear Delt Raise",
    equipment: "Dumbbell", target: "rear_delts",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Forehead on the bench kills cheating", "Small dumbbells, big control", "Shoulder height, no higher"],
  },
  {
    id: "lying-rear-delt-raise", name: "Lying Rear Delt Raise",
    equipment: "Dumbbell", target: "rear_delts",
    secondary: [],
    level: "Intermediate", setsReps: "3 × 12–15",
    cues: ["Chest stays on the bench", "Raise to shoulder height", "Slow on the way down"],
  },
  {
    id: "reverse-fly-with-rotation", name: "Reverse Fly with Rotation",
    equipment: "Dumbbell", target: "rear_delts",
    secondary: [],
    level: "Intermediate", setsReps: "3 × 12–15",
    cues: ["Thumbs turn up as you open", "Rotate and raise in one motion", "Rotator-cuff friendly — stay light"],
  },
  {
    id: "cable-rear-lateral", name: "Cable Rear Lateral",
    equipment: "Cable", target: "rear_delts",
    secondary: ["erectors", "rhomboids", "traps"],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Bent over, cable pulls across the body", "Arm long, low to high", "No torso rotation"],
  },
];

/** Demonstration frames follow a naming convention, so no per-exercise wiring. */
export const demo = (id, frame) => `./img/demo/${id}-${frame}.jpg`;

/** Every exercise, keyed by id. */
export const byId = Object.fromEntries(exercises.map((e) => [e.id, e]));
