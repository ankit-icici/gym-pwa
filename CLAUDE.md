# Working on this repo

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

- **No "How to do it" steps section.** Form cues only (3 short lines each).
- **Gym-floor muscle names, never anatomical Latin.** "Lats", "Upper Back",
  "Traps", "Lower Back", "Upper Lats", "Rear Delts" — see `MUSCLES` in
  `js/anatomy.js`. Applies to all user-visible text.
- Session length is selectable (4/5/6); `group.regions` is priority order and
  a shorter day drops the tail.

## Layout

```
index.html            app shell
css/app.css           design tokens + all styling (light + dark)
js/app.js             router, screens, demo player, workout generator, theme
js/anatomy.js         posterior-view muscle map (SVG) + gym-name registry
js/data/back.js       the Back group: 24 exercises, 6 regions, 4 per region
img/demo/             48 demonstration photos (public domain)
sw.js                 service worker; SHELL precaches everything incl. photos
tools-make-icons.mjs  regenerates the PNG icons from source
```

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
4. Flip `ready: true` in `REGISTRY` at the top of `js/app.js`.
5. Add the new data file and photos to `SHELL` in `sw.js` and bump `CACHE`.

## Testing and deploying

Serve with `Cache-Control: no-store` during development or the browser holds
ES modules. Deploys: push to main; GitHub Pages publishes from branch root.
Pages serves with max-age=600, so a just-deployed change can take up to 10
minutes to reach an uninstalled browser; the service worker precaches with
`cache: 'reload'` so a CACHE bump always fetches fresh files.
