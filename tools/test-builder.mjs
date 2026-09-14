/*
 * tools/test-builder.mjs — checks the day builder against the training rules.
 *
 *     node tools/test-builder.mjs
 *
 * `validate.mjs` is the companion to this and checks the *data*. This checks
 * what the builder does with it: that a day covers the whole muscle group, is
 * ordered the way a trainer would coach it, spreads across equipment, and ends
 * on its bodyweight bonus. Those rules were the whole point of the generator
 * and they lived only in prose, which meant a rewrite of `orderDay` could
 * break every one of them while `validate.mjs` still printed OK.
 *
 * It sweeps every group against every length and every equipment filter, many
 * times over, because the builder samples: a rule that holds on one draw can
 * fail on the next. Exits non-zero on failure.
 */

import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  buildWorkout, slotAlternatives, regionSequence, slotCounts, orderDay, repBucket,
  leadsWithCompound,
} from '../js/workout.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LENGTHS = [4, 5, 6];
/* Must match EQUIPMENT_FILTERS in js/app.js. */
const FILTERS = ['All', 'Machine', 'Cable', 'Barbell', 'Dumbbell', 'Bodyweight'];
const LOADED = ['Machine', 'Cable', 'Barbell', 'Dumbbell'];
const DRAWS = 60;          // draws per group/length/filter
const MIN_DISTINCT = 40;   // distinct days per 200 rebuilds at length 6

const problems = [];
const seen = new Set();
/* One line per distinct failure: a sampling bug fires on most draws, and a
   thousand copies of it buries everything else. */
const note = (msg) => { if (!seen.has(msg)) { seen.add(msg); problems.push(msg); } };

const groupFiles = (await readdir(path.join(ROOT, 'js/data'))).filter((f) => f.endsWith('.js'));
const mods = [];
for (const file of groupFiles) mods.push(await import(path.join(ROOT, 'js/data', file)));

for (const mod of mods) {
  const { group, byId, exercises } = mod;
  const gid = group.id;

  /* Slot allocation: every muscle is represented before any is doubled, and
     the shares add up to the length asked for. */
  for (const len of LENGTHS) {
    const counts = slotCounts(group.regions, len, group.volume);
    const total = counts.reduce((a, b) => a + b, 0);
    if (total !== len) note(`${gid}/${len}: slots add up to ${total}, not ${len}`);
    if (counts.some((c) => c < 1)) {
      note(`${gid}/${len}: ${group.regions[counts.findIndex((c) => c < 1)]} gets no slot`);
    }
    if (Math.max(...counts) - Math.min(...counts) > 2) {
      note(`${gid}/${len}: lopsided split ${counts.join('/')} — check group.volume`);
    }
    if (regionSequence(group, len).length !== len) note(`${gid}/${len}: regionSequence length`);
  }

  for (const len of LENGTHS) {
    for (const filter of FILTERS) {
      const where = `${gid}/${len}/${filter}`;
      for (let draw = 0; draw < DRAWS; draw++) {
        let items;
        try { items = buildWorkout(mod, filter, len); }
        catch (err) { note(`${where}: threw ${err.message}`); continue; }
        const day = items.map((it) => byId[it.id]);
        if (day.some((e) => !e)) { note(`${where}: produced an id no exercise has`); continue; }

        const bonus = items.filter((it) => it.finisher);
        const main = items.filter((it) => !it.finisher).map((it) => byId[it.id]);

        /* Length: the chosen number, plus the bonus on top of it. */
        if (main.length !== len) note(`${where}: ${main.length} exercises, expected ${len}`);
        if (new Set(items.map((it) => it.id)).size !== items.length) {
          note(`${where}: the same exercise twice in one day`);
        }

        /* The bodyweight finisher. Filtered to Bodyweight the day can legitimately
           use everything the group has, leaving none — see buildWorkout. */
        if (bonus.length > 1) note(`${where}: ${bonus.length} finishers`);
        if (bonus.length && !items[items.length - 1].finisher) note(`${where}: finisher is not last`);
        if (bonus.length && byId[bonus[0].id].equipment !== 'Bodyweight') {
          note(`${where}: finisher "${bonus[0].id}" is not a bodyweight movement`);
        }
        if (!bonus.length && filter !== 'Bodyweight') note(`${where}: no finisher`);

        /* Coverage: every muscle in the group gets trained. */
        const hit = new Set(main.map((e) => e.target));
        for (const region of group.regions) {
          if (!hit.has(region)) note(`${where}: trains nothing for ${region}`);
        }

        /* Order: compounds lead, and no accessory is revisited once left. */
        let afterIsolation = false;
        for (const e of main) {
          if (e.pattern === 'isolation') afterIsolation = true;
          else if (afterIsolation) note(`${where}: compound "${e.id}" placed after isolation work`);
        }
        const blocks = [];
        for (const e of main.filter((x) => x.pattern === 'isolation')) {
          if (blocks[blocks.length - 1] !== e.target) blocks.push(e.target);
        }
        if (new Set(blocks).size !== blocks.length) {
          note(`${where}: accessory work returns to a muscle it already left (${blocks.join(' → ')})`);
        }

        /* A muscle's own slots run compound first, then heavier before lighter. */
        for (const region of hit) {
          const inRegion = main.filter((e) => e.target === region);
          const ranked = [...inRegion].sort((a, b) =>
            (a.pattern === 'compound' ? 0 : 1) - (b.pattern === 'compound' ? 0 : 1)
            || loadOf(a) - loadOf(b));
          if (inRegion.some((e, i) => e.id !== ranked[i].id)) {
            note(`${where}: ${region} slots are out of order`);
          }
        }

        /* Swapping any slot must offer somewhere to go, and must include the
           current pick so repeated taps cycle rather than jumping. */
        for (let i = 0; i < items.length; i++) {
          const alts = slotAlternatives(mod, items, i);
          if (!alts.length) { note(`${where}: nothing to swap slot ${i + 1} for`); continue; }
          if (!alts.some((e) => e.id === items[i].id)) {
            note(`${where}: slot ${i + 1} swap list omits the current exercise, so it cannot cycle`);
          }
          if (items[i].finisher && alts.some((e) => e.equipment !== 'Bodyweight')) {
            note(`${where}: finisher swaps to non-bodyweight work`);
          }
        }
      }
    }
  }

  /*
   * Properties of many draws rather than of one, because the builder samples
   * among the candidates that score near the top. Asserting these per draw is
   * wrong and was the first thing this file got wrong: the heavy anchor is a
   * scoring preference, so a single day is allowed to miss it.
   */
  const days = new Set();
  let allFour = 0;
  let anchored = 0;
  /* A day is built around one heavy compound — but only muscles that lead with
     compounds can supply one, and abs and calves honestly cannot. */
  const wantsAnchor = group.regions.some((r) => leadsWithCompound(r, exercises)
    && exercises.some((e) => e.target === r && e.pattern === 'compound' && repBucket(e) === 'heavy'));
  for (let draw = 0; draw < 200; draw++) {
    const day = buildWorkout(mod, 'All', 6);
    days.add(day.map((it) => it.id).join(','));
    const kinds = new Set(day.map((it) => byId[it.id].equipment).filter((q) => LOADED.includes(q)));
    if (kinds.size === 4) allFour++;
    const main6 = day.filter((it) => !it.finisher).map((it) => byId[it.id]);
    if (main6.some((e) => e.pattern === 'compound' && repBucket(e) === 'heavy')) anchored++;
  }
  if (wantsAnchor && anchored < 160) {
    note(`${gid}: only ${anchored / 2}% of days are anchored by a heavy compound`);
  }
  if (days.size < MIN_DISTINCT) {
    note(`${gid}: only ${days.size} distinct days in 200 rebuilds — Rebuild is not rebuilding`);
  }
  if (allFour < 40) {
    note(`${gid}: only ${allFour}% of days use all four loaded equipment kinds`);
  }
}

/* orderDay must not invent or lose exercises. */
{
  const mod = mods.find((m) => m.group.id === 'back') ?? mods[0];
  const picked = mod.exercises.slice(0, 6);
  const out = orderDay(picked, mod.group);
  if (out.length !== picked.length || new Set(out).size !== picked.length) {
    note('orderDay changed the contents of a day rather than only its order');
  }
}

function loadOf(e) {
  const RANK = { heavy: 0, moderate: 1, high: 2 };
  return RANK[repBucket(e)];
}

if (problems.length) {
  console.error(`FAILED — ${problems.length} problem(s):\n` + problems.map((p) => `  - ${p}`).join('\n'));
  process.exit(1);
}
console.log(`OK — day builder holds for ${mods.length} groups × ${LENGTHS.length} lengths × ${FILTERS.length} filters.`);
