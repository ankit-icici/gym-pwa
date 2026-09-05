# The Forge — Train with intent

**Live:** https://ankit-icici.github.io/gym-pwa/ · **Hosting:** GitHub Pages
from `main` branch root — push to deploy, no build step, no CI.

If you are an AI assistant picking this project up, read `CLAUDE.md` first.


**The Forge** — an installable PWA that lists gym exercises by muscle group,
demonstrates every movement with real photography, names the muscle each one
trains, and builds an ordered training day in one tap.

All six muscle groups are live — **217 exercises**, at least 10 per target
area, every one demonstrated with real photography and placed only under the
muscle it primarily trains:

| Group | Areas | Exercises |
| --- | --- | --- |
| Back | Lats · Upper Back · Lower Back · Rear Delts | 45 |
| Chest | Mid · Upper · Lower | 30 |
| Shoulders | Front Delts · Side Delts · Traps | 33 |
| Arms | Biceps · Triceps · Forearms | 33 |
| Legs | Quads · Hamstrings · Glutes · Calves | 44 |
| Core | Lower Abs · Upper Abs · Obliques | 32 |

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
- **Build a day, in order.** One tap covers every target area and numbers the
  exercises in the sequence to perform them: heavy compounds anchor each
  muscle, isolation follows, and a 6-exercise back day gets two lat movements
  and two rows the way a real session is programmed. Arm day follows a fixed
  plan — 4 biceps, 3 triceps, 2 forearms, alternating. Tick them off, swap any
  slot within the same muscle, or rebuild.
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
