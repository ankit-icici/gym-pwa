# Gym — Train with intent

An installable PWA that lists gym exercises by muscle group, animates every
movement, names the muscle each one trains, and builds a six-exercise day for a
muscle group in one tap.

Currently shipping the **Back** group: 24 exercises across 6 target areas,
each demonstrated with real photography.

## What it does

- **Browse by muscle.** Exercises are grouped under the muscle they actually
  train — Latissimus Dorsi, Rhomboids & Mid-Traps, Trapezius, Erector Spinae,
  Teres, Posterior Deltoid — and filterable by equipment.
- **Real demonstrations.** Every exercise is shown by a real lifter — the
  starting position and the peak of the rep, cross-faded on a loop. Tap the
  photo to step between positions and study them. Photography is from the
  public-domain [free-exercise-db](https://github.com/yuhonas/free-exercise-db).
- **Anatomy map.** Each exercise highlights the muscle it trains on a body map,
  named the way trainers say it — lats, upper back, traps, lower back, upper
  lats, rear delts — plus what it also works.
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
index.html            app shell
manifest.webmanifest  PWA manifest
sw.js                 service worker (offline shell, photos included)
css/app.css           design tokens + all styling
js/app.js             router, screens, demo player, workout generator, theme
js/anatomy.js         posterior-view muscle map + gym-name registry
js/data/back.js       the Back muscle group
img/demo/             demonstration photos (public domain, free-exercise-db)
tools-make-icons.mjs  regenerates the PNG icons from source
```

See `CLAUDE.md` for the pose angle convention and how to add a muscle group.
