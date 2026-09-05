/*
 * data/chest.js — the Chest muscle group.
 *
 * Same curation rules as back.js (set by the user — do not quietly relax
 * them): primary muscle only, unique across the whole app, 10+ per region,
 * real-photo demonstrations from the public-domain free-exercise-db.
 * `regions` is PRIORITY ORDER and also the execution order of a built day.
 */

export const group = {
  id: "chest",
  name: "Chest",
  tagline: "Press power and a full upper shelf",
  regions: ["mid_chest", "upper_chest", "lower_chest"],
};

export const exercises = [
  /* ─────  MID CHEST  (10)  ───── */
  {
    id: "barbell-bench-press", name: "Barbell Bench Press",
    equipment: "Barbell", target: "mid_chest",
    secondary: ["shoulders", "triceps"],
    level: "Beginner", setsReps: "4 × 6–10",
    cues: ["Shoulder blades pinned back on the bench", "Bar to the nipple line, elbows ~45°", "Feet planted — drive through the floor"],
  },
  {
    id: "dumbbell-bench-press", name: "Dumbbell Bench Press",
    equipment: "Dumbbell", target: "mid_chest",
    secondary: ["shoulders", "triceps"],
    level: "Beginner", setsReps: "3–4 × 8–12",
    cues: ["Deeper stretch than a bar allows", "Press up and slightly together", "Do not clang the bells at the top"],
  },
  {
    id: "smith-machine-bench-press", name: "Smith Machine Bench Press",
    equipment: "Machine", target: "mid_chest",
    secondary: ["shoulders", "triceps"],
    level: "Beginner", setsReps: "3–4 × 8–12",
    cues: ["Bench set so the bar meets mid-chest", "Fixed path — control the tempo", "Rack safeties just below chest height"],
  },
  {
    id: "machine-chest-press", name: "Machine Chest Press",
    equipment: "Machine", target: "mid_chest",
    secondary: ["shoulders", "triceps"],
    level: "Beginner", setsReps: "3 × 10–12",
    cues: ["Handles level with mid-chest", "Press through, one-second squeeze", "Slow negative, plates never slam"],
  },
  {
    id: "pec-deck-fly", name: "Pec Deck Fly",
    equipment: "Machine", target: "mid_chest",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Elbows slightly bent and fixed", "Squeeze the pads together, pause", "Open only as far as comfortable"],
  },
  {
    id: "cable-crossover", name: "Cable Crossover",
    equipment: "Cable", target: "mid_chest",
    secondary: ["shoulders"],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Step forward, slight lean in", "Hug a barrel — hands meet low", "Constant tension, no resting at the top"],
  },
  {
    id: "flat-cable-fly", name: "Flat Cable Fly",
    equipment: "Cable", target: "mid_chest",
    secondary: [],
    level: "Intermediate", setsReps: "3 × 12–15",
    cues: ["Bench between the low pulleys", "Arms in a wide arc, elbows soft", "Squeeze above the chest"],
  },
  {
    id: "dumbbell-fly", name: "Dumbbell Fly",
    equipment: "Dumbbell", target: "mid_chest",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Soft elbows locked at one angle", "Lower until you feel the stretch", "Fly, do not press"],
  },
  {
    id: "push-up", name: "Push-Up",
    equipment: "Bodyweight", target: "mid_chest",
    secondary: ["shoulders", "triceps"],
    level: "Beginner", setsReps: "3 × as many as you can",
    cues: ["Body one straight line", "Chest to the floor every rep", "Hands under the shoulders"],
  },
  {
    id: "wide-push-up", name: "Wide Push-Up",
    equipment: "Bodyweight", target: "mid_chest",
    secondary: ["abs", "shoulders", "triceps"],
    level: "Beginner", setsReps: "3 × as many as you can",
    cues: ["Hands well outside the shoulders", "More chest, less triceps", "Keep the hips level"],
  },

  /* ─────  UPPER CHEST  (10)  ───── */
  {
    id: "incline-barbell-press", name: "Incline Barbell Press",
    equipment: "Barbell", target: "upper_chest",
    secondary: ["shoulders", "triceps"],
    level: "Beginner", setsReps: "4 × 6–10",
    cues: ["Bench at 30–45°, no higher", "Bar to the upper chest", "Elbows under the bar, not flared"],
  },
  {
    id: "incline-dumbbell-press", name: "Incline Dumbbell Press",
    equipment: "Dumbbell", target: "upper_chest",
    secondary: ["shoulders", "triceps"],
    level: "Beginner", setsReps: "3–4 × 8–12",
    cues: ["Bells start at shoulder width", "Press up and slightly back", "Full stretch at the bottom"],
  },
  {
    id: "neutral-grip-incline-press", name: "Neutral-Grip Incline Press",
    equipment: "Dumbbell", target: "upper_chest",
    secondary: ["shoulders", "triceps"],
    level: "Beginner", setsReps: "3 × 8–12",
    cues: ["Palms face each other", "Easier on the shoulders", "Same bar path as a normal incline"],
  },
  {
    id: "incline-dumbbell-fly", name: "Incline Dumbbell Fly",
    equipment: "Dumbbell", target: "upper_chest",
    secondary: ["shoulders"],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Same fly rules, tilted bench", "Arc wide, stretch deep", "Do not turn it into a press"],
  },
  {
    id: "incline-cable-fly", name: "Incline Cable Fly",
    equipment: "Cable", target: "upper_chest",
    secondary: ["shoulders"],
    level: "Intermediate", setsReps: "3 × 12–15",
    cues: ["Cables keep tension at the top", "Squeeze above the upper chest", "Elbow angle never changes"],
  },
  {
    id: "incline-cable-press", name: "Incline Cable Press",
    equipment: "Cable", target: "upper_chest",
    secondary: ["shoulders", "triceps"],
    level: "Beginner", setsReps: "3 × 10–12",
    cues: ["Press up and in from low pulleys", "Cables fight you sideways — resist", "Slow eccentric"],
  },
  {
    id: "low-to-high-cable-fly", name: "Low-to-High Cable Fly",
    equipment: "Cable", target: "upper_chest",
    secondary: ["shoulders"],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Start low, finish at eye level", "The upward arc is the upper-chest line", "Pause with hands together"],
  },
  {
    id: "incline-machine-press", name: "Incline Machine Press",
    equipment: "Machine", target: "upper_chest",
    secondary: ["shoulders", "triceps"],
    level: "Beginner", setsReps: "3 × 10–12",
    cues: ["Seat set so handles hit upper chest", "Drive through, do not lock hard", "Control the plates down"],
  },
  {
    id: "smith-incline-press", name: "Smith Incline Press",
    equipment: "Machine", target: "upper_chest",
    secondary: ["shoulders", "triceps"],
    level: "Beginner", setsReps: "3–4 × 8–12",
    cues: ["Bar meets the chest below the collarbone", "Fixed path — slow and strict", "Safeties set before you start"],
  },
  {
    id: "feet-elevated-push-up", name: "Feet-Elevated Push-Up",
    equipment: "Bodyweight", target: "upper_chest",
    secondary: ["shoulders", "triceps"],
    level: "Beginner", setsReps: "3 × as many as you can",
    cues: ["Feet on a bench, hands on the floor", "The higher the feet, the more upper chest", "Body stays rigid"],
  },

  /* ─────  LOWER CHEST  (10)  ───── */
  {
    id: "decline-barbell-press", name: "Decline Barbell Press",
    equipment: "Barbell", target: "lower_chest",
    secondary: ["shoulders", "triceps"],
    level: "Beginner", setsReps: "3–4 × 8–12",
    cues: ["Slight decline is enough", "Bar to the lower chest", "Shorter path — expect heavier weight"],
  },
  {
    id: "wide-grip-decline-press", name: "Wide-Grip Decline Press",
    equipment: "Barbell", target: "lower_chest",
    secondary: ["shoulders", "triceps"],
    level: "Intermediate", setsReps: "3 × 8–12",
    cues: ["Grip well outside the shoulders", "Less triceps, more chest", "Touch and drive, no bouncing"],
  },
  {
    id: "decline-dumbbell-press", name: "Decline Dumbbell Press",
    equipment: "Dumbbell", target: "lower_chest",
    secondary: ["shoulders", "triceps"],
    level: "Beginner", setsReps: "3 × 8–12",
    cues: ["Hook the feet before taking the bells", "Press up, not toward the head", "Deep stretch, straight path"],
  },
  {
    id: "decline-dumbbell-fly", name: "Decline Dumbbell Fly",
    equipment: "Dumbbell", target: "lower_chest",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Fixed soft elbows", "Wide arc over the lower chest", "Light — the stretch does the work"],
  },
  {
    id: "chest-dips", name: "Chest Dips",
    equipment: "Bodyweight", target: "lower_chest",
    secondary: ["shoulders", "triceps"],
    level: "Intermediate", setsReps: "3 × as many as you can",
    cues: ["Lean forward, elbows flare slightly", "Down until shoulders are below elbows", "Stay leaned — upright shifts it to triceps"],
  },
  {
    id: "high-to-low-cable-fly", name: "High-to-Low Cable Fly",
    equipment: "Cable", target: "lower_chest",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Start high, finish at the hips", "Arms long, arc down and in", "Squeeze at the bottom"],
  },
  {
    id: "one-arm-cable-crossover", name: "One-Arm Cable Crossover",
    equipment: "Cable", target: "lower_chest",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15 each side",
    cues: ["One side at a time, hips square", "Cross past the midline", "Slow return — do not get pulled open"],
  },
  {
    id: "decline-machine-press", name: "Decline Machine Press",
    equipment: "Machine", target: "lower_chest",
    secondary: ["shoulders", "triceps"],
    level: "Beginner", setsReps: "3 × 10–12",
    cues: ["Handles at lower-chest height", "Press and squeeze for a second", "No lockout slamming"],
  },
  {
    id: "smith-decline-press", name: "Smith Decline Press",
    equipment: "Machine", target: "lower_chest",
    secondary: ["shoulders", "triceps"],
    level: "Beginner", setsReps: "3 × 8–12",
    cues: ["Fixed path suits the decline angle", "Bar to the lower chest", "Control beats load here"],
  },
  {
    id: "incline-push-up", name: "Incline Push-Up",
    equipment: "Bodyweight", target: "lower_chest",
    secondary: ["shoulders", "triceps"],
    level: "Beginner", setsReps: "3 × as many as you can",
    cues: ["Hands on a bench, feet on the floor", "Hands-elevated = lower-chest bias", "Chest to the bench edge every rep"],
  },
];

/** Demonstration frames follow a naming convention, so no per-exercise wiring. */
export const demo = (id, frame) => `./img/demo/${id}-${frame}.jpg`;

/** Every exercise, keyed by id. */
export const byId = Object.fromEntries(exercises.map((e) => [e.id, e]));
