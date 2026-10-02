import data from '../data/champions.json';
import {gen, toId} from './calc';
import type {FieldState, PokemonState, SideConditions, StatsTable} from './types';

export interface ChampionsData {
  items: string[];
  species: Record<string, {abilities: string[]; moves: string[]}>;
}
export const championsData = data as ChampionsData;

export const SPECIES_NAMES = [...gen.species].map(s => s.name).sort();
export const NATURE_NAMES = [...gen.natures].map(n => n.name).sort();

const zeroStats = (): StatsTable => ({hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0});

/** Learnset/abilities lookup, falling back to the base species for calc-only formes. */
export function speciesInfo(name: string) {
  const direct = championsData.species[name];
  if (direct) return direct;
  const base = gen.species.get(toId(name))?.baseSpecies;
  return (base && championsData.species[base]) || {abilities: [], moves: []};
}

export function defaultAbility(name: string): string {
  const species = gen.species.get(toId(name));
  return speciesInfo(name).abilities[0] ?? species?.abilities?.[0] ?? '';
}

/** Megas must hold their Mega Stone; pick it automatically. */
export function defaultItem(name: string): string {
  const species = gen.species.get(toId(name));
  if (species?.name.includes('-Mega')) {
    const stone = [...gen.items].find(i =>
      Object.values((i as {megaStone?: Record<string, string>}).megaStone ?? {}).includes(species.name));
    if (stone) return stone.name;
  }
  return '';
}

export function defaultPokemon(species: string): PokemonState {
  return {
    species,
    ability: defaultAbility(species),
    item: defaultItem(species),
    nature: 'Hardy',
    sp: zeroStats(),
    boosts: zeroStats(),
    status: '',
    hpPercent: 100,
    moves: ['', '', '', ''],
    crits: [false, false, false, false],
  };
}

export const emptySide = (): SideConditions => ({
  isReflect: false, isLightScreen: false, isAuroraVeil: false,
  isHelpingHand: false, isFriendGuard: false, isTailwind: false,
});

export const defaultField = (): FieldState => ({
  gameType: 'Singles',
  weather: '',
  terrain: '',
  sides: [emptySide(), emptySide()],
});
