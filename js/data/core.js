/*
 * data/core.js — the Core muscle group.
 *
 * Same curation rules as back.js (set by the user — do not quietly relax
 * them): primary muscle only, unique across the whole app, 10+ per region,
 * real-photo demonstrations from the public-domain free-exercise-db.
 * `regions` is PRIORITY ORDER and also the execution order of a built day.
 */

export const group = {
  id: "core",
  name: "Core",
  tagline: "A midsection that braces as well as it looks",
  regions: ["lower_abs", "upper_abs", "obliques"],
};

export const exercises = [
  /* ─────  LOWER ABS  (12)  ───── */
  {
    id: "hanging-leg-raise", name: "Hanging Leg Raise",
    equipment: "Bodyweight", target: "lower_abs",
    secondary: [],
    level: "Advanced", setsReps: "3 × 10–15",
    cues: ["Dead hang, zero swinging", "Curl the pelvis, not just the legs", "Lower slower than you lift"],
  },
  {
    id: "lying-leg-raise", name: "Lying Leg Raise",
    equipment: "Bodyweight", target: "lower_abs",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Hands under the hips for support", "Legs straight, lower to hover", "Do not let the back arch off"],
  },
  {
    id: "reverse-crunch", name: "Reverse Crunch",
    equipment: "Bodyweight", target: "lower_abs",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Knees to the chest, hips off the floor", "The hip lift IS the rep", "No leg-swinging momentum"],
  },
  {
    id: "decline-reverse-crunch", name: "Decline Reverse Crunch",
    equipment: "Bodyweight", target: "lower_abs",
    secondary: [],
    level: "Beginner", setsReps: "3 × 10–15",
    cues: ["Decline makes gravity meaner", "Hips curl up and off the bench", "Slow negative"],
  },
  {
    id: "leg-pull-in", name: "Leg Pull-In",
    equipment: "Bodyweight", target: "lower_abs",
    secondary: [],
    level: "Beginner", setsReps: "3 × 15–20",
    cues: ["Seated on the floor, lean back slightly", "Knees to chest, legs out long", "Feet never touch down"],
  },
  {
    id: "hip-raise", name: "Hip Raise",
    equipment: "Bodyweight", target: "lower_abs",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Knees bent, curl the hips up", "Lower with control", "Small movement, all abs"],
  },
  {
    id: "cable-reverse-crunch", name: "Cable Reverse Crunch",
    equipment: "Cable", target: "lower_abs",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Ankle strap on a low pulley", "Constant tension on the curl", "Strict — the stack will cheat for you"],
  },
  {
    id: "hanging-pike", name: "Hanging Pike",
    equipment: "Bodyweight", target: "lower_abs",
    secondary: [],
    level: "Advanced", setsReps: "3 × 6–10",
    cues: ["Toes toward the bar", "The hardest leg raise there is", "Bend the knees to scale it down"],
  },
  {
    id: "ball-pull-in", name: "Ball Pull-In",
    equipment: "Bodyweight", target: "lower_abs",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Push-up position, shins on the ball", "Drag the knees to the chest", "Hips stay level"],
  },
  {
    id: "jackknife-sit-up", name: "Jackknife Sit-Up",
    equipment: "Bodyweight", target: "lower_abs",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Arms and legs rise together", "Touch toes at the top", "Lower everything slow"],
  },

  {
    id: "smith-machine-hip-raise", name: "Smith Machine Hip Raise",
    equipment: "Machine", target: "lower_abs",
    secondary: [],
    level: "Intermediate", setsReps: "3 × 12–15",
    cues: ["Bar set low, hips curl up to it", "The fixed path keeps it strict", "Squeeze at the top, lower slow"],
  },
  {
    id: "captains-chair-knee-raise", name: "Captain's Chair Knee Raise",
    equipment: "Machine", target: "lower_abs",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Back flat against the pad", "Curl the hips, do not just lift the knees", "No swinging from the shoulders"],
  },

  /* ─────  UPPER ABS  (11)  ───── */
  {
    id: "crunch", name: "Crunch",
    equipment: "Bodyweight", target: "upper_abs",
    secondary: [],
    level: "Beginner", setsReps: "3 × 15–20",
    cues: ["Ribs to hips — a short curl", "Chin off the chest", "Do not yank the neck"],
  },
  {
    id: "sit-up", name: "Sit-Up",
    equipment: "Bodyweight", target: "upper_abs",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Feet anchored, curl up smooth", "Roll down bone by bone", "Add a plate on the chest to progress"],
  },
  {
    id: "decline-crunch", name: "Decline Crunch",
    equipment: "Bodyweight", target: "upper_abs",
    secondary: [],
    level: "Intermediate", setsReps: "3 × 12–15",
    cues: ["The decline adds range", "Curl, pause, lower slow", "Hands guide, never pull, the head"],
  },
  {
    id: "cable-crunch", name: "Cable Crunch",
    equipment: "Cable", target: "upper_abs",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Kneel, rope beside the ears", "Crunch the ribs to the hips", "Hips stay still — abs only"],
  },
  {
    id: "ball-crunch", name: "Ball Crunch",
    equipment: "Bodyweight", target: "upper_abs",
    secondary: [],
    level: "Beginner", setsReps: "3 × 15–20",
    cues: ["Lower back supported by the ball", "Longer range than floor crunches", "Slow and full"],
  },
  {
    id: "3-4-sit-up", name: "3/4 Sit-Up",
    equipment: "Bodyweight", target: "upper_abs",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Stop three quarters of the way up", "Constant ab tension", "Never rest at the bottom"],
  },
  {
    id: "tuck-crunch", name: "Tuck Crunch",
    equipment: "Bodyweight", target: "upper_abs",
    secondary: [],
    level: "Beginner", setsReps: "3 × 15–20",
    cues: ["Knees bent and lifted", "Crunch toward the knees", "Small strict range"],
  },
  {
    id: "legs-up-crunch", name: "Legs-Up Crunch",
    equipment: "Bodyweight", target: "upper_abs",
    secondary: [],
    level: "Beginner", setsReps: "3 × 15–20",
    cues: ["Calves resting on the ball", "Hip flexors switched off — pure abs", "Curl and hold a beat"],
  },
  {
    id: "machine-crunch", name: "Machine Crunch",
    equipment: "Machine", target: "upper_abs",
    secondary: [],
    level: "Intermediate", setsReps: "3 × 12–15",
    cues: ["Load it like any other muscle", "Full crunch, full stretch", "Progressive overload works on abs too"],
  },
  {
    id: "ab-rollout", name: "Ab Rollout",
    equipment: "Barbell", target: "upper_abs",
    secondary: ["erectors", "shoulders"],
    level: "Intermediate", setsReps: "3 × 8–12",
    cues: ["Roll out only as far as the back stays flat", "Hips never sag", "Pull back with the abs, not the arms"],
  },
  {
    id: "plank", name: "Plank",
    equipment: "Bodyweight", target: "upper_abs",
    secondary: [],
    level: "Beginner", setsReps: "3 × 30–60 s",
    cues: ["Straight line, glutes squeezed", "Push the floor away", "Quality seconds beat long saggy ones"],
  },

  /* ─────  OBLIQUES  (11)  ───── */
  {
    id: "russian-twist", name: "Russian Twist",
    equipment: "Bodyweight", target: "obliques",
    secondary: ["erectors"],
    level: "Intermediate", setsReps: "3 × 20 total",
    cues: ["Lean back, chest proud", "Rotate the ribs, not just the arms", "Feet down to scale it easier"],
  },
  {
    id: "oblique-crunch", name: "Oblique Crunch",
    equipment: "Bodyweight", target: "obliques",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15 each side",
    cues: ["Crunch shoulder toward opposite hip", "Slow — twisting momentum is wasted", "Both sides, equal reps"],
  },
  {
    id: "cross-body-crunch", name: "Cross-Body Crunch",
    equipment: "Bodyweight", target: "obliques",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15 each side",
    cues: ["Elbow chases the opposite knee", "Shoulder blade off the floor", "Controlled, never whippy"],
  },
  {
    id: "bicycle-crunch", name: "Bicycle Crunch",
    equipment: "Bodyweight", target: "obliques",
    secondary: [],
    level: "Beginner", setsReps: "3 × 20 total",
    cues: ["Slow pedaling beats fast flailing", "Elbow to opposite knee, extend the other leg", "Shoulders stay off the floor"],
  },
  {
    id: "side-plank", name: "Side Plank",
    equipment: "Bodyweight", target: "obliques",
    secondary: ["shoulders"],
    level: "Beginner", setsReps: "3 × 30–45 s each side",
    cues: ["Elbow under the shoulder", "Hips high — no sagging", "Stack the feet or stagger them"],
  },
  {
    id: "side-jackknife", name: "Side Jackknife",
    equipment: "Bodyweight", target: "obliques",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15 each side",
    cues: ["Side-lying, crunch up sideways", "Top elbow meets the top hip", "Small range, big squeeze"],
  },
  {
    id: "dumbbell-side-bend", name: "Dumbbell Side Bend",
    equipment: "Dumbbell", target: "obliques",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15 each side",
    cues: ["One bell only — the other hand stays empty", "Slide down the thigh, pull back up", "Do not lean forward or back"],
  },
  {
    id: "barbell-side-bend", name: "Barbell Side Bend",
    equipment: "Barbell", target: "obliques",
    secondary: ["erectors"],
    level: "Beginner", setsReps: "3 × 12–15 each side",
    cues: ["Bar on the back, feet planted", "Bend strictly sideways", "Light — the spine is involved"],
  },
  {
    id: "cable-woodchop", name: "Cable Woodchop",
    equipment: "Cable", target: "obliques",
    secondary: ["shoulders"],
    level: "Beginner", setsReps: "3 × 12–15 each side",
    cues: ["High to low, across the body", "Arms long, hips pivot", "Power comes from the trunk"],
  },
  {
    id: "cable-russian-twist", name: "Cable Russian Twist",
    equipment: "Cable", target: "obliques",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15 each side",
    cues: ["Cable at chest height, arms long", "Rotate against the stack", "Constant tension both ways"],
  },
  {
    id: "pallof-press", name: "Pallof Press",
    equipment: "Cable", target: "obliques",
    secondary: ["chest", "shoulders", "triceps"],
    level: "Beginner", setsReps: "3 × 10–12 each side",
    cues: ["Press out and hold — do not rotate", "Anti-rotation is the whole point", "Brutally honest core strength"],
  },
];

/** Demonstration frames follow a naming convention, so no per-exercise wiring. */
export const demo = (id, frame) => `./img/demo/${id}-${frame}.jpg`;

/** Every exercise, keyed by id. */
export const byId = Object.fromEntries(exercises.map((e) => [e.id, e]));
