/*
 * tools/validate.mjs — checks the exercise data against the owner's curation
 * rules. Run it after any data change:
 *
 *     node tools/validate.mjs
 *
 * These rules were set by the owner over several rounds of feedback; this
 * script is what makes them enforceable instead of merely written down.
 */

import { readdir, readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIN_PER_REGION = 10;
const MIN_EQUIPMENT_TYPES = 3;
/* Must match EQUIPMENT_FILTERS in js/app.js — anything else is unreachable by
   every filter chip, and nothing in the UI would tell you. */
const EQUIPMENT = ['Machine', 'Cable', 'Barbell', 'Dumbbell', 'Bodyweight'];

const problems = [];
const note = (msg) => problems.push(msg);

const groupFiles = (await readdir(path.join(ROOT, 'js/data'))).filter((f) => f.endsWith('.js'));
const photos = new Set(await readdir(path.join(ROOT, 'img/demo')));

const seenIds = new Map();      // exercise id -> group it appeared in
const seenNames = new Map();    // display name -> group

for (const file of groupFiles) {
  const mod = await import(path.join(ROOT, 'js/data', file));
  const { group, exercises, byId } = mod;
  const gid = group.id;

  if (`${gid}.js` !== file) note(`${file}: group.id is "${gid}" but the filename says otherwise`);
  // Rendered straight into the group hero; missing it prints "undefined".
  for (const field of ['name', 'tagline']) {
    if (!group[field]) note(`${gid}: group.${field} is missing`);
  }
  if (Object.keys(byId).length !== exercises.length) note(`${gid}: byId and exercises disagree in length`);

  const perRegion = {};
  for (const e of exercises) {
    // Rule: an exercise appears exactly once in the whole app.
    if (seenIds.has(e.id)) note(`duplicate id "${e.id}" in ${gid} and ${seenIds.get(e.id)}`);
    seenIds.set(e.id, gid);
    if (seenNames.has(e.name)) note(`duplicate name "${e.name}" in ${gid} and ${seenNames.get(e.name)}`);
    seenNames.set(e.name, gid);

    // Rule: every exercise sits under one of its group's declared regions.
    if (!group.regions.includes(e.target)) {
      note(`${gid}/${e.id}: target "${e.target}" is not one of ${group.regions.join(', ')}`);
    }
    perRegion[e.target] = (perRegion[e.target] ?? 0) + 1;

    // Rule: real photo demonstrations, both frames, named by convention.
    for (const frame of [0, 1]) {
      if (!photos.has(`${e.id}-${frame}.jpg`)) note(`${gid}/${e.id}: missing img/demo/${e.id}-${frame}.jpg`);
    }

    // Rule: form cues only, no how-to step lists.
    if (e.howTo) note(`${gid}/${e.id}: has a howTo list — the owner asked for cues only`);
    if (!Array.isArray(e.cues) || !e.cues.length) note(`${gid}/${e.id}: no form cues`);
    for (const field of ['name', 'equipment', 'level', 'setsReps']) {
      if (!e[field]) note(`${gid}/${e.id}: missing ${field}`);
    }
    if (e.equipment && !EQUIPMENT.includes(e.equipment)) {
      note(`${gid}/${e.id}: equipment "${e.equipment}" is not one of ${EQUIPMENT.join(', ')} — no filter would ever show it`);
    }
    if (e.secondary?.includes(e.target)) note(`${gid}/${e.id}: lists its own target as secondary`);
  }

  // Rule: at least ten exercises per region, with a mix of equipment.
  for (const region of group.regions) {
    const n = perRegion[region] ?? 0;
    if (n < MIN_PER_REGION) note(`${gid}/${region}: only ${n} exercises (minimum ${MIN_PER_REGION})`);
    const kinds = new Set(exercises.filter((e) => e.target === region).map((e) => e.equipment));
    if (kinds.size < MIN_EQUIPMENT_TYPES) {
      note(`${gid}/${region}: only ${kinds.size} equipment type(s) — needs at least ${MIN_EQUIPMENT_TYPES}`);
    }
  }

  // A fixed plan (Arms) must only reference regions the group actually has.
  for (const region of group.plan ?? []) {
    if (!group.regions.includes(region)) note(`${gid}: plan references unknown region "${region}"`);
  }
}

/*
 * Every region shown in the UI needs a gym-floor display name, and the body
 * map has to be internally consistent: a key listed in PAINT_ORDER without a
 * matching REGIONS entry throws at render time and blanks every screen with a
 * body map on it.
 */
const anatomy = await import(path.join(ROOT, 'js/anatomy.js'));
const anatomySrc = await readFile(path.join(ROOT, 'js/anatomy.js'), 'utf8');
for (const view of ['front', 'back']) {
  const order = anatomySrc.match(new RegExp(`${view}:\\s*\\[([^\\]]*)\\]`));
  if (!order) { note(`js/anatomy.js: no PAINT_ORDER entry for the ${view} view`); continue; }
  const keys = [...order[1].matchAll(/'([a-z_]+)'/g)].map((m) => m[1]);
  for (const k of keys) {
    if (!anatomySrc.includes(`    ${k}: [`)) {
      note(`js/anatomy.js: PAINT_ORDER.${view} lists "${k}" but REGIONS.${view} has no shapes for it — this throws at render`);
    }
  }
}
for (const file of groupFiles) {
  const { group } = await import(path.join(ROOT, 'js/data', file));
  for (const region of group.regions) {
    if (!anatomy.MUSCLES[region]) note(`${group.id}: region "${region}" has no entry in MUSCLES (js/anatomy.js)`);
  }
}

/*
 * Every local file the app loads must be precached, or it silently fails
 * offline. Checking only the obvious ones is how two icons went missing.
 */
const sw = await readFile(path.join(ROOT, 'sw.js'), 'utf8');
const shell = new Set([...sw.matchAll(/'(\.\/[^']*)'/g)].map((m) => m[1]));

const shipped = [];
for (const dir of ['', 'css', 'js', 'js/data', 'icons', 'img/demo']) {
  for (const f of await readdir(path.join(ROOT, dir || '.'), { withFileTypes: true })) {
    if (!f.isFile()) continue;
    if (/\.(html|css|js|png|jpg|webmanifest)$/.test(f.name)) {
      shipped.push(dir ? `./${dir}/${f.name}` : `./${f.name}`);
    }
  }
}
for (const f of shipped) {
  // sw.js registers itself and tools are dev-only; everything else must ship.
  if (f === './sw.js' || f.startsWith('./tools')) continue;
  if (!shell.has(f)) note(`sw.js SHELL is missing ${f}`);
}
for (const f of shell) {
  if (f === './') continue;
  try { await access(path.join(ROOT, f)); }
  catch { note(`sw.js SHELL lists ${f}, which does not exist`); }
}

/* Photos with no exercise pointing at them are dead weight in the cache. */
for (const p of photos) {
  const id = p.replace(/-[01]\.jpg$/, '');
  if (!seenIds.has(id)) note(`img/demo/${p} belongs to no exercise`);
}

/* Fields the UI reads must exist on the data. A rename that misses one shows
   the user "undefined" and nothing else complains. */
const appSrc = await readFile(path.join(ROOT, 'js/app.js'), 'utf8');
const rendered = new Set([...appSrc.matchAll(/\$\{e\.([a-zA-Z]+)\}/g)].map((m) => m[1]));
for (const file of groupFiles) {
  const mod = await import(path.join(ROOT, 'js/data', file));
  for (const field of rendered) {
    const missing = mod.exercises.filter((e) => !(field in e));
    if (missing.length === mod.exercises.length) {
      note(`js/app.js renders e.${field}, which no exercise in ${mod.group.id} defines`);
    } else if (missing.length) {
      note(`${mod.group.id}: ${missing.length} exercise(s) missing "${field}", which js/app.js renders`);
    }
  }
}

/* The app name must agree everywhere it is written. */
const NAME = 'The Forge';
for (const [file, needle] of [['index.html', NAME], ['manifest.webmanifest', NAME], ['js/app.js', `setBar('${NAME}')`]]) {
  const text = await readFile(path.join(ROOT, file), 'utf8');
  if (!text.includes(needle)) note(`${file}: does not mention "${needle}" — app name out of sync`);
}

const total = seenIds.size;
if (problems.length) {
  console.error(`FAILED — ${problems.length} problem(s):\n` + problems.map((p) => `  - ${p}`).join('\n'));
  process.exit(1);
}
console.log(`OK — ${total} exercises across ${groupFiles.length} groups, ${photos.size} photos, all rules pass.`);
