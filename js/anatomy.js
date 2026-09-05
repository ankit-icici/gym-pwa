/*
 * anatomy.js — a posterior-view torso map.
 * Each muscle region is a named group so a card can light up exactly the
 * region an exercise trains and print its anatomical name next to it.
 */

const NS = 'http://www.w3.org/2000/svg';

/* Mirror a path across the x = 100 centre line by negating the sweep. */
const REGIONS = {
  traps: [
    'M100,44 L63,67 L71,101 L100,125 L129,101 L137,67 Z',
  ],
  rear_delts: [
    'M62,66 C50,70 40,80 41,94 C43,106 52,112 61,110 C64,96 62,80 62,66 Z',
    'M138,66 C150,70 160,80 159,94 C157,106 148,112 139,110 C136,96 138,80 138,66 Z',
  ],
  teres: [
    'M57,96 C66,105 75,111 84,116 L78,127 C67,121 57,112 50,102 Z',
    'M143,96 C134,105 125,111 116,116 L122,127 C133,121 143,112 150,102 Z',
  ],
  rhomboids: [
    'M75,104 L98,127 L98,152 L81,145 Z',
    'M125,104 L102,127 L102,152 L119,145 Z',
  ],
  lats: [
    'M54,112 C60,150 67,175 75,199 L98,191 L98,134 C82,132 66,124 54,112 Z',
    'M146,112 C140,150 133,175 125,199 L102,191 L102,134 C118,132 134,124 146,112 Z',
  ],
  erectors: [
    'M88,152 C85,170 84,188 86,206 L98,208 L98,154 Z',
    'M112,152 C115,170 116,188 114,206 L102,208 L102,154 Z',
  ],
};

const OUTLINE =
  'M100,46 C128,47 148,57 157,74 C164,92 151,105 145,119 ' +
  'C139,151 133,171 129,197 L127,216 L73,216 L71,197 ' +
  'C67,171 61,151 55,119 C49,105 36,92 43,74 C52,57 72,47 100,46 Z';

/* Gym-floor names, the way a trainer says them — not textbook Latin. */
export const MUSCLES = {
  lats:       { name: 'Lats',       short: 'Lats',       blurb: 'The big V-taper muscle down the sides of your back. Width comes from here.' },
  rhomboids:  { name: 'Upper Back', short: 'Upper Back', blurb: 'Between the shoulder blades. Rowing thickness and posture.' },
  traps:      { name: 'Traps',      short: 'Traps',      blurb: 'Neck to mid-back. Shrugs, carries and heavy pulls.' },
  erectors:   { name: 'Lower Back', short: 'Lower Back', blurb: 'The columns either side of the spine. Keeps you upright under load.' },
  teres:      { name: 'Upper Lats', short: 'Upper Lats', blurb: 'Just under the armpit. Close and high pulling angles hit it best.' },
  rear_delts: { name: 'Rear Delts', short: 'Rear Delts', blurb: 'The back of the shoulder. Small muscle, big posture payoff.' },
};

/** Order the regions paint in, so smaller regions land on top of bigger ones. */
const PAINT_ORDER = ['lats', 'traps', 'rhomboids', 'erectors', 'teres', 'rear_delts'];

/**
 * Build the anatomy SVG.
 * @param {string}   primary    region key to highlight strongly
 * @param {string[]} secondary  region keys to highlight faintly
 */
export function createAnatomy(primary, secondary = [], opts = {}) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '28 8 144 216');
  svg.setAttribute('class', 'anatomy');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('role', 'img');
  const label = MUSCLES[primary]?.name ?? primary;
  svg.setAttribute('aria-label', `Back anatomy with ${label} highlighted`);

  const add = (tag, attrs) => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    svg.appendChild(n);
    return n;
  };

  add('circle', { cx: 100, cy: 26, r: 19, class: 'an-body' });
  add('rect', { x: 89, y: 40, width: 22, height: 14, rx: 5, class: 'an-body' });
  add('path', { d: OUTLINE, class: 'an-body' });
  // Upper-arm stubs give the silhouette a shoulder to hang off.
  add('path', { d: 'M45,80 C36,104 33,132 34,156 L48,158 C48,132 51,106 57,86 Z', class: 'an-body an-limb' });
  add('path', { d: 'M155,80 C164,104 167,132 166,156 L152,158 C152,132 149,106 143,86 Z', class: 'an-body an-limb' });

  for (const key of PAINT_ORDER) {
    const state = key === primary ? 'primary' : secondary.includes(key) ? 'secondary' : 'idle';
    for (const d of REGIONS[key]) {
      add('path', { d, class: `an-muscle is-${state}`, 'data-region': key });
    }
  }

  add('path', { d: OUTLINE, class: 'an-edge' });
  add('line', { x1: 100, y1: 60, x2: 100, y2: 210, class: 'an-spine' });
  return svg;
}
