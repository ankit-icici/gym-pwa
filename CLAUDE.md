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

After any change that ships files: bump `CACHE` in `sw.js` (e.g. `gym-v7` ->
`gym-v8`), or installed phones keep serving the old version. If you add or
remove files under `img/demo/` or `js/data/`, regenerate the `SHELL` list in
`sw.js` too — it precaches every file for offline use.

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
- In-page controls (filters, session length, ticking, swapping) re-render via
  `render()` and must never touch history.

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
  primarily trains, and appears exactly once in the whole app. Shoulder-primary
  movements (shrugs, upright rows, carries) were explicitly evicted from Back —
  they belong to Shoulders when that group is built. Do not re-add them.
- **At least 10 exercises per region**, mixing machine, cable, barbell,
  dumbbell and bodyweight.
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
js/anatomy.js         posterior-view muscle map (SVG) + gym-name registry
js/data/<group>.js    six groups, 217 exercises, 10+ per region:
                        back 45 (lats, upper back, lower back, rear delts)
                        chest 30 (mid, upper, lower)
                        shoulders 33 (front delts, side delts, traps)
                        arms 33 (biceps, triceps, forearms — fixed 4/3/2 plan)
                        legs 44 (quads, hamstrings, glutes, calves)
                        core 32 (lower abs, upper abs, obliques)
img/demo/             434 demonstration photos (public domain, 720px)
sw.js                 service worker; SHELL precaches everything incl. photos
tools-make-icons.mjs  regenerates the PNG icons from source
```

## Regenerating or extending the data

The curation tables and generator that produced every group live in this
session's scratchpad pattern: a `gengroup.py` that validates each pick's
dataset-declared primary muscle against its region, enforces app-wide
uniqueness of both exercise ids and dataset entries, downloads the photo pair,
and emits the data file. If you extend a group, replicate those checks — they
are what enforce the user's curation rules mechanically. Resize new photos with
`sips -s formatOptions normal --resampleWidth 720`.

## Adding a muscle group

1. Copy `js/data/back.js` to `js/data/<group>.js`; same exports (`group`,
   `exercises`, `byId`, `demo`). `regions` in priority order.
2. Pick exercises that exist in free-exercise-db and download their two frames
   to `img/demo/<your-id>-{0,1}.jpg`:
   `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/<Their_Id>/{0,1}.jpg`
   (browse `dist/exercises.json` in that repo to find ids).
3. Add the region keys with gym-floor names to `MUSCLES` in `js/anatomy.js` and
   draw their patches in `REGIONS`. The current map is a posterior view; chest,
   arms and quads will need an anterior-view variant.
4. Register it in `REGISTRY` at the top of `js/app.js` with `count`, `areas`
   and `art` (they power the home tile without loading the data). Filter
   candidates by the dataset's `primaryMuscles` — primary only — and prefer
   `category === 'strength'` so stretches do not sneak in.
5. Add its regions to `MUSCLES` and to the right view in `REGIONS` in
   `js/anatomy.js` (front view for anterior muscles, back view for posterior).
5. Add the new data file and photos to `SHELL` in `sw.js` and bump `CACHE`.

## Testing and deploying

Serve with `Cache-Control: no-store` during development or the browser holds
ES modules. Deploys: push to main; GitHub Pages publishes from branch root.
Pages serves with max-age=600, so a just-deployed change can take up to 10
minutes to reach an uninstalled browser; the service worker precaches with
`cache: 'reload'` so a CACHE bump always fetches fresh files.
