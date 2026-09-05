/*
 * anatomy.js — full-body muscle maps, one anterior view and one posterior
 * view, sharing a single silhouette. Each region is a named set of paths so
 * a card can light up exactly the muscle an exercise trains.
 *
 * createAnatomy() picks the view from the PRIMARY region: chest, biceps and
 * quads face you; lats, glutes and hamstrings turn around.
 */

const NS = 'http://www.w3.org/2000/svg';

/* Gym-floor names, the way a trainer says them — not textbook Latin. */
export const MUSCLES = {
  // back group
  lats:        { name: 'Lats',        short: 'Lats',        blurb: 'The big V-taper muscle down the sides of your back. Width comes from here.' },
  rhomboids:   { name: 'Upper Back',  short: 'Upper Back',  blurb: 'Between the shoulder blades. Rowing thickness and posture.' },
  erectors:    { name: 'Lower Back',  short: 'Lower Back',  blurb: 'The columns either side of the spine. Keeps you upright under load.' },
  rear_delts:  { name: 'Rear Delts',  short: 'Rear Delts',  blurb: 'The back of the shoulder. Small muscle, big posture payoff.' },
  // chest group
  mid_chest:   { name: 'Mid Chest',   short: 'Mid Chest',   blurb: 'The meat of the pecs. Flat presses and flys live here.' },
  upper_chest: { name: 'Upper Chest', short: 'Upper Chest', blurb: 'The shelf under the collarbone. Incline work builds it.' },
  lower_chest: { name: 'Lower Chest', short: 'Lower Chest', blurb: 'The underline of the pecs. Declines and dips carve it.' },
  // shoulders group
  front_delts: { name: 'Front Delts', short: 'Front Delts', blurb: 'The front of the shoulder. Every press starts here.' },
  side_delts:  { name: 'Side Delts',  short: 'Side Delts',  blurb: 'The side caps. This is what makes shoulders look wide.' },
  traps:       { name: 'Traps',       short: 'Traps',       blurb: 'Neck to mid-back. Shrugs, carries and heavy pulls.' },
  // arms group
  biceps:      { name: 'Biceps',      short: 'Biceps',      blurb: 'Front of the upper arm. Curls, and every pull helps too.' },
  triceps:     { name: 'Triceps',     short: 'Triceps',     blurb: 'Back of the upper arm — two thirds of its size.' },
  forearms:    { name: 'Forearms',    short: 'Forearms',    blurb: 'Grip and wrist strength. The muscle group that shakes hands.' },
  // legs group
  quads:       { name: 'Quads',       short: 'Quads',       blurb: 'Front of the thigh. Squats, presses and lunges.' },
  hamstrings:  { name: 'Hamstrings',  short: 'Hams',        blurb: 'Back of the thigh. Hinges and curls, half of every sprint.' },
  glutes:      { name: 'Glutes',      short: 'Glutes',      blurb: 'The strongest muscle you own. Hip drive comes from here.' },
  calves:      { name: 'Calves',      short: 'Calves',      blurb: 'Below the knee. High reps, full stretch, patience.' },
  // core group
  upper_abs:   { name: 'Upper Abs',   short: 'Upper Abs',   blurb: 'The top rows of the six-pack. Crunching brings ribs to hips.' },
  lower_abs:   { name: 'Lower Abs',   short: 'Lower Abs',   blurb: 'Below the navel. Leg raises and pelvic curls hit it hardest.' },
  obliques:    { name: 'Obliques',    short: 'Obliques',    blurb: 'The sides of the waist. Twisting, side-bending and bracing.' },

  // Name-only entries for "also works" chips; these have no map region.
  abs:         { name: 'Abs',         short: 'Abs' },
  chest:       { name: 'Chest',       short: 'Chest' },
  shoulders:   { name: 'Shoulders',   short: 'Shoulders' },
};

/* ---------- the shared silhouette ---------- */

const BODY = [
  // torso
  'M64,42 C78,35 122,35 136,42 C140,60 138,82 131,101 C128,110 126,114 124,117 L76,117 C74,114 72,110 69,101 C62,82 60,60 64,42 Z',
  // arms
  'M63,43 C53,47 48,57 47,70 C45,92 44,110 42,130 L54,132 C57,113 58,95 60,77 C61,62 61,50 63,43 Z',
  'M137,43 C147,47 152,57 153,70 C155,92 156,110 158,130 L146,132 C143,113 142,95 140,77 C139,62 139,50 137,43 Z',
  // hands
  'M41,132 L55,134 C55,141 53,146 48,147 C43,146 41,139 41,132 Z',
  'M159,132 L145,134 C145,141 147,146 152,147 C157,146 159,139 159,132 Z',
  // legs
  'M76,117 L98,117 C99,143 98,169 95,193 C94,209 92,221 90,229 L80,229 C78,215 76,197 75,177 C74,155 74,135 76,117 Z',
  'M124,117 L102,117 C101,143 102,169 105,193 C106,209 108,221 110,229 L120,229 C122,215 124,197 125,177 C126,155 126,135 124,117 Z',
  // feet
  'M79,229 L91,229 L91,236 L77,236 Z',
  'M121,229 L109,229 L109,236 L123,236 Z',
];
const HEAD = { cx: 100, cy: 16, r: 13 };
const NECK = 'M92,26 L108,26 L109,40 L91,40 Z';

/* ---------- regions ---------- */

const REGIONS = {
  front: {
    front_delts: [
      'M50,58 C48,46 56,40 64,42 C68,48 69,56 67,63 C61,65 54,63 50,58 Z',
      'M150,58 C152,46 144,40 136,42 C132,48 131,56 133,63 C139,65 146,63 150,58 Z',
    ],
    side_delts: [
      'M49,62 C45,54 45,46 51,41 C47,49 47,57 50,64 Z M50,64 C52,70 55,74 58,76 L54,78 C51,74 49,69 48,64 Z',
      'M151,62 C155,54 155,46 149,41 C153,49 153,57 150,64 Z M150,64 C148,70 145,74 142,76 L146,78 C149,74 151,69 152,64 Z',
    ],
    upper_chest: [
      'M68,46 C88,41 112,41 132,46 L131,60 C111,55 89,55 69,60 Z',
    ],
    mid_chest: [
      'M69,60 C89,56 111,56 131,60 L130,82 C120,90 108,92 100,87 C92,92 80,90 70,82 Z',
    ],
    lower_chest: [
      'M71,83 C81,91 92,93 100,88 C108,93 119,91 129,83 L127,96 C110,103 90,103 73,96 Z',
    ],
    biceps: [
      'M48,70 C54,66 60,70 60,80 C60,92 56,102 50,101 C46,92 45,78 48,70 Z',
      'M152,70 C146,66 140,70 140,80 C140,92 144,102 150,101 C154,92 155,78 152,70 Z',
    ],
    forearms: [
      'M46,105 C51,102 56,104 56,112 C55,120 54,126 53,131 L44,130 C44,121 44,112 46,105 Z',
      'M154,105 C149,102 144,104 144,112 C145,120 146,126 147,131 L156,130 C156,121 156,112 154,105 Z',
    ],
    upper_abs: [
      'M85,99 L115,99 L114,131 L86,131 Z',
    ],
    lower_abs: [
      'M86,133 L114,133 L111,158 C104,163 96,163 89,158 Z',
    ],
    obliques: [
      'M75,100 L83,100 L84,150 L78,144 C76,130 74,114 75,100 Z',
      'M125,100 L117,100 L116,150 L122,144 C124,130 126,114 125,100 Z',
    ],
    quads: [
      'M78,120 C86,115 94,117 96,124 L94,189 C90,196 84,194 80,187 C76,164 75,140 78,120 Z',
      'M122,120 C114,115 106,117 104,124 L106,189 C110,196 116,194 120,187 C124,164 125,140 122,120 Z',
    ],
  },
  back: {
    traps: [
      'M100,30 L66,44 L74,58 L100,86 L126,58 L134,44 Z',
    ],
    rear_delts: [
      'M50,58 C48,46 56,40 64,42 C68,48 69,56 67,63 C61,65 54,63 50,58 Z',
      'M150,58 C152,46 144,40 136,42 C132,48 131,56 133,63 C139,65 146,63 150,58 Z',
    ],
    rhomboids: [
      'M80,58 L97,76 L97,97 L83,91 Z',
      'M120,58 L103,76 L103,97 L117,91 Z',
    ],
    lats: [
      'M67,63 C68,86 76,106 94,118 L97,122 L97,101 C87,94 76,80 71,63 Z',
      'M133,63 C132,86 124,106 106,118 L103,122 L103,101 C113,94 124,80 129,63 Z',
    ],
    erectors: [
      'M92,99 L98,101 L98,143 L90,139 C90,126 90,112 92,99 Z',
      'M108,99 L102,101 L102,143 L110,139 C110,126 110,112 108,99 Z',
    ],
    triceps: [
      'M48,70 C54,66 60,70 60,80 C60,92 56,102 50,101 C46,92 45,78 48,70 Z',
      'M152,70 C146,66 140,70 140,80 C140,92 144,102 150,101 C154,92 155,78 152,70 Z',
    ],
    glutes: [
      'M79,116 C90,111 97,116 97,128 C97,139 90,146 83,142 C77,135 76,123 79,116 Z',
      'M121,116 C110,111 103,116 103,128 C103,139 110,146 117,142 C123,135 124,123 121,116 Z',
    ],
    hamstrings: [
      'M78,148 C86,144 94,146 95,152 L93,192 C89,198 83,196 80,190 C77,176 76,160 78,148 Z',
      'M122,148 C114,144 106,146 105,152 L107,192 C111,198 117,196 120,190 C123,176 124,160 122,148 Z',
    ],
    calves: [
      'M81,198 C87,193 93,196 93,204 C93,215 90,224 86,226 C82,219 80,207 81,198 Z',
      'M119,198 C113,193 107,196 107,204 C107,215 110,224 114,226 C118,219 120,207 119,198 Z',
    ],
  },
};

/* Which way the body faces for each region. */
const VIEW_OF = {};
for (const [view, regs] of Object.entries(REGIONS)) {
  for (const key of Object.keys(regs)) VIEW_OF[key] = view;
}

/* Smaller regions paint after bigger ones so they stay clickable to the eye. */
const PAINT_ORDER = {
  front: ['quads', 'obliques', 'upper_abs', 'lower_abs', 'mid_chest', 'upper_chest', 'lower_chest', 'forearms', 'biceps', 'front_delts', 'side_delts'],
  back:  ['lats', 'traps', 'hamstrings', 'rhomboids', 'erectors', 'glutes', 'calves', 'triceps', 'rear_delts'],
};

/**
 * Build the anatomy SVG.
 * @param {string}   primary    region key to highlight strongly
 * @param {string[]} secondary  region keys to highlight faintly
 */
export function createAnatomy(primary, secondary = []) {
  const view = VIEW_OF[primary] ?? 'back';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '36 0 128 240');
  svg.setAttribute('class', 'anatomy');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `Body map with ${MUSCLES[primary]?.name ?? primary} highlighted`);

  const add = (tag, attrs) => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    svg.appendChild(n);
    return n;
  };

  add('circle', { ...HEAD, class: 'an-body' });
  add('path', { d: NECK, class: 'an-body' });
  for (const d of BODY) add('path', { d, class: 'an-body' });

  for (const key of PAINT_ORDER[view]) {
    const state = key === primary ? 'primary' : secondary.includes(key) ? 'secondary' : 'idle';
    for (const d of REGIONS[view][key]) {
      add('path', { d, class: `an-muscle is-${state}`, 'data-region': key });
    }
  }
  return svg;
}
