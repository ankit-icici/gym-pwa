/*
 * js/workout.js — the day builder.
 *
 * Split out of app.js so it can be tested without a DOM: everything here is
 * pure, taking a data module plus a filter and a length and returning a list
 * of items. `tools/test-builder.mjs` exercises it directly, which is what
 * keeps the training rules below enforceable rather than merely described.
 * Read "How a day is built" in CLAUDE.md alongside this file.
 *
 * app.js needs only buildWorkout and slotAlternatives; the rest is exported
 * for the test, which asserts on the pieces individually.
 */

/* The four loaded kinds. A built day should draw on all of them; bodyweight is
   handled separately, by the finisher every day ends on. */
const LOADED_EQUIPMENT = ['Machine', 'Cable', 'Barbell', 'Dumbbell'];

/* ============================================================
   Workout generation — programmed the way a trainer would build it.

   A day is not a random draw from the muscle group. It opens each muscle with
   a compound, adds isolation once that compound has covered the muscle, and
   spreads the load across equipment, rep ranges and the secondary muscles
   every movement borrows — so a back day does not end up putting the biceps
   under all six exercises, and a chest day is not three variations of a
   pressing motion plus a fly.
   ============================================================ */

/*
 * Movement families, derived from the id.
 *
 * This is the only heuristic left in the generator, and that is deliberate:
 * families exist to stop three near-identical movements landing in one day,
 * so a miss costs a little variety and never correctness. `pattern` — the
 * judgement that has to be right — is explicit on the data instead.
 *
 * Order matters, first match wins: the specific entries come before the
 * generic ones that would otherwise swallow them (leg-extension before
 * extension, calf-raise before raise, dumbbell-kickback before kickback).
 */
const FAMILIES = [
  [/leg-extension/, 'knee-extension'],
  [/leg-curl|nordic-curl/, 'knee-flexion'],
  [/calf-raise/, 'calf'],
  [/back-extension|superman/, 'spinal-extension'],
  [/dumbbell-kickback/, 'elbow-extension'],
  [/wrist|finger-curls|plate-pinch|roller/, 'grip'],
  [/carry/, 'carry'],
  [/shrug/, 'shrug'],
  [/upright/, 'upright-row'],
  [/face-pull|rear-delt|rear-lateral|reverse-fly|reverse-machine-fly/, 'rear-delt'],
  [/straight-arm|pullover/, 'shoulder-extension'],
  [/pulldown|pull-up|chin-up/, 'vertical-pull'],
  [/row/, 'horizontal-row'],
  [/deadlift|rack-pull|good-morning/, 'hinge'],
  [/glute-bridge|hip-thrust|kickback|pull-through|kneeling-squat/, 'hip-extension'],
  [/squat|lunge|split-squat|step-up|leg-press/, 'squat'],
  [/dip|push-up/, 'dip-pushup'],
  [/plank|pallof|rollout|hold/, 'brace'],
  [/shoulder-press|overhead-barbell-press|seated-barbell-press|(seated|standing)-dumbbell-press|push-press|arnold-press|handstand/, 'vertical-press'],
  [/press/, 'horizontal-press'],
  [/fly|crossover|pec-deck/, 'fly'],
  [/pushdown|overhead-(rope|barbell|dumbbell)-extension|skullcrusher|lying-dumbbell-extension/, 'elbow-extension'],
  [/curl/, 'elbow-flexion'],
  [/crunch|sit-up/, 'trunk-flexion'],
  [/leg-raise|pull-in|pike|jackknife|hip-raise|knee-raise|flutter/, 'hip-flexion'],
  [/twist|woodchop|bicycle|side-bend|oblique|cross-body/, 'rotation'],
  [/raise|lateral/, 'raise'],
];
const familyOf = (e) => {
  const base = FAMILIES.find(([re]) => re.test(e.id))?.[1] ?? e.id;
  // Angle is part of the movement. Flat, incline and decline pressing are
  // three different exercises to a trainer, and a chest day wants all three —
  // without this they collapse into one family and crowd each other out.
  const angle = /incline/.test(e.id) ? 'incline-' : /decline/.test(e.id) ? 'decline-' : '';
  return angle + base;
};

/*
 * How heavy a movement is prescribed, as the first number of its rep range —
 * lower is heavier. Prescriptions by effort ("as many as you can") sit with
 * the heavy work; prescriptions by time or distance (planks, carries) are
 * finishers.
 *
 * Kept numeric rather than bucketed because ordering needs the resolution: a
 * 3–6 deadlift has to open a day ahead of an 8–12 pulldown, and both are
 * "heavy".
 */
function loadRank(e) {
  if (/as many as you can/i.test(e.setsReps)) return 8;
  if (/\d\s*(s|m)\b|holds|rolls/.test(e.setsReps)) return 30;
  const m = /×\s*(\d+)/.exec(e.setsReps);
  return m ? +m[1] : 20;
}

/* Coarse bands, for keeping a day from becoming six sets of twelve. */
function repBucket(e) {
  const r = loadRank(e);
  return r <= 8 ? 'heavy' : r <= 10 ? 'moderate' : 'high';
}

/** What a part-built day has already spent, by every axis the scorer weighs. */
function tallyOf(picked) {
  const t = { secondary: new Map(), equipment: new Map(), family: new Map(), bucket: new Map(), advanced: 0 };
  const bump = (map, key) => map.set(key, (map.get(key) ?? 0) + 1);
  for (const e of picked) {
    for (const tag of e.secondary) bump(t.secondary, tag);
    bump(t.equipment, e.equipment);
    bump(t.family, familyOf(e));
    bump(t.bucket, repBucket(e));
    if (e.level === 'Advanced') t.advanced++;
  }
  return t;
}

/*
 * Score one candidate for one slot against the day so far. Every term is a
 * question a trainer would ask out loud: is this the right *kind* of movement
 * for this point in the session, does it hammer something the day has already
 * hammered, is this the fourth machine in a row, is it the third variation of
 * the same motion?
 */
function scoreCandidate(e, { wantCompound, tally, needsAnchor }) {
  let s = 0;

  // The right kind of movement. Compounds open a muscle; isolation earns its
  // place once a compound has already covered that muscle.
  s += (e.pattern === 'compound') === wantCompound ? 30 : -18;

  // Every session is built around one genuinely heavy compound. Until the day
  // has one, the movements that could be it are worth more.
  if (needsAnchor && e.pattern === 'compound' && repBucket(e) === 'heavy') s += 22;

  // Spread the borrowed work. Six back exercises that all pull through the
  // biceps is a biceps day with extra steps.
  let overlap = 0;
  for (const tag of e.secondary) overlap += tally.secondary.get(tag) ?? 0;
  s -= Math.min(overlap * 8, 24);

  // A real spread of equipment: machine, barbell, dumbbell and cable each
  // earn a session a bonus the first time they appear, and repeats cost.
  // Bodyweight is left out of the bonus on purpose — the day closes with a
  // dedicated bodyweight finisher, so it does not need help getting in.
  const already = tally.equipment.get(e.equipment) ?? 0;
  s -= 9 * already;
  if (LOADED_EQUIPMENT.includes(e.equipment)) { if (!already) s += 12; }
  else s -= 8;

  // Not three pulldowns.
  s -= 16 * (tally.family.get(familyOf(e)) ?? 0);

  // A spread of rep ranges rather than six sets of twelve. Where each one
  // lands in the session is settled afterwards, by orderDay().
  s -= 6 * (tally.bucket.get(repBucket(e)) ?? 0);

  // Don't stack the hardest movements in the book on top of each other.
  if (e.level === 'Advanced') s -= 6 * tally.advanced;

  return s;
}

/*
 * Pick among the candidates that score near the top, weighted toward the
 * better ones, instead of always taking the single best.
 *
 * Taking the maximum made every Rebuild return almost the same day: the score
 * gaps are wide enough that noise small enough to preserve the structure was
 * never enough to change the winner. Shortlisting instead keeps the structure
 * absolutely — nothing outside the margin can ever be chosen — while giving
 * the day real variety inside it.
 */
function chooseScored(scored) {
  const MARGIN = 14;
  const floor = Math.max(...scored.map(([, s]) => s)) - MARGIN;
  const shortlist = scored.filter(([, s]) => s >= floor);
  const weight = ([, s]) => s - floor + 1;
  let r = Math.random() * shortlist.reduce((sum, c) => sum + weight(c), 0);
  for (const c of shortlist) {
    r -= weight(c);
    if (r <= 0) return c[0];
  }
  return shortlist[shortlist.length - 1][0];
}

/*
 * Does this muscle get led by compounds at all?
 *
 * Some muscles are: you open quads with a squat and chest with a press. Others
 * are genuinely isolation muscles — nobody opens side delts with an upright row
 * when the lateral raise is the movement, traps are shrugs, and forearms are
 * wrist curls rather than carries. Forcing a compound there produces exactly
 * the odd prescriptions a trainer would not write.
 *
 * The split follows the data rather than a hand-kept list: a muscle leads with
 * a compound when compounds are at least a third of what it has. Measured over
 * the whole muscle, not the filtered pool, so picking an equipment chip never
 * changes the character of the muscle.
 */
const COMPOUND_LED = 1 / 3;
function leadsWithCompound(region, exercises) {
  const inRegion = exercises.filter((e) => e.target === region);
  if (!inRegion.length) return false;
  return inRegion.filter((e) => e.pattern === 'compound').length / inRegion.length >= COMPOUND_LED;
}

/*
 * How many slots each muscle gets.
 *
 * Every muscle in the group gets one before any gets a second — that is what
 * guarantees a day covers the whole group, and what makes "an arms day trains
 * both biceps and triceps" true without special-casing Arms.
 *
 * The rest is shared out by `group.volume`, the share of a session each muscle
 * earns. Two earlier versions of this were wrong in the same way. Round-robin
 * gave whatever divided evenly, so a third of an arm day was wrist curls.
 * Weighting by position in `group.regions` was worse, because that list is
 * *execution* order, not volume: it prescribed three front-delt movements and
 * one side-delt, when front delts are already hammered by every chest press
 * and side delts are the head that actually needs the work.
 *
 * So volume is authored per muscle in the data, the way `pattern` is, and for
 * the same reason — it is a trainer's judgement and nothing else in the file
 * encodes it. Each remaining slot goes to whichever muscle is furthest behind
 * its share (D'Hondt), which keeps the split stable as the length changes.
 */
function slotCounts(regions, len, volume) {
  const counts = regions.map(() => 0);
  for (let i = 0; i < regions.length && i < len; i++) counts[i] = 1;
  const weight = (i) => volume[regions[i]];
  for (let left = len - regions.length; left > 0; left--) {
    let best = 0;
    for (let i = 1; i < regions.length; i++) {
      const mine = (counts[i] + 1) / weight(i);
      const theirs = (counts[best] + 1) / weight(best);
      // Ties go to the muscle with fewer slots so far, then to priority.
      if (mine < theirs || (mine === theirs && counts[i] < counts[best])) best = i;
    }
    counts[best]++;
  }
  return counts;
}

/** Which muscle each numbered slot trains, in the group's priority order. */
function regionSequence(group, len) {
  const counts = slotCounts(group.regions, len, group.volume);
  return group.regions.flatMap((r, i) => Array(counts[i]).fill(r));
}

/*
 * Put the day in the order a trainer would coach it.
 *
 * Scoring decides WHAT is in the session; this decides WHEN. Compounds come
 * first, while you are fresh and the bar is heaviest; accessory work follows.
 *
 * The two halves are then ordered on different principles, because a trainer
 * orders them on different principles:
 *
 *  - Compounds go heaviest first, whatever muscle they belong to. A back day
 *    that drew a deadlift opens on the deadlift, not on a pulldown, because
 *    what matters is spending your freshest sets on the most demanding lift.
 *    This is also why isolation never comes first: a fly before an incline
 *    press pre-fatigues the pec and costs you load on the bigger lift.
 *  - Accessories are grouped by muscle, so you finish a muscle and move on
 *    rather than ping-ponging between obliques and lower abs — and they follow
 *    the order the compounds established, so the muscle a day opened on is the
 *    muscle it finishes first. On an arms day that means the close-grip bench
 *    and the triceps accessory sit together instead of three curls apart.
 */
function orderDay(picked, group) {
  const compounds = picked
    .filter((e) => e.pattern === 'compound')
    .sort((a, b) => loadRank(a) - loadRank(b)
      || group.regions.indexOf(a.target) - group.regions.indexOf(b.target));

  // A muscle's place in the accessory block is where its compound came in the
  // first half. Muscles that never had one keep the group's own order, behind
  // those that did.
  const openedAt = new Map();
  compounds.forEach((e, i) => { if (!openedAt.has(e.target)) openedAt.set(e.target, i); });
  const muscleRank = (t) => (openedAt.has(t)
    ? openedAt.get(t)
    : compounds.length + group.regions.indexOf(t));

  const accessories = picked
    .filter((e) => e.pattern === 'isolation')
    .sort((a, b) => muscleRank(a.target) - muscleRank(b.target) || loadRank(a) - loadRank(b));

  return [...compounds, ...accessories];
}

/*
 * The bodyweight finisher — one movement on top of the chosen session length.
 *
 * Push-ups to close a chest day, chin-ups to close a back day. It sits outside
 * the length selector on purpose: it is a bonus, not one of the N exercises,
 * and it is the reason the scorer does not otherwise chase bodyweight work.
 *
 * What makes a good one: a compound, on one of the group's lead muscles,
 * prescribed by effort rather than by a rep count.
 */
function finisherScore(e, group) {
  return (e.pattern === 'compound' ? 30 : 0)
    + (/as many as you can/i.test(e.setsReps) ? 14 : 0)
    - 6 * group.regions.indexOf(e.target);
}

const finisherPool = (mod, taken) =>
  mod.exercises.filter((e) => e.equipment === 'Bodyweight' && !taken.has(e.id));

function buildWorkout(mod, filter, len = mod.group.regions.length) {
  const { group, exercises } = mod;
  const matches = (e) => filter === 'All' || e.equipment === filter;
  const seq = regionSequence(group, len);

  const picked = [];
  const used = new Set();
  const opened = new Set();

  for (let slot = 0; slot < seq.length; slot++) {
    const region = seq[slot];
    const inRegion = exercises.filter((e) => e.target === region && !used.has(e.id));
    if (!inRegion.length) continue;
    // Prefer the chosen equipment, but never return a short workout because
    // of it — fall back to the whole region rather than dropping a slot.
    let pool = inRegion.filter(matches);
    if (!pool.length) pool = inRegion;

    /*
     * Every muscle opens with a compound — that is what anchors it, and
     * skipping it is how you end up with an upper chest trained entirely by
     * flys. A muscle's *second* slot is accessory work by the same logic:
     * squat then leg extension, bench then fly, barbell row then a pullover.
     *
     * Both sides degrade on their own. Muscles that are not compound-led
     * never ask for one; muscles with no isolation at all (every rhomboid
     * movement is a row) let the remaining terms pick the most different row.
     */
    const wantCompound = !opened.has(region)
      && leadsWithCompound(region, exercises)
      && pool.some((e) => e.pattern === 'compound');

    const needsAnchor = !picked.some((e) => e.pattern === 'compound' && repBucket(e) === 'heavy');
    const ctx = { wantCompound, needsAnchor, tally: tallyOf(picked) };
    const best = chooseScored(pool.map((e) => [e, scoreCandidate(e, ctx)]));

    picked.push(best);
    used.add(best.id);
    opened.add(region);
  }

  const items = orderDay(picked, group).map((e) => ({ id: e.id, done: false }));

  /*
   * ...and one bodyweight movement on top, which is why this returns len + 1.
   *
   * The pool can legitimately come up empty: filtered to Bodyweight, the day
   * itself is already bodyweight and may have used everything the group has
   * (Shoulders owns exactly two such movements). A day with no separate
   * finisher is the right answer there, not a bug to paper over — every other
   * filter always leaves one.
   */
  const pool = finisherPool(mod, new Set(picked.map((e) => e.id)));
  if (pool.length) {
    const bonus = chooseScored(pool.map((e) => [e, finisherScore(e, group)]));
    items.push({ id: bonus.id, done: false, finisher: true });
  }
  return items;
}

/**
 * Alternatives for one slot, best first, scored against the rest of the day —
 * so swapping keeps the day balanced instead of walking the file in order.
 * The slot keeps its role: swapping the day's opening squat offers another
 * compound, not a leg extension.
 */
function slotAlternatives(mod, items, i) {
  const { exercises, byId, group } = mod;
  const cur = byId[items[i].id];
  const others = items.filter((_, k) => k !== i).map((it) => byId[it.id]);
  const taken = new Set(others.map((e) => e.id));
  const scored = items[i].finisher
    // The finisher is a bodyweight slot, so it cycles through the group's
    // other bodyweight work rather than through its own muscle.
    ? finisherPool(mod, taken).map((e) => [e, finisherScore(e, group)])
    : exercises
      .filter((e) => e.target === cur.target && !taken.has(e.id))
      .map((e) => [e, scoreCandidate(e, {
        wantCompound: cur.pattern === 'compound',
        needsAnchor: !others.some((o) => o.pattern === 'compound' && repBucket(o) === 'heavy'),
        tally: tallyOf(others),
      })]);
  return scored.sort((a, b) => b[1] - a[1]).map(([e]) => e);
}

export {
  buildWorkout,
  slotAlternatives,
  // Exported for tools/test-builder.mjs, not used by app.js:
  regionSequence,
  slotCounts,
  orderDay,
  familyOf,
  loadRank,
  repBucket,
  leadsWithCompound,
};
