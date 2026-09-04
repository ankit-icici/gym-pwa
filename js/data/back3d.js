/*
 * data/back3d.js — 3D gym scenes for the Back group.
 *
 * Kept apart from data/back.js on purpose: this module pulls in three.js, and
 * the browse screens (which only draw SVG thumbnails) must never pay that
 * 685 KB. The detail screen imports it lazily.
 *
 * COORDINATES. Poses were authored in 2D, so equipment positions convert as:
 *   side-view exercise:   2D (x, y)  ->  3D (0, -y,  x)     +x was "forward"
 *   front-view exercise:  2D (x, y)  ->  3D (x, -y,  0)     +x was lateral
 * The figure always faces +Z and the floor is y = 0.
 */

import {
  scene3d, barbell3d, barOnBack3d, sharedDumbbell3d, dumbbells3d, latBar3d,
  handle3d, pullupBar3d, cable3d, bench3d, padUpright3d, thighPad3d,
  frame3d, footPlate3d, leverArms3d,
} from '../three/kit3d.js';

/* A pulldown tower: overhead pulley on a post behind the seat. */
const pulldownTower = () => [
  cable3d({ pulley: [0, 196, -6], post: [0, 0, -98] }),
  bench3d({ y: 46, z: -6, w: 54, len: 62 }),
  thighPad3d({ y: 66, z: 26, w: 68 }),
];

/* A seated row station: low pulley out front, seat and foot brace. */
const rowStation = (pulleyY = 26) => [
  cable3d({ pulley: [0, pulleyY, 88], post: [0, 0, 106] }),
  bench3d({ y: 40, z: -8, w: 52, len: 78 }),
  footPlate3d({ z: 66, y: 24, tilt: 14 }),
];

export const SCENES = {
  /* ---- lats ---- */
  'lat-pulldown': scene3d([...pulldownTower(), latBar3d({ len: 116 })]),

  'pull-up': scene3d([pullupBar3d({ y: 172, len: 150 })]),

  'straight-arm-pulldown': scene3d([
    cable3d({ pulley: [0, 170, 70], post: [0, 0, 94] }),
    handle3d({ len: 32 }),
  ]),

  'dumbbell-pullover': scene3d([
    bench3d({ y: 40, z: -14, w: 54, len: 124 }),
    sharedDumbbell3d({ r: 15 }),
  ]),

  /* ---- rhomboids / mid-back ---- */
  'seated-cable-row': scene3d([...rowStation(26), handle3d({ len: 26 })]),

  'bent-over-barbell-row': scene3d([barbell3d({ len: 152, plateR: 23 })]),

  't-bar-row': scene3d([
    padUpright3d({ y: 84, z: 58, w: 44, h: 58, d: 13, tilt: -34 }),
    frame3d([
      [[0, 56, 58], [0, 4, 58]],          // pad support
      [[0, 4, 20], [0, 4, 78]],           // floor rail
      [[0, 4, -46], [0, 32, 26]],         // landmine sleeve
    ]),
    barbell3d({ len: 62, plateR: 20 }),
  ]),

  'single-arm-dumbbell-row': scene3d([
    bench3d({ x: 30, y: 38, z: 34, w: 46, len: 104 }),
    dumbbells3d({ hands: 'r', r: 13 }),
  ]),

  /* ---- traps ---- */
  'barbell-shrug': scene3d([barbell3d({ len: 152, plateR: 22 })]),
  'dumbbell-shrug': scene3d([dumbbells3d({ r: 12 })]),

  'cable-upright-row': scene3d([
    cable3d({ pulley: [0, 18, 24], post: [0, 0, -96] }),
    barbell3d({ len: 78, plateR: 12, plates: false }),
  ]),

  'farmers-carry': scene3d([dumbbells3d({ r: 15 })]),

  /* ---- erectors / lower back ---- */
  'deadlift': scene3d([barbell3d({ len: 152, plateR: 26 })]),

  'back-extension': scene3d([
    padUpright3d({ y: 66, z: 4, w: 46, h: 24, d: 34, tilt: 45 }),
    frame3d([
      [[0, 4, 4], [0, 56, 4]],            // hip post
      [[0, 4, -26], [0, 4, 34]],          // base rail
      [[0, 56, 4], [0, 18, -42]],         // 45 degree frame
      [[0, 26, -42], [0, 4, -42]],        // ankle upright
      [[-16, 14, -40], [16, 14, -40]],    // ankle roller
      [[-16, 28, -40], [16, 28, -40]],
    ]),
  ]),

  'good-morning': scene3d([barOnBack3d({ len: 152, plateR: 22 })]),

  'rack-pull': scene3d([
    frame3d([
      [[-74, 0, 0], [-74, 150, 0]],
      [[74, 0, 0], [74, 150, 0]],
      [[-74, 48, 0], [-48, 48, 0]],
      [[74, 48, 0], [48, 48, 0]],
    ]),
    barbell3d({ len: 152, plateR: 26 }),
  ]),

  /* ---- teres ---- */
  'neutral-grip-pulldown': scene3d([...pulldownTower(), handle3d({ len: 24 })]),

  'meadows-row': scene3d([
    frame3d([[[0, 4, -96], [0, 34, -24]]]),
    barbell3d({ len: 70, plateR: 20 }),
  ]),

  'wide-grip-seated-row': scene3d([...rowStation(70), handle3d({ len: 54 })]),

  'machine-high-row': scene3d([
    padUpright3d({ y: 92, z: 38, w: 48, h: 60, d: 15 }),
    bench3d({ y: 38, z: -8, w: 52, len: 72 }),
    frame3d([
      [[0, 60, 38], [0, 4, 38]],
      [[0, 4, 0], [0, 4, 60]],
      [[-46, 154, 60], [46, 154, 60]],
      [[-46, 154, 60], [-46, 30, 62]],
      [[46, 154, 60], [46, 30, 62]],
    ]),
    handle3d({ len: 28 }),
  ]),

  /* ---- rear delts ---- */
  'reverse-pec-deck': scene3d([
    padUpright3d({ y: 106, z: 24, w: 40, h: 52, d: 12 }),
    bench3d({ y: 40, z: -4, w: 50, len: 54 }),
    frame3d([[[0, 44, 24], [0, 4, 24]], [[0, 132, 24], [0, 172, -10]]]),
    leverArms3d({ pivot: [0, 172, -10] }),
  ]),

  'face-pull': scene3d([
    cable3d({ pulley: [0, 140, 76], post: [0, 0, 94] }),
    handle3d({ len: 28 }),
  ]),

  'chest-supported-rear-fly': scene3d([
    padUpright3d({ y: 102, z: 26, w: 46, h: 60, d: 14, tilt: -12 }),
    frame3d([[[0, 56, 26], [0, 4, 26]], [[-26, 4, 26], [26, 4, 26]]]),
    dumbbells3d({ r: 11 }),
  ]),

  'reverse-cable-fly': scene3d([
    cable3d({ pulley: [-74, 142, -18], post: [-98, 0, -28], attach: 'l' }),
    cable3d({ pulley: [74, 142, -18], post: [98, 0, -28], attach: 'r' }),
  ]),
};
