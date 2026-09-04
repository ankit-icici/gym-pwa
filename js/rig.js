/*
 * rig.js — a 2D skeletal animator that draws an anatomical figure in SVG
 * and interpolates it between authored poses.
 *
 * The figure is built from tapered limb volumes rather than stick lines, and
 * the muscle an exercise trains is painted onto the body itself, brightening
 * as the rep reaches peak contraction.
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
 *
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
  head: 14,
  upperArm: 34,
  forearm: 32,
  hand: 8,
  thigh: 44,
  shin: 42,
  foot: 16,
  shoulderW: 20, // half-width of the shoulder girdle
  hipW: 15,      // half-width of the pelvis
};

/* How thick the body is at each joint. The side view is a narrow profile;
   the front view is broader and carries the V-taper. */
const RADII = {
  side:  { pelvis: 14,   waist: 12.5, chest: 17.5, shoulder: 12.5, elbow: 8,   hand: 6.2,
           hip: 13,   knee: 9,   ankle: 6.2, toe: 4.8, neck: 8.4 },
  front: { pelvis: 15.5, waist: 13.5, chest: 22,   shoulder: 12.8, elbow: 7.6, hand: 5.8,
           hip: 12,   knee: 8.6, ankle: 5.8, toe: 4.4, neck: 8.4 },
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
    const sx = view === 'front' ? dir * LIMB.shoulderW : 0;
    const shoulder = [shoulderMid[0] + sx, shoulderMid[1] + (far ? 3 : 0)];

    const upperAng = view === 'front' ? lateral : p.shoulder + (far ? p.farShoulder : 0);
    const elbow = step(shoulder, LIMB.upperArm, upperAng);
    const foreAng = view === 'front'
      ? upperAng + p.elbow * dir
      : upperAng + p.elbow + (far ? p.farElbow : 0);
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

  return {
    pelvis, neckBase, headCentre, shoulderMid, view,
    right: limb(1),
    left: limb(-1),
  };
}

/* ---------- interpolation ---------- */

const easeInOut = (t) => 0.5 - 0.5 * Math.cos(Math.PI * t);

/*
 * Interpolates the standard pose fields plus ANY other numeric field an
 * exercise carries. That last part matters: the 3D renderer reads extra keys
 * like hip3d and elbow3d, and a fixed key list would silently drop them
 * mid-animation, leaving the 3D figure to fall back on the 2D angles.
 */
export function lerpPose(a, b, t) {
  const out = {};
  const keys = new Set([...Object.keys(DEFAULT_POSE), ...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    const av = a[k], bv = b[k];
    const aNum = typeof av === 'number', bNum = typeof bv === 'number';
    if (!aNum && !bNum) continue;
    const A = aNum ? av : (DEFAULT_POSE[k] ?? bv);
    const B = bNum ? bv : (DEFAULT_POSE[k] ?? av);
    out[k] = A + (B - A) * t;
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

/** 0 at the start of a rep, 1 at peak contraction. Drives the muscle glow. */
export const contraction = (u) => easeInOut(1 - Math.abs(2 * u - 1));

/* ---------- geometry ---------- */

/**
 * The outline of the convex hull of two circles — a limb segment with real
 * thickness that tapers from one joint to the next. Drawing these plus a disc
 * at every joint gives a continuous body without any boolean geometry.
 */
function taper(p0, r0, p1, r1) {
  const dx = p1[0] - p0[0], dy = p1[1] - p0[1];
  const d = Math.hypot(dx, dy);
  if (d < 0.01) return '';
  const ux = dx / d, uy = dy / d;
  const nx = -uy, ny = ux;
  const c = Math.max(-1, Math.min(1, (r0 - r1) / d));
  const s = Math.sqrt(1 - c * c);
  const P = (p, r, sign) => [
    p[0] + r * (ux * c + nx * s * sign),
    p[1] + r * (uy * c + ny * s * sign),
  ];
  const a0 = P(p0, r0, 1), a1 = P(p1, r1, 1);
  const b1 = P(p1, r1, -1), b0 = P(p0, r0, -1);
  const f = (q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`;
  return `M${f(a0)}L${f(a1)}L${f(b1)}L${f(b0)}Z`;
}

const disc = (p, r) =>
  `M${(p[0] - r).toFixed(1)},${p[1].toFixed(1)}` +
  `a${r},${r} 0 1,0 ${(2 * r).toFixed(1)},0` +
  `a${r},${r} 0 1,0 ${(-2 * r).toFixed(1)},0Z`;

/** Every shape making up one arm+leg pair, as path data. */
function limbPaths(side, R) {
  return [
    taper(side.shoulder, R.shoulder, side.elbow, R.elbow),
    taper(side.elbow, R.elbow, side.hand, R.hand),
    taper(side.hip, R.hip, side.knee, R.knee),
    taper(side.knee, R.knee, side.ankle, R.ankle),
    taper(side.ankle, R.ankle, side.toe, R.toe),
    disc(side.shoulder, R.shoulder), disc(side.elbow, R.elbow), disc(side.hand, R.hand),
    disc(side.hip, R.hip), disc(side.knee, R.knee), disc(side.ankle, R.ankle),
  ];
}

/** The torso alone — also used as the clip region for muscle highlights. */
function torsoPaths(s, R, view) {
  const waist = [
    s.pelvis[0] + (s.shoulderMid[0] - s.pelvis[0]) * 0.42,
    s.pelvis[1] + (s.shoulderMid[1] - s.pelvis[1]) * 0.42,
  ];
  const parts = [
    taper(s.pelvis, R.pelvis, waist, R.waist),
    taper(waist, R.waist, s.shoulderMid, R.chest),
    disc(s.pelvis, R.pelvis),
    disc(waist, R.waist),
    disc(s.shoulderMid, R.chest),
  ];
  if (view === 'front') {
    parts.push(taper(s.right.shoulder, R.shoulder, s.left.shoulder, R.shoulder));
  }
  return parts;
}

/* ---------- muscle map ---------- */

/*
 * Muscle regions live in torso-local coordinates: u runs 0 (pelvis) to 1
 * (base of the neck), and v runs across the torso where v = 1 is the EDGE OF
 * THE BODY AT THAT HEIGHT. Measuring v against the local width rather than a
 * fixed one is what keeps a shape like the lats hugging the flank all the way
 * down instead of being clipped away where the torso narrows.
 *
 * In side view -v is the back of the body; in front view v is lateral, so
 * shapes are mirrored. Everything is clipped to the torso silhouette, which
 * keeps the shapes honest no matter how far the figure bends.
 */
const mirror = (poly) => poly.map(([u, v]) => [u, -v]);
const pair = (poly) => [poly, mirror(poly)];

const MUSCLE_SHAPES = {
  side: {
    lats:       [[[0.92, -0.30], [1.00, -1.15], [0.30, -1.15], [0.14, -0.30], [0.50, -0.42]]],
    rhomboids:  [[[0.92, -0.30], [0.99, -1.15], [0.56, -1.15], [0.54, -0.35]]],
    traps:      [[[1.12, 0.40], [1.20, -1.15], [0.66, -1.15], [0.60, -0.35], [0.92, -0.05]]],
    erectors:   [[[0.62, -0.55], [0.68, -1.15], [0.06, -1.15], [0.02, -0.50]]],
    teres:      [[[0.95, -0.35], [1.05, -1.05], [0.74, -1.15], [0.70, -0.45]]],
    rear_delts: 'shoulder',
  },
  front: {
    lats:       pair([[0.92, 0.35], [0.98, 1.15], [0.35, 1.15], [0.14, 0.28], [0.48, 0.45]]),
    rhomboids:  pair([[0.90, 0.06], [0.94, 0.75], [0.58, 0.62], [0.56, 0.05]]),
    traps:      [[[1.16, -1.45], [1.22, 1.45], [0.76, 0.60], [0.70, 0], [0.76, -0.60]]],
    erectors:   pair([[0.56, 0.05], [0.60, 0.42], [0.10, 0.38], [0.08, 0.04]]),
    teres:      pair([[0.90, 0.55], [0.98, 1.15], [0.72, 1.15], [0.68, 0.60]]),
    rear_delts: 'shoulder',
  },
};

/* Half-width of the torso at height u, matching the pelvis/waist/chest nodes
   the silhouette is built from. */
const WAIST_U = 0.42 * 0.92, CHEST_U = 0.92;
function torsoRadius(u, R) {
  if (u <= 0) return R.pelvis;
  if (u < WAIST_U) return R.pelvis + (R.waist - R.pelvis) * (u / WAIST_U);
  if (u < CHEST_U) return R.waist + (R.chest - R.waist) * ((u - WAIST_U) / (CHEST_U - WAIST_U));
  return R.chest;
}

/** Map torso-local (u, v) polygons into world space for the current pose. */
function musclePath(s, region, view, R) {
  const shapes = MUSCLE_SHAPES[view][region];
  if (!shapes) return '';

  // Deltoids ride on the shoulder joint, not the torso.
  if (shapes === 'shoulder') {
    const sides = view === 'front' ? [s.right, s.left] : [s.right];
    return sides.map((side) => disc(side.shoulder, R.shoulder * 0.94)).join('');
  }

  const L = LIMB.torso;
  const ux = (s.shoulderMid[0] - s.pelvis[0]) / (L * 0.92);
  const uy = (s.shoulderMid[1] - s.pelvis[1]) / (L * 0.92);
  const sx = -uy, sy = ux;   // across the torso; +v is the front of the body

  const at = ([u, v]) => {
    const w = torsoRadius(u, R);
    return [
      s.pelvis[0] + ux * u * L + sx * v * w,
      s.pelvis[1] + uy * u * L + sy * v * w,
    ];
  };
  return shapes
    .map((poly) => 'M' + poly.map(at).map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join('L') + 'Z')
    .join('');
}

/* ---------- rendering ---------- */

const ns = 'http://www.w3.org/2000/svg';
const el = (name, attrs = {}) => {
  const n = document.createElementNS(ns, name);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
};
let uid = 0;

/**
 * Creates the SVG scene for one exercise and returns a handle with
 * `.setTime(u)` so the caller owns the clock.
 */
export function createFigure(exercise, opts = {}) {
  const view = exercise.view || 'side';
  const R = RADII[view];
  const primary = opts.primary ?? exercise.target;
  const secondary = opts.secondary ?? exercise.secondary ?? [];
  const id = `t${++uid}`;

  const svg = el('svg', {
    viewBox: exercise.viewBox || '-116 -214 232 236',
    class: 'figure',
    role: 'img',
    'aria-label': `Animated demonstration of ${exercise.name}`,
    preserveAspectRatio: 'xMidYMid meet',
  });

  const defs = el('defs');

  // One shared light direction across every shape in the figure, so the
  // separate limb paths read as a single lit body rather than flat cut-outs.
  // userSpaceOnUse matters here: per-element bounding boxes would give each
  // limb its own little gradient.
  for (const [gid, cls] of [[`${id}b`, 'g-body'], [`${id}f`, 'g-far'], [`${id}m`, 'g-mus']]) {
    const g = el('linearGradient', {
      id: gid, gradientUnits: 'userSpaceOnUse',
      x1: -80, y1: -196, x2: 70, y2: 14,
    });
    g.append(
      el('stop', { offset: '0', class: `${cls}-hi` }),
      el('stop', { offset: '1', class: `${cls}-lo` }),
    );
    defs.appendChild(g);
  }

  const clip = el('clipPath', { id });
  defs.appendChild(clip);
  const clipShapes = Array.from({ length: 6 }, () => el('path'));
  for (const c of clipShapes) clip.appendChild(c);

  // Layers, back to front: static equipment, far limbs, body, muscles, kit.
  const gStatic = el('g', { class: 'eq-static' });
  const gFar = el('g', { class: 'fig-far', fill: `url(#${id}f)` });
  const gBody = el('g', { class: 'fig-body', fill: `url(#${id}b)` });
  const gMuscle = el('g', { class: 'fig-muscle', fill: `url(#${id}m)`, 'clip-path': `url(#${id})` });
  const gDelt = el('g', { class: 'fig-muscle', fill: `url(#${id}m)` });
  const gEquip = el('g', { class: 'eq-live' });
  svg.append(defs, gStatic, gFar, gBody, gMuscle, gDelt, gEquip);

  const farPaths = Array.from({ length: 11 }, () => gFar.appendChild(el('path')));
  const bodyPaths = Array.from({ length: 32 }, () => gBody.appendChild(el('path')));
  const head = gBody.appendChild(el('circle', { class: 'head', r: LIMB.head }));

  const secPath = gMuscle.appendChild(el('path', { class: 'mus mus-2' }));
  const priPath = gMuscle.appendChild(el('path', { class: 'mus mus-1' }));
  const secDelt = gDelt.appendChild(el('path', { class: 'mus mus-2' }));
  const priDelt = gDelt.appendChild(el('path', { class: 'mus mus-1' }));

  const equipment = exercise.equipmentLayer ? exercise.equipmentLayer(el, gStatic, gEquip) : null;

  const paint = (nodes, list) => {
    nodes.forEach((n, i) => n.setAttribute('d', list[i] ?? ''));
  };

  function setTime(u) {
    const pose = samplePoses(exercise.poses, u);
    const s = solve(pose, view);

    const torso = torsoPaths(s, R, view);
    const near = [
      ...torso,
      taper(s.neckBase, R.neck, s.headCentre, LIMB.head * 0.8),
      ...limbPaths(s.right, R),
    ];
    if (view === 'front') near.push(...limbPaths(s.left, R));

    paint(bodyPaths, near);
    paint(farPaths, view === 'front' ? [] : limbPaths(s.left, R));
    head.setAttribute('cx', s.headCentre[0].toFixed(1));
    head.setAttribute('cy', s.headCentre[1].toFixed(1));
    paint(clipShapes, torso);

    // Muscles brighten toward peak contraction, the way the working tissue
    // is what your eye should be drawn to mid-rep.
    const glow = 0.34 + 0.66 * contraction(u);
    const split = (region, torsoNode, deltNode) => {
      const d = region ? musclePath(s, region, view, R) : '';
      const onDelt = MUSCLE_SHAPES[view][region] === 'shoulder';
      torsoNode.setAttribute('d', onDelt ? '' : d);
      deltNode.setAttribute('d', onDelt ? d : '');
    };
    split(primary, priPath, priDelt);
    const sec = secondary.filter((r) => r !== primary);
    secPath.setAttribute('d', sec.filter((r) => MUSCLE_SHAPES[view][r] !== 'shoulder')
      .map((r) => musclePath(s, r, view, R)).join(''));
    secDelt.setAttribute('d', sec.filter((r) => MUSCLE_SHAPES[view][r] === 'shoulder')
      .map((r) => musclePath(s, r, view, R)).join(''));
    for (const n of [priPath, priDelt]) n.style.opacity = glow.toFixed(3);

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
