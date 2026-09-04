/*
 * three/viewer.js — the 3D exercise viewer.
 *
 * One WebGL renderer is shared across the whole app and moved between mounts,
 * because browsers cap the number of live WebGL contexts and exercise detail
 * screens come and go constantly.
 *
 * Drag (or swipe) orbits the camera. Being able to look at a lift from any
 * angle is the entire reason this view exists — a fixed camera hides exactly
 * the detail you need for form.
 */

import * as THREE from '../../vendor/three.module.min.js';
import { buildFigure, applyPose, setMuscles, SEG } from './figure.js';
import { samplePoses, contraction } from '../rig.js';

const D2R = Math.PI / 180;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/*
 * Camera presets. Azimuth 0 looks at the figure's front, 180 at its back.
 *
 * The default is a REAR three-quarter: for back training that is the one angle
 * that shows the movement path and the working muscle at the same time. A
 * front view hides every muscle in the app.
 */
export const ANGLES = {
  hero:  { az: 148, el: 12 },
  back:  { az: 180, el: 10 },
  side:  { az: 92,  el: 8 },
  front: { az: 4,   el: 8 },
  top:   { az: 152, el: 54 },
};
export const ANGLE_ORDER = ['hero', 'side', 'back', 'front', 'top'];
export const ANGLE_LABEL = { hero: '3/4', side: 'Side', back: 'Back', front: 'Front', top: 'Top' };

/* Read the live theme colours so the scene matches the app in both modes. */
function themeColours() {
  const cs = getComputedStyle(document.documentElement);
  const get = (n, fallback) => (cs.getPropertyValue(n) || fallback).trim();
  return {
    bg: get('--surface-2', '#1A1D22'),
    body: get('--fig-body', '#B9C0CB'),
    accent: get('--accent', '#FF7A45'),
    equip: get('--equip', '#454C58'),
    equipSolid: get('--equip-solid', '#7D8593'),
    dark: document.documentElement.getAttribute('data-theme') === 'dark'
      || (!document.documentElement.getAttribute('data-theme')
          && matchMedia('(prefers-color-scheme: dark)').matches),
  };
}

let shared = null;

function getRenderer() {
  if (shared) return shared;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  shared = { renderer, canvas: renderer.domElement };
  return shared;
}

/**
 * Mount a 3D view of `exercise` into `host`.
 * Returns { setTime, setAngle, dispose, resize }.
 */
export function createViewer(host, exercise, opts = {}) {
  const { renderer, canvas } = getRenderer();
  const C = themeColours();

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 10, 2000);

  const mat = {
    body: new THREE.MeshStandardMaterial({ color: C.body, roughness: 0.72, metalness: 0.02 }),
    // polygonOffset keeps the thin shells from z-fighting the body underneath.
    muscle: new THREE.MeshStandardMaterial({
      color: C.accent, roughness: 0.5, metalness: 0.05, side: THREE.DoubleSide,
      emissive: new THREE.Color(C.accent), emissiveIntensity: 0.22,
      polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3,
    }),
    // Secondary muscles stay faint on purpose: at full strength they smear
    // most of the back in orange and you lose the one that actually matters.
    muscleDim: new THREE.MeshStandardMaterial({
      color: C.accent, roughness: 0.85, side: THREE.DoubleSide,
      transparent: true, opacity: 0.22, depthWrite: false,
      polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3,
    }),
    frame: new THREE.MeshStandardMaterial({ color: C.equip, roughness: 0.55, metalness: 0.35 }),
    steel: new THREE.MeshStandardMaterial({ color: C.equipSolid, roughness: 0.35, metalness: 0.6 }),
    plate: new THREE.MeshStandardMaterial({ color: C.equipSolid, roughness: 0.6, metalness: 0.25 }),
    pad: new THREE.MeshStandardMaterial({ color: C.equip, roughness: 0.9, metalness: 0 }),
    stack: new THREE.MeshStandardMaterial({ color: C.equip, roughness: 0.7, metalness: 0.2 }),
  };

  // Lighting. The sun is fixed overhead so the contact shadow stays put, while
  // a second key light follows the camera — otherwise orbiting round the back
  // of the figure would leave you staring at an unlit silhouette.
  scene.add(new THREE.HemisphereLight(0xffffff, C.dark ? 0x14171c : 0xc8ccd4, C.dark ? 1.05 : 1.0));
  const sun = new THREE.DirectionalLight(0xffffff, C.dark ? 0.95 : 1.15);
  sun.position.set(-120, 340, 120);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  const d = 200;
  Object.assign(sun.shadow.camera, { left: -d, right: d, top: d, bottom: -d, near: 40, far: 800 });
  sun.shadow.bias = -0.0022;
  scene.add(sun);
  const key = new THREE.DirectionalLight(0xffffff, C.dark ? 0.95 : 1.0);
  scene.add(key, key.target);

  // Ground: catches the contact shadow that tells you where the floor is.
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(300, 48),
    new THREE.ShadowMaterial({ opacity: C.dark ? 0.42 : 0.18 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  const disc = new THREE.Mesh(
    new THREE.RingGeometry(0, 250, 56),
    new THREE.MeshBasicMaterial({ color: C.bg, transparent: true, opacity: C.dark ? 0.55 : 0.75 }),
  );
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = -0.6;
  scene.add(disc);

  const rig = buildFigure(mat);
  scene.add(rig.root);
  setMuscles(rig, exercise.target, exercise.secondary ?? []);

  const kitGroup = new THREE.Group();
  scene.add(kitGroup);
  const build = opts.scene3d ?? exercise.scene3d;
  const updateKit = build ? build({ group: kitGroup, mat, THREE }) : null;

  /* ---------- camera + orbit ---------- */
  const view = exercise.view3d ?? 'hero';
  let az = (ANGLES[view] ?? ANGLES.hero).az;
  let el = (ANGLES[view] ?? ANGLES.hero).el;

  /*
   * Frame the shot from the figure itself rather than hand-tuning a camera per
   * exercise. The body is sampled across a whole rep and the camera pulled
   * back to fit that, deliberately ignoring the equipment: fitting a pulldown
   * tower or a squat rack would shrink the person to nothing, and cropping
   * the machine is what real exercise footage does anyway.
   */
  const bounds = new THREE.Box3();
  for (let i = 0; i <= 10; i++) {
    applyPose(rig, samplePoses(exercise.poses, i / 10), {
      elbowPlane: exercise.elbowPlane ?? (exercise.view === 'front' ? 'frontal' : 'sagittal'),
      depthAxis: exercise.view === 'front' ? 'x' : 'z',
      asymmetric: exercise.asymmetric,
    });
    rig.root.updateMatrixWorld(true);
    bounds.expandByObject(rig.root);
  }
  const size = bounds.getSize(new THREE.Vector3());
  const target = bounds.getCenter(new THREE.Vector3());
  target.y = Math.max(target.y, size.y * 0.42);
  const radius = Math.max(size.x, size.y, size.z * 0.8) * 0.5;
  const dist = exercise.camDist
    ?? (radius / Math.sin((camera.fov * D2R) / 2)) * 1.28;

  function placeCamera() {
    const a = az * D2R, e = el * D2R;
    camera.position.set(
      target.x + dist * Math.cos(e) * Math.sin(a),
      target.y + dist * Math.sin(e),
      target.z + dist * Math.cos(e) * Math.cos(a),
    );
    camera.lookAt(target);
    // Park the key light up and to the left of wherever the camera now is.
    key.position.copy(camera.position).multiplyScalar(0.9);
    key.position.y += 160;
    key.target.position.copy(target);
    key.target.updateMatrixWorld();
  }
  placeCamera();

  let drag = null;
  const pt = (ev) => (ev.touches ? ev.touches[0] : ev);
  const onDown = (ev) => {
    drag = { x: pt(ev).clientX, y: pt(ev).clientY, az, el };
    host.setPointerCapture?.(ev.pointerId);
  };
  const onMove = (ev) => {
    if (!drag) return;
    const p = pt(ev);
    az = drag.az - (p.clientX - drag.x) * 0.42;
    el = clamp(drag.el + (p.clientY - drag.y) * 0.30, -18, 72);
    placeCamera();
    ev.preventDefault();
  };
  const onUp = () => { drag = null; };
  host.addEventListener('pointerdown', onDown);
  host.addEventListener('pointermove', onMove, { passive: false });
  addEventListener('pointerup', onUp);
  addEventListener('pointercancel', onUp);

  /* ---------- mount ---------- */
  host.appendChild(canvas);
  canvas.style.cssText = 'width:100%;height:100%;display:block;touch-action:none;cursor:grab';

  function resize() {
    const w = host.clientWidth || 320, h = host.clientHeight || 320;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  function setTime(u) {
    const pose = samplePoses(exercise.poses, u);
    applyPose(rig, pose, {
      elbowPlane: exercise.elbowPlane ?? (exercise.view === 'front' ? 'frontal' : 'sagittal'),
      depthAxis: exercise.view === 'front' ? 'x' : 'z',
      asymmetric: exercise.asymmetric,
    });
    rig.root.updateMatrixWorld(true);
    if (updateKit) updateKit(rig);
    // The trained muscle glows brighter as the rep reaches peak contraction.
    mat.muscle.emissiveIntensity = 0.10 + 0.42 * contraction(u);
    renderer.render(scene, camera);
  }

  // Always paint one frame. The shared clock does not start while the tab is
  // hidden or motion is reduced, and without this the canvas would just sit
  // there blank in both of those perfectly ordinary cases.
  setTime(0);

  return {
    setTime,
    resize,
    setAngle(name) {
      const a = ANGLES[name];
      if (!a) return;
      az = a.az; el = a.el;
      placeCamera();
    },
    get angle() { return { az, el }; },
    dispose() {
      // The renderer's canvas is shared app-wide, so only detach it if this
      // viewer is still the one holding it.
      if (canvas.parentNode === host) canvas.remove();
      ro.disconnect();
      host.removeEventListener('pointerdown', onDown);
      host.removeEventListener('pointermove', onMove);
      removeEventListener('pointerup', onUp);
      removeEventListener('pointercancel', onUp);
      scene.traverse((n) => {
        if (n.isMesh) {
          n.geometry?.dispose();
          const m = n.material;
          (Array.isArray(m) ? m : [m]).forEach((x) => x?.dispose?.());
        }
      });
    },
  };
}
