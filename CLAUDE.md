# Working on this repo

## Orientation — read this first

**The Forge** is an installable gym PWA. Everything you need is in this repo;
there is nothing on the owner's machine and no external service to configure.

| | |
| --- | --- |
| Live app | https://ankit-icici.github.io/gym-pwa/ |
| Repo | https://github.com/ankit-icici/gym-pwa (public) |
| Owner's GitHub | `ankit-icici` |
| Hosting | GitHub Pages, served from `main` branch root. **No build step, no CI.** |
| Deploy | `git push origin main`. Pages republishes in 1–3 minutes. That is the whole process. |
| Stack | Plain HTML + CSS + ES modules. No dependencies, no package.json, no bundler. |

After any change that ships files: bump `CACHE` in `sw.js` to the next number
(it is a plain `gym-vN` counter — check the file for the current value), or
installed phones keep serving the old version. If you add or
remove any shipped file — data, photos, icons, css — regenerate the `SHELL`
list in `sw.js` too. It precaches everything the app loads, and a missing
entry breaks that file offline without any visible error. `tools/validate.mjs`
cross-checks SHELL against what is actually on disk.

GitHub Pages serves with `max-age=600`, so a just-pushed change can take up to
10 minutes to reach a browser that has visited before. The service worker
precaches with `cache: 'reload'`, so a `CACHE` bump always pulls fresh files.

The app is named **The Forge** (user-chosen). The name lives in index.html
(title + apple-mobile-web-app-title), manifest.webmanifest (name/short_name)
and the home screen's `setBar` call — keep them in sync if it ever changes.

## Navigation

Routing is hash-based but driven by `history.pushState` / `popstate`, never by
assigning `location.hash`. That assignment was a real bug: the in-app back
arrow pushed a *new* entry instead of popping one, so the history stack grew
on every back tap and a phone swipe-back bounced the user forward again.

- Forward moves use `go()` (pushes an entry).
- Back moves use `goBack(parentHash)`, which calls `history.back()` when
  `history.state.depth > 0` and otherwise replaces with the parent — so a
  deep link opened cold goes to its parent screen rather than exiting the app.
- Redirects for unknown routes use `goReplace()`, so back never lands on a
  dead URL.
- In-page controls must never push history. Filters and the session-length
  selector re-render via `render()`; ticking, swapping and rebuilding call
  `screenWorkout()` directly. Clearing a day is the one exception that touches
  history at all — it calls `goReplace()`, because the workout it was showing
  no longer exists.

## The user's standing preferences

These were established over several rounds of feedback. Treat them as
constraints, not suggestions — each one replaced something they rejected.

1. **Never store project files on their Mac.** Work in a scratch directory,
   commit and push. The repo is the single source of truth so any Claude
   account can pick the project up.
2. **Demonstrations are real photographs, never procedurally drawn figures.**
   They rejected hand-built SVG animation and a hand-posed 3D mannequin,
   because hand-authored joint angles cannot guarantee correct exercise form.
3. **Gym-floor muscle names, never anatomical Latin.**
4. **No "How to do it" step lists.** Short form cues only.
5. Curation rules for exercise data — see the section below.

A static PWA with **no build step, no dependencies, no package.json** — edit the
files and reload. Keep it that way; it is what makes the project portable
across machines and sessions.

## How exercises are demonstrated — and why

Every exercise is shown as a **pair of photographs of a real lifter** — starting
position and peak — cross-faded on a loop. The pairs live at
`img/demo/<exercise-id>-0.jpg` and `-1.jpg` (a naming convention, so there is no
per-exercise wiring) and come from
[free-exercise-db](https://github.com/yuhonas/free-exercise-db), which is
public domain (Unlicense).

This is the third iteration, and the history matters if you are tempted to
change it: hand-authored SVG stick figures and then a hand-posed 3D mannequin
were both built and both rejected by the user, because **hand-authoring joint
angles cannot guarantee correct exercise form**, and form is the entire point
of a demonstration. Photographs of a real person performing the lift correctly
solve that by construction. Do not reintroduce procedurally posed figures for
demonstrations. (The removed 2D/3D rigs are in git history before commit
"Replace hand-built animation with real demonstration photos" if ever needed.)

## Product decisions that came from the user

- **Primary muscle only, no duplicates.** An exercise lives under the muscle it
  primarily trains, and appears exactly once in the whole app. Shrugs and
  upright rows were explicitly evicted from Back and now live under Traps in
  Shoulders; Farmer's Carry went to Forearms in Arms, since grip is what it
  actually trains. Do not re-add any of them to Back.
- **At least 10 exercises per region**, drawing on machine, cable, barbell,
  dumbbell and bodyweight. The enforced minimum is three distinct equipment
  types per region; some regions honestly cannot offer all five (lower abs is
  mostly bodyweight, calves have no bodyweight loading worth listing).
- **No "How to do it" steps section.** Form cues only (3 short lines each).
- **Gym-floor muscle names, never anatomical Latin.** "Lats", "Upper Back",
  "Lower Back", "Rear Delts" — see `MUSCLES` in `js/anatomy.js`. Applies to all
  user-visible text.
- Session length is selectable (4/5/6). `group.regions` is priority order; the
  generator wraps around it, so a 6-exercise day on 4 regions doubles up the
  top priorities (two lat movements, two rows) like a real back day.
- **A built day is an ordered program, not a list.** Slots are numbered and the
  region sequence is the execution order. Arms has a fixed `group.plan` from
  the user — 4 biceps, 3 triceps, 2 forearms, alternating bi/tri with grip work
  last — and plan groups hide the length selector. Each muscle's first slot
  prefers a heavy movement (target reps <= 10) so a day is always anchored by a
  press/squat/row, and within a muscle's slots low-rep work sorts before
  high-rep isolation.

## Layout

```
index.html            app shell
css/app.css           design tokens + all styling (light + dark)
js/app.js             router, screens, demo player, workout generator, theme
js/anatomy.js         front + back body maps (SVG) + the gym-name registry
js/data/<group>.js    six groups, 219 exercises, 10+ per region:
                        back 45 (lats, upper back, lower back, rear delts)
                        chest 30 (mid, upper, lower)
                        shoulders 33 (front delts, side delts, traps)
                        arms 33 (biceps, triceps, forearms — fixed 4/3/2 plan)
                        legs 44 (quads, hamstrings, glutes, calves)
                        core 34 (lower abs, upper abs, obliques)
img/demo/             demonstration photos (public domain, 720px), <id>-0/-1.jpg
manifest.webmanifest  PWA manifest (app name, icons, standalone display)
icons/                generated PNG icons (see tools-make-icons.mjs below)
tools/validate.mjs    curation-rule checker — run after any data change
tools-make-icons.mjs  `node tools-make-icons.mjs icons` — regenerates the PNGs
.claude/launch.json   dev-server config (`npx serve -l 4173 .`) for editor tooling
sw.js                 service worker; SHELL precaches every shipped file
tools-make-icons.mjs  regenerates the PNG icons from source
```

## Checking the data

```bash
node tools/validate.mjs
```

This mechanically enforces the owner's curation rules — one region per
exercise, app-wide uniqueness of ids and names, 10+ per region, at least three
equipment types per region, `equipment` values inside the filter enum, both
demonstration photos present and named by convention, cues-not-howTo, every
region named in `MUSCLES`, `PAINT_ORDER` and `REGIONS` agreeing, every field
`js/app.js` renders actually existing on the data, every shipped file present
in the `sw.js` SHELL, and the app name in sync across index.html, manifest and
app.js.

It is not exhaustive: it cannot judge whether an exercise belongs to *upper*
rather than *lower* chest, and it does not check the hard-coded counts in the
docs or the `REGISTRY`. **Run it after any data change.** It exits non-zero on
failure, so it is safe to wire into anything.

The original generator that built the six groups was session-scoped and is not
in this repo — `tools/validate.mjs` is the durable half. To extend the data,
replicate the same checks: validate each pick's dataset-declared
`primaryMuscles` against the region you are putting it in, confirm the id is
not already used anywhere in `js/data/`, then download the photo pair. Resize
new photos with `sips -s formatOptions normal --resampleWidth 720 <file> --out <file>`.

## Adding a muscle group

Note the naming split before you start: **region KEYS are snake_case
identifiers** (`lats`, `rhomboids`, `erectors`, `rear_delts`, `upper_chest`,
`side_delts`, `quads`, `lower_abs`…) while the **gym-floor names users see**
live in `MUSCLES[key].name` in `js/anatomy.js`. Keys are internal; only the
display names must follow the no-Latin rule.

1. Copy `js/data/back.js` to `js/data/<group>.js`; same exports (`group`,
   `exercises`, `byId`, `demo`). `group` needs `id`, `name`, `tagline` and
   `regions` — `tagline` is rendered into the group hero, so omitting it
   prints "undefined" there. `regions` goes in priority order; it doubles as
   the execution order of a built day.

   Each exercise needs `id`, `name`, `equipment`, `target`, `secondary`,
   `level`, `setsReps` and `cues`. **`equipment` must be exactly one of
   `Machine`, `Cable`, `Barbell`, `Dumbbell`, `Bodyweight`** — these are the
   filter chips in `js/app.js`, and any other value makes the exercise
   unreachable by every filter with nothing in the UI to hint at why. The
   source database uses its own vocabulary (`body only`, `e-z curl bar`,
   `kettlebells`, `other`…), so you are mapping, not copying.
2. Pick exercises from free-exercise-db, filtering by `primaryMuscles` and
   preferring `category === 'strength'` so stretches do not sneak in. Browse
   `dist/exercises.json` in that repo for ids, then download both frames to
   `img/demo/<your-id>-{0,1}.jpg` from
   `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/<Their_Id>/{0,1}.jpg`.

   **The database's muscle vocabulary is coarser than this app's regions.** It
   knows `chest`, `shoulders`, `abdominals`, `middle back`, `lower back` — it
   has no idea about upper vs lower chest, front vs side delts, or upper vs
   lower abs. For those regions "check the primary muscle" only gets you to
   the right group; splitting within it is your judgement from the movement
   itself, and no tool can check it for you.

   **Some muscles simply cannot meet the 10-per-region floor from this
   source** (neck has 8 entries in total, most of them not strength work). If
   you hit that, say so and ask the owner rather than padding the region with
   near-duplicates or quietly dropping the rule.
3. Add each region key to `MUSCLES` in `js/anatomy.js` with its gym-floor
   `name`, `short` and `blurb`, and draw its shapes in `REGIONS`. **Both views
   already exist** — `REGIONS.front` (upper/mid/lower chest, front and side
   delts, biceps, forearms, upper/lower abs, obliques, quads) and
   `REGIONS.back` (lats, traps, rhomboids, erectors, rear delts, triceps,
   glutes, hamstrings, calves). Put the region in whichever view the muscle is
   visible from;
   `createAnatomy()` picks the view from the primary region automatically.
   Add the key to the matching `PAINT_ORDER` list too, or it will not render —
   and never list a key in `PAINT_ORDER` without shapes in `REGIONS`, which
   throws at render time and blanks every screen showing a body map. A key
   added to *both* views silently resolves to the back view. `validate.mjs`
   checks this pairing.
4. Register the group in `REGISTRY` at the top of `js/app.js`. The full shape
   is required — omit `ready` or `load` and the tile is dead:
   ```js
   { id: 'legs', name: 'Legs', ready: true, count: 44, areas: 4,
     art: 'quads', load: () => import('./data/legs.js') }
   ```
   `count`, `areas` and `art` render the home tile without loading the data
   module; keep `count` accurate when you add exercises.
5. Add the data file and every new photo to `SHELL` in `sw.js`, and bump
   `CACHE`. Missing entries break offline use silently.
6. Update the numbers the docs and code hard-code: `count` and `areas` in the
   `REGISTRY`, the group table in README, and the Layout block below. Nothing
   derives these automatically.
7. Run `node tools/validate.mjs` and fix anything it reports.

Optionally give the group a fixed `plan` (an array of region keys, one per
slot) if the owner has specified an exact make-up — Arms uses this for its
4 biceps / 3 triceps / 2 forearms day. Plan groups hide the length selector.

## Testing and deploying

Use `npx serve -l 4173 .` (what `.claude/launch.json` configures) — it sends
no-cache headers, so edits show up on reload. `python3 -m http.server` also
works but caches ES modules, so you will chase phantom bugs after an edit
unless you hard-reload every time. Deploys: push to main; GitHub Pages publishes from branch root.
Pages serves with max-age=600, so a just-deployed change can take up to 10
minutes to reach an uninstalled browser; the service worker precaches with
`cache: 'reload'` so a CACHE bump always fetches fresh files.
