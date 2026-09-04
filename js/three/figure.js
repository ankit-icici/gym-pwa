/*
 * three/figure.js — the 3D articulated mannequin.
 *
 * A bone hierarchy of THREE.Group nodes with tapered limb meshes hung off
 * them, plus muscle patches wrapped onto the torso surface that light up for
 * whichever region an exercise trains.
 *
 * SPACE: Y is up, the floor is y = 0, and the figure FACES +Z (the default
 * camera). Units match the 2D rig, so pose data is shared between them.
 *
 * BONE CONVENTION: every limb group points DOWN its local -Y at rest, so a
 * bone of length L runs from its origin to (0, -L, 0).
 *
 * JOINT ROTATIONS use Euler order XYZ, which Three applies Z then Y then X.
 * That is exactly the anatomical order we want at the shoulder and hip:
 * abduct in the frontal plane first, twist, then swing forward.
 */

import * as THREE from '../../vendor/three.module.min.js';

const D2R = Math.PI / 180;
const PI = Math.PI;

export const SEG = {
  torso: 62, neck: 12, head: 13,
  upperArm: 34, forearm: 32, hand: 9,
  thigh: 44, shin: 42, foot: 17,
  shoulderW: 20, hipW: 10,
  pelvisY: 86,               // standing pelvis height
};

/* Radii. The torso is an ellipse in cross-section — wider than it is deep —
   which is what `depth` scales it to. */
const R = {
  pelvis: 15, chest: 22.5, torsoDepth: 0.66,
  delt: 9.5,
  upperArm: [7.6, 6.2], forearm: [6.0, 4.8],
  thigh: [11.5, 8.2], shin: [8.2, 5.4],
  head: 13,
};

/* ---------- mesh helpers ---------- */

const cyl = (rTop, rBot, len, mat, seg = 20) => {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, len, seg, 1), mat);
  m.position.y = -len / 2;
  m.castShadow = true;
  return m;
};
const ball = (r, mat, y = 0) => {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), mat);
  m.position.y = y;
  m.castShadow = true;
  return m;
};

/** A tapered limb segment with rounded ends, running from the origin down -Y. */
function bone(len, [rTop, rBot], mat) {
  const g = new THREE.Group();
  g.add(cyl(rTop, rBot, len, mat), ball(rTop, mat, 0), ball(rBot, mat, -len));
  return g;
}

/* ---------- muscle patches ---------- */

/*
 * A muscle is a slice of the torso's surface: a piece of an open cylinder at
 * a slightly larger radius, so it sits on the skin rather than inside it.
 *
 * theta is measured so that 0 faces +Z (the figure's front) and PI faces -Z
 * (its back). Back muscles therefore cluster around PI.
 *
 * [yFrom, yTo] are fractions of torso height; [thetaStart, thetaLength] in
 * radians. `pair` mirrors the patch to the other side of the spine.
 */
const BACK_MUSCLES = {
  lats:       { y: [0.12, 0.80], theta: [PI - 1.42, 1.02], pair: true },
  rhomboids:  { y: [0.54, 0.90], theta: [PI - 0.86, 0.80], pair: true },
  traps:      { y: [0.72, 1.06], theta: [PI - 1.28, 2.56], pair: false },
  erectors:   { y: [0.05, 0.64], theta: [PI - 0.46, 0.40], pair: true },
  teres:      { y: [0.68, 0.90], theta: [PI - 1.46, 0.54], pair: true },
  rear_delts: { deltoid: true },
};

export const MUSCLE_KEYS = Object.keys(BACK_MUSCLES);

/* Must track the torso mesh exactly. The torso is a single straight taper
   from pelvis to chest, so anything fancier here sinks the muscle patches
   inside the body and they vanish. */
function torsoRadiusAt(f) {
  return R.pelvis + (R.chest - R.pelvis) * f;
}

function musclePatch(def, mat) {
  const g = new THREE.Group();
  if (def.deltoid) return g;

  const [f0, f1] = def.y;
  const y0 = f0 * SEG.torso, y1 = f1 * SEG.torso;
  const rBot = torsoRadiusAt(f0) * 1.05;
  const rTop = torsoRadiusAt(f1) * 1.05;

  const build = (thetaStart) => {
    const geo = new THREE.CylinderGeometry(
      rTop, rBot, y1 - y0, 26, 2, true, thetaStart, def.theta[1],
    );
    const m = new THREE.Mesh(geo, mat);
    m.position.y = (y0 + y1) / 2;
    m.scale.z = R.torsoDepth;
    return m;
  };
  g.add(build(def.theta[0]));
  if (def.pair) {
    // Mirror across the spine: reflect the arc through theta = PI.
    g.add(build(2 * PI - def.theta[0] - def.theta[1]));
  }
  return g;
}

/* ---------- the figure ---------- */

export function buildFigure(materials) {
  const { body, muscle } = materials;

  const root = new THREE.Group();
  const pelvis = new THREE.Group();
  root.add(pelvis);

  // Torso: a tapered elliptical column from the pelvis up to the shoulders.
  const spine = new THREE.Group();
  pelvis.add(spine);
  const torsoMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(R.chest, R.pelvis, SEG.torso, 26, 3), body,
  );
  torsoMesh.position.y = SEG.torso / 2;
  torsoMesh.scale.z = R.torsoDepth;
  torsoMesh.castShadow = true;
  const hipBall = new THREE.Mesh(new THREE.SphereGeometry(R.pelvis, 22, 16), body);
  hipBall.scale.set(1, 0.82, R.torsoDepth);
  hipBall.castShadow = true;
  const chestBall = new THREE.Mesh(new THREE.SphereGeometry(R.chest * 0.92, 22, 16), body);
  chestBall.position.y = SEG.torso * 0.94;
  chestBall.scale.set(1, 0.8, R.torsoDepth);
  chestBall.castShadow = true;
  spine.add(torsoMesh, hipBall, chestBall);

  // Muscle patches, one group per region, all hidden until an exercise asks.
  // Every patch mesh is collected into `meshes` so lighting a region is just
  // a visibility flip and a material swap.
  const muscles = {};
  for (const [key, def] of Object.entries(BACK_MUSCLES)) {
    const g = musclePatch(def, muscle);
    g.visible = false;
    if (!def.deltoid) spine.add(g);
    const meshes = [];
    g.traverse((n) => { if (n.isMesh) meshes.push(n); });
    muscles[key] = { group: g, def, meshes };
  }

  // Neck and head.
  const neck = new THREE.Group();
  neck.position.y = SEG.torso * 0.96;
  spine.add(neck);
  neck.add(cyl(7, 8.5, SEG.neck, body).translateY(SEG.neck));
  const head = new THREE.Mesh(new THREE.SphereGeometry(R.head, 24, 18), body);
  head.position.y = SEG.neck + R.head * 0.72;
  head.scale.set(0.92, 1.1, 1);
  head.castShadow = true;
  neck.add(head);

  const arms = {}, legs = {};
  for (const side of ['l', 'r']) {
    const sx = side === 'l' ? 1 : -1;   // the figure's own left is +X

    const shoulder = new THREE.Group();
    shoulder.position.set(sx * SEG.shoulderW, SEG.torso * 0.9, 0);
    spine.add(shoulder);

    const delt = new THREE.Mesh(new THREE.SphereGeometry(R.delt, 18, 14), body);
    delt.castShadow = true;
    shoulder.add(delt);

    // Rear-delt highlight: a cap on the back half of the deltoid.
    const deltMus = new THREE.Mesh(
      new THREE.SphereGeometry(R.delt * 1.04, 18, 14, PI * 0.55, PI * 0.9, PI * 0.15, PI * 0.7),
      muscle,
    );
    deltMus.visible = false;
    shoulder.add(deltMus);
    muscles.rear_delts.meshes.push(deltMus);

    const upper = bone(SEG.upperArm, R.upperArm, body);
    shoulder.add(upper);
    const fore = bone(SEG.forearm, R.forearm, body);
    fore.position.y = -SEG.upperArm;
    upper.add(fore);
    const hand = new THREE.Group();
    hand.position.y = -SEG.forearm;
    const handMesh = new THREE.Mesh(new THREE.BoxGeometry(5.5, SEG.hand, 9), body);
    handMesh.position.y = -SEG.hand / 2;
    handMesh.castShadow = true;
    hand.add(handMesh);
    fore.add(hand);
    arms[side] = { shoulder, upper, fore, hand, sx };

    const hip = new THREE.Group();
    hip.position.set(sx * SEG.hipW, 0, 0);
    pelvis.add(hip);
    const thigh = bone(SEG.thigh, R.thigh, body);
    hip.add(thigh);
    const shin = bone(SEG.shin, R.shin, body);
    shin.position.y = -SEG.thigh;
    thigh.add(shin);
    const foot = new THREE.Group();
    foot.position.y = -SEG.shin;
    const footMesh = new THREE.Mesh(new THREE.BoxGeometry(9, 5.5, SEG.foot), body);
    footMesh.position.set(0, -3, SEG.foot * 0.28);
    footMesh.castShadow = true;
    foot.add(footMesh);
    shin.add(foot);
    legs[side] = { hip, thigh, shin, foot, sx };
  }

  return { root, pelvis, spine, neck, head, arms, legs, muscles, materials };
}

/* ---------- posing ---------- */

/**
 * Drive the rig from a pose object. The fields are the same ones the 2D rig
 * uses, so both renderers share one set of authored keyframes:
 *   torso, neck, shoulder (sagittal flexion), abduct (frontal abduction),
 *   elbow, hip, knee, ankle, rootX, rootY.
 *
 * `elbowPlane` decides which way the elbow hinge points: 'sagittal' for rows
 * and presses, 'frontal' for pulldowns and flyes where the humerus is rotated
 * so the forearm folds toward the midline.
 */
export function applyPose(rig, pose, opts = {}) {
  const p = pose;
  const torsoA = p.torso3d ?? p.torso ?? 0;
  const frontal = opts.elbowPlane === 'frontal';
  const asym = opts.asymmetric === true;

  // Side-view poses were authored with +x meaning "the way the figure faces",
  // which is +z here. Front-view poses meant lateral, which really is x.
  const rx = p.rootX ?? 0;
  const depthIsX = opts.depthAxis === 'x';
  rig.pelvis.position.set(depthIsX ? rx : 0, -(p.rootY ?? -SEG.pelvisY), depthIsX ? (p.rootZ ?? 0) : rx);
  // +x here tips the top of the spine toward +z, which is forward.
  rig.spine.rotation.set(torsoA * D2R, (p.twist ?? 0) * D2R, 0);
  rig.neck.rotation.x = -(p.neck ?? 0) * D2R;

  for (const side of ['l', 'r']) {
    const a = rig.arms[side];
    // Only genuinely one-sided exercises get the far-arm offsets; otherwise
    // both hands are on the same bar and must stay together.
    const far = asym && side === 'l';
    /*
     * *3d fields override the 2D angles where a movement needs different
     * numbers once real depth exists.
     *
     * `shoulder` is authored as an ABSOLUTE angle from vertical (that is what
     * the 2D rig means by it), but the arm hangs off the spine here, so the
     * torso lean has to be added back in or every bent-over lift ends up with
     * its arms swinging out behind the figure.
     */
    const shoulderAbs = (p.shoulder3d ?? p.shoulder ?? 0) + (far ? (p.farShoulder ?? 0) : 0);
    const flex = torsoA + shoulderAbs;
    const abd = (p.abduct3d ?? p.abduct ?? 0) + (p.armFlare ?? 0);
    const elb = (p.elbow3d ?? p.elbow ?? 0) + (far ? (p.farElbow ?? 0) : 0);

    a.shoulder.rotation.set(-flex * D2R, (p.shoulderTwist ?? 0) * D2R * a.sx, abd * D2R * a.sx);
    if (frontal) {
      a.upper.rotation.set(0, 0, 0);
      a.fore.rotation.set(0, 0, elb * D2R * a.sx);
    } else {
      a.upper.rotation.set(0, 0, 0);
      a.fore.rotation.set(-elb * D2R, 0, 0);
    }
    a.hand.rotation.set(0, 0, 0);

    // hip3d / knee3d override the 2D angles. Seated front-view poses fake
    // depth by shortening the thigh (thighK), which is meaningless in 3D —
    // those poses carry real joint angles here instead.
    const hipA = p.hip3d ?? p.hip ?? 0;
    const kneeA = p.knee3d ?? p.knee ?? 0;
    const l = rig.legs[side];
    l.hip.rotation.set(-hipA * D2R, 0, (p.stance ?? 3) * D2R * l.sx);
    l.shin.rotation.x = kneeA * D2R;
    l.foot.rotation.x = (hipA - kneeA + (p.ankle ?? 0)) * D2R;
  }
}

/** Light up the regions an exercise trains; everything else stays hidden. */
export function setMuscles(rig, primary, secondary = []) {
  for (const [key, entry] of Object.entries(rig.muscles)) {
    const on = key === primary || secondary.includes(key);
    const isPrimary = key === primary;
    if (!entry.def.deltoid) entry.group.visible = on;
    for (const m of entry.meshes) {
      m.visible = on;
      m.material = isPrimary ? rig.materials.muscle : rig.materials.muscleDim;
    }
  }
  rig.primary = primary;
}
