# Gym — Train with intent

An installable PWA that lists gym exercises by muscle group, animates every
movement, names the muscle each one trains, and builds a six-exercise day for a
muscle group in one tap.

Currently shipping the **Back** group: 24 exercises across 6 target areas.

## What it does

- **Browse by muscle.** Exercises are grouped under the muscle they actually
  train — Latissimus Dorsi, Rhomboids & Mid-Traps, Trapezius, Erector Spinae,
  Teres, Posterior Deltoid — and filterable by equipment.
- **Animated demonstrations.** Every exercise has a looping figure animation
  drawn from hand-authored keyframe poses, plus the gym equipment it uses. No
  video files, no network calls: it is all SVG driven by one rAF loop.
- **Anatomy map.** Each exercise shows a posterior-view body with the primary
  muscle lit up and named, and its secondary muscles shaded.
- **Build a day.** One tap picks six exercises — exactly one per target area —
  so a generated session always covers the whole muscle group. Tick them off,
  swap any slot for another exercise hitting the same muscle, or rebuild.
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
manifest.webmanifest    PWA manifest
sw.js                   service worker (offline shell)
css/app.css             design tokens + all styling
js/app.js               router, screens, workout generator, theme
js/rig.js               skeletal figure engine (poses -> SVG)
js/equipment.js         composable gym equipment parts
js/anatomy.js           posterior-view muscle map
js/data/back.js         the Back muscle group
tools-make-icons.mjs    regenerates the PNG icons from source
debug.html              dev-only pose contact sheet
```

See `CLAUDE.md` for the pose angle convention and how to add a muscle group.
