import {Field, Generations, Move, Pokemon, calculate} from '@smogon/calc';
import {getFinalSpeed} from '@smogon/calc/dist/mechanics/util';
import type {ID, MoveName} from '@smogon/calc/dist/data/interface';
import type {FieldState, PokemonState, SideConditions} from './types';

/** @smogon/calc models Pokémon Champions as generation 0. */
export const gen = Generations.get(0);

export function toCalcPokemon(p: PokemonState): Pokemon {
  const pokemon = new Pokemon(gen, p.species, {
    ability: p.ability || undefined,
    item: p.item || undefined,
    nature: p.nature,
    evs: p.sp, // In gen 0 the calc treats `evs` as Stat Points.
    boosts: p.boosts,
    status: p.status,
  });
  pokemon.originalCurHP = Math.max(1, Math.floor((pokemon.maxHP() * p.hpPercent) / 100));
  return pokemon;
}

export function toCalcField(f: FieldState, attackerIndex: 0 | 1): Field {
  const side = (s: SideConditions) => ({...s});
  return new Field({
    gameType: f.gameType,
    weather: f.weather || undefined,
    terrain: f.terrain || undefined,
    attackerSide: side(f.sides[attackerIndex]),
    defenderSide: side(f.sides[attackerIndex === 0 ? 1 : 0]),
  });
}

export interface MoveResult {
  move: string;
  type: string;
  category: string;
  /** Damage as % of defender's max HP. */
  minPercent: number;
  maxPercent: number;
  minDamage: number;
  maxDamage: number;
  rolls: number[];
  koText: string;
  /** 1 = OHKO, 2 = 2HKO, … ; 0 when no damage or unknown. */
  koHits: number;
  description: string;
}

export function calcMove(
  attacker: PokemonState, defender: PokemonState, field: FieldState,
  attackerIndex: 0 | 1, moveIndex: number,
): MoveResult | null {
  const name = attacker.moves[moveIndex];
  if (!name || !gen.moves.get(toId(name))) return null;
  const atk = toCalcPokemon(attacker);
  const def = toCalcPokemon(defender);
  const move = new Move(gen, name as MoveName, {
    ability: atk.ability, item: atk.item, species: atk.name,
    isCrit: attacker.crits[moveIndex],
  });
  const result = calculate(gen, atk, def, move, toCalcField(field, attackerIndex));
  const [min, max] = result.range();
  const maxHP = def.maxHP();
  let koText = '';
  let koHits = 0;
  let description = '';
  if (max > 0) {
    try {
      const ko = result.kochance();
      koText = ko.text;
      koHits = ko.n;
      description = result.fullDesc();
    } catch {
      description = result.desc?.() ?? '';
    }
  }
  return {
    move: name,
    type: result.move.type,
    category: result.move.category,
    minPercent: (min / maxHP) * 100,
    maxPercent: (max / maxHP) * 100,
    minDamage: min,
    maxDamage: max,
    rolls: flattenRolls(result.damage),
    koText,
    koHits,
    description,
  };
}

function flattenRolls(damage: number | number[] | number[][]): number[] {
  if (typeof damage === 'number') return [damage];
  if (damage.length && Array.isArray(damage[0])) {
    // Multi-hit (e.g. Parental Bond): sum each roll across hits.
    const hits = damage as number[][];
    return hits[0].map((_, i) => hits.reduce((sum, h) => sum + h[i], 0));
  }
  return damage as number[];
}

/** Final in-battle Speed including boosts, items, abilities, weather, Tailwind and paralysis. */
export function effectiveSpeed(p: PokemonState, field: FieldState, sideIndex: 0 | 1): number {
  const calcField = toCalcField(field, sideIndex);
  return getFinalSpeed(gen, toCalcPokemon(p), calcField, calcField.attackerSide);
}

export function toId(s: string): ID {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '') as ID;
}
