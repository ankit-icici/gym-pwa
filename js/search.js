/*
 * search.js — find an exercise by the words a lifter actually types.
 * Pure, no DOM, so it can be checked from node like workout.js.
 *
 * Every word typed has to appear somewhere in the exercise's name, its muscle,
 * its group, its equipment or its type — so "straight arm lat pull down" finds
 * Straight-Arm Pulldown through its muscle, Lats, even though the name never
 * says "lat". Spacing and punctuation are ignored, because gym spelling is not
 * consistent: "pull down", "pull-down" and "pulldown" are the same search, as
 * are "pullup" and "Pull-Up".
 */

/* Shorthand and common misspellings, expanded before matching. Kept small on
   purpose: anything that is already a substring of the real word ("tricep",
   "delt") needs no entry. */
const ALIASES = {
  dumbell: 'dumbbell', db: 'dumbbell', bb: 'barbell', bw: 'bodyweight',
  rdl: 'romanian deadlift', ohp: 'overhead press', sldl: 'stiff leg deadlift',
};

const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const squash = (s) => s.replace(/ /g, '');

function queryWords(query) {
  const words = normalize(query).split(' ').filter(Boolean);
  return words.flatMap((w) => (ALIASES[w] ?? w).split(' '));
}

/* A word matches a text if it is inside it with or without the spaces. */
const hit = (word, spaced) => spaced.includes(word) || squash(spaced).includes(word);

/**
 * @param groups  [{ group, exercises }] — the loaded group modules
 * @param query   what the user typed
 * @param muscles the MUSCLES registry, for gym-floor muscle names
 * @returns [{ group, e }] best first; empty for a blank query
 */
export function searchExercises(groups, query, muscles) {
  const words = queryWords(query);
  if (!words.length) return [];
  const phrase = squash(normalize(query));

  const found = [];
  for (const { group, exercises } of groups) {
    for (const e of exercises) {
      const m = muscles[e.target] ?? {};
      const name = normalize(e.name);
      const all = normalize([e.name, m.name, m.short, group.name, e.equipment, e.pattern].join(' '));
      if (!words.every((w) => hit(w, all))) continue;
      // Words found in the name itself outrank words found only through the
      // muscle or group, and the whole query inside the name outranks both.
      const score = words.filter((w) => hit(w, name)).length
        + (squash(name).includes(phrase) ? words.length : 0)
        + (name.startsWith(words[0]) ? 0.5 : 0);
      found.push({ group, e, score });
    }
  }
  return found
    .sort((a, b) => b.score - a.score || a.e.name.localeCompare(b.e.name))
    .map(({ group, e }) => ({ group, e }));
}
