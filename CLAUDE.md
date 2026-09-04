# Working on this repo

A dependency-free static PWA. There is **no build step and no package.json** —
edit the files and reload. Keep it that way; it is what makes the project
portable across machines and sessions.

## Testing your changes

```bash
python3 -m http.server 4173
```

Open `debug.html` after touching any pose — it renders every exercise at both
keyframes side by side, which catches broken kinematics far faster than
clicking through the app. `?only=lat-pulldown,pull-up` narrows it, `?cell=440`
enlarges the cells.

Browsers cache ES modules aggressively. If an edit does not appear, serve with
`Cache-Control: no-store` and unregister the service worker.

## The pose system

`js/rig.js` is a 2D skeletal animator. Each exercise supplies keyframe poses;
the rig eases between them and loops forward-then-backward, so a two-pose
exercise reads as concentric → eccentric → repeat.

**All angles are degrees measured from STRAIGHT DOWN, positive rotating toward
+x — the direction the figure faces.** So `0` hangs straight down, `90` points
horizontally forward, `180` points straight up, `-45` points down and behind.

**The floor is y = 0.** A standing pelvis sits at `rootY: -86`; seated is about
`-46` in side view.

Key pose fields (full list in the header comment of `js/rig.js`):

| field | meaning |
| --- | --- |
| `torso` | lean from vertical; `0` upright, `90` folded flat over the hips |
| `shoulder` | upper-arm angle (side view) |
| `abduct` | how far the arm swings out to the side (front view) |
| `elbow` | elbow flexion added on top of the shoulder angle |
| `hip` / `knee` | thigh angle and knee flexion; shin angle is `hip - knee` |
| `rootX` / `rootY` | where the pelvis sits |
| `thighK` / `shinK` | limb length multipliers, to foreshorten legs pointing at the camera |
| `farShoulder` / `farElbow` / `farHip` | side view only: how the hidden far limbs differ, for things like a hand braced on a bench |

Two gotchas worth knowing:

- **Rows finish with a large negative `shoulder` and a deep `elbow` flexion**
  (roughly `-85` / `120`), because the elbow drives back past the ribs. A small
  elbow bend alone looks like a curl, not a row.
- In **front view** a positive `elbow` swings the forearm outward and up, and it
  mirrors across both arms. A close-grip finish therefore needs a near-full fold
  (about `168`), not a small bend.

Choose `view: 'side'` when the movement happens front-to-back (rows, deadlifts,
hinges) and `view: 'front'` when it happens laterally (pulldowns, flyes, shrugs).

## Adding a muscle group

1. Copy `js/data/back.js` to `js/data/<group>.js`. Keep the same exports:
   `group` (with `id`, `name`, `tagline`, `regions`), `exercises`, and `byId`.
2. Add the region keys and their anatomical names to `MUSCLES` in
   `js/anatomy.js`, and draw their paths in `REGIONS`. The map is a posterior
   view; a front-view map will be needed for chest, arms and quads.
3. Flip `ready: true` for that group in `REGISTRY` at the top of `js/app.js`.
4. Add the new data file to `SHELL` in `sw.js` and bump `CACHE`.

Nothing else needs touching — the screens, filters and workout generator are all
data-driven.

Aim for four exercises per target region and a mix of machine, cable, barbell,
dumbbell and bodyweight. The generator picks one exercise per region, so the
number of regions is the workout length.

## Icons

`node tools-make-icons.mjs icons` regenerates every PNG from source. It is a
self-contained rasteriser plus PNG encoder — no image libraries.
