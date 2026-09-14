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

## No group is special-cased

Arms used to carry a fixed `group.plan` — 4 biceps, 3 triceps, 2 forearms,
alternating bi/tri — introduced in commit a2ec42a and described there and in
this file as "per the user's spec".

**It was not.** The user has since said they never asked for alternation; what
they asked for was that an arms day train both biceps and triceps. The plan,
the alternation and the hidden length selector that came with it have all been
removed, and Arms now behaves like every other group: the 4/5/6 selector, the
same ordering, the same bodyweight finisher. Covering every region of a group
before repeating any is what makes "both biceps and triceps" true, and it is
true of every group, so nothing needs special-casing to get it.

The lesson is worth more than the change: **do not write "the user said X" into
this file unless the user actually said X.** Once it is written down it gets
believed, repeated back to them as fact, and defended in code comments. If you
are recording a design decision you made yourself, say so — `validate.mjs`
fails a group that reintroduces `plan`, so this cannot quietly come back.

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
- Session length is selectable (4/5/6), plus the bodyweight finisher on top.
- **How much of a day each muscle gets is `group.volume`, not list order.**
  Two things a group declares are easy to conflate and must not be:
  `group.regions` is *execution* order, `group.volume` is *how much work the
  muscle earns*. They genuinely differ — a shoulder day is led by the press but
  owes most of its slots to the side delts, because the front delts are already
  hammered by every chest press.
- **A built day is an ordered program, not a list.** Slots are numbered, and
  the order is the order to train in.
- **An arms day trains both biceps and triceps.** That is the whole of what the
  user asked for here — see "No group is special-cased" below. Every group's
  day covers all of its regions before repeating any, so this holds by
  construction rather than by special-casing Arms.
- **A built day should read like a trainer wrote it** — see "How a day is
  built" below. This replaced a generator that picked at random inside each
  muscle, which could hand you three pulldown variations, four machines in a
  row, or a back day that put the biceps under all six exercises.
- **Every day ends on a bodyweight movement**, on top of the chosen length —
  the user asked for it as a "+1", so it is not one of the N exercises and the
  length selector does not count it.
- **Compound or isolation is shown in the UI** — a tag on the exercise cards
  and workout slots, and a Type row on the exercise screen.

## How a day is built

`buildWorkout` in `js/app.js`, in three stages: `regionSequence` decides which
muscle each slot trains, scoring decides what fills it, and `orderDay` decides
what order the day is performed in. A bodyweight finisher is added on top.

### Which muscle gets how many slots

`slotCounts`. Every muscle in the group gets one slot before any gets a second,
which is what makes a day cover the whole group — and what makes "an arms day
trains both biceps and triceps" true without special-casing Arms. The rest is
shared out by `group.volume` (D'Hondt), so a 6-exercise shoulder day is 2 front
delts, 3 side delts and 1 traps.

Two earlier versions of this were wrong the same way, and the second is the
instructive one. Round-robin gave whatever divided evenly — six slots over
three muscles was two each, so a third of an arm day was wrist curls. The fix
was to weight by position in `group.regions`, which was *worse*: that list is
execution order, so it prescribed three front-delt movements and one side-delt
raise, which is the opposite of what a shoulder day needs.

So volume is authored per muscle in the data, the way `pattern` is, for exactly
the same reason: it is a trainer's judgement, nothing else in the file encodes
it, and deriving it from a field that means something else produces confident
nonsense. `validate.mjs` requires a positive weight for every region.

Each candidate is scored against the day assembled so far, and the pick is
sampled from the ones scoring within a margin of the best rather than always
taking the maximum. That distinction matters: taking the maximum made every
Rebuild return near enough the same day, because the score gaps are wider than
any noise small enough to leave the structure intact.

The terms, each one a question a trainer would ask out loud:

- **Compound or isolation, by position.** Every muscle opens with a compound
  and its second slot is accessory work — squat then leg extension, bench then
  fly. Muscles that are not compound-led skip that: `leadsWithCompound()` calls
  a muscle compound-led when compounds are at least a third of its exercises,
  which is what stops the builder opening side delts with an upright row when
  the lateral raise is the movement, or prescribing a farmer's carry before
  wrist curls. It reads that from the data, so it follows the data.
- **Secondary-muscle spread.** Repeating a tag already loaded by the day costs
  points, capped so it can never outweigh the slot's role. Six back exercises
  that all pull through the biceps is a biceps day with extra steps.
- **Equipment spread.** Machine, cable, barbell and dumbbell each earn a bonus
  the first time they appear and cost on repeats, so a day draws on all four.
  Bodyweight is deliberately left out of that bonus and mildly penalised — it
  has its own slot at the end, and without this it crowded out the loaded work.
- **Movement family** — not three pulldowns. Families are derived from the id
  by `familyOf()`, including the angle, because flat, incline and decline
  pressing are three different exercises and a chest day wants all three.
- **A heavy anchor.** Until the day contains one heavy compound, the movements
  that could be it are worth more. Every session is built around one.
- **Rep-range spread** — not six sets of twelve.
- **Level** — the hardest movements in the book do not stack.

Only `pattern` is explicit data; the families and rep buckets are derived. That
split is deliberate. A family miss costs a little variety and never
correctness, so a heuristic is fine there. `pattern` decides what anchors a
muscle, and no heuristic gets it right — `cable-rear-lateral` lists three
secondary muscles and is still a raise, `hip-thrust` lists two and anchors a
glute day — so it is authored per exercise and `tools/validate.mjs` enforces it.

### Order, and the finisher

`orderDay` decides when each movement is performed, which scoring deliberately
does not. Compounds first, heaviest first, whatever muscle they belong to —
that is why `loadRank` is a number rather than a bucket, since a 3–6 deadlift
has to open a back day ahead of an 8–12 pulldown and both are "heavy".
Accessories follow, grouped by muscle, in the order the compounds established.

**A day therefore looks like it alternates muscles, and that is correct.** A
chest day runs bench, incline, decline, then three flys — not bench, fly,
incline, fly. The sub-regions of a chest are one muscle at three angles, there
is nothing to "finish", and an isolation movement placed before a compound
pre-fatigues the muscle and costs you load on the bigger lift. Finishing one
muscle before starting the next is a real convention, but it belongs to
sessions that train several muscle *groups* (chest then triceps), not to a
single-group day. Where it does apply — the accessory block — the code already
does it: both lower-ab movements sit together, and an arms day puts the
close-grip bench next to its triceps accessory rather than three curls later.

Every day then gets one extra bodyweight movement on top of the chosen length —
push-ups closing a chest day, chin-ups closing a back day. It is outside the
length selector on purpose: a 6-exercise day returns 7 items, the last one
flagged `finisher: true`, rendered as "+1" rather than numbered into the
sequence. `finisherScore` prefers a compound, on one of the group's lead
muscles, prescribed by effort rather than by a rep count.

The swap button uses the same scorers (`slotAlternatives`), ranking the
alternatives against the rest of the day and cycling through them, so a swap
keeps the day balanced and keeps the slot's kind: swapping the opening squat
offers another compound, not a leg extension, and swapping the finisher offers
another bodyweight movement rather than another quad exercise.

Saved workouts are left alone — an in-progress day built by an older version
keeps its shape until the user hits Rebuild or Clear, rather than being
silently rewritten underneath them.

Both rules degrade on their own rather than needing special cases. A muscle
with no compound at all (biceps, calves, abs) never asks for one; a muscle with
no isolation at all (every rhomboid movement is a row) lets the remaining terms
pick the most *different* row instead.

## Layout

```
index.html            app shell
css/app.css           design tokens + all styling (light + dark)
js/app.js             router, screens, demo player, theme
js/workout.js         the day builder — pure, no DOM, so it can be tested
js/anatomy.js         front + back body maps (SVG) + the gym-name registry
js/data/<group>.js    six groups, 220 exercises, 10+ per region:
                        back 45 (lats, upper back, lower back, rear delts)
                        chest 30 (mid, upper, lower)
                        shoulders 33 (front delts, side delts, traps)
                        arms 33 (biceps, triceps, forearms)
                        legs 45 (quads, hamstrings, glutes, calves)
                        core 34 (lower abs, upper abs, obliques)
img/demo/             demonstration photos (public domain, 720px), <id>-0/-1.jpg
manifest.webmanifest  PWA manifest (app name, icons, standalone display)
icons/                generated PNG icons (see tools-make-icons.mjs below)
tools/validate.mjs    curation-rule checker — run after any data change
tools/test-builder.mjs day-builder checker — run after any generator change
tools-make-icons.mjs  `node tools-make-icons.mjs icons` — regenerates the PNGs
.claude/launch.json   dev-server config (`npx serve -l 4173 .`) for editor tooling
sw.js                 service worker; SHELL precaches every shipped file
tools-make-icons.mjs  regenerates the PNG icons from source
```

## Checking your work

```bash
node tools/validate.mjs      # the data
node tools/test-builder.mjs  # the day builder
```

Run both. They are the reason the rules in this file are rules and not just
prose, and they are quick — neither needs a browser, a server or a network.

This mechanically enforces the owner's curation rules — one region per
exercise, app-wide uniqueness of ids and names, 10+ per region, at least three
equipment types per region, `equipment` values inside the filter enum, both
demonstration photos present and named by convention, `pattern` present and
one of compound/isolation, cues-not-howTo, every
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

## What the source cannot give us

The data was audited against all 876 entries in free-exercise-db, by muscle and
by equipment. **It is close to the ceiling of what that source offers.** Of the
~650 unused entries, almost all are near-duplicates of movements already here —
43 triceps "extension" variants, 11 pulldown variants — and the movement-family
rule means adding them would never change a prescription. Do not pad regions
with them.

These gaps are real, are the source's and not an oversight, and cannot be
closed without a second source. Recorded so nobody audits this again:

- **No body-only shoulder press** — no pike push-up. Shoulders owns exactly two
  bodyweight movements, which is why a shoulder day's finisher is nearly always
  the handstand push-up.
- **No cable work for quads, hamstrings or calves**, no machine forearm work,
  no bodyweight calf raise.
- **No Pendlay row, seal row or Meadows row.**
- **An adductors region is not viable** — two usable entries against a floor of
  ten. Neck is the same (eight, mostly not strength), as the old note said.

To re-run the audit, pull `dist/exercises.json` from the repo linked above and
compare `primaryMuscles` and `equipment` against `js/data/`.

One useful thing in that file: every entry carries its own `mechanic`
(compound/isolation). It was used to cross-check the `pattern` values here —
66 agreed, 12 differed, and all twelve were cases where it calls a reverse
crunch or a superman "compound". Ours were kept. **Treat that field as a second
opinion, not as an authority**, and the same goes for its muscle names, which
are coarser than this app's regions.

## Adding a muscle group

Note the naming split before you start: **region KEYS are snake_case
identifiers** (`lats`, `rhomboids`, `erectors`, `rear_delts`, `upper_chest`,
`side_delts`, `quads`, `lower_abs`…) while the **gym-floor names users see**
live in `MUSCLES[key].name` in `js/anatomy.js`. Keys are internal; only the
display names must follow the no-Latin rule.

1. Copy `js/data/back.js` to `js/data/<group>.js`; same exports (`group`,
   `exercises`, `byId`, `demo`). `group` needs `id`, `name`, `tagline`,
   `regions` and `volume` — `tagline` is rendered into the group hero, so
   omitting it prints "undefined" there.

   `regions` is the order a day is *performed* in. `volume` is a weight per
   region saying how many of a day's slots that muscle earns. **These are two
   different judgements and the second is not derivable from the first** — see
   "Which muscle gets how many slots". Write `volume` as a trainer would
   apportion a session, and say why in a comment above it, as the existing
   groups do.

   Each exercise needs `id`, `name`, `equipment`, `target`, `pattern`,
   `secondary`, `level`, `setsReps` and `cues`. **`pattern` must be exactly
   `compound` or `isolation`** — multi-joint or single-joint, judged from the
   movement. The day builder is built on it (see "How a day is built"), a wrong
   value silently produces a bad workout, and nothing derives it for you.
   **`equipment` must be exactly one of
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

There is no per-group override for the make-up of a day, and adding one back
needs the owner to ask for it — see "No group is special-cased" below.

## Testing and deploying

Most changes can be checked without a browser at all — `js/workout.js` is pure
and `tools/test-builder.mjs` drives it directly. Use the browser for the UI.

Use `npx serve -l 4173 .` (what `.claude/launch.json` configures) — it sends
no-cache headers, so edits show up on reload.

**Do not check behaviour over `python3 -m http.server`.** It sends no cache
headers at all, so the browser applies heuristic freshness to the ES modules
and keeps serving the version it first saw. This has burned two sessions: a
generator change looked like it had not taken effect, and the old output was
nearly reported as a bug. Unregistering the service worker and clearing
`caches` is not enough, because the stale copy is in the HTTP cache. If you
must use it, serve on a **port you have not used before** — new origin, empty
cache — or send `Cache-Control: no-store` yourself.

Deploys: push to main; GitHub Pages publishes from branch root. Pages serves
with max-age=600, so a just-deployed change can take up to 10 minutes to reach
an uninstalled browser; the service worker precaches with `cache: 'reload'` so
a CACHE bump always fetches fresh files.

A saved workout is never rewritten underneath the user. An in-progress day
built by an older version keeps its shape until they hit Rebuild or Clear — so
after changing the builder, clear `localStorage` before judging the output.
