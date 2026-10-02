/**
 * Generates src/data/champions.json from Pokémon Showdown's data for the current
 * Pokémon Champions regulation (season).
 *
 * @smogon/calc already ships Champions species/move/item/ability data (gen 0),
 * so this only adds what the calc lacks: legal abilities and learnsets per species,
 * plus which regulation and package versions the data came from.
 *
 * Run with `npm run data`. The "Update Champions data" GitHub Action does this weekly
 * with the latest pokemon-showdown and @smogon/calc, so new seasons are picked up.
 */
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import ps from 'pokemon-showdown';
import calc from '@smogon/calc';
import {buildPresets, type Preset} from './presets';

const {Dex} = ps;
const {Generations} = calc;

/**
 * The current season is the newest searchable official VGC format, e.g.
 * "[Gen 9 Champions] VGC 2026 Reg M-B". Its `mod` holds that regulation's rules.
 */
const current = Dex.formats.all()
  .filter(f => /^gen9championsvgc\d+reg[a-z]+$/.test(f.id) && f.searchShow)
  .sort((a, b) => a.id.localeCompare(b.id))
  .at(-1);
if (!current) throw new Error('No current Champions VGC format found in pokemon-showdown');
const regulation = current.name.match(/Reg [A-Z0-9-]+/)?.[0] ?? current.name.replace(/^\[.*?\]\s*/, '');
console.log(`Current regulation: ${current.name} (mod: ${current.mod})`);

const dex = Dex.mod(current.mod);
const gen = Generations.get(0);
const calcMoves = new Set([...gen.moves].map(m => m.name));
const learnsets = dex.data.Learnsets as Record<string, {learnset?: Record<string, unknown>}>;

function movesFor(id: string): string[] {
  const out = new Set<string>();
  // Walk forme → base species → pre-evolutions, since megas/formes often inherit learnsets.
  let species = dex.species.get(id);
  const seen = new Set<string>();
  while (species.exists && !seen.has(species.id)) {
    seen.add(species.id);
    for (const moveId of Object.keys(learnsets[species.id]?.learnset ?? {})) {
      const name = dex.moves.get(moveId).name;
      if (calcMoves.has(name)) out.add(name);
    }
    const next = species.changesFrom || (species.baseSpecies !== species.name ? species.baseSpecies : species.prevo);
    if (!next) break;
    species = dex.species.get(next);
  }
  return [...out].sort();
}

const species: Record<string, {abilities: string[]; moves: string[]}> = {};
const presetFallback: Record<string, string> = {};
for (const s of gen.species) {
  const sd = dex.species.get(s.name);
  if (!sd.exists) {
    console.warn(`Not in Showdown champions mod: ${s.name}`);
    continue;
  }
  // A Mega has exactly one ability. For some newer Megas Showdown's mod still reports the base
  // form's abilities, while @smogon/calc (and real usage) has the Mega's own, so trust the calc there.
  const isMega = s.name.includes('-Mega');
  const abilities = isMega
    ? Object.values(s.abilities ?? {}).filter(Boolean) as string[]
    : [...new Set(Object.values(sd.abilities).filter(Boolean))] as string[];
  species[s.name] = {abilities, moves: movesFor(s.name)};
  // In-battle formes (Aegislash-Blade, Castform-Rainy, Mimikyu-Busted…) have no sets of their own.
  if (!isMega && sd.baseSpecies !== s.name) presetFallback[s.name] = sd.baseSpecies;
}

const empty = Object.entries(species).filter(([, v]) => !v.moves.length).map(([k]) => k);
if (empty.length) console.warn(`Species with no learnset: ${empty.join(', ')}`);

// Default builds from Smogon. If the download fails (offline, site down), keep the previous ones
// rather than wiping them.
const outFile = new URL('../src/data/champions.json', import.meta.url);
const itemNames = [...gen.items].map(i => i.name).sort();
let presets: Record<string, Preset>;
try {
  presets = await buildPresets(species, presetFallback, new Set(itemNames), new Set([...gen.natures].map(n => n.name)));
} catch (e) {
  console.warn(`Could not fetch Smogon presets (${(e as Error).message}); keeping existing ones.`);
  presets = existsSync(outFile) ? JSON.parse(readFileSync(outFile, 'utf8')).presets ?? {} : {};
}
const bySource = Object.values(presets).reduce<Record<string, number>>((acc, p) => {
  acc[p.source] = (acc[p.source] ?? 0) + 1;
  return acc;
}, {});
console.log(`Presets: ${Object.keys(presets).length}/${Object.keys(species).length}`, bySource);

const version = (pkg: string) =>
  JSON.parse(readFileSync(new URL(`../node_modules/${pkg}/package.json`, import.meta.url), 'utf8')).version as string;

const out = {
  regulation,
  format: current.name.replace(/^\[.*?\]\s*/, ''),
  sources: {showdown: version('pokemon-showdown'), calc: version('@smogon/calc')},
  items: itemNames,
  species,
  presets,
};
writeFileSync(outFile, JSON.stringify(out));
console.log(`Wrote ${regulation}: ${Object.keys(species).length} species, ${out.items.length} items`);
