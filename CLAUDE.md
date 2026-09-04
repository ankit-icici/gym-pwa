# Working on this repo

A static PWA with **no build step and no package.json** — edit the files and
reload. three.js is vendored at `vendor/three.module.min.js` rather than pulled
from a CDN, so the app still installs and runs offline. Keep it that way; it is
what makes the project portable across machines and sessions.

## Two renderers, on purpose

| | where | why |
| --- | --- | --- |
| **SVG** (`js/rig.js`) | cards, workout rows | Dozens can animate at once for almost nothing. Browsers cap live WebGL contexts, so a 24-card grid of 3D scenes is not an option. |
| **3D** (`js/three/`) | exercise detail screen | This is where you study form, and you can orbit the camera to check it from any angle. |

**Both renderers share one set of authored keyframe poses.** Do not fork the
pose data. If a movement needs different numbers in 3D, add a `*3d` field
(`shoulder3d`, `abduct3d`, `elbow3d`, `hip3d`, `knee3d`, `torso3d`) — the 3D rig
prefers those and the 2D rig ignores them.

three.js is imported dynamically, only when a detail screen opens, so browsing
never pays for it.

## Testing your changes

```bash
python3 -m http.server 4173
```

`debug3d.html` is the 3D bench: one exercise at a time, a scrub bar, and camera
presets. `?id=<exercise-id>` jumps straight to one. Use it whenever you touch a
pose or a 3D scene.

Open `debug.html` after touching any pose — it renders every exercise at both
keyframes side by side, which catches broken kinematics far faster than
clicking through the app. `?only=lat-pulldown,pull-up` narrows it, `?cell=440`
enlarges the cells.

Browsers cache ES modules aggressively. If an edit does not appear, serve with
`Cache-Control: no-store` and unregister the service worker.

## What the figure is made of

`js/rig.js` does two jobs. It solves joint positions from keyframe poses, and
it draws an anatomical figure from those joints.

The body is **not** stick lines. Every segment is a `taper()` — the convex hull
of the two circles at its end joints — plus a disc at each joint. Drawing those
overlapping shapes into one group with a single fill unions them for free, no
boolean geometry required. Joint thicknesses live in `RADII`, separately for the
side and front views.

The muscle an exercise trains is painted **onto the body**, brightening toward
peak contraction (`contraction(u)`). This is the thing that makes the animation
informative rather than decorative — do not regress it to a stick figure with a
caption. Orange is reserved exclusively for muscle; all gym equipment stays
monochrome so the eye lands on the working tissue.

## The pose system

Each exercise supplies keyframe poses; the rig eases between them and loops
forward-then-backward, so a two-pose exercise reads as concentric → eccentric →
repeat.

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

## Muscle shapes

`MUSCLE_SHAPES` in `js/rig.js` maps each region to polygons in torso-local
coordinates, one set per view:

- `u` runs 0 at the pelvis to 1 at the base of the neck.
- `v` runs across the torso, and **v = 1 means the edge of the body at that
  height** — it is scaled by `torsoRadius(u)`, not by a fixed width. This is
  deliberate: with a fixed width, a shape like the lats gets clipped away
  wherever the torso narrows, leaving a thin stripe down the middle.
- In side view negative `v` is the back of the body. In front view `v` is
  lateral, so shapes are wrapped in `pair()` to mirror them.
- Push `v` slightly past 1 (about 1.15) for anything that should sit flush with
  the body edge; everything is clipped to the torso silhouette anyway.
- The string `'shoulder'` instead of polygons puts the region on the deltoid
  joints, which is what the rear delts use.

A new muscle group needs its regions defined here for **both** views, or those
exercises will animate with no highlight.

## Framing

Each exercise carries an explicit `viewBox` so its scene sits centred. The
window size is fixed at `232 236` for every exercise — only the x origin
changes — which keeps figures at a consistent scale across cards.

To re-measure after changing poses or equipment, render each exercise offscreen,
sample `setTime` across the loop, union the bounding boxes of everything except
`.eq-floor` (the ground line is deliberately far wider than any viewBox, so it
would swamp the measurement), and set the origin to `centreX - 116`.

## Adding a muscle group

1. Copy `js/data/back.js` to `js/data/<group>.js`. Keep the same exports:
   `group` (with `id`, `name`, `tagline`, `regions`), `exercises`, and `byId`.
   **`regions` is in priority order, not anatomical order** — the generator
   fills a session by walking it, so a shortened day drops the tail first.
2. Add the region keys and their anatomical names to `MUSCLES` in
   `js/anatomy.js`, and draw their paths in `REGIONS`. That map is a posterior
   view; a front-view map will be needed for chest, arms and quads.
3. Add the same regions to `MUSCLE_SHAPES` in `js/rig.js`, for both views.
4. Flip `ready: true` for that group in `REGISTRY` at the top of `js/app.js`.
5. Measure and set each exercise's `viewBox` (see Framing above).
6. Add the new data file to `SHELL` in `sw.js` and bump `CACHE`.

Nothing else needs touching — the screens, filters and workout generator are all
data-driven.

Aim for four exercises per target region and a mix of machine, cable, barbell,
dumbbell and bodyweight. The generator picks one exercise per region, so the
number of regions sets the maximum session length; the user can shorten it with
the selector, which trims from the end of the priority list.

## Icons

`node tools-make-icons.mjs icons` regenerates every PNG from source. It is a
self-contained rasteriser plus PNG encoder — no image libraries.


## The 3D rig

`js/three/figure.js` builds a bone hierarchy of `THREE.Group` nodes with tapered
limb meshes hung off them. **Y is up, the floor is y = 0, and the figure faces
+Z.** Every limb group points down its local -Y at rest.

Three things here will bite you if you forget them:

1. **`shoulder` is absolute, but the arm hangs off the spine.** Pose data means
   "angle from vertical", so `applyPose` adds the torso lean back in
   (`flex = torso + shoulder`). Skip that and every bent-over lift ends up with
   its arms swinging out behind the figure.
2. **Rotation order is XYZ**, which Three applies Z then Y then X. At the
   shoulder that is exactly right: abduct in the frontal plane, then swing
   forward.
3. **`elbowPlane`** decides which way the elbow hinge points — `'sagittal'` for
   rows and hinges, `'frontal'` for pulldowns and flyes where the humerus is
   rotated and the forearm folds toward the midline. It defaults from `view`.

Muscles are slices of the torso's surface: open cylinder segments at a slightly
larger radius, defined in `BACK_MUSCLES` by a height range and a theta arc where
theta = 0 faces +Z and theta = PI faces the back. `torsoRadiusAt()` **must track
the torso mesh exactly** — if it models a waist the mesh does not have, the
patches sink inside the body and disappear.

The camera auto-frames from the figure's swept bounds, deliberately ignoring
equipment: fitting a pulldown tower would shrink the person to nothing, and
cropping the machine is what real exercise footage does. It defaults to a REAR
three-quarter view, because a front view hides every muscle this app is about.

`js/three/kit3d.js` holds composable equipment parts; `js/data/back3d.js` wires
them per exercise. That file is separate from `data/back.js` so the browse
screens never import three.js. Equipment coordinates convert from the 2D data as:

- side-view exercise: 2D `(x, y)` -> 3D `(0, -y, x)`
- front-view exercise: 2D `(x, y)` -> 3D `(x, -y, 0)`

One WebGL renderer is shared app-wide and moved between mounts. `createViewer`
paints one frame immediately, because the shared clock does not run while the
tab is hidden or motion is reduced, and a blank canvas in those cases is a bug
users will hit.
