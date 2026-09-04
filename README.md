# Gym — Train with intent

An installable PWA that lists gym exercises by muscle group, animates every
movement, names the muscle each one trains, and builds a six-exercise day for a
muscle group in one tap.

Currently shipping the **Back** group: 24 exercises across 6 target areas.

## What it does

- **Browse by muscle.** Exercises are grouped under the muscle they actually
  train — Latissimus Dorsi, Rhomboids & Mid-Traps, Trapezius, Erector Spinae,
  Teres, Posterior Deltoid — and filterable by equipment.
- **3D demonstrations you can rotate.** Open any exercise and the movement plays
  on an articulated 3D figure with the gym equipment around it. Drag to orbit,
  or jump to a preset angle — 3/4, side, back, front, top — so you can check
  form from wherever it is actually visible. Cards and workout rows keep fast
  2D SVG animations, since browsers cap how many live 3D scenes can exist.
- **The muscle lights up on the body.** The trained muscle is painted onto the
  moving figure and brightens toward peak contraction, so the animation tells
  you what it works rather than just how it looks. Orange means muscle and
  nothing else — the equipment stays monochrome.
- **Anatomy map.** The detail screen also shows a posterior-view body with the
  primary muscle named and its secondary muscles shaded.
- **Build a day.** One tap picks one exercise per target area, so a generated
  session always covers the whole muscle group. Choose 4, 5 or 6 exercises;
  shorter sessions trim the lowest-priority areas. Tick them off, swap any slot
  for another exercise hitting the same muscle, or rebuild.
- **Works offline, installs to the home screen, light and dark themes.**

## Running it locally

No build step, no dependencies. Any static server works:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`. For development prefer a server that sends
`Cache-Control: no-store`, or the browser will hold on to the ES modules.

`debug.html` is a contact sheet showing every exercise at its start and peak
keyframe — the fastest way to check poses after editing them. It accepts
`?only=id,id` and `?cell=440`.

## Deploying

Static hosting only. This repo is set up for GitHub Pages serving from the
default branch root — push and it publishes. `sw.js` uses stale-while-revalidate,
so a deploy reaches installed devices on their next launch.

## Layout

```
index.html              app shell
vendor/three.module.min.js  three.js r168 (MIT), vendored so the app works offline
manifest.webmanifest    PWA manifest
sw.js                   service worker (offline shell)
css/app.css             design tokens + all styling
js/app.js               router, screens, workout generator, theme
js/rig.js               skeletal figure engine (poses -> SVG)
js/equipment.js         composable gym equipment parts
js/anatomy.js           posterior-view muscle map
js/data/back.js         the Back muscle group
js/data/back3d.js       3D equipment scenes for it (imports three.js)
js/three/figure.js      3D articulated mannequin + muscle patches
js/three/kit3d.js       composable 3D gym equipment
js/three/viewer.js      3D scene, camera, orbit, auto-framing
tools-make-icons.mjs    regenerates the PNG icons from source
debug.html              dev-only pose contact sheet (2D)
debug3d.html            dev-only 3D bench, ?id=<exercise-id>
```

See `CLAUDE.md` for the pose angle convention and how to add a muscle group.
