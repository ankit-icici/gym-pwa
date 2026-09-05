/*
 * data/arms.js — the Arms muscle group.
 *
 * Same curation rules as back.js (set by the user — do not quietly relax
 * them): primary muscle only, unique across the whole app, 10+ per region,
 * real-photo demonstrations from the public-domain free-exercise-db.
 * `regions` is PRIORITY ORDER and also the execution order of a built day.
 */

export const group = {
  id: "arms",
  name: "Arms",
  tagline: "Biceps, triceps and a grip that lasts",
  regions: ["biceps", "triceps", "forearms"],
  // Execution plan set by the user: 4 biceps, 3 triceps, 2 forearms, alternating bi/tri with grip work last
  plan: ["biceps", "triceps", "biceps", "triceps", "biceps", "triceps", "biceps", "forearms", "forearms"],
};

export const exercises = [
  /* ─────  BICEPS  (11)  ───── */
  {
    id: "barbell-curl", name: "Barbell Curl",
    equipment: "Barbell", target: "biceps",
    secondary: ["forearms"],
    level: "Beginner", setsReps: "3–4 × 8–12",
    cues: ["Elbows pinned to the ribs", "No leaning back to finish reps", "Full lockout at the bottom"],
  },
  {
    id: "ez-bar-curl", name: "EZ-Bar Curl",
    equipment: "Barbell", target: "biceps",
    secondary: [],
    level: "Beginner", setsReps: "3–4 × 8–12",
    cues: ["The angled grip spares the wrists", "Same rules as a straight bar", "Squeeze hard at the top"],
  },
  {
    id: "preacher-curl", name: "Preacher Curl",
    equipment: "Barbell", target: "biceps",
    secondary: [],
    level: "Beginner", setsReps: "3 × 10–12",
    cues: ["Armpits snug on the pad", "Stop just short of straight at the bottom", "No bouncing out of the stretch"],
  },
  {
    id: "spider-curl", name: "Spider Curl",
    equipment: "Barbell", target: "biceps",
    secondary: [],
    level: "Beginner", setsReps: "3 × 10–12",
    cues: ["Chest down on the incline bench", "Arms hang straight — pure curl", "Nowhere to cheat from here"],
  },
  {
    id: "dumbbell-curl", name: "Dumbbell Curl",
    equipment: "Dumbbell", target: "biceps",
    secondary: ["forearms"],
    level: "Beginner", setsReps: "3 × 10–12",
    cues: ["Rotate palms up as you curl", "Both arms or alternating — stay strict", "Control the lowering"],
  },
  {
    id: "hammer-curl", name: "Hammer Curl",
    equipment: "Dumbbell", target: "biceps",
    secondary: [],
    level: "Beginner", setsReps: "3 × 10–12",
    cues: ["Palms face each other throughout", "Builds the arm’s thickness", "No swinging from the shoulders"],
  },
  {
    id: "incline-dumbbell-curl", name: "Incline Dumbbell Curl",
    equipment: "Dumbbell", target: "biceps",
    secondary: [],
    level: "Beginner", setsReps: "3 × 10–12",
    cues: ["Lie back, arms hang behind the body", "Longest biceps stretch there is", "Curl without drifting forward"],
  },
  {
    id: "concentration-curl", name: "Concentration Curl",
    equipment: "Dumbbell", target: "biceps",
    secondary: ["forearms"],
    level: "Beginner", setsReps: "3 × 10–12 each side",
    cues: ["Elbow braced against the inner thigh", "Curl to the shoulder, squeeze", "The strictest curl in the gym"],
  },
  {
    id: "cable-curl", name: "Cable Curl",
    equipment: "Cable", target: "biceps",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Tension from bottom to top", "Elbows glued in place", "Great as a finisher"],
  },
  {
    id: "rope-hammer-curl", name: "Rope Hammer Curl",
    equipment: "Cable", target: "biceps",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Neutral grip on the rope", "Drive the thumbs to the shoulders", "Slow negative"],
  },
  {
    id: "machine-curl", name: "Machine Curl",
    equipment: "Machine", target: "biceps",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Elbows lined up with the pivot", "Full stretch, full squeeze", "No half reps as you tire"],
  },

  /* ─────  TRICEPS  (12)  ───── */
  {
    id: "close-grip-bench-press", name: "Close-Grip Bench Press",
    equipment: "Barbell", target: "triceps",
    secondary: ["chest", "shoulders"],
    level: "Beginner", setsReps: "4 × 6–10",
    cues: ["Hands just inside shoulder width", "Elbows tucked to the ribs", "The mass-builder for triceps"],
  },
  {
    id: "skullcrusher", name: "Skullcrusher",
    equipment: "Barbell", target: "triceps",
    secondary: ["forearms"],
    level: "Beginner", setsReps: "3 × 10–12",
    cues: ["Lower to the forehead or just behind", "Elbows stay pointed at the ceiling", "Go light before you go heavy"],
  },
  {
    id: "overhead-barbell-extension", name: "Overhead Barbell Extension",
    equipment: "Barbell", target: "triceps",
    secondary: ["shoulders"],
    level: "Beginner", setsReps: "3 × 10–12",
    cues: ["Elbows close to the head", "Lower behind the neck, press tall", "Long-head stretch is the point"],
  },
  {
    id: "cable-pushdown", name: "Cable Pushdown",
    equipment: "Cable", target: "triceps",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Elbows pinned to the sides", "Push to full lockout", "Only the forearms move"],
  },
  {
    id: "rope-pushdown", name: "Rope Pushdown",
    equipment: "Cable", target: "triceps",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Split the rope at the bottom", "Elbows never drift forward", "Squeeze for a second locked out"],
  },
  {
    id: "overhead-rope-extension", name: "Overhead Rope Extension",
    equipment: "Cable", target: "triceps",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Face away, rope behind the head", "Extend up and slightly forward", "Deep stretch at the bottom"],
  },
  {
    id: "lying-dumbbell-extension", name: "Lying Dumbbell Extension",
    equipment: "Dumbbell", target: "triceps",
    secondary: ["chest", "shoulders"],
    level: "Intermediate", setsReps: "3 × 10–12",
    cues: ["Bells lower past the ears", "Elbows point at the ceiling", "Press back to full lockout"],
  },
  {
    id: "overhead-dumbbell-extension", name: "Overhead Dumbbell Extension",
    equipment: "Dumbbell", target: "triceps",
    secondary: [],
    level: "Beginner", setsReps: "3 × 10–12",
    cues: ["Both hands cup one bell overhead", "Lower behind the head", "Elbows in — do not let them flare"],
  },
  {
    id: "dumbbell-kickback", name: "Dumbbell Kickback",
    equipment: "Dumbbell", target: "triceps",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Upper arm parallel to the floor and frozen", "Extend to a straight arm, pause", "Light weight — momentum ruins it"],
  },
  {
    id: "triceps-dips", name: "Triceps Dips",
    equipment: "Bodyweight", target: "triceps",
    secondary: ["chest", "shoulders"],
    level: "Beginner", setsReps: "3 × as many as you can",
    cues: ["Body upright, elbows tucked", "Down to 90°, press to lockout", "Lean forward and it becomes chest"],
  },
  {
    id: "bench-dips", name: "Bench Dips",
    equipment: "Bodyweight", target: "triceps",
    secondary: ["chest", "shoulders"],
    level: "Beginner", setsReps: "3 × 10–15",
    cues: ["Hands on a bench behind you", "Hips close to the bench", "Add plates on the lap to progress"],
  },
  {
    id: "machine-dip", name: "Machine Dip",
    equipment: "Machine", target: "triceps",
    secondary: ["chest", "shoulders"],
    level: "Beginner", setsReps: "3 × 10–12",
    cues: ["Elbows track straight back", "Full lockout, controlled return", "Heavier than bodyweight dips allow"],
  },

  /* ─────  FOREARMS  (10)  ───── */
  {
    id: "barbell-wrist-curl", name: "Barbell Wrist Curl",
    equipment: "Barbell", target: "forearms",
    secondary: [],
    level: "Beginner", setsReps: "3 × 15–20",
    cues: ["Forearms on the thighs, palms up", "Curl with the wrists only", "Let the bar roll to the fingers, then curl"],
  },
  {
    id: "reverse-wrist-curl", name: "Reverse Wrist Curl",
    equipment: "Barbell", target: "forearms",
    secondary: [],
    level: "Beginner", setsReps: "3 × 15–20",
    cues: ["Palms down, small range", "Balances all the gripping work", "Light bar, high reps"],
  },
  {
    id: "behind-back-wrist-curl", name: "Behind-Back Wrist Curl",
    equipment: "Barbell", target: "forearms",
    secondary: [],
    level: "Beginner", setsReps: "3 × 15–20",
    cues: ["Bar held behind the thighs", "Curl the wrists, nothing else moves", "Grip width at the hips"],
  },
  {
    id: "dumbbell-wrist-curl", name: "Dumbbell Wrist Curl",
    equipment: "Dumbbell", target: "forearms",
    secondary: [],
    level: "Beginner", setsReps: "3 × 15–20 each side",
    cues: ["One arm at a time on the thigh", "Full roll to the fingertips", "Slow both directions"],
  },
  {
    id: "dumbbell-reverse-wrist-curl", name: "Dumbbell Reverse Wrist Curl",
    equipment: "Dumbbell", target: "forearms",
    secondary: [],
    level: "Beginner", setsReps: "3 × 15–20 each side",
    cues: ["Palm down on the thigh", "Small strict range", "The forgotten half of forearm work"],
  },
  {
    id: "cable-wrist-curl", name: "Cable Wrist Curl",
    equipment: "Cable", target: "forearms",
    secondary: [],
    level: "Beginner", setsReps: "3 × 15–20",
    cues: ["Constant tension through the range", "Wrists only, forearms braced", "Burnout-friendly"],
  },
  {
    id: "finger-curls", name: "Finger Curls",
    equipment: "Barbell", target: "forearms",
    secondary: [],
    level: "Beginner", setsReps: "3 × 15–20",
    cues: ["Bar rolls to the fingertips", "Close the fist to curl it back", "Pure grip strength"],
  },
  {
    id: "farmer-s-carry", name: "Farmer's Carry",
    equipment: "Dumbbell", target: "forearms",
    secondary: ["abs", "glutes", "hamstrings"],
    level: "Intermediate", setsReps: "3 × 30–40 m",
    cues: ["Heaviest bells you can hold flat-backed", "Tall posture, short quick steps", "The grip gives out last — make it fight"],
  },
  {
    id: "plate-pinch", name: "Plate Pinch",
    equipment: "Bodyweight", target: "forearms",
    secondary: [],
    level: "Intermediate", setsReps: "3 × 30 s holds",
    cues: ["Pinch two plates smooth-side out", "Thumb strength you cannot fake", "Time the holds, beat them next week"],
  },
  {
    id: "wrist-roller", name: "Wrist Roller",
    equipment: "Bodyweight", target: "forearms",
    secondary: ["shoulders"],
    level: "Beginner", setsReps: "3 rolls up + down",
    cues: ["Arms out, roll the weight up", "Both directions, no resting", "Cruel and effective"],
  },
];

/** Demonstration frames follow a naming convention, so no per-exercise wiring. */
export const demo = (id, frame) => `./img/demo/${id}-${frame}.jpg`;

/** Every exercise, keyed by id. */
export const byId = Object.fromEntries(exercises.map((e) => [e.id, e]));
