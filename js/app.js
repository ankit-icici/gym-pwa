import { createAnatomy, MUSCLES } from './anatomy.js';

/* ============================================================
   Muscle-group registry.
   To add a group: write js/data/<id>.js in the shape of back.js, drop its
   demonstration photos in img/demo/, and flip `ready` here.
   ============================================================ */
/* count/areas/art power the home tiles without loading the data modules. */
const REGISTRY = [
  { id: 'back',      name: 'Back',      ready: true, count: 45, areas: 4, art: 'lats',        load: () => import('./data/back.js') },
  { id: 'chest',     name: 'Chest',     ready: true, count: 30, areas: 3, art: 'mid_chest',   load: () => import('./data/chest.js') },
  { id: 'shoulders', name: 'Shoulders', ready: true, count: 33, areas: 3, art: 'side_delts',  load: () => import('./data/shoulders.js') },
  { id: 'arms',      name: 'Arms',      ready: true, count: 33, areas: 3, art: 'biceps',      load: () => import('./data/arms.js') },
  { id: 'legs',      name: 'Legs',      ready: true, count: 44, areas: 4, art: 'quads',       load: () => import('./data/legs.js') },
  { id: 'core',      name: 'Core',      ready: true, count: 34, areas: 3, art: 'upper_abs',   load: () => import('./data/core.js') },
];

const EQUIPMENT_FILTERS = ['All', 'Machine', 'Cable', 'Barbell', 'Dumbbell', 'Bodyweight'];
/* The four loaded kinds. A built day should draw on all of them; bodyweight is
   handled separately, by the finisher every day ends on. */
const LOADED_EQUIPMENT = ['Machine', 'Cable', 'Barbell', 'Dumbbell'];
/* Session lengths offered. The default is one exercise per target area —
   fewer means dropping a region, in priority order. */
const LENGTHS = [4, 5, 6];

/* ============================================================
   Storage — small, forgiving, never throws in private mode.
   ============================================================ */
const store = {
  get(k, fallback) {
    try { const v = localStorage.getItem(k); return v === null ? fallback : JSON.parse(v); }
    catch { return fallback; }
  },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* quota or private mode */ } },
};

const todayKey = () => new Date().toISOString().slice(0, 10);

/* ============================================================
   Theme — auto / light / dark, remembered between visits.
   ============================================================ */
const THEMES = ['auto', 'light', 'dark'];
let theme = store.get('gym.theme', 'auto');

function applyTheme() {
  const root = document.documentElement;
  if (theme === 'auto') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
  const dark = theme === 'dark' || (theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0A0B0D' : '#F7F7F5');
}
function cycleTheme() {
  theme = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
  store.set('gym.theme', theme);
  applyTheme();
  render();
}
applyTheme();
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

/* ============================================================
   Icons
   ============================================================ */
const ICON = {
  back: '<path d="M15 18l-6-6 6-6"/>',
  chevron: '<path d="M9 18l6-6-6-6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z"/>',
  auto: '<rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8.5 21h7M12 17v4"/>',
  bolt: '<path d="M13 2L4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5z"/>',
  shuffle: '<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
  swap: '<path d="M17 2l4 4-4 4"/><path d="M3 6h18"/><path d="M7 22l-4-4 4-4"/><path d="M21 18H3"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  play: '<path d="M8 5v14l11-7z"/>',
  pause: '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>',
  spark: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/>',
  add: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
};
const svgIcon = (n, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`;

/* ============================================================
   The demonstration player.
   Two photographs of a real lifter — starting position and peak — cross-faded
   on a loop. One active player at a time; released on every route change.
   ============================================================ */
let player = null;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

function releaseMedia() {
  if (player) { clearInterval(player.timer); player = null; }
}

function mountPlayer(box, e, demo) {
  const imgs = box.querySelectorAll('.demo-img');
  const label = box.querySelector('.pose-label');
  const btn = box.querySelector('[data-play]');
  let frame = 0;
  let playing = !reducedMotion.matches;

  const show = (f) => {
    frame = f;
    imgs[0].classList.toggle('is-active', f === 0);
    imgs[1].classList.toggle('is-active', f === 1);
    if (label) label.textContent = f === 0 ? 'Start' : 'Peak';
  };
  const tick = () => show(frame === 0 ? 1 : 0);

  const start = () => {
    clearInterval(player.timer);
    player.timer = setInterval(tick, 1500);
  };
  player = { timer: 0 };
  if (playing) start(); else show(1);

  btn?.addEventListener('click', () => {
    playing = !playing;
    btn.innerHTML = svgIcon(playing ? 'pause' : 'play');
    btn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    if (playing) start(); else clearInterval(player.timer);
  });
  // Tapping the photo steps between positions and pauses for study.
  imgs.forEach((im) => im.addEventListener('click', () => {
    playing = false;
    clearInterval(player.timer);
    if (btn) { btn.innerHTML = svgIcon('play'); btn.setAttribute('aria-label', 'Play'); }
    tick();
  }));
}

const demoMarkup = (demo, e, { label = true } = {}) => `
  <img class="demo-img is-active" src="${demo(e.id, 0)}" alt="${e.name}, starting position" decoding="async">
  <img class="demo-img" src="${demo(e.id, 1)}" alt="${e.name}, peak position" decoding="async">
  ${label ? '<div class="pose-label">Start</div>' : ''}`;

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
 * The region sequence IS the execution order of the day. Groups with an
 * explicit `plan` (Arms: 4 biceps, 3 triceps, 2 forearms) use it verbatim;
 * everyone else wraps around the priority list and then sorts, so a
 * 6-exercise day on 4 regions comes out as two lat movements, two rows,
 * lower back, rear delts — compounds first, isolation last.
 */
function regionSequence(group, len) {
  if (group.plan) return [...group.plan];
  const seq = [];
  for (let k = 0; seq.length < len; k++) seq.push(group.regions[k % group.regions.length]);
  seq.sort((a, b) => group.regions.indexOf(a) - group.regions.indexOf(b));
  return seq;
}

/*
 * Put the day in the order a trainer would coach it.
 *
 * Scoring decides WHAT is in the session; this decides WHEN. Compounds come
 * first, while you are fresh and the bar is heaviest, and accessory work
 * follows. Inside each half the heavier prescription leads, then the group's
 * own muscle priority — so a chest day runs bench, incline, decline rather
 * than jumping between angles, and a back day that drew a rack pull opens on
 * it rather than on a pulldown.
 *
 * Groups with a fixed `plan` (Arms) keep the plan's order: its alternating
 * bi/tri pattern IS the prescription the user wrote, and sorting it into "all
 * compounds first" would throw that away. There, ordering only settles which
 * of a muscle's own picks comes first.
 */
function orderDay(picked, group) {
  const rank = (e) => (e.pattern === 'compound' ? 0 : 1000) + loadRank(e);
  if (group.plan) {
    const out = [...picked];
    for (const region of new Set(picked.map((e) => e.target))) {
      const slots = [];
      picked.forEach((e, i) => { if (e.target === region) slots.push(i); });
      const ordered = slots.map((i) => picked[i]).sort((a, b) => rank(a) - rank(b));
      slots.forEach((i, k) => { out[i] = ordered[k]; });
    }
    return out;
  }
  return [...picked].sort((a, b) =>
    (a.pattern === 'compound' ? 0 : 1) - (b.pattern === 'compound' ? 0 : 1)
    || loadRank(a) - loadRank(b)
    || group.regions.indexOf(a.target) - group.regions.indexOf(b.target));
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

const lengthFor = (mod) => {
  if (mod.group.plan) return mod.group.plan.length;
  const saved = store.get(`gym.len.${mod.group.id}`, 6);
  return Math.min(Math.max(saved, LENGTHS[0]), LENGTHS[LENGTHS.length - 1]);
};

/** "4 biceps · 3 triceps · 2 forearms" — a plan summary for the dock. */
function planLabel(group) {
  const counts = [];
  for (const r of group.plan) {
    const hit = counts.find((c) => c.r === r);
    if (hit) hit.n++; else counts.push({ r, n: 1 });
  }
  return counts.map((c) => `${c.n} ${(MUSCLES[c.r]?.short ?? c.r).toLowerCase()}`).join(' · ');
}

const workoutKey = (gid) => `gym.workout.${gid}`;
const saveWorkout = (gid, w) => store.set(workoutKey(gid), w);

/** Saved workouts can reference exercises that no longer exist after an
    update; silently drop those instead of crashing on them. */
function loadWorkout(gid, byId = null) {
  const w = store.get(workoutKey(gid), null);
  if (!w) return null;
  if (byId) {
    w.items = w.items.filter((it) => byId[it.id]);
    if (!w.items.length) return null;
  }
  return w;
}

/* ============================================================
   Router
   ============================================================ */
const root = document.getElementById('app');
const barEl = document.getElementById('bar');
const cache = new Map();

async function loadGroup(id) {
  if (cache.has(id)) return cache.get(id);
  const entry = REGISTRY.find((g) => g.id === id);
  if (!entry?.ready) return null;
  const mod = await entry.load();
  cache.set(id, mod);
  return mod;
}

function parseRoute() {
  const h = location.hash.replace(/^#\/?/, '');
  const p = h.split('/').filter(Boolean);
  if (p[0] === 'g' && p[2] === 'e') return { name: 'detail', group: p[1], exercise: p[3] };
  if (p[0] === 'g') return { name: 'group', group: p[1] };
  if (p[0] === 'w') return { name: 'workout', group: p[1] };
  return { name: 'home' };
}

/*
 * Navigation.
 *
 * Every forward move PUSHES a history entry and every back move POPS one, so
 * the browser's own back — the swipe gesture on a phone, the system back
 * button on Android — always lands on the screen you actually came from.
 *
 * Assigning location.hash for "back" was the bug this replaces: it pushed a
 * new entry, so the stack grew on every back tap and a swipe bounced you
 * forward again.
 *
 * `depth` counts how many screens deep this history entry is, which is how we
 * tell "the user navigated here" from "the user opened a link straight to
 * here" — going back out of the latter would leave the app entirely.
 */
const depth = () => history.state?.depth ?? 0;

function go(hash) {
  if (hash === location.hash) return;
  history.pushState({ depth: depth() + 1 }, '', hash);
  render();
}

/** Replace the current entry — for redirects that should not be revisitable. */
function goReplace(hash) {
  history.replaceState({ depth: depth() }, '', hash);
  render();
}

/**
 * Step back one screen. Uses real history when we have some, so the user
 * returns to wherever they actually came from (an exercise opened from a
 * workout goes back to that workout, not to the exercise list). Falls back to
 * the parent screen when this is the first page of the session.
 */
function goBack(parentHash) {
  if (depth() > 0) history.back();
  else goReplace(parentHash);
}

function setBar(title, { back = null } = {}) {
  barEl.innerHTML = `
    <div class="bar-in">
      ${back
        ? `<button class="icon-btn" data-back="${back}" aria-label="Go back">${svgIcon('back')}</button>`
        : `<span style="width:6px"></span>`}
      <h1 class="bar-title">${title}</h1>
      <button class="icon-btn" data-theme-toggle aria-label="Theme: ${theme}. Tap to change.">
        ${svgIcon(theme === 'auto' ? 'auto' : theme === 'dark' ? 'moon' : 'sun')}
      </button>
    </div>`;
}

/* ============================================================
   Screens
   ============================================================ */
function ringSvg(frac, size = 46) {
  const r = size / 2 - 3.5;
  const c = 2 * Math.PI * r;
  return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
    <circle class="trk" cx="${size / 2}" cy="${size / 2}" r="${r}"/>
    <circle class="val" cx="${size / 2}" cy="${size / 2}" r="${r}"
      stroke-linecap="${frac > 0 ? 'round' : 'butt'}"
      stroke-dasharray="${(c * frac).toFixed(1)} ${c.toFixed(1)}"/>
  </svg>`;
}

function screenHome() {
  setBar('The Forge');
  const saved = REGISTRY.filter((g) => g.ready)
    .map((g) => ({ g, w: loadWorkout(g.id) }))
    .filter((x) => x.w);

  root.innerHTML = `
    <div class="screen wrap">
      <header class="hero">
        <div class="eyebrow">Train with intent</div>
        <h1>Pick a muscle group.<br>Get your day's exercises.</h1>
        <p>Real demonstrations for every movement, in the order you should do them, with the muscle each one hits.</p>
      </header>

      ${saved.length ? `
        <div class="section-head"><h2>In progress</h2></div>
        <div class="stack">
          ${saved.map(({ g, w }) => {
            const done = w.items.filter((i) => i.done).length;
            return `<button class="card" data-go="#/w/${g.id}">
              <div class="thumb" style="display:grid;place-items:center">${ringSvg(done / w.items.length, 52)}</div>
              <div class="card-body">
                <div class="card-name">${g.name} Day</div>
                <div class="card-sub">${done} of ${w.items.length} done · saved ${w.date === todayKey() ? 'today' : w.date}</div>
              </div>
              <span class="card-go">${svgIcon('chevron')}</span>
            </button>`;
          }).join('')}
        </div>` : ''}

      <div class="section-head"><h2>Muscle groups</h2><span class="count">${REGISTRY.filter(g => g.ready).length} ready</span></div>
      <div class="tiles">
        ${REGISTRY.map((g) => `
          <button class="tile ${g.ready ? 'is-live' : 'is-soon'}" ${g.ready ? `data-go="#/g/${g.id}"` : 'disabled'}>
            <div>
              <div class="tile-name">${g.name}</div>
              <div class="tile-sub">${g.ready ? `${g.count} exercises` : 'Coming soon'}</div>
            </div>
            ${g.ready ? `<span class="tag tag-muscle" style="align-self:flex-start">${g.areas} target areas</span>` : ''}
          </button>`).join('')}
      </div>

      <div id="install-slot"></div>
    </div>`;

  root.querySelectorAll('.tile.is-live').forEach((tile, i) => {
    const g = REGISTRY.filter((x) => x.ready)[i];
    if (!g?.art) return;
    const art = document.createElement('div');
    art.className = 'tile-art';
    art.appendChild(createAnatomy(g.art));
    tile.appendChild(art);
  });
  renderInstallHint();
}

/* Compound or isolation, in the words a gym floor uses. */
const patternLabel = (e) => (e.pattern === 'compound' ? 'Compound' : 'Isolation');

const cardTag = (e) => `
  <span class="tag tag-muscle"><i class="tag-dot"></i>${MUSCLES[e.target]?.short ?? e.target}</span>
  <span class="tag tag-pattern">${patternLabel(e)}</span>
  <span class="tag">${e.equipment}</span>`;

function exerciseCard(gid, e, demo) {
  return `<button class="card" data-go="#/g/${gid}/e/${e.id}">
    <span class="thumb"><img class="thumb-img" src="${demo(e.id, 1)}" alt="" loading="lazy" decoding="async"></span>
    <span class="card-body">
      <span class="card-name">${e.name}</span>
      <span class="card-meta">${cardTag(e)}</span>
      <span class="card-sub">${e.setsReps}</span>
    </span>
    <span class="card-go">${svgIcon('chevron')}</span>
  </button>`;
}

async function screenGroup(gid) {
  const mod = await loadGroup(gid);
  if (!mod) return goReplace('#/');
  const { group, exercises, demo } = mod;
  setBar(group.name, { back: '#/' });

  const filter = store.get(`gym.filter.${gid}`, 'All');
  const len = lengthFor(mod);
  const shown = exercises.filter((e) => filter === 'All' || e.equipment === filter);

  root.innerHTML = `
    <div class="screen wrap">
      <header class="hero">
        <div class="eyebrow">${group.regions.length} target areas</div>
        <h1>${group.name}</h1>
        <p>${group.tagline}. ${exercises.length} exercises, grouped by the muscle each one actually trains.</p>
      </header>

      <div class="chips" role="group" aria-label="Filter by equipment">
        ${EQUIPMENT_FILTERS.map((f) => `
          <button class="chip" data-filter="${f}" aria-pressed="${f === filter}">${f === 'All' ? 'All equipment' : f}</button>`).join('')}
      </div>

      <div id="sections">
        ${group.regions.map((region) => {
          const list = shown.filter((e) => e.target === region);
          if (!list.length) return '';
          const m = MUSCLES[region];
          return `
            <div class="section-head">
              <h2 style="display:flex;align-items:center;gap:9px">
                <span class="anat-mini" data-anat="${region}"></span>${m.name}
              </h2>
              <span class="count">${list.length}</span>
            </div>
            <div class="grid">${list.map((e) => exerciseCard(gid, e, demo)).join('')}</div>`;
        }).join('')}
      </div>

      ${shown.length ? '' : `<div class="empty"><div class="e-t">Nothing with that equipment</div><div class="e-s">Try another filter.</div></div>`}
    </div>
    <div class="dock">
      <div class="dock-in">
        ${group.plan
          ? `<div class="seg"><span class="seg-label">${planLabel(group)}</span></div>`
          : `<div class="seg" role="group" aria-label="Exercises per session">
              <span class="seg-label">Exercises</span>
              ${LENGTHS.map((n) => `
                <button class="seg-btn" data-len="${n}" aria-pressed="${n === len}">${n}</button>`).join('')}
            </div>`}
        <button class="btn" data-build="${gid}">${svgIcon('bolt')} Build ${group.name} Day</button>
      </div>
    </div>`;

  hydrateAnatomy(mod);
}

async function screenDetail(gid, eid) {
  const mod = await loadGroup(gid);
  const e = mod?.byId[eid];
  if (!e) return goReplace(`#/g/${gid}`);
  const { demo } = mod;
  setBar(e.name, { back: `#/g/${gid}` });
  const m = MUSCLES[e.target];

  root.innerHTML = `
    <div class="screen wrap">
      <div class="stage">
        <div class="stage-fig photo" id="demo-box">
          ${demoMarkup(demo, e)}
          <button class="play-toggle" data-play aria-label="Pause">${svgIcon(reducedMotion.matches ? 'play' : 'pause')}</button>
        </div>
        <div class="stage-anat">
          <span data-anat-big="${e.target}"></span>
          <div class="anat-label">
            <div class="n">${m.name}</div>
            <div class="b">${m.blurb}</div>
          </div>
        </div>
      </div>

      <dl class="facts">
        <div class="fact"><dt>Type</dt><dd>${patternLabel(e)}</dd></div>
        <div class="fact"><dt>Equipment</dt><dd>${e.equipment}</dd></div>
        <div class="fact"><dt>Sets &amp; reps</dt><dd>${e.setsReps}</dd></div>
        <div class="fact"><dt>Level</dt><dd>${e.level}</dd></div>
      </dl>

      ${e.secondary?.length ? `
        <div class="section-head"><h2>Also works</h2></div>
        <div class="card-meta">${e.secondary.map((sx) => `<span class="tag">${MUSCLES[sx]?.name ?? sx}</span>`).join('')}</div>` : ''}

      <div class="section-head"><h2>Form cues</h2></div>
      <div class="cues">${e.cues.map((c) => `<div class="cue">${svgIcon('spark')}<span>${c}</span></div>`).join('')}</div>
    </div>`;

  hydrateAnatomy(mod);
  mountPlayer(document.getElementById('demo-box'), e, demo);
}

async function screenWorkout(gid) {
  const mod = await loadGroup(gid);
  if (!mod) return goReplace('#/');
  const { group, byId, demo } = mod;
  setBar(`${group.name} Day`, { back: `#/g/${gid}` });

  let w = loadWorkout(gid, byId);
  if (!w) {
    const filter = store.get(`gym.filter.${gid}`, 'All');
    w = {
      date: todayKey(), filter,
      items: buildWorkout(mod, filter, lengthFor(mod)),
    };
    saveWorkout(gid, w);
  }

  const done = w.items.filter((i) => i.done).length;
  const total = w.items.length;
  const bonus = w.items.some((i) => i.finisher);

  root.innerHTML = `
    <div class="screen wrap">
      <div class="progress">
        ${ringSvg(total ? done / total : 0)}
        <div class="progress-txt">
          <div class="t">${done === total ? 'Session complete. Well done.' : `${done} of ${total} finished`}</div>
          <div class="s">Do them in this order, top to bottom${bonus ? ' · ends on a bodyweight finisher' : ''}${w.filter !== 'All' ? ` · ${w.filter}` : ''}</div>
        </div>
      </div>

      <div class="stack">
        ${w.items.map((it, i) => {
          const e = byId[it.id];
          // The finisher is the bonus movement on top of the chosen length, so
          // it is numbered "+1" rather than taking the next slot number.
          const swapLabel = it.finisher
            ? `Swap ${e.name} for another bodyweight exercise`
            : `Swap ${e.name} for another ${MUSCLES[e.target].short} exercise`;
          return `<div class="slot ${it.done ? 'is-done' : ''} ${it.finisher ? 'is-bonus' : ''}">
            <button class="slot-open" data-go="#/g/${gid}/e/${e.id}">
              <span class="thumb"><span class="slot-num">${it.finisher ? '+1' : i + 1}</span><img class="thumb-img" src="${demo(e.id, 1)}" alt="" loading="lazy" decoding="async"></span>
              <span class="slot-body">
                <span class="slot-name">${e.name}</span>
                <span class="slot-meta">
                  <span class="tag tag-muscle"><i class="tag-dot"></i>${MUSCLES[e.target].short}</span>
                  <span class="tag tag-pattern">${patternLabel(e)}</span>
                  <span class="slot-reps">${e.setsReps}</span>
                </span>
              </span>
            </button>
            <button class="slot-swap" data-swap="${i}" aria-label="${swapLabel}">${svgIcon('swap')}</button>
            <button class="tick" data-tick="${i}" aria-pressed="${it.done}" aria-label="Mark ${e.name} ${it.done ? 'not done' : 'done'}">${svgIcon('check')}</button>
          </div>`;
        }).join('')}
      </div>

      <div class="btn-row" style="margin-top:16px">
        <button class="btn btn-ghost" data-regen="${gid}">${svgIcon('shuffle')} Rebuild</button>
        <button class="btn btn-ghost" data-clear="${gid}">${svgIcon('trash')} Clear</button>
      </div>
    </div>`;
}

/* Attach the anatomy maps the markup asked for. */
function hydrateAnatomy(mod) {
  for (const host of root.querySelectorAll('[data-anat]')) {
    host.appendChild(createAnatomy(host.dataset.anat));
  }
  for (const host of root.querySelectorAll('[data-anat-big]')) {
    const e = mod.byId[parseRoute().exercise];
    host.appendChild(createAnatomy(host.dataset.anatBig, e?.secondary ?? []));
  }
}

/* ============================================================
   Install hint (Chrome fires an event; iOS needs a nudge)
   ============================================================ */
let deferredPrompt = null;
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; renderInstallHint(); });

function renderInstallHint() {
  const slot = document.getElementById('install-slot');
  if (!slot) return;
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (standalone || store.get('gym.installDismissed', false)) return;

  const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (!deferredPrompt && !iOS) return;

  slot.innerHTML = `
    <div class="section-head"><h2>Add to your phone</h2></div>
    <div class="card" style="cursor:default">
      <span class="thumb" style="display:grid;place-items:center">${svgIcon('add', 'anat-mini')}</span>
      <span class="card-body">
        <span class="card-name">Install the app</span>
        <span class="card-sub">${iOS && !deferredPrompt
          ? 'Tap Share, then “Add to Home Screen”. It then opens full screen and works offline.'
          : 'Runs full screen and works offline once installed.'}</span>
      </span>
      ${deferredPrompt ? `<button class="btn btn-sm" data-install>Install</button>` : `<button class="icon-btn" data-dismiss-install aria-label="Dismiss">×</button>`}
    </div>`;
}

/* ============================================================
   Global event wiring
   ============================================================ */
document.addEventListener('click', async (ev) => {
  const back = ev.target.closest('[data-back]');
  if (back) { goBack(back.dataset.back); return; }

  const nav = ev.target.closest('[data-go]');
  if (nav) { go(nav.dataset.go); return; }

  if (ev.target.closest('[data-theme-toggle]')) { cycleTheme(); return; }

  const len = ev.target.closest('[data-len]');
  if (len) {
    store.set(`gym.len.${parseRoute().group}`, +len.dataset.len);
    render();
    return;
  }

  const chip = ev.target.closest('[data-filter]');
  if (chip) {
    const gid = parseRoute().group;
    store.set(`gym.filter.${gid}`, chip.dataset.filter);
    render();
    return;
  }

  const build = ev.target.closest('[data-build]');
  if (build) {
    const gid = build.dataset.build;
    const mod = await loadGroup(gid);
    const filter = store.get(`gym.filter.${gid}`, 'All');
    saveWorkout(gid, {
      date: todayKey(), filter,
      items: buildWorkout(mod, filter, lengthFor(mod)),
    });
    go(`#/w/${gid}`);
    return;
  }

  const tick = ev.target.closest('[data-tick]');
  const swap = ev.target.closest('[data-swap]');
  if (tick || swap) {
    const gid = parseRoute().group;
    const mod = await loadGroup(gid);
    const w = loadWorkout(gid, mod?.byId);
    if (!mod || !w) return;
    if (tick) {
      const i = +tick.dataset.tick;
      w.items[i].done = !w.items[i].done;
    } else {
      const i = +swap.dataset.swap;
      // Cycle through the same muscle's exercises ranked best-first for this
      // slot, so a swap keeps the day balanced rather than walking the file
      // in order. Repeated taps still step through every option.
      const ranked = slotAlternatives(mod, w.items, i);
      const next = ranked[(ranked.findIndex((x) => x.id === w.items[i].id) + 1) % ranked.length];
      // Keep the slot's kind: swapping the finisher leaves it the finisher.
      w.items[i] = { id: next.id, done: false, ...(w.items[i].finisher && { finisher: true }) };
    }
    saveWorkout(gid, w);
    releaseMedia();
    await screenWorkout(gid);
    return;
  }

  const regen = ev.target.closest('[data-regen]');
  if (regen) {
    const gid = regen.dataset.regen;
    const mod = await loadGroup(gid);
    const cur = loadWorkout(gid);
    const filter = cur?.filter ?? 'All';
    saveWorkout(gid, {
      date: todayKey(), filter,
      items: buildWorkout(mod, filter, lengthFor(mod)),
    });
    releaseMedia();
    await screenWorkout(gid);
    return;
  }

  const clear = ev.target.closest('[data-clear]');
  if (clear) {
    try { localStorage.removeItem(workoutKey(clear.dataset.clear)); } catch { /* ignore */ }
    // The workout no longer exists, so leaving its entry in history would let
    // back land on a dead screen. Replace it rather than pushing.
    goReplace(`#/g/${clear.dataset.clear}`);
    return;
  }

  if (ev.target.closest('[data-install]') && deferredPrompt) {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    renderInstallHint();
    return;
  }
  if (ev.target.closest('[data-dismiss-install]')) {
    store.set('gym.installDismissed', true);
    document.getElementById('install-slot').innerHTML = '';
  }
});

addEventListener('scroll', () => {
  barEl.classList.toggle('is-stuck', scrollY > 4);
}, { passive: true });

/* ============================================================
   Boot
   ============================================================ */
async function render() {
  releaseMedia();
  const r = parseRoute();
  if (r.name === 'group') await screenGroup(r.group);
  else if (r.name === 'detail') await screenDetail(r.group, r.exercise);
  else if (r.name === 'workout') await screenWorkout(r.group);
  else screenHome();
  if (r.name !== 'workout') scrollTo({ top: 0 });
}

// pushState does not fire hashchange, so popstate is the single source of
// truth for back/forward. Seed the first entry with a depth so a fresh load
// (or a deep link) knows it has nothing to go back to.
addEventListener('popstate', render);
if (!history.state) history.replaceState({ depth: 0 }, '', location.hash || '#/');
render();

if ('serviceWorker' in navigator) {
  addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
