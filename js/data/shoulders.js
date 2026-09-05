/*
 * data/shoulders.js — the Shoulders muscle group.
 *
 * Same curation rules as back.js (set by the user — do not quietly relax
 * them): primary muscle only, unique across the whole app, 10+ per region,
 * real-photo demonstrations from the public-domain free-exercise-db.
 * `regions` is PRIORITY ORDER and also the execution order of a built day.
 */

export const group = {
  id: "shoulders",
  name: "Shoulders",
  tagline: "Caps, width and a strong press",
  regions: ["front_delts", "side_delts", "traps"],
};

export const exercises = [
  /* ─────  FRONT DELTS  (12)  ───── */
  {
    id: "overhead-barbell-press", name: "Overhead Barbell Press",
    equipment: "Barbell", target: "front_delts",
    secondary: ["triceps"],
    level: "Beginner", setsReps: "4 × 5–8",
    cues: ["Squeeze the glutes, ribs down", "Bar path grazes the face", "Lock out overhead, biceps by the ears"],
  },
  {
    id: "seated-barbell-press", name: "Seated Barbell Press",
    equipment: "Barbell", target: "front_delts",
    secondary: ["triceps"],
    level: "Intermediate", setsReps: "3–4 × 6–10",
    cues: ["Back against the pad, feet planted", "Lower to the chin, no lower", "No bouncing out of the bottom"],
  },
  {
    id: "push-press", name: "Push Press",
    equipment: "Barbell", target: "front_delts",
    secondary: ["quads", "triceps"],
    level: "Advanced", setsReps: "4 × 3–6",
    cues: ["Small knee dip, big drive", "Legs start it, shoulders finish it", "Absorb the bar on the way down"],
  },
  {
    id: "seated-dumbbell-press", name: "Seated Dumbbell Press",
    equipment: "Dumbbell", target: "front_delts",
    secondary: ["triceps"],
    level: "Beginner", setsReps: "3–4 × 8–12",
    cues: ["Bells at shoulder height, palms forward", "Press up, not forward", "Do not clang at the top"],
  },
  {
    id: "arnold-press", name: "Arnold Press",
    equipment: "Dumbbell", target: "front_delts",
    secondary: ["triceps"],
    level: "Intermediate", setsReps: "3 × 8–12",
    cues: ["Start palms facing you", "Rotate out as you press", "Reverse the spiral on the way down"],
  },
  {
    id: "standing-dumbbell-press", name: "Standing Dumbbell Press",
    equipment: "Dumbbell", target: "front_delts",
    secondary: ["triceps"],
    level: "Beginner", setsReps: "3 × 8–10",
    cues: ["Brace like a plank", "No leg drive — that is a push press", "Full lockout overhead"],
  },
  {
    id: "machine-shoulder-press", name: "Machine Shoulder Press",
    equipment: "Machine", target: "front_delts",
    secondary: ["triceps"],
    level: "Beginner", setsReps: "3 × 10–12",
    cues: ["Seat set so handles start at shoulder height", "Press without shrugging", "Slow negative"],
  },
  {
    id: "smith-shoulder-press", name: "Smith Shoulder Press",
    equipment: "Machine", target: "front_delts",
    secondary: ["triceps"],
    level: "Beginner", setsReps: "3–4 × 8–10",
    cues: ["Seat slightly behind the bar path", "Bar to the chin, press tall", "Safeties set — then push hard"],
  },
  {
    id: "cable-shoulder-press", name: "Cable Shoulder Press",
    equipment: "Cable", target: "front_delts",
    secondary: ["triceps"],
    level: "Beginner", setsReps: "3 × 10–12",
    cues: ["Cables pull down the whole way", "Constant tension, no lockout rest", "Strict torso"],
  },
  {
    id: "front-raise", name: "Front Raise",
    equipment: "Dumbbell", target: "front_delts",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Raise to eye level, no higher", "Thumbs slightly up", "No swinging from the hips"],
  },
  {
    id: "cable-front-raise", name: "Cable Front Raise",
    equipment: "Cable", target: "front_delts",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Cable behind you, arm long", "Tension from the very bottom", "Strict and light"],
  },
  {
    id: "handstand-push-up", name: "Handstand Push-Up",
    equipment: "Bodyweight", target: "front_delts",
    secondary: ["triceps"],
    level: "Advanced", setsReps: "3 × as many as you can",
    cues: ["Kick up against a wall", "Head to the floor, press to lockout", "Advanced — earn it with pike push-ups first"],
  },

  /* ─────  SIDE DELTS  (10)  ───── */
  {
    id: "dumbbell-lateral-raise", name: "Dumbbell Lateral Raise",
    equipment: "Dumbbell", target: "side_delts",
    secondary: [],
    level: "Beginner", setsReps: "3–4 × 12–15",
    cues: ["Lead with the elbows", "Raise to shoulder height only", "Pour-the-jug tilt at the top"],
  },
  {
    id: "seated-lateral-raise", name: "Seated Lateral Raise",
    equipment: "Dumbbell", target: "side_delts",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Sitting kills the leg cheat", "Slight forward lean", "Pause a beat at the top"],
  },
  {
    id: "one-arm-lateral-raise", name: "One-Arm Lateral Raise",
    equipment: "Dumbbell", target: "side_delts",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15 each side",
    cues: ["Hold something solid with the free hand", "Strict — no body English", "Slow on the way down"],
  },
  {
    id: "seated-cable-lateral-raise", name: "Seated Cable Lateral Raise",
    equipment: "Cable", target: "side_delts",
    secondary: ["rhomboids", "traps"],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Cable keeps tension at the bottom", "Raise out, not forward", "Light weight, perfect reps"],
  },
  {
    id: "cable-lateral-raise", name: "Cable Lateral Raise",
    equipment: "Cable", target: "side_delts",
    secondary: ["forearms"],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Cable runs behind the body", "Arm long, arc to shoulder height", "No shrugging — traps stay quiet"],
  },
  {
    id: "incline-lateral-raise", name: "Incline Lateral Raise",
    equipment: "Dumbbell", target: "side_delts",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15 each side",
    cues: ["Lie sideways on an incline bench", "The bottom half does the work", "Cannot cheat from here"],
  },
  {
    id: "lying-lateral-raise", name: "Lying Lateral Raise",
    equipment: "Dumbbell", target: "side_delts",
    secondary: [],
    level: "Intermediate", setsReps: "3 × 12–15 each side",
    cues: ["Side-lying, raise to vertical", "Strictest lateral there is", "Tiny dumbbell, big burn"],
  },
  {
    id: "partial-lateral-raise", name: "Partial Lateral Raise",
    equipment: "Dumbbell", target: "side_delts",
    secondary: [],
    level: "Beginner", setsReps: "3 × 15–20",
    cues: ["Heavy bells, bottom half only", "Burn out after full-range sets", "Elbows stay soft"],
  },
  {
    id: "upright-barbell-row", name: "Upright Barbell Row",
    equipment: "Barbell", target: "side_delts",
    secondary: ["traps"],
    level: "Beginner", setsReps: "3 × 10–12",
    cues: ["Grip at shoulder width — not narrow", "Elbows lead, stop at shoulder height", "Wrists stay below the elbows"],
  },
  {
    id: "smith-one-arm-upright-row", name: "Smith One-Arm Upright Row",
    equipment: "Machine", target: "side_delts",
    secondary: ["biceps", "traps"],
    level: "Beginner", setsReps: "3 × 10–12 each side",
    cues: ["Fixed path, one arm at a time", "Elbow high, to shoulder height", "Do not twist toward the bar"],
  },

  /* ─────  TRAPS  (11)  ───── */
  {
    id: "barbell-shrug", name: "Barbell Shrug",
    equipment: "Barbell", target: "traps",
    secondary: [],
    level: "Beginner", setsReps: "3–4 × 12–15",
    cues: ["Straight up and down — never roll", "Hold the top for a full second", "Arms are hooks, keep them straight"],
  },
  {
    id: "dumbbell-shrug", name: "Dumbbell Shrug",
    equipment: "Dumbbell", target: "traps",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Longer range than a bar allows", "Shrug to the ears, lower slow", "No elbow bend at all"],
  },
  {
    id: "behind-the-back-shrug", name: "Behind-the-Back Shrug",
    equipment: "Barbell", target: "traps",
    secondary: ["forearms", "rhomboids"],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Bar held behind the thighs", "Pulls the shoulders back as you shrug", "Smaller range — stay strict"],
  },
  {
    id: "cable-shrug", name: "Cable Shrug",
    equipment: "Cable", target: "traps",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Low pulley, constant tension", "Straight up, pause, straight down", "No rolling"],
  },
  {
    id: "machine-shrug", name: "Machine Shrug",
    equipment: "Machine", target: "traps",
    secondary: ["forearms"],
    level: "Beginner", setsReps: "3–4 × 12–15",
    cues: ["Load heavy — the machine keeps it honest", "Full second at the top", "Do not bounce the plates"],
  },
  {
    id: "smith-behind-back-shrug", name: "Smith Behind-Back Shrug",
    equipment: "Machine", target: "traps",
    secondary: ["shoulders"],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Bar fixed behind the thighs", "Shrug tall, control down", "Grip width at the thighs"],
  },
  {
    id: "calf-machine-shrug", name: "Calf-Machine Shrug",
    equipment: "Machine", target: "traps",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Shoulders under the calf pads", "Frees the grip completely", "Pure trap range"],
  },
  {
    id: "upright-cable-row", name: "Upright Cable Row",
    equipment: "Cable", target: "traps",
    secondary: ["shoulders"],
    level: "Intermediate", setsReps: "3 × 10–12",
    cues: ["Elbows lead and stay above the wrists", "Stop at shoulder height", "Shoulder-width grip protects the shoulders"],
  },
  {
    id: "dumbbell-upright-row", name: "Dumbbell Upright Row",
    equipment: "Dumbbell", target: "traps",
    secondary: ["biceps", "shoulders"],
    level: "Beginner", setsReps: "3 × 10–12",
    cues: ["Bells travel close to the body", "Elbows high, stop at shoulders", "No swinging"],
  },
  {
    id: "clean-shrug", name: "Clean Shrug",
    equipment: "Barbell", target: "traps",
    secondary: ["forearms", "shoulders"],
    level: "Beginner", setsReps: "4 × 6–8",
    cues: ["Deadlift grip, explosive shrug", "Hips help — this one is fast", "Heavier than a strict shrug"],
  },
  {
    id: "scapular-pull-up", name: "Scapular Pull-Up",
    equipment: "Bodyweight", target: "traps",
    secondary: ["lats", "rhomboids"],
    level: "Beginner", setsReps: "3 × 8–12",
    cues: ["Dead hang, arms straight", "Lift the body by squeezing the blades down", "Small range, huge carryover to pull-ups"],
  },
];

/** Demonstration frames follow a naming convention, so no per-exercise wiring. */
export const demo = (id, frame) => `./img/demo/${id}-${frame}.jpg`;

/** Every exercise, keyed by id. */
export const byId = Object.fromEntries(exercises.map((e) => [e.id, e]));
