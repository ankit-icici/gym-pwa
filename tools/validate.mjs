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
    if (e.secondary?.includes(e.target)) note(`${gid}/${e.id}: lists its own target as secondary`);
  }

  // Rule: at least ten exercises per region, with a mix of equipment.
  for (const region of group.regions) {
    const n = perRegion[region] ?? 0;
    if (n < MIN_PER_REGION) note(`${gid}/${region}: only ${n} exercises (minimum ${MIN_PER_REGION})`);
    const kinds = new Set(exercises.filter((e) => e.target === region).map((e) => e.equipment));
    if (kinds.size < 3) note(`${gid}/${region}: only ${kinds.size} equipment type(s) — needs a mix`);
  }

  // A fixed plan (Arms) must only reference regions the group actually has.
  for (const region of group.plan ?? []) {
    if (!group.regions.includes(region)) note(`${gid}: plan references unknown region "${region}"`);
  }
}

/* Every region shown in the UI needs a gym-floor display name. */
const anatomy = await import(path.join(ROOT, 'js/anatomy.js'));
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
