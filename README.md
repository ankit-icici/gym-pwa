# The Forge — Train with intent

**Live:** https://ankit-icici.github.io/gym-pwa/ · **Hosting:** GitHub Pages
from `main` branch root — push to deploy, no build step, no CI.

If you are an AI assistant picking this project up, read `CLAUDE.md` first.


**The Forge** — an installable PWA that lists gym exercises by muscle group,
demonstrates every movement with real photography, names the muscle each one
trains, and builds an ordered training day in one tap.

All six muscle groups are live — **219 exercises**, at least 10 per target
area, every one demonstrated with real photography and placed only under the
muscle it primarily trains:

| Group | Areas | Exercises |
| --- | --- | --- |
| Back | Lats · Upper Back · Lower Back · Rear Delts | 45 |
| Chest | Mid · Upper · Lower | 30 |
| Shoulders | Front Delts · Side Delts · Traps | 33 |
| Arms | Biceps · Triceps · Forearms | 33 |
| Legs | Quads · Hamstrings · Glutes · Calves | 44 |
| Core | Lower Abs · Upper Abs · Obliques | 34 |

## What it does

- **Browse by muscle.** Exercises are grouped under the muscle they actually
  train, named the way trainers say it — Lats, Upper Back, Lower Back, Rear
  Delts, Traps, Quads — and filterable by equipment.
- **Real demonstrations.** Every exercise is shown by a real lifter — the
  starting position and the peak of the rep, cross-faded on a loop. Tap the
  photo to step between positions and study them. Photography is from the
  public-domain [free-exercise-db](https://github.com/yuhonas/free-exercise-db).
- **Anatomy map.** Each exercise highlights the muscle it trains on a body map
  — front view for chest, biceps, quads and abs, back view for lats, glutes and
  hamstrings — plus what it also works.
- **Build a day, the way a trainer would.** One tap covers every target area
  and numbers the exercises in the order to perform them: the heavy compounds
  first while you are fresh — a back day that draws a deadlift opens on it —
  then accessory work. Each muscle opens with a compound and follows it with
  isolation, squat then leg extension, bench then fly, unless it is a muscle
  trained by isolation in the first place, where the lateral raise leads and no
  upright row is forced in. The day is balanced across machine, barbell,
  dumbbell and cable, across rep ranges, and across the secondary muscles every
  movement borrows — so it never comes out as three pulldowns, four machines in
  a row, or a back day that puts the biceps under all six exercises.
- **Every day ends on a bodyweight movement.** Push-ups to close a chest day,
  chin-ups to close a back day — an extra "+1" on top of the length you chose,
  not one of the exercises counted against it.
- **Compound or isolation, labelled.** Every exercise says which it is, so the
  shape of the day is visible rather than implied. Tick them off, swap any slot
  for another movement that fits it, or rebuild for a genuinely different day.
- **Works offline, installs to the home screen, light and dark themes.**

## Running it locally

No build step, no dependencies. Any static server works:

```bash
npx serve -l 4173 .
```

Then open `http://localhost:4173`. (`python3 -m http.server 4173` works too,
but caches ES modules — you will need to hard-reload after every edit.)

After changing exercise data, run the rule checker:

```bash
node tools/validate.mjs
```

## Deploying

Static hosting only, from GitHub Pages on the `main` branch root — push and it
publishes, usually within 1–3 minutes. **Bump `CACHE` in `sw.js` on every
deploy**, or installed phones keep serving the old version; if you add or
remove files, regenerate the `SHELL` list there too.

## Layout

```
index.html            app shell
manifest.webmanifest  PWA manifest
sw.js                 service worker (offline shell, photos included)
css/app.css           design tokens + all styling
js/app.js             router, screens, demo player, workout generator, theme
js/anatomy.js         front + back body maps, and the gym-name registry
js/data/*.js          the six muscle groups (back, chest, shoulders, arms, legs, core)
img/demo/             438 demonstration photos (public domain, free-exercise-db)
icons/                app icons (PNG, generated)
tools/validate.mjs    checks the data against the curation rules
tools-make-icons.mjs  `node tools-make-icons.mjs icons` regenerates the PNGs
.claude/launch.json   dev-server config for editor tooling
```

See `CLAUDE.md` for the curation rules, how navigation works, and how to add a
muscle group.
