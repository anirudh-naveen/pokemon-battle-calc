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
  // Helping Hand and Friend Guard come from an ally, so they only exist in Doubles.
  const side = (s: SideConditions) => f.gameType === 'Doubles' ? {...s} : {...s, isHelpingHand: false, isFriendGuard: false};
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
  /** Damage multiplier caused by the current weather / terrain (null if none or no effect). */
  weatherMod: number | null;
  terrainMod: number | null;
  /** Multipliers from active side conditions (attacker's Helping Hand, defender's screens, …). */
  sideMods: {key: keyof SideConditions; side: 0 | 1; mod: number}[];
}

/** Side conditions that can change damage, and which side they must be on to matter. */
const ATTACKER_SIDE_MODS: (keyof SideConditions)[] = ['isHelpingHand'];
const DEFENDER_SIDE_MODS: (keyof SideConditions)[] = ['isReflect', 'isLightScreen', 'isAuroraVeil', 'isFriendGuard'];

const COMMON_RATIOS = [0, 0.25, 1 / 3, 0.5, 2 / 3, 0.75, 1.2, 1.25, 1.3, 4 / 3, 1.5, 2, 3, 4];

/** Snap to a familiar multiplier: formula rounding makes e.g. 0.5× come out as 0.51. */
function snapRatio(r: number) {
  const near = COMMON_RATIOS.find(c => Math.abs(c - r) < 0.03);
  return Math.round((near ?? r) * 100) / 100;
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
  const run = (f: FieldState) => calculate(gen, atk.clone(), def.clone(), move.clone(), toCalcField(f, attackerIndex));
  const result = run(field);
  const [min, max] = result.range();
  // Measure what weather/terrain actually did by recalculating without each one.
  const modifier = (without: FieldState) => {
    const baseMax = run(without).range()[1];
    if (!baseMax || !max) return baseMax === max ? null : baseMax ? 0 : null;
    const ratio = snapRatio(max / baseMax);
    return ratio === 1 ? null : ratio;
  };
  const weatherMod = field.weather ? modifier({...field, weather: ''}) : null;
  const terrainMod = field.terrain ? modifier({...field, terrain: ''}) : null;
  const defenderIndex = attackerIndex === 0 ? 1 : 0;
  const sideMods: MoveResult['sideMods'] = [];
  for (const [side, keys] of [[attackerIndex, ATTACKER_SIDE_MODS], [defenderIndex, DEFENDER_SIDE_MODS]] as const) {
    for (const key of keys) {
      if (!field.sides[side][key]) continue;
      const sides = [...field.sides] as FieldState['sides'];
      sides[side] = {...sides[side], [key]: false};
      const mod = modifier({...field, sides});
      if (mod !== null) sideMods.push({key, side, mod});
    }
  }
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
    weatherMod,
    terrainMod,
    sideMods,
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
