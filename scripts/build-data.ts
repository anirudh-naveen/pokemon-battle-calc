/**
 * Generates src/data/champions.json from Pokémon Showdown's `champions` mod.
 *
 * @smogon/calc already ships Champions species/move/item/ability data (gen 0),
 * so this only adds what the calc lacks: legal abilities and learnsets per species.
 * Run with `npm run data` after updating the `pokemon-showdown` devDependency.
 */
import {writeFileSync} from 'node:fs';
import ps from 'pokemon-showdown';
import calc from '@smogon/calc';

const {Dex} = ps;
const {Generations} = calc;

const dex = Dex.mod('champions');
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
for (const s of gen.species) {
  const sd = dex.species.get(s.name);
  if (!sd.exists) {
    console.warn(`Not in Showdown champions mod: ${s.name}`);
    continue;
  }
  species[s.name] = {
    abilities: [...new Set(Object.values(sd.abilities).filter(Boolean))] as string[],
    moves: movesFor(s.name),
  };
}

const empty = Object.entries(species).filter(([, v]) => !v.moves.length).map(([k]) => k);
if (empty.length) console.warn(`Species with no learnset: ${empty.join(', ')}`);

const out = {
  items: [...gen.items].map(i => i.name).sort(),
  species,
};
writeFileSync(new URL('../src/data/champions.json', import.meta.url), JSON.stringify(out));
console.log(`Wrote ${Object.keys(species).length} species, ${out.items.length} items`);
