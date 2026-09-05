/*
 * data/legs.js — the Legs muscle group.
 *
 * Same curation rules as back.js (set by the user — do not quietly relax
 * them): primary muscle only, unique across the whole app, 10+ per region,
 * real-photo demonstrations from the public-domain free-exercise-db.
 * `regions` is PRIORITY ORDER and also the execution order of a built day.
 */

export const group = {
  id: "legs",
  name: "Legs",
  tagline: "Squat strength from hips to heels",
  regions: ["quads", "hamstrings", "glutes", "calves"],
};

export const exercises = [
  /* ─────  QUADS  (13)  ───── */
  {
    id: "barbell-squat", name: "Barbell Squat",
    equipment: "Barbell", target: "quads",
    secondary: ["calves", "glutes", "hamstrings"],
    level: "Beginner", setsReps: "4 × 5–8",
    cues: ["Brace before every rep", "Hips below parallel if mobility allows", "Knees track over the toes"],
  },
  {
    id: "front-squat", name: "Front Squat",
    equipment: "Barbell", target: "quads",
    secondary: ["calves", "glutes", "hamstrings"],
    level: "Advanced", setsReps: "3–4 × 5–8",
    cues: ["Elbows high, bar on the shoulders", "Torso stays tall — that is the point", "Harder on quads, easier on the back"],
  },
  {
    id: "leg-press", name: "Leg Press",
    equipment: "Machine", target: "quads",
    secondary: ["calves", "glutes", "hamstrings"],
    level: "Beginner", setsReps: "3–4 × 10–12",
    cues: ["Feet mid-platform, hip width", "Lower until the hips want to curl — stop there", "Never lock the knees hard"],
  },
  {
    id: "hack-squat-machine", name: "Hack Squat Machine",
    equipment: "Machine", target: "quads",
    secondary: ["calves", "glutes", "hamstrings"],
    level: "Beginner", setsReps: "3 × 10–12",
    cues: ["Back flat on the pad", "Deep as your hips allow", "Drive through the whole foot"],
  },
  {
    id: "smith-machine-squat", name: "Smith Machine Squat",
    equipment: "Machine", target: "quads",
    secondary: ["calves", "glutes", "hamstrings"],
    level: "Beginner", setsReps: "3 × 8–12",
    cues: ["Feet slightly forward of the bar", "Fixed path — sit straight down", "Safeties set to depth"],
  },
  {
    id: "leg-extension", name: "Leg Extension",
    equipment: "Machine", target: "quads",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Pad on the shins, knees at the pivot", "Pause a second at the top", "Lower slow — no slamming"],
  },
  {
    id: "barbell-lunge", name: "Barbell Lunge",
    equipment: "Barbell", target: "quads",
    secondary: ["calves", "glutes", "hamstrings"],
    level: "Intermediate", setsReps: "3 × 8–10 each leg",
    cues: ["Long step, torso tall", "Back knee kisses the floor", "Push through the front heel"],
  },
  {
    id: "dumbbell-lunge", name: "Dumbbell Lunge",
    equipment: "Dumbbell", target: "quads",
    secondary: ["calves", "glutes", "hamstrings"],
    level: "Beginner", setsReps: "3 × 10–12 each leg",
    cues: ["Bells at the sides, chest up", "Step, sink, drive back", "Alternate or walk them"],
  },
  {
    id: "dumbbell-split-squat", name: "Dumbbell Split Squat",
    equipment: "Dumbbell", target: "quads",
    secondary: ["glutes", "hamstrings"],
    level: "Beginner", setsReps: "3 × 8–10 each leg",
    cues: ["Feet stay planted — no stepping", "Straight down, straight up", "Front leg does the work"],
  },
  {
    id: "bulgarian-split-squat", name: "Bulgarian Split Squat",
    equipment: "Barbell", target: "quads",
    secondary: ["calves", "glutes", "hamstrings"],
    level: "Advanced", setsReps: "3 × 8–10 each leg",
    cues: ["Rear foot on the bench behind you", "Torso slightly forward, sink deep", "Brutal and worth it"],
  },
  {
    id: "barbell-step-up", name: "Barbell Step-Up",
    equipment: "Barbell", target: "quads",
    secondary: ["calves", "glutes", "hamstrings"],
    level: "Intermediate", setsReps: "3 × 8–10 each leg",
    cues: ["Whole foot on the box", "Drive up without pushing off the floor leg", "Control the step down"],
  },
  {
    id: "goblet-squat", name: "Goblet Squat",
    equipment: "Dumbbell", target: "quads",
    secondary: ["calves", "glutes", "hamstrings"],
    level: "Beginner", setsReps: "3 × 10–12",
    cues: ["Weight hugged at the chest", "Elbows slide inside the knees", "The best squat teacher there is"],
  },
  {
    id: "bodyweight-squat", name: "Bodyweight Squat",
    equipment: "Bodyweight", target: "quads",
    secondary: ["glutes", "hamstrings"],
    level: "Beginner", setsReps: "3 × 15–20",
    cues: ["Arms forward for balance", "Full depth, heels down", "Warm-up staple or high-rep burner"],
  },

  /* ─────  HAMSTRINGS  (11)  ───── */
  {
    id: "romanian-deadlift", name: "Romanian Deadlift",
    equipment: "Barbell", target: "hamstrings",
    secondary: ["calves", "glutes", "erectors"],
    level: "Intermediate", setsReps: "3–4 × 8–10",
    cues: ["Soft knees, hips push back", "Bar slides down the thighs", "Stop where the hamstrings scream — stand tall"],
  },
  {
    id: "stiff-leg-deadlift", name: "Stiff-Leg Deadlift",
    equipment: "Barbell", target: "hamstrings",
    secondary: ["glutes", "erectors"],
    level: "Intermediate", setsReps: "3 × 8–10",
    cues: ["Straighter knees than an RDL", "Flat back the whole way", "Deeper stretch — lighter bar"],
  },
  {
    id: "sumo-deadlift", name: "Sumo Deadlift",
    equipment: "Barbell", target: "hamstrings",
    secondary: ["forearms", "glutes", "erectors"],
    level: "Intermediate", setsReps: "3–4 × 3–6",
    cues: ["Wide stance, toes out", "Knees track over the toes", "Chest up, push the floor apart"],
  },
  {
    id: "dumbbell-stiff-leg-deadlift", name: "Dumbbell Stiff-Leg Deadlift",
    equipment: "Dumbbell", target: "hamstrings",
    secondary: ["glutes", "erectors"],
    level: "Beginner", setsReps: "3 × 10–12",
    cues: ["Bells brush the legs on the way down", "Hips back, back flat", "Feel the stretch, do not chase depth"],
  },
  {
    id: "smith-stiff-leg-deadlift", name: "Smith Stiff-Leg Deadlift",
    equipment: "Machine", target: "hamstrings",
    secondary: ["glutes", "erectors"],
    level: "Beginner", setsReps: "3 × 8–10",
    cues: ["Fixed path keeps the bar close", "Hinge, do not squat it", "Slow eccentric"],
  },
  {
    id: "lying-leg-curl", name: "Lying Leg Curl",
    equipment: "Machine", target: "hamstrings",
    secondary: [],
    level: "Beginner", setsReps: "3–4 × 10–12",
    cues: ["Hips pressed into the pad", "Curl to the glutes, pause", "Lower in three slow seconds"],
  },
  {
    id: "seated-leg-curl", name: "Seated Leg Curl",
    equipment: "Machine", target: "hamstrings",
    secondary: [],
    level: "Beginner", setsReps: "3 × 10–12",
    cues: ["Thighs locked under the pad", "Full squeeze at the bottom", "Do not let the stack yank you open"],
  },
  {
    id: "standing-leg-curl", name: "Standing Leg Curl",
    equipment: "Machine", target: "hamstrings",
    secondary: [],
    level: "Beginner", setsReps: "3 × 10–12 each leg",
    cues: ["One leg at a time, hips square", "Curl, hold, lower slow", "Balance the strong and weak side"],
  },
  {
    id: "glute-ham-raise", name: "Glute-Ham Raise",
    equipment: "Machine", target: "hamstrings",
    secondary: ["calves", "glutes"],
    level: "Intermediate", setsReps: "3 × 6–10",
    cues: ["Knees on the pad, feet locked", "Lower as slow as you can", "Push off only as much as you must"],
  },
  {
    id: "nordic-curl", name: "Nordic Curl",
    equipment: "Bodyweight", target: "hamstrings",
    secondary: ["calves", "glutes", "erectors"],
    level: "Intermediate", setsReps: "3 × 4–8",
    cues: ["Ankles anchored, body straight", "Fight the fall with the hamstrings", "Push back up — that still counts"],
  },
  {
    id: "ball-leg-curl", name: "Ball Leg Curl",
    equipment: "Bodyweight", target: "hamstrings",
    secondary: ["calves", "glutes"],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Hips stay bridged the whole set", "Drag the ball in with the heels", "Roll out slow"],
  },

  /* ─────  GLUTES  (10)  ───── */
  {
    id: "hip-thrust", name: "Hip Thrust",
    equipment: "Barbell", target: "glutes",
    secondary: ["calves", "hamstrings"],
    level: "Intermediate", setsReps: "3–4 × 8–12",
    cues: ["Shoulder blades on the bench, bar on the hips", "Drive until the body is a tabletop", "Chin tucked, hard glute squeeze"],
  },
  {
    id: "barbell-glute-bridge", name: "Barbell Glute Bridge",
    equipment: "Barbell", target: "glutes",
    secondary: ["calves", "hamstrings"],
    level: "Intermediate", setsReps: "3 × 10–12",
    cues: ["Floor version of the hip thrust", "Push through the heels", "One-second squeeze at the top"],
  },
  {
    id: "glute-bridge", name: "Glute Bridge",
    equipment: "Bodyweight", target: "glutes",
    secondary: ["hamstrings"],
    level: "Beginner", setsReps: "3 × 15–20",
    cues: ["Heels close to the hips", "Squeeze at the top — no arching the back", "Slow lowering"],
  },
  {
    id: "single-leg-glute-bridge", name: "Single-Leg Glute Bridge",
    equipment: "Bodyweight", target: "glutes",
    secondary: ["hamstrings"],
    level: "Beginner", setsReps: "3 × 10–12 each leg",
    cues: ["One foot planted, one leg up", "Hips stay level — no tilting", "Twice as honest as the two-leg version"],
  },
  {
    id: "glute-kickback", name: "Glute Kickback",
    equipment: "Bodyweight", target: "glutes",
    secondary: ["hamstrings"],
    level: "Beginner", setsReps: "3 × 12–15 each leg",
    cues: ["On all fours, kick up and back", "Squeeze at the top, do not arch", "Slow and strict"],
  },
  {
    id: "cable-kickback", name: "Cable Kickback",
    equipment: "Cable", target: "glutes",
    secondary: ["hamstrings"],
    level: "Intermediate", setsReps: "3 × 12–15 each leg",
    cues: ["Ankle cuff, slight forward lean", "Kick back with a straight leg", "Do not swing — tension does the work"],
  },
  {
    id: "cable-pull-through", name: "Cable Pull-Through",
    equipment: "Cable", target: "glutes",
    secondary: ["hamstrings", "erectors"],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Face away, rope between the legs", "Hinge, then snap the hips forward", "Glutes finish the rep, not the arms"],
  },
  {
    id: "kneeling-squat", name: "Kneeling Squat",
    equipment: "Barbell", target: "glutes",
    secondary: ["abs", "hamstrings", "erectors"],
    level: "Intermediate", setsReps: "3 × 12–15",
    cues: ["Kneel tall under the bar", "Sit back to the heels, drive up", "Pure hip extension"],
  },
  {
    id: "step-up-with-knee-raise", name: "Step-Up with Knee Raise",
    equipment: "Bodyweight", target: "glutes",
    secondary: ["hamstrings", "quads"],
    level: "Beginner", setsReps: "3 × 10–12 each leg",
    cues: ["Step up, drive the other knee high", "Control the way down", "Glutes and balance together"],
  },
  {
    id: "flutter-kicks", name: "Flutter Kicks",
    equipment: "Bodyweight", target: "glutes",
    secondary: ["hamstrings"],
    level: "Beginner", setsReps: "3 × 20–30 s",
    cues: ["Face down, legs long", "Small fast kicks from the hips", "Squeeze the glutes, not the lower back"],
  },

  /* ─────  CALVES  (10)  ───── */
  {
    id: "standing-calf-raise", name: "Standing Calf Raise",
    equipment: "Machine", target: "calves",
    secondary: [],
    level: "Beginner", setsReps: "4 × 12–15",
    cues: ["Full stretch at the bottom", "Pause one second at the top", "No bouncing — calves love to cheat"],
  },
  {
    id: "seated-calf-raise", name: "Seated Calf Raise",
    equipment: "Machine", target: "calves",
    secondary: [],
    level: "Beginner", setsReps: "3–4 × 15–20",
    cues: ["Bent knees hit the deeper calf muscle", "Slow, full range", "Pause at both ends"],
  },
  {
    id: "leg-press-calf-raise", name: "Leg Press Calf Raise",
    equipment: "Machine", target: "calves",
    secondary: [],
    level: "Beginner", setsReps: "3 × 15–20",
    cues: ["Balls of the feet on the platform edge", "Press through the toes", "Knees soft, never locked"],
  },
  {
    id: "donkey-calf-raise", name: "Donkey Calf Raise",
    equipment: "Machine", target: "calves",
    secondary: [],
    level: "Intermediate", setsReps: "3 × 12–15",
    cues: ["Hinged at the hips, calves loaded deep", "Old-school and unmatched", "Full stretch every rep"],
  },
  {
    id: "smith-calf-raise", name: "Smith Calf Raise",
    equipment: "Machine", target: "calves",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Toes on a block under the bar", "Fixed path, strict reps", "Stretch, drive, pause"],
  },
  {
    id: "barbell-calf-raise", name: "Barbell Calf Raise",
    equipment: "Barbell", target: "calves",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15",
    cues: ["Bar on the back, toes on a plate", "Balance is half the work", "Tall pause at the top"],
  },
  {
    id: "barbell-seated-calf-raise", name: "Barbell Seated Calf Raise",
    equipment: "Barbell", target: "calves",
    secondary: [],
    level: "Beginner", setsReps: "3 × 15–20",
    cues: ["Bar padded across the knees", "Small range, big stretch", "High reps burn best"],
  },
  {
    id: "dumbbell-calf-raise", name: "Dumbbell Calf Raise",
    equipment: "Dumbbell", target: "calves",
    secondary: [],
    level: "Intermediate", setsReps: "3 × 15–20",
    cues: ["Bells at the sides, toes on a step", "Full drop at the bottom", "Go until the calves quit"],
  },
  {
    id: "seated-one-leg-calf-raise", name: "Seated One-Leg Calf Raise",
    equipment: "Dumbbell", target: "calves",
    secondary: [],
    level: "Beginner", setsReps: "3 × 12–15 each leg",
    cues: ["Dumbbell on one knee", "One calf at a time — no hiding", "Slow tempo"],
  },
  {
    id: "single-leg-calf-raise", name: "Single-Leg Calf Raise",
    equipment: "Dumbbell", target: "calves",
    secondary: [],
    level: "Intermediate", setsReps: "3 × 12–15 each leg",
    cues: ["Ball of the foot on the handle", "Hold something for balance", "Deep stretch is the payoff"],
  },
];

/** Demonstration frames follow a naming convention, so no per-exercise wiring. */
export const demo = (id, frame) => `./img/demo/${id}-${frame}.jpg`;

/** Every exercise, keyed by id. */
export const byId = Object.fromEntries(exercises.map((e) => [e.id, e]));
