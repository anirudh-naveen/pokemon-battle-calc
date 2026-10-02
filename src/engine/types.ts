import type {StatID, StatsTable, StatusName, Terrain, Weather} from '@smogon/calc/dist/data/interface';

export type {StatID, StatsTable, StatusName, Terrain, Weather};

export const STAT_IDS: StatID[] = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
export const STAT_LABELS: Record<StatID, string> = {
  hp: 'HP', atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Spe',
};

/** Champions Stat Points rules. */
export const SP_TOTAL = 66;
export const SP_MAX = 32;

export interface PokemonState {
  species: string;
  ability: string;
  item: string;
  nature: string;
  sp: StatsTable;
  boosts: StatsTable;
  status: StatusName | '';
  /** Current HP as a percentage of max HP (1–100). */
  hpPercent: number;
  moves: string[];
  /** Per-move critical hit toggles, parallel to `moves`. */
  crits: boolean[];
}

export interface SideConditions {
  isReflect: boolean;
  isLightScreen: boolean;
  isAuroraVeil: boolean;
  isHelpingHand: boolean;
  isFriendGuard: boolean;
  isTailwind: boolean;
}

export interface FieldState {
  gameType: 'Singles' | 'Doubles';
  weather: Weather | '';
  terrain: Terrain | '';
  /** Index 0 = left Pokémon's side, 1 = right Pokémon's side. */
  sides: [SideConditions, SideConditions];
}
