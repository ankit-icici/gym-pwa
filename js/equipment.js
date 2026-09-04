/*
 * equipment.js — composable gym-equipment parts for the figure scenes.
 *
 * A "part" is a function (gStatic, gLive) => update(joints, pose, u) | void.
 * `scene([...parts])` bundles them into the `equipmentLayer` that rig.js wants.
 *
 * The world is y-down with the FLOOR AT y = 0, so a standing pelvis sits at
 * y = -86 (see STAND in data/back.js).
 */

const NS = 'http://www.w3.org/2000/svg';

export const E = (tag, attrs = {}) => {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  return n;
};

export function scene(parts) {
  return (_el, gStatic, gLive) => {
    gStatic.appendChild(E('line', { class: 'eq-floor', x1: -108, y1: 0, x2: 108, y2: 0 }));
    const updates = parts.map((p) => p(gStatic, gLive)).filter(Boolean);
    return (s, pose, u) => { for (const f of updates) f(s, pose, u); };
  };
}

/* Mid-point between the two hands — the natural place to hang a bar. */
const hands = (s) => [(s.right.hand[0] + s.left.hand[0]) / 2, (s.right.hand[1] + s.left.hand[1]) / 2];

/* ---------- free weights ---------- */

/** A barbell held in the hands. Seen end-on in side view, full-length from the front. */
export const bar = ({ view = 'side', halfWidth = 46, plate = 21 } = {}) => (gS, gL) => {
  if (view === 'side') {
    const disc = E('circle', { class: 'eq-plate', r: plate });
    const hub = E('circle', { class: 'eq-hub', r: 4.5 });
    gL.append(disc, hub);
    return (s) => {
      const h = hands(s);
      for (const n of [disc, hub]) { n.setAttribute('cx', h[0].toFixed(1)); n.setAttribute('cy', h[1].toFixed(1)); }
    };
  }
  const shaft = E('line', { class: 'eq-bar' });
  const discs = [-1, 1].map(() => E('rect', { class: 'eq-plate', width: 9, height: plate * 2, rx: 3 }));
  gL.append(shaft, ...discs);
  return (s) => {
    const y = (s.right.hand[1] + s.left.hand[1]) / 2;
    const cx = (s.right.hand[0] + s.left.hand[0]) / 2;
    shaft.setAttribute('x1', cx - halfWidth); shaft.setAttribute('y1', y);
    shaft.setAttribute('x2', cx + halfWidth); shaft.setAttribute('y2', y);
    discs.forEach((d, i) => {
      d.setAttribute('x', cx + (i ? halfWidth - 14 : -halfWidth + 5));
      d.setAttribute('y', y - plate);
    });
  };
};

/** One dumbbell per hand. */
export const dumbbells = ({ view = 'side', hands: which = 'both', size = 13 } = {}) => (gS, gL) => {
  const targets = which === 'right' ? ['right'] : which === 'left' ? ['left'] : ['right', 'left'];
  const made = targets.map((k) => {
    const g = E('g', { class: 'eq-db' });
    g.append(
      E('line', { class: 'eq-bar', x1: -size, y1: 0, x2: size, y2: 0 }),
      E('rect', { class: 'eq-plate', x: -size - 4, y: -size + 1, width: 8, height: size * 2 - 2, rx: 3 }),
      E('rect', { class: 'eq-plate', x: size - 4, y: -size + 1, width: 8, height: size * 2 - 2, rx: 3 }),
    );
    gL.appendChild(g);
    return [k, g];
  });
  return (s) => {
    for (const [k, g] of made) {
      const h = s[k].hand;
      // In side view the handle points at the camera, so turn it edge-on.
      const rot = view === 'side' ? 90 : 0;
      g.setAttribute('transform', `translate(${h[0].toFixed(1)} ${h[1].toFixed(1)}) rotate(${rot})`);
    }
  };
};

/** A fixed overhead bar (pull-ups, chin-ups). */
export const pullupBar = ({ y = -178, halfWidth = 62 } = {}) => (gS) => {
  gS.append(
    E('line', { class: 'eq-frame', x1: -halfWidth, y1: y, x2: -halfWidth, y2: y + 8 }),
    E('line', { class: 'eq-frame', x1: halfWidth, y1: y, x2: halfWidth, y2: y + 8 }),
    E('line', { class: 'eq-bar', x1: -halfWidth - 6, y1: y + 8, x2: halfWidth + 6, y2: y + 8 }),
    E('line', { class: 'eq-frame', x1: -halfWidth, y1: y, x2: halfWidth, y2: y }),
  );
};

/* ---------- cables & machines ---------- */

/**
 * A weight stack, upright post and pulley, plus a live cable that tracks the hands.
 * `attach` picks which end of the cable follows the body.
 */
export const cableRig = ({ pulley = [-78, -170], stack = 'top', postX = -84, attach = 'hands' } = {}) => (gS, gL) => {
  const floorY = 0;
  gS.append(
    E('line', { class: 'eq-frame', x1: postX, y1: floorY, x2: postX, y2: -182 }),
    E('rect', { class: 'eq-stack', x: postX - 15, y: -128, width: 30, height: 128, rx: 4 }),
  );
  for (let i = 0; i < 6; i++) {
    gS.appendChild(E('line', { class: 'eq-stack-line', x1: postX - 15, y1: -124 + i * 20, x2: postX + 15, y2: -124 + i * 20 }));
  }
  gS.appendChild(E('circle', { class: 'eq-pulley', cx: pulley[0], cy: pulley[1], r: 7 }));

  const rope = E('polyline', { class: 'eq-cable', points: '' });
  gL.appendChild(rope);
  return (s) => {
    const h = attach === 'right' ? s.right.hand : attach === 'left' ? s.left.hand : hands(s);
    rope.setAttribute('points', `${postX},${-132} ${postX},${pulley[1]} ${pulley[0].toFixed(1)},${pulley[1]} ${h[0].toFixed(1)},${h[1].toFixed(1)}`);
  };
};

/** A wide lat-pulldown bar hanging from the cable, angled ends and all. */
export const latBar = ({ halfWidth = 52 } = {}) => (gS, gL) => {
  const g = E('g', { class: 'eq-latbar' });
  g.append(
    E('line', { class: 'eq-bar', x1: -halfWidth, y1: 0, x2: halfWidth, y2: 0 }),
    E('line', { class: 'eq-bar', x1: -halfWidth, y1: 0, x2: -halfWidth - 9, y2: 11 }),
    E('line', { class: 'eq-bar', x1: halfWidth, y1: 0, x2: halfWidth + 9, y2: 11 }),
  );
  gL.appendChild(g);
  return (s) => {
    const h = hands(s);
    g.setAttribute('transform', `translate(${h[0].toFixed(1)} ${h[1].toFixed(1)})`);
  };
};

/** A short straight or V handle for rows and face pulls. */
export const handle = ({ halfWidth = 16, angle = 90 } = {}) => (gS, gL) => {
  const g = E('g');
  g.appendChild(E('line', { class: 'eq-bar', x1: -halfWidth, y1: 0, x2: halfWidth, y2: 0 }));
  gL.appendChild(g);
  return (s) => {
    const h = hands(s);
    g.setAttribute('transform', `translate(${h[0].toFixed(1)} ${h[1].toFixed(1)}) rotate(${angle})`);
  };
};

/* ---------- static furniture ---------- */

/** A padded bench or seat. `angle` tilts it for incline / chest-supported work. */
export const bench = ({ x = 0, y = -44, w = 92, h = 12, angle = 0, legs = true } = {}) => (gS) => {
  const g = E('g', { transform: `translate(${x} ${y}) rotate(${angle})` });
  g.appendChild(E('rect', { class: 'eq-pad', x: -w / 2, y: -h, width: w, height: h, rx: 5 }));
  gS.appendChild(g);
  if (legs) {
    gS.append(
      E('line', { class: 'eq-frame', x1: x - w / 3, y1: y, x2: x - w / 3, y2: 0 }),
      E('line', { class: 'eq-frame', x1: x + w / 3, y1: y, x2: x + w / 3, y2: 0 }),
    );
  }
};

/** A vertical seat back or chest pad. */
export const pad = ({ x = 0, y = -80, w = 12, h = 54, angle = 0 } = {}) => (gS) => {
  gS.appendChild(E('rect', {
    class: 'eq-pad', x: -w / 2, y: -h / 2, width: w, height: h, rx: 5,
    transform: `translate(${x} ${y}) rotate(${angle})`,
  }));
};

/** Any straight bit of machine frame. */
export const frame = (segments) => (gS) => {
  for (const [x1, y1, x2, y2] of segments) {
    gS.appendChild(E('line', { class: 'eq-frame', x1, y1, x2, y2 }));
  }
};

/** A foot plate to brace against on seated rows. */
export const footPlate = ({ x = -62, y = -18, angle = -12 } = {}) => (gS) => {
  gS.appendChild(E('rect', {
    class: 'eq-pad', x: -6, y: -22, width: 12, height: 44, rx: 4,
    transform: `translate(${x} ${y}) rotate(${angle})`,
  }));
};

/** A barbell resting across the traps (squats, good mornings). */
export const barOnBack = ({ view = 'side', plate = 22, halfWidth = 46 } = {}) => (gS, gL) => {
  if (view === 'side') {
    const disc = E('circle', { class: 'eq-plate', r: plate });
    const hub = E('circle', { class: 'eq-hub', r: 4.5 });
    gL.append(disc, hub);
    return (s) => {
      // Sit the bar on top of the shoulder girdle, just behind the neck.
      const [x, y] = s.shoulderMid;
      for (const n of [disc, hub]) { n.setAttribute('cx', (x - 5).toFixed(1)); n.setAttribute('cy', (y - 4).toFixed(1)); }
    };
  }
  const shaft = E('line', { class: 'eq-bar' });
  gL.appendChild(shaft);
  return (s) => {
    const [x, y] = s.shoulderMid;
    shaft.setAttribute('x1', x - halfWidth); shaft.setAttribute('y1', y - 4);
    shaft.setAttribute('x2', x + halfWidth); shaft.setAttribute('y2', y - 4);
  };
};

/** Machine lever arms: a rod from a fixed pivot out to each hand (pec deck). */
export const armLinks = ({ pivot = [0, -150] } = {}) => (gS, gL) => {
  gS.appendChild(E('circle', { class: 'eq-pulley', cx: pivot[0], cy: pivot[1], r: 5 }));
  const rods = [E('line', { class: 'eq-frame' }), E('line', { class: 'eq-frame' })];
  gL.append(...rods);
  return (s) => {
    for (const [i, side] of [s.right, s.left].entries()) {
      rods[i].setAttribute('x1', pivot[0]); rods[i].setAttribute('y1', pivot[1]);
      rods[i].setAttribute('x2', side.hand[0].toFixed(1)); rods[i].setAttribute('y2', side.hand[1].toFixed(1));
    }
  };
};
