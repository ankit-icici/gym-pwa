/*
 * rig.js — a tiny 2D skeletal animator that draws a human figure in SVG
 * and interpolates it between authored poses.
 *
 * ANGLE CONVENTION (this is the only thing you need to know to author poses):
 *   All angles are in DEGREES, measured from STRAIGHT DOWN.
 *   Positive rotates toward +x, which is the direction the figure FACES
 *   (screen-right in side view, the figure's own left in front view).
 *
 *     0   = pointing straight down
 *    90   = pointing horizontally forward
 *   180   = pointing straight up
 *   -45   = down and behind
 *
 * POSE FIELDS
 *   torso     lean from vertical. 0 = upright, 90 = folded flat over the hips.
 *   neck      head tilt relative to the torso. + looks up.
 *   shoulder  upper-arm angle. 0 = hanging, 90 = straight out front, 180 = overhead.
 *   elbow     elbow FLEXION added on top of the shoulder angle. 0 = locked straight.
 *   abduct    (front view only) how far the arm swings out to the side. 0 = at side.
 *   hip       thigh angle. 0 = standing, 90 = thigh horizontal (seated).
 *   knee      knee FLEXION, always >= 0. Shin angle = hip - knee.
 *   ankle     foot angle relative to the shin.
 *   rootY     vertical position of the pelvis. The FLOOR IS y = 0, so a
 *             standing pelvis sits at about -86.
 *   rootX     horizontal offset of the whole figure.
 *   thighK    thigh length multiplier, and shinK for the shin. Used to
 *             foreshorten legs that point at the camera (e.g. seated, front view).

 * In FRONT view `abduct` replaces `shoulder`, and both arms mirror: a positive
 * `elbow` always swings the forearm outward and up away from the upper arm.
 */

const D2R = Math.PI / 180;

/** Walk `len` from point `p` at `ang` degrees off straight-down. */
export function step(p, len, ang) {
  const r = ang * D2R;
  return [p[0] + len * Math.sin(r), p[1] + len * Math.cos(r)];
}

/* Segment lengths, in the rig's arbitrary units. Roughly 8-head proportions. */
export const LIMB = {
  torso: 62,
  neck: 12,
  head: 15,   // radius
  upperArm: 34,
  forearm: 32,
  hand: 8,
  thigh: 44,
  shin: 42,
  foot: 16,
  shoulderW: 20, // half-width of the shoulder girdle
  hipW: 12,      // half-width of the pelvis
};

export const DEFAULT_POSE = {
  torso: 0, neck: 0,
  shoulder: 0, elbow: 0, abduct: 0,
  hip: 0, knee: 0, ankle: 0,
  rootX: 0, rootY: 0,
  thighK: 1, shinK: 1,
  // Side view only: how the hidden far limbs differ from the near ones.
  // The defaults just break the silhouette; override them when the far arm
  // is doing something genuinely different (bracing on a bench, say).
  farShoulder: -9, farElbow: 0, farHip: 7,
};

/**
 * Forward kinematics. Returns every joint position for one pose.
 * `side` is +1 for the near limb and -1 for the far limb (front view mirroring).
 */
export function solve(pose, view) {
  const p = { ...DEFAULT_POSE, ...pose };

  const pelvis = [p.rootX, p.rootY];
  // The torso runs UP from the pelvis, so its angle is 180 minus the lean.
  const torsoAng = 180 - p.torso;
  const neckBase = step(pelvis, LIMB.torso, torsoAng);
  const headCentre = step(neckBase, LIMB.neck + LIMB.head * 0.6, torsoAng + p.neck);

  // Shoulders sit slightly below the top of the spine.
  const shoulderMid = step(pelvis, LIMB.torso * 0.92, torsoAng);

  const limb = (dir) => {
    // Side view hides the far limb behind the near one, so offset it.
    const far = view === 'side' && dir < 0;

    // In front view the arm also swings out sideways (abduction).
    const lateral = view === 'front' ? p.abduct * dir : 0;
    const sx = view === 'front' ? dir * LIMB.shoulderW * 0.55 : 0;
    const shoulder = [shoulderMid[0] + sx, shoulderMid[1] + (far ? 3 : 0)];

    const upperAng = view === 'front' ? lateral : p.shoulder + (far ? p.farShoulder : 0);
    const elbow = step(shoulder, LIMB.upperArm, upperAng);
    // Elbow flexion always folds the forearm back toward the body's midline.
    const foreAng = view === 'front' ? upperAng + p.elbow * dir : upperAng + p.elbow + (far ? p.farElbow : 0);
    const hand = step(elbow, LIMB.forearm, foreAng);

    const hx = view === 'front' ? dir * LIMB.hipW * 0.6 : 0;
    const hipJ = [pelvis[0] + hx, pelvis[1]];
    const hipAng = view === 'front' ? dir * 3 : p.hip + (far ? p.farHip : 0);
    const knee = step(hipJ, LIMB.thigh * p.thighK, hipAng);
    const shinAng = hipAng - p.knee;
    const ankle = step(knee, LIMB.shin * p.shinK, shinAng);
    const toe = step(ankle, LIMB.foot, shinAng + 90 + p.ankle);

    return { shoulder, elbow, hand, hip: hipJ, knee, ankle, toe };
  };

  const right = limb(1);
  const left = limb(-1);

  return { pelvis, neckBase, headCentre, shoulderMid, right, left, view };
}

/* ---------- interpolation ---------- */

const easeInOut = (t) => 0.5 - 0.5 * Math.cos(Math.PI * t);

export function lerpPose(a, b, t) {
  const out = {};
  for (const k of Object.keys(DEFAULT_POSE)) {
    const av = a[k] ?? DEFAULT_POSE[k];
    const bv = b[k] ?? DEFAULT_POSE[k];
    out[k] = av + (bv - av) * t;
  }
  return out;
}

/**
 * Sample a pose list at normalised time `u` in [0,1).
 * The list is played forward then backward (yo-yo), so a 2-pose exercise
 * reads as concentric -> eccentric -> repeat, which is what a rep looks like.
 */
export function samplePoses(poses, u) {
  if (poses.length === 1) return poses[0];
  const segs = (poses.length - 1) * 2;         // forward legs + return legs
  const x = u * segs;
  let i = Math.floor(x);
  let t = easeInOut(x - i);
  if (i >= segs) { i = segs - 1; t = 1; }
  const fwd = poses.length - 1;
  if (i < fwd) return lerpPose(poses[i], poses[i + 1], t);
  const j = segs - 1 - i;                       // walking back down the list
  return lerpPose(poses[j + 1], poses[j], t);
}

/* ---------- rendering ---------- */

const ns = 'http://www.w3.org/2000/svg';
const el = (name, attrs = {}) => {
  const n = document.createElementNS(ns, name);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
};
const fmt = (pts) => pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

/**
 * Creates the SVG scene for one exercise and returns a handle with
 * `.setTime(u)` so the caller owns the clock.
 */
export function createFigure(exercise, opts = {}) {
  const view = exercise.view || 'side';
  const svg = el('svg', {
    viewBox: exercise.viewBox || '-110 -190 220 220',
    class: 'figure',
    role: 'img',
    'aria-label': `Animated demonstration of ${exercise.name}`,
    preserveAspectRatio: 'xMidYMid meet',
  });

  // Layers, back to front: static gym equipment, the moving figure, moving equipment.
  const gStatic = el('g', { class: 'eq-static' });
  const gFar = el('g', { class: 'fig-far' });
  const gBody = el('g', { class: 'fig-near' });
  const gEquip = el('g', { class: 'eq-live' });
  svg.append(gStatic, gFar, gBody, gEquip);

  const mk = (parent, cls) => {
    const line = el('polyline', { class: cls, points: '' });
    parent.appendChild(line);
    return line;
  };

  // Far-side limbs are drawn first and dimmed, which reads as depth.
  const far = {
    arm: mk(gFar, 'bone bone-far'),
    leg: mk(gFar, 'bone bone-far'),
  };
  const spine = mk(gBody, 'bone bone-spine');
  const arm = mk(gBody, 'bone');
  const leg = mk(gBody, 'bone');
  const head = el('circle', { class: 'head', r: LIMB.head });
  gBody.appendChild(head);

  const equipment = exercise.equipmentLayer ? exercise.equipmentLayer(el, gStatic, gEquip) : null;

  function setTime(u) {
    const pose = samplePoses(exercise.poses, u);
    const s = solve(pose, view);

    spine.setAttribute('points', fmt([s.pelvis, s.neckBase]));
    head.setAttribute('cx', s.headCentre[0].toFixed(1));
    head.setAttribute('cy', s.headCentre[1].toFixed(1));

    const armPts = (side) => [side.shoulder, side.elbow, side.hand];
    const legPts = (side) => [side.hip, side.knee, side.ankle, side.toe];

    arm.setAttribute('points', fmt(armPts(s.right)));
    leg.setAttribute('points', fmt(legPts(s.right)));
    far.arm.setAttribute('points', fmt(armPts(s.left)));
    far.leg.setAttribute('points', fmt(legPts(s.left)));

    if (equipment) equipment(s, pose, u);
  }

  setTime(0);
  return { svg, setTime };
}

/**
 * Drives any number of figures from one shared rAF loop and pauses
 * automatically when the tab is hidden or the user prefers reduced motion.
 */
export function createClock() {
  const subs = new Set();
  let raf = null;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  function frame(now) {
    for (const s of subs) {
      const u = ((now - s.t0) % s.period) / s.period;
      s.fn(u);
    }
    raf = requestAnimationFrame(frame);
  }
  function sync() {
    const shouldRun = subs.size > 0 && !document.hidden && !reduced.matches;
    if (shouldRun && raf === null) raf = requestAnimationFrame(frame);
    if (!shouldRun && raf !== null) { cancelAnimationFrame(raf); raf = null; }
    // With motion reduced, park every figure at peak contraction instead.
    if (reduced.matches) for (const s of subs) s.fn(0.5);
  }
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);

  return {
    add(fn, period = 2600) {
      const s = { fn, period, t0: performance.now() };
      subs.add(s);
      sync();
      return () => { subs.delete(s); sync(); };
    },
    clear() { subs.clear(); sync(); },
  };
}
