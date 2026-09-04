/*
 * three/kit3d.js — 3D gym equipment, composed the same way as the 2D kit.
 *
 * A "part" is (ctx) => update(rig) | void, where ctx carries the scene group
 * and the shared materials. Anything held in the hands reads the hand bones'
 * world positions each frame, so a barbell tracks the lift instead of being
 * animated separately.
 */

import * as THREE from '../../vendor/three.module.min.js';

const PI = Math.PI;

/* ---------- primitives ---------- */

export function box(ctx, w, h, d, x, y, z, mat = 'frame') {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), ctx.mat[mat]);
  m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  ctx.group.add(m);
  return m;
}

export function tube(ctx, r, len, mat = 'steel') {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 16), ctx.mat[mat]);
  m.castShadow = true;
  ctx.group.add(m);
  return m;
}

/** A post between two points — the workhorse for machine frames. */
export function strut(ctx, from, to, r = 3.4, mat = 'frame') {
  const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
  const len = a.distanceTo(b);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 12), ctx.mat[mat]);
  m.position.copy(a).lerp(b, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  m.castShadow = true;
  ctx.group.add(m);
  return m;
}

/* ---------- parts ---------- */

/** A barbell held in both hands, oriented along the line between them. */
export const barbell3d = ({ len = 150, plateR = 24, plates = true } = {}) => (ctx) => {
  const g = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, len, 14), ctx.mat.steel);
  shaft.rotation.z = PI / 2;
  shaft.castShadow = true;
  g.add(shaft);
  if (plates) {
    for (const s of [-1, 1]) {
      for (const [off, r] of [[0.30, plateR], [0.36, plateR * 0.72]]) {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 5.5, 26), ctx.mat.plate);
        p.rotation.z = PI / 2;
        p.position.x = s * len * off;
        p.castShadow = true;
        g.add(p);
      }
    }
  }
  ctx.group.add(g);
  return (rig) => alignBetweenHands(g, rig);
};

/** A wide pulldown bar, cranked ends and all. */
export const latBar3d = ({ len = 118 } = {}) => (ctx) => {
  const g = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, len, 14), ctx.mat.steel);
  shaft.rotation.z = PI / 2;
  g.add(shaft);
  for (const s of [-1, 1]) {
    const end = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 24, 12), ctx.mat.steel);
    end.position.set(s * len / 2, -9, 0);
    end.rotation.z = s * 0.75;
    g.add(end);
  }
  g.traverse((n) => { if (n.isMesh) n.castShadow = true; });
  ctx.group.add(g);
  return (rig) => alignBetweenHands(g, rig);
};

/** A short row / face-pull handle. */
export const handle3d = ({ len = 34, axis = 'x' } = {}) => (ctx) => {
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, len, 12), ctx.mat.steel);
  if (axis === 'x') m.rotation.z = PI / 2;
  m.castShadow = true;
  g.add(m);
  ctx.group.add(g);
  return (rig) => alignBetweenHands(g, rig, axis === 'x');
};

/** One dumbbell per hand. */
export const dumbbells3d = ({ r = 13, hands = 'both' } = {}) => (ctx) => {
  const made = (hands === 'both' ? ['l', 'r'] : [hands]).map((side) => {
    const g = new THREE.Group();
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 34, 12), ctx.mat.steel);
    bar.rotation.z = PI / 2;
    g.add(bar);
    for (const s of [-1, 1]) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 9, 22), ctx.mat.plate);
      p.rotation.z = PI / 2;
      p.position.x = s * 13;
      g.add(p);
    }
    g.traverse((n) => { if (n.isMesh) n.castShadow = true; });
    ctx.group.add(g);
    return [side, g];
  });
  return (rig) => {
    for (const [side, g] of made) {
      rig.arms[side].hand.getWorldPosition(g.position);
      // Keep the handle across the palm rather than along the forearm.
      const q = new THREE.Quaternion();
      rig.arms[side].hand.getWorldQuaternion(q);
      g.quaternion.copy(q);
    }
  };
};

/** A fixed overhead bar. */
export const pullupBar3d = ({ y = 210, len = 150 } = {}) => (ctx) => {
  const bar = tube(ctx, 3, len);
  bar.rotation.z = PI / 2;
  bar.position.y = y;
  for (const s of [-1, 1]) {
    strut(ctx, [s * len / 2, y, 0], [s * len / 2, y + 26, 0], 3);
    strut(ctx, [s * len / 2, y + 26, 0], [s * (len / 2 + 4), y + 26, -70], 3);
  }
};

/** A weight stack with an upright and a pulley, plus a cable to the hands. */
export const cable3d = ({ pulley = [0, 200, -60], post = [-90, 0, -60], attach = 'hands' } = {}) => (ctx) => {
  const [px, py, pz] = pulley;
  const [ox, , oz] = post;
  strut(ctx, [ox, 0, oz], [ox, py + 8, oz], 5);
  // Top run out to the pulley, in whichever direction it is offset.
  if (Math.hypot(px - ox, pz - oz) > 6) strut(ctx, [ox, py + 8, oz], [px, py + 8, pz], 4);

  const stack = box(ctx, 34, 118, 30, ox, 60, oz, 'stack');
  stack.receiveShadow = true;
  for (let i = 0; i < 7; i++) {
    box(ctx, 35, 2, 31, ox, 8 + i * 16, oz, 'frame');
  }
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(6, 2, 8, 18), ctx.mat.steel);
  wheel.position.set(px, py, pz);
  wheel.rotation.y = PI / 2;
  ctx.group.add(wheel);

  // The cable is redrawn every frame between the pulley and the hands.
  const cable = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 6), ctx.mat.steel);
  ctx.group.add(cable);
  const a = new THREE.Vector3(px, py, pz), b = new THREE.Vector3();
  return (rig) => {
    if (attach === 'hands') {
      const l = new THREE.Vector3(), r = new THREE.Vector3();
      rig.arms.l.hand.getWorldPosition(l);
      rig.arms.r.hand.getWorldPosition(r);
      b.copy(l).add(r).multiplyScalar(0.5);
    } else {
      rig.arms[attach].hand.getWorldPosition(b);
    }
    const len = a.distanceTo(b) || 1;
    cable.position.copy(a).lerp(b, 0.5);
    cable.scale.y = len;
    cable.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  };
};

/** A padded bench or seat. `tilt` inclines it for chest-supported work. */
export const bench3d = ({ x = 0, y = 46, z = 0, w = 60, len = 120, tilt = 0, legs = true } = {}) => (ctx) => {
  const pad = box(ctx, w, 12, len, x, y, z, 'pad');
  pad.rotation.x = tilt * Math.PI / 180;
  if (legs) {
    for (const s of [-1, 1]) {
      strut(ctx, [x, 0, z + s * len * 0.34], [x, y - 6, z + s * len * 0.34], 4);
      box(ctx, w * 0.9, 4, 12, x, 2, z + s * len * 0.34, 'frame');
    }
  }
  return null;
};

/** An upright chest / back pad. */
export const padUpright3d = ({ x = 0, y = 110, z = -30, w = 54, h = 60, d = 14, tilt = 0 } = {}) => (ctx) => {
  const m = box(ctx, w, h, d, x, y, z, 'pad');
  m.rotation.x = tilt * Math.PI / 180;
  return null;
};

/** A thigh restraint pad, the bar across your legs on a pulldown. */
export const thighPad3d = ({ y = 66, z = 26, w = 62 } = {}) => (ctx) => {
  box(ctx, w, 13, 24, 0, y, z, 'pad');
  for (const s of [-1, 1]) strut(ctx, [s * w * 0.4, y - 6, z], [s * w * 0.4, 46, z - 26], 3.4);
  return null;
};

/** Arbitrary machine frame runs. */
export const frame3d = (segments, r = 3.6) => (ctx) => {
  for (const [a, b] of segments) strut(ctx, a, b, r);
  return null;
};

/** A foot brace to push against on seated rows. */
export const footPlate3d = ({ x = 0, y = 26, z = 78, tilt = -14 } = {}) => (ctx) => {
  const m = box(ctx, 54, 46, 8, x, y, z, 'pad');
  m.rotation.x = tilt * Math.PI / 180;
  return null;
};

/* ---------- shared helpers ---------- */

const _l = new THREE.Vector3(), _r = new THREE.Vector3(), _mid = new THREE.Vector3();

/**
 * Put an object at the midpoint of the hands and, when it is a long bar,
 * rotate it to lie along the line joining them.
 */
function alignBetweenHands(obj, rig, orient = true) {
  rig.arms.l.hand.getWorldPosition(_l);
  rig.arms.r.hand.getWorldPosition(_r);
  _mid.copy(_l).add(_r).multiplyScalar(0.5);
  obj.position.copy(_mid);
  if (!orient) return;
  const dir = _l.clone().sub(_r);
  if (dir.lengthSq() < 1) return;
  obj.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir.normalize());
}

/** Bundle parts into the scene builder a viewer expects. */
export function scene3d(parts) {
  return (ctx) => {
    const updates = parts.map((p) => p(ctx)).filter(Boolean);
    return (rig) => { for (const f of updates) f(rig); };
  };
}

/** A barbell racked across the traps (squats, good mornings). */
export const barOnBack3d = ({ len = 150, plateR = 22 } = {}) => (ctx) => {
  const g = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, len, 14), ctx.mat.steel);
  shaft.rotation.z = PI / 2;
  g.add(shaft);
  for (const s of [-1, 1]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(plateR, plateR, 6, 24), ctx.mat.plate);
    p.rotation.z = PI / 2;
    p.position.x = s * len * 0.32;
    g.add(p);
  }
  g.traverse((n) => { if (n.isMesh) n.castShadow = true; });
  ctx.group.add(g);
  const v = new THREE.Vector3(), q = new THREE.Quaternion();
  return (rig) => {
    // Sit it on the shoulder girdle, a little behind the neck.
    rig.spine.getWorldQuaternion(q);
    v.set(0, SEG_TORSO * 0.9, -16).applyQuaternion(q);
    rig.pelvis.getWorldPosition(g.position);
    g.position.add(v);
    g.quaternion.copy(q);
  };
};
const SEG_TORSO = 62;

/** One dumbbell cupped in both hands (pullovers, goblet work). */
export const sharedDumbbell3d = ({ r = 15 } = {}) => (ctx) => {
  const g = new THREE.Group();
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 30, 12), ctx.mat.steel);
  bar.rotation.z = PI / 2;
  g.add(bar);
  for (const s of [-1, 1]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 10, 22), ctx.mat.plate);
    p.rotation.z = PI / 2;
    p.position.x = s * 14;
    g.add(p);
  }
  g.traverse((n) => { if (n.isMesh) n.castShadow = true; });
  ctx.group.add(g);
  return (rig) => alignBetweenHands(g, rig);
};

/** Pec-deck style lever arms running from a pivot out to each hand. */
export const leverArms3d = ({ pivot = [0, 176, -34] } = {}) => (ctx) => {
  const rods = [];
  for (let i = 0; i < 2; i++) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 1, 10), ctx.mat.frame);
    m.castShadow = true;
    ctx.group.add(m);
    rods.push(m);
  }
  const a = new THREE.Vector3(...pivot), b = new THREE.Vector3();
  return (rig) => {
    [rig.arms.l, rig.arms.r].forEach((arm, i) => {
      arm.hand.getWorldPosition(b);
      const len = a.distanceTo(b) || 1;
      rods[i].position.copy(a).lerp(b, 0.5);
      rods[i].scale.y = len;
      rods[i].quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    });
  };
};
