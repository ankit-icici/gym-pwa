import { createAnatomy, MUSCLES } from './anatomy.js';

/* ============================================================
   Muscle-group registry.
   To add a group: write js/data/<id>.js in the shape of back.js, drop its
   demonstration photos in img/demo/, and flip `ready` here.
   ============================================================ */
/* count/areas/art power the home tiles without loading the data modules. */
const REGISTRY = [
  { id: 'back',      name: 'Back',      ready: true, count: 45, areas: 4, art: 'lats',        load: () => import('./data/back.js') },
  { id: 'chest',     name: 'Chest',     ready: true, count: 30, areas: 3, art: 'mid_chest',   load: () => import('./data/chest.js') },
  { id: 'shoulders', name: 'Shoulders', ready: true, count: 33, areas: 3, art: 'side_delts',  load: () => import('./data/shoulders.js') },
  { id: 'arms',      name: 'Arms',      ready: true, count: 33, areas: 3, art: 'biceps',      load: () => import('./data/arms.js') },
  { id: 'legs',      name: 'Legs',      ready: true, count: 44, areas: 4, art: 'quads',       load: () => import('./data/legs.js') },
  { id: 'core',      name: 'Core',      ready: true, count: 32, areas: 3, art: 'upper_abs',   load: () => import('./data/core.js') },
];

const EQUIPMENT_FILTERS = ['All', 'Machine', 'Cable', 'Barbell', 'Dumbbell', 'Bodyweight'];
/* Session lengths offered. The default is one exercise per target area —
   fewer means dropping a region, in priority order. */
const LENGTHS = [4, 5, 6];

/* ============================================================
   Storage — small, forgiving, never throws in private mode.
   ============================================================ */
const store = {
  get(k, fallback) {
    try { const v = localStorage.getItem(k); return v === null ? fallback : JSON.parse(v); }
    catch { return fallback; }
  },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* quota or private mode */ } },
};

const todayKey = () => new Date().toISOString().slice(0, 10);

/* ============================================================
   Theme — auto / light / dark, remembered between visits.
   ============================================================ */
const THEMES = ['auto', 'light', 'dark'];
let theme = store.get('gym.theme', 'auto');

function applyTheme() {
  const root = document.documentElement;
  if (theme === 'auto') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
  const dark = theme === 'dark' || (theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0A0B0D' : '#F7F7F5');
}
function cycleTheme() {
  theme = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
  store.set('gym.theme', theme);
  applyTheme();
  render();
}
applyTheme();
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

/* ============================================================
   Icons
   ============================================================ */
const ICON = {
  back: '<path d="M15 18l-6-6 6-6"/>',
  chevron: '<path d="M9 18l6-6-6-6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z"/>',
  auto: '<rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8.5 21h7M12 17v4"/>',
  bolt: '<path d="M13 2L4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5z"/>',
  shuffle: '<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
  swap: '<path d="M17 2l4 4-4 4"/><path d="M3 6h18"/><path d="M7 22l-4-4 4-4"/><path d="M21 18H3"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  play: '<path d="M8 5v14l11-7z"/>',
  pause: '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>',
  spark: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/>',
  add: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
};
const svgIcon = (n, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`;

/* ============================================================
   The demonstration player.
   Two photographs of a real lifter — starting position and peak — cross-faded
   on a loop. One active player at a time; released on every route change.
   ============================================================ */
let player = null;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

function releaseMedia() {
  if (player) { clearInterval(player.timer); player = null; }
}

function mountPlayer(box, e, demo) {
  const imgs = box.querySelectorAll('.demo-img');
  const label = box.querySelector('.pose-label');
  const btn = box.querySelector('[data-play]');
  let frame = 0;
  let playing = !reducedMotion.matches;

  const show = (f) => {
    frame = f;
    imgs[0].classList.toggle('is-active', f === 0);
    imgs[1].classList.toggle('is-active', f === 1);
    if (label) label.textContent = f === 0 ? 'Start' : 'Peak';
  };
  const tick = () => show(frame === 0 ? 1 : 0);

  const start = () => {
    clearInterval(player.timer);
    player.timer = setInterval(tick, 1500);
  };
  player = { timer: 0 };
  if (playing) start(); else show(1);

  btn?.addEventListener('click', () => {
    playing = !playing;
    btn.innerHTML = svgIcon(playing ? 'pause' : 'play');
    btn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    if (playing) start(); else clearInterval(player.timer);
  });
  // Tapping the photo steps between positions and pauses for study.
  imgs.forEach((im) => im.addEventListener('click', () => {
    playing = false;
    clearInterval(player.timer);
    if (btn) { btn.innerHTML = svgIcon('play'); btn.setAttribute('aria-label', 'Play'); }
    tick();
  }));
}

const demoMarkup = (demo, e, { label = true } = {}) => `
  <img class="demo-img is-active" src="${demo(e.id, 0)}" alt="${e.name}, starting position" decoding="async">
  <img class="demo-img" src="${demo(e.id, 1)}" alt="${e.name}, peak position" decoding="async">
  ${label ? '<div class="pose-label">Start</div>' : ''}`;

/* ============================================================
   Workout generation.
   One exercise per target region, so a generated day always covers
   the whole muscle group instead of hammering one area six times.
   ============================================================ */
function pick(list, avoid = new Set()) {
  const fresh = list.filter((e) => !avoid.has(e.id));
  const from = fresh.length ? fresh : list;
  return from[Math.floor(Math.random() * from.length)];
}

/*
 * The region sequence IS the execution order of the day. Groups with an
 * explicit `plan` (Arms: 4 biceps, 3 triceps, 2 forearms) use it verbatim;
 * everyone else wraps around the priority list and then sorts, so a
 * 6-exercise day on 4 regions comes out as two lat movements, two rows,
 * lower back, rear delts — compounds first, isolation last.
 */
function regionSequence(group, len) {
  if (group.plan) return [...group.plan];
  const seq = [];
  for (let k = 0; seq.length < len; k++) seq.push(group.regions[k % group.regions.length]);
  seq.sort((a, b) => group.regions.indexOf(a) - group.regions.indexOf(b));
  return seq;
}

function buildWorkout(mod, filter, len = mod.group.regions.length) {
  const { group, exercises } = mod;
  const matches = (e) => filter === 'All' || e.equipment === filter;
  const used = new Set();
  const out = [];

  // Target reps stand in for how heavy a movement is: presses and squats sit
  // at 5-10 reps, isolation and burnout work at 12+.
  const heaviness = (e) => {
    const m = /×\s*(\d+)/.exec(e.setsReps);
    return m ? +m[1] : 13;   // "as many as you can" reads as a finisher
  };

  const seq = regionSequence(group, len);
  const seen = {};
  for (const region of seq) {
    const inRegion = exercises.filter((e) => e.target === region && !used.has(e.id));
    if (!inRegion.length) continue;
    // Prefer the chosen equipment, but never return a short workout because
    // of it — fall back to the whole region rather than dropping a slot.
    let eligible = inRegion.filter(matches);
    if (!eligible.length) eligible = inRegion;
    // A muscle's first exercise of the day should anchor it with something
    // heavy, so the day never comes out as all flys and finishers.
    if (!seen[region]) {
      const heavy = eligible.filter((e) => heaviness(e) <= 10);
      if (heavy.length) eligible = heavy;
      seen[region] = true;
    }
    const chosen = pick(eligible, used);
    out.push(chosen.id);
    used.add(chosen.id);
  }

  // Within each muscle's slots, heavy low-rep work comes before high-rep
  // isolation — close-grip bench before kickbacks, barbell curl before
  // machine curl. The slot pattern itself (which muscle when) is untouched.
  const byIdOf = (id) => exercises.find((e) => e.id === id);
  for (const region of new Set(seq)) {
    const slots = [];
    out.forEach((id, i) => { if (byIdOf(id).target === region) slots.push(i); });
    const ordered = slots.map((i) => out[i]).sort((a, b) => heaviness(byIdOf(a)) - heaviness(byIdOf(b)));
    slots.forEach((i, k) => { out[i] = ordered[k]; });
  }
  return out;
}

const lengthFor = (mod) => {
  if (mod.group.plan) return mod.group.plan.length;
  const saved = store.get(`gym.len.${mod.group.id}`, 6);
  return Math.min(Math.max(saved, LENGTHS[0]), LENGTHS[LENGTHS.length - 1]);
};

/** "4 biceps · 3 triceps · 2 forearms" — a plan summary for the dock. */
function planLabel(group) {
  const counts = [];
  for (const r of group.plan) {
    const hit = counts.find((c) => c.r === r);
    if (hit) hit.n++; else counts.push({ r, n: 1 });
  }
  return counts.map((c) => `${c.n} ${(MUSCLES[c.r]?.short ?? c.r).toLowerCase()}`).join(' · ');
}

const workoutKey = (gid) => `gym.workout.${gid}`;
const saveWorkout = (gid, w) => store.set(workoutKey(gid), w);

/** Saved workouts can reference exercises that no longer exist after an
    update; silently drop those instead of crashing on them. */
function loadWorkout(gid, byId = null) {
  const w = store.get(workoutKey(gid), null);
  if (!w) return null;
  if (byId) {
    w.items = w.items.filter((it) => byId[it.id]);
    if (!w.items.length) return null;
  }
  return w;
}

/* ============================================================
   Router
   ============================================================ */
const root = document.getElementById('app');
const barEl = document.getElementById('bar');
const cache = new Map();

async function loadGroup(id) {
  if (cache.has(id)) return cache.get(id);
  const entry = REGISTRY.find((g) => g.id === id);
  if (!entry?.ready) return null;
  const mod = await entry.load();
  cache.set(id, mod);
  return mod;
}

function parseRoute() {
  const h = location.hash.replace(/^#\/?/, '');
  const p = h.split('/').filter(Boolean);
  if (p[0] === 'g' && p[2] === 'e') return { name: 'detail', group: p[1], exercise: p[3] };
  if (p[0] === 'g') return { name: 'group', group: p[1] };
  if (p[0] === 'w') return { name: 'workout', group: p[1] };
  return { name: 'home' };
}

/*
 * Navigation.
 *
 * Every forward move PUSHES a history entry and every back move POPS one, so
 * the browser's own back — the swipe gesture on a phone, the system back
 * button on Android — always lands on the screen you actually came from.
 *
 * Assigning location.hash for "back" was the bug this replaces: it pushed a
 * new entry, so the stack grew on every back tap and a swipe bounced you
 * forward again.
 *
 * `depth` counts how many screens deep this history entry is, which is how we
 * tell "the user navigated here" from "the user opened a link straight to
 * here" — going back out of the latter would leave the app entirely.
 */
const depth = () => history.state?.depth ?? 0;

function go(hash) {
  if (hash === location.hash) return;
  history.pushState({ depth: depth() + 1 }, '', hash);
  render();
}

/** Replace the current entry — for redirects that should not be revisitable. */
function goReplace(hash) {
  history.replaceState({ depth: depth() }, '', hash);
  render();
}

/**
 * Step back one screen. Uses real history when we have some, so the user
 * returns to wherever they actually came from (an exercise opened from a
 * workout goes back to that workout, not to the exercise list). Falls back to
 * the parent screen when this is the first page of the session.
 */
function goBack(parentHash) {
  if (depth() > 0) history.back();
  else goReplace(parentHash);
}

function setBar(title, { back = null } = {}) {
  barEl.innerHTML = `
    <div class="bar-in">
      ${back
        ? `<button class="icon-btn" data-back="${back}" aria-label="Go back">${svgIcon('back')}</button>`
        : `<span style="width:6px"></span>`}
      <h1 class="bar-title">${title}</h1>
      <button class="icon-btn" data-theme-toggle aria-label="Theme: ${theme}. Tap to change.">
        ${svgIcon(theme === 'auto' ? 'auto' : theme === 'dark' ? 'moon' : 'sun')}
      </button>
    </div>`;
}

/* ============================================================
   Screens
   ============================================================ */
function ringSvg(frac, size = 46) {
  const r = size / 2 - 3.5;
  const c = 2 * Math.PI * r;
  return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
    <circle class="trk" cx="${size / 2}" cy="${size / 2}" r="${r}"/>
    <circle class="val" cx="${size / 2}" cy="${size / 2}" r="${r}"
      stroke-linecap="${frac > 0 ? 'round' : 'butt'}"
      stroke-dasharray="${(c * frac).toFixed(1)} ${c.toFixed(1)}"/>
  </svg>`;
}

function screenHome() {
  setBar('The Forge');
  const saved = REGISTRY.filter((g) => g.ready)
    .map((g) => ({ g, w: loadWorkout(g.id) }))
    .filter((x) => x.w);

  root.innerHTML = `
    <div class="screen wrap">
      <header class="hero">
        <div class="eyebrow">Train with intent</div>
        <h1>Pick a muscle group.<br>Get your day's exercises.</h1>
        <p>Real demonstrations for every movement, in the order you should do them, with the muscle each one hits.</p>
      </header>

      ${saved.length ? `
        <div class="section-head"><h2>In progress</h2></div>
        <div class="stack">
          ${saved.map(({ g, w }) => {
            const done = w.items.filter((i) => i.done).length;
            return `<button class="card" data-go="#/w/${g.id}">
              <div class="thumb" style="display:grid;place-items:center">${ringSvg(done / w.items.length, 52)}</div>
              <div class="card-body">
                <div class="card-name">${g.name} Day</div>
                <div class="card-sub">${done} of ${w.items.length} done · saved ${w.date === todayKey() ? 'today' : w.date}</div>
              </div>
              <span class="card-go">${svgIcon('chevron')}</span>
            </button>`;
          }).join('')}
        </div>` : ''}

      <div class="section-head"><h2>Muscle groups</h2><span class="count">${REGISTRY.filter(g => g.ready).length} ready</span></div>
      <div class="tiles">
        ${REGISTRY.map((g) => `
          <button class="tile ${g.ready ? 'is-live' : 'is-soon'}" ${g.ready ? `data-go="#/g/${g.id}"` : 'disabled'}>
            <div>
              <div class="tile-name">${g.name}</div>
              <div class="tile-sub">${g.ready ? `${g.count} exercises` : 'Coming soon'}</div>
            </div>
            ${g.ready ? `<span class="tag tag-muscle" style="align-self:flex-start">${g.areas} target areas</span>` : ''}
          </button>`).join('')}
      </div>

      <div id="install-slot"></div>
    </div>`;

  root.querySelectorAll('.tile.is-live').forEach((tile, i) => {
    const g = REGISTRY.filter((x) => x.ready)[i];
    if (!g?.art) return;
    const art = document.createElement('div');
    art.className = 'tile-art';
    art.appendChild(createAnatomy(g.art));
    tile.appendChild(art);
  });
  renderInstallHint();
}

const cardTag = (e) => `
  <span class="tag tag-muscle"><i class="tag-dot"></i>${MUSCLES[e.target]?.short ?? e.target}</span>
  <span class="tag">${e.equipment}</span>`;

function exerciseCard(gid, e, demo) {
  return `<button class="card" data-go="#/g/${gid}/e/${e.id}">
    <span class="thumb"><img class="thumb-img" src="${demo(e.id, 1)}" alt="" loading="lazy" decoding="async"></span>
    <span class="card-body">
      <span class="card-name">${e.name}</span>
      <span class="card-meta">${cardTag(e)}</span>
      <span class="card-sub">${e.setsReps}</span>
    </span>
    <span class="card-go">${svgIcon('chevron')}</span>
  </button>`;
}

async function screenGroup(gid) {
  const mod = await loadGroup(gid);
  if (!mod) return goReplace('#/');
  const { group, exercises, demo } = mod;
  setBar(group.name, { back: '#/' });

  const filter = store.get(`gym.filter.${gid}`, 'All');
  const len = lengthFor(mod);
  const shown = exercises.filter((e) => filter === 'All' || e.equipment === filter);

  root.innerHTML = `
    <div class="screen wrap">
      <header class="hero">
        <div class="eyebrow">${group.regions.length} target areas</div>
        <h1>${group.name}</h1>
        <p>${group.tagline}. ${exercises.length} exercises, grouped by the muscle each one actually trains.</p>
      </header>

      <div class="chips" role="group" aria-label="Filter by equipment">
        ${EQUIPMENT_FILTERS.map((f) => `
          <button class="chip" data-filter="${f}" aria-pressed="${f === filter}">${f === 'All' ? 'All equipment' : f}</button>`).join('')}
      </div>

      <div id="sections">
        ${group.regions.map((region) => {
          const list = shown.filter((e) => e.target === region);
          if (!list.length) return '';
          const m = MUSCLES[region];
          return `
            <div class="section-head">
              <h2 style="display:flex;align-items:center;gap:9px">
                <span class="anat-mini" data-anat="${region}"></span>${m.name}
              </h2>
              <span class="count">${list.length}</span>
            </div>
            <div class="grid">${list.map((e) => exerciseCard(gid, e, demo)).join('')}</div>`;
        }).join('')}
      </div>

      ${shown.length ? '' : `<div class="empty"><div class="e-t">Nothing with that equipment</div><div class="e-s">Try another filter.</div></div>`}
    </div>
    <div class="dock">
      <div class="dock-in">
        ${group.plan
          ? `<div class="seg"><span class="seg-label">${planLabel(group)}</span></div>`
          : `<div class="seg" role="group" aria-label="Exercises per session">
              <span class="seg-label">Exercises</span>
              ${LENGTHS.map((n) => `
                <button class="seg-btn" data-len="${n}" aria-pressed="${n === len}">${n}</button>`).join('')}
            </div>`}
        <button class="btn" data-build="${gid}">${svgIcon('bolt')} Build ${group.name} Day</button>
      </div>
    </div>`;

  hydrateAnatomy(mod);
}

async function screenDetail(gid, eid) {
  const mod = await loadGroup(gid);
  const e = mod?.byId[eid];
  if (!e) return goReplace(`#/g/${gid}`);
  const { demo } = mod;
  setBar(e.name, { back: `#/g/${gid}` });
  const m = MUSCLES[e.target];

  root.innerHTML = `
    <div class="screen wrap">
      <div class="stage">
        <div class="stage-fig photo" id="demo-box">
          ${demoMarkup(demo, e)}
          <button class="play-toggle" data-play aria-label="Pause">${svgIcon(reducedMotion.matches ? 'play' : 'pause')}</button>
        </div>
        <div class="stage-anat">
          <span data-anat-big="${e.target}"></span>
          <div class="anat-label">
            <div class="n">${m.name}</div>
            <div class="b">${m.blurb}</div>
          </div>
        </div>
      </div>

      <dl class="facts">
        <div class="fact"><dt>Equipment</dt><dd>${e.gear}</dd></div>
        <div class="fact"><dt>Sets &amp; reps</dt><dd>${e.setsReps}</dd></div>
        <div class="fact"><dt>Level</dt><dd>${e.level}</dd></div>
      </dl>

      ${e.secondary?.length ? `
        <div class="section-head"><h2>Also works</h2></div>
        <div class="card-meta">${e.secondary.map((sx) => `<span class="tag">${MUSCLES[sx]?.name ?? sx}</span>`).join('')}</div>` : ''}

      <div class="section-head"><h2>Form cues</h2></div>
      <div class="cues">${e.cues.map((c) => `<div class="cue">${svgIcon('spark')}<span>${c}</span></div>`).join('')}</div>
    </div>`;

  hydrateAnatomy(mod);
  mountPlayer(document.getElementById('demo-box'), e, demo);
}

async function screenWorkout(gid) {
  const mod = await loadGroup(gid);
  if (!mod) return goReplace('#/');
  const { group, byId, demo } = mod;
  setBar(`${group.name} Day`, { back: `#/g/${gid}` });

  let w = loadWorkout(gid, byId);
  if (!w) {
    const filter = store.get(`gym.filter.${gid}`, 'All');
    w = {
      date: todayKey(), filter,
      items: buildWorkout(mod, filter, lengthFor(mod)).map((id) => ({ id, done: false })),
    };
    saveWorkout(gid, w);
  }

  const done = w.items.filter((i) => i.done).length;
  const total = w.items.length;

  root.innerHTML = `
    <div class="screen wrap">
      <div class="progress">
        ${ringSvg(total ? done / total : 0)}
        <div class="progress-txt">
          <div class="t">${done === total ? 'Session complete. Well done.' : `${done} of ${total} finished`}</div>
          <div class="s">Do them in this order, top to bottom${w.filter !== 'All' ? ` · ${w.filter}` : ''}</div>
        </div>
      </div>

      <div class="stack">
        ${w.items.map((it, i) => {
          const e = byId[it.id];
          return `<div class="slot ${it.done ? 'is-done' : ''}">
            <button class="slot-open" data-go="#/g/${gid}/e/${e.id}">
              <span class="thumb"><span class="slot-num">${i + 1}</span><img class="thumb-img" src="${demo(e.id, 1)}" alt="" loading="lazy" decoding="async"></span>
              <span class="slot-body">
                <span class="slot-name">${e.name}</span>
                <span class="slot-meta">
                  <span class="tag tag-muscle"><i class="tag-dot"></i>${MUSCLES[e.target].short}</span>
                  <span class="slot-reps">${e.setsReps}</span>
                </span>
              </span>
            </button>
            <button class="slot-swap" data-swap="${i}" aria-label="Swap ${e.name} for another ${MUSCLES[e.target].short} exercise">${svgIcon('swap')}</button>
            <button class="tick" data-tick="${i}" aria-pressed="${it.done}" aria-label="Mark ${e.name} ${it.done ? 'not done' : 'done'}">${svgIcon('check')}</button>
          </div>`;
        }).join('')}
      </div>

      <div class="btn-row" style="margin-top:16px">
        <button class="btn btn-ghost" data-regen="${gid}">${svgIcon('shuffle')} Rebuild</button>
        <button class="btn btn-ghost" data-clear="${gid}">${svgIcon('trash')} Clear</button>
      </div>
    </div>`;
}

/* Attach the anatomy maps the markup asked for. */
function hydrateAnatomy(mod) {
  for (const host of root.querySelectorAll('[data-anat]')) {
    host.appendChild(createAnatomy(host.dataset.anat));
  }
  for (const host of root.querySelectorAll('[data-anat-big]')) {
    const e = mod.byId[parseRoute().exercise];
    host.appendChild(createAnatomy(host.dataset.anatBig, e?.secondary ?? []));
  }
}

/* ============================================================
   Install hint (Chrome fires an event; iOS needs a nudge)
   ============================================================ */
let deferredPrompt = null;
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; renderInstallHint(); });

function renderInstallHint() {
  const slot = document.getElementById('install-slot');
  if (!slot) return;
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (standalone || store.get('gym.installDismissed', false)) return;

  const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (!deferredPrompt && !iOS) return;

  slot.innerHTML = `
    <div class="section-head"><h2>Add to your phone</h2></div>
    <div class="card" style="cursor:default">
      <span class="thumb" style="display:grid;place-items:center">${svgIcon('add', 'anat-mini')}</span>
      <span class="card-body">
        <span class="card-name">Install the app</span>
        <span class="card-sub">${iOS && !deferredPrompt
          ? 'Tap Share, then “Add to Home Screen”. It then opens full screen and works offline.'
          : 'Runs full screen and works offline once installed.'}</span>
      </span>
      ${deferredPrompt ? `<button class="btn btn-sm" data-install>Install</button>` : `<button class="icon-btn" data-dismiss-install aria-label="Dismiss">×</button>`}
    </div>`;
}

/* ============================================================
   Global event wiring
   ============================================================ */
document.addEventListener('click', async (ev) => {
  const back = ev.target.closest('[data-back]');
  if (back) { goBack(back.dataset.back); return; }

  const nav = ev.target.closest('[data-go]');
  if (nav) { go(nav.dataset.go); return; }

  if (ev.target.closest('[data-theme-toggle]')) { cycleTheme(); return; }

  const len = ev.target.closest('[data-len]');
  if (len) {
    store.set(`gym.len.${parseRoute().group}`, +len.dataset.len);
    render();
    return;
  }

  const chip = ev.target.closest('[data-filter]');
  if (chip) {
    const gid = parseRoute().group;
    store.set(`gym.filter.${gid}`, chip.dataset.filter);
    render();
    return;
  }

  const build = ev.target.closest('[data-build]');
  if (build) {
    const gid = build.dataset.build;
    const mod = await loadGroup(gid);
    const filter = store.get(`gym.filter.${gid}`, 'All');
    saveWorkout(gid, {
      date: todayKey(), filter,
      items: buildWorkout(mod, filter, lengthFor(mod)).map((id) => ({ id, done: false })),
    });
    go(`#/w/${gid}`);
    return;
  }

  const tick = ev.target.closest('[data-tick]');
  const swap = ev.target.closest('[data-swap]');
  if (tick || swap) {
    const gid = parseRoute().group;
    const mod = await loadGroup(gid);
    const w = loadWorkout(gid, mod?.byId);
    if (!mod || !w) return;
    if (tick) {
      const i = +tick.dataset.tick;
      w.items[i].done = !w.items[i].done;
    } else {
      const i = +swap.dataset.swap;
      const cur = mod.byId[w.items[i].id];
      // Cycle to the next exercise that trains the same target region.
      const pool = mod.exercises.filter((x) => x.target === cur.target);
      const next = pool[(pool.findIndex((x) => x.id === cur.id) + 1) % pool.length];
      w.items[i] = { id: next.id, done: false };
    }
    saveWorkout(gid, w);
    releaseMedia();
    await screenWorkout(gid);
    return;
  }

  const regen = ev.target.closest('[data-regen]');
  if (regen) {
    const gid = regen.dataset.regen;
    const mod = await loadGroup(gid);
    const cur = loadWorkout(gid);
    const filter = cur?.filter ?? 'All';
    saveWorkout(gid, {
      date: todayKey(), filter,
      items: buildWorkout(mod, filter, lengthFor(mod)).map((id) => ({ id, done: false })),
    });
    releaseMedia();
    await screenWorkout(gid);
    return;
  }

  const clear = ev.target.closest('[data-clear]');
  if (clear) {
    try { localStorage.removeItem(workoutKey(clear.dataset.clear)); } catch { /* ignore */ }
    // The workout no longer exists, so leaving its entry in history would let
    // back land on a dead screen. Replace it rather than pushing.
    goReplace(`#/g/${clear.dataset.clear}`);
    return;
  }

  if (ev.target.closest('[data-install]') && deferredPrompt) {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    renderInstallHint();
    return;
  }
  if (ev.target.closest('[data-dismiss-install]')) {
    store.set('gym.installDismissed', true);
    document.getElementById('install-slot').innerHTML = '';
  }
});

addEventListener('scroll', () => {
  barEl.classList.toggle('is-stuck', scrollY > 4);
}, { passive: true });

/* ============================================================
   Boot
   ============================================================ */
async function render() {
  releaseMedia();
  const r = parseRoute();
  if (r.name === 'group') await screenGroup(r.group);
  else if (r.name === 'detail') await screenDetail(r.group, r.exercise);
  else if (r.name === 'workout') await screenWorkout(r.group);
  else screenHome();
  if (r.name !== 'workout') scrollTo({ top: 0 });
}

// pushState does not fire hashchange, so popstate is the single source of
// truth for back/forward. Seed the first entry with a depth so a fresh load
// (or a deep link) knows it has nothing to go back to.
addEventListener('popstate', render);
if (!history.state) history.replaceState({ depth: 0 }, '', location.hash || '#/');
render();

if ('serviceWorker' in navigator) {
  addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
