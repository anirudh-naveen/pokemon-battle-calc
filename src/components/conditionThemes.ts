import type {ComponentType, SVGProps} from 'react';
import type {SideConditions, Terrain, Weather} from '../engine/types';
import {
  AuroraIcon, ElectricIcon, FriendGuardIcon, GrassyIcon, HelpingHandIcon, LightScreenIcon, MistyIcon,
  PsychicIcon, RainIcon, ReflectIcon, SandIcon, SnowIcon, SunIcon, TailwindIcon,
} from './icons';

export type ParticleKind =
  | 'sun' | 'rain' | 'sand' | 'snow' | 'electric' | 'grassy' | 'psychic' | 'misty'
  | 'reflect' | 'lightscreen' | 'aurora' | 'tailwind' | 'helpinghand' | 'friendguard';

export interface ConditionTheme {
  label: string;
  /** One-line summary of what the condition does to damage. */
  effect: string;
  icon: ComponentType<SVGProps<SVGSVGElement> & {size?: number}>;
  particles: ParticleKind;
  /** Gradient + text classes for the active tile. */
  active: string;
  /** Icon colour when inactive. */
  accent: string;
  /** Solid colour used for ambient backdrops and modifier tags. */
  color: string;
}

export const WEATHER_THEMES: Record<Exclude<Weather, 'Hail' | 'Harsh Sunshine' | 'Heavy Rain' | 'Strong Winds'>, ConditionTheme> = {
  Sun: {
    label: 'Sun', effect: 'Fire ×1.5 · Water ×0.5', icon: SunIcon, particles: 'sun',
    active: 'bg-gradient-to-br from-amber-300 via-orange-400 to-rose-500 text-white',
    accent: 'text-orange-500', color: '#f97316',
  },
  Rain: {
    label: 'Rain', effect: 'Water ×1.5 · Fire ×0.5', icon: RainIcon, particles: 'rain',
    active: 'bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-800 text-white',
    accent: 'text-sky-500', color: '#3b82f6',
  },
  Sand: {
    label: 'Sand', effect: 'Rock-types SpD ×1.5', icon: SandIcon, particles: 'sand',
    active: 'bg-gradient-to-br from-amber-200 via-yellow-600 to-amber-800 text-white',
    accent: 'text-amber-600', color: '#b45309',
  },
  Snow: {
    label: 'Snow', effect: 'Ice-types Def ×1.5', icon: SnowIcon, particles: 'snow',
    active: 'bg-gradient-to-br from-sky-200 via-cyan-300 to-slate-500 text-slate-900',
    accent: 'text-cyan-500', color: '#22d3ee',
  },
};

export const TERRAIN_THEMES: Record<Terrain, ConditionTheme> = {
  Electric: {
    label: 'Electric', effect: 'Electric ×1.3', icon: ElectricIcon, particles: 'electric',
    active: 'bg-gradient-to-br from-yellow-200 via-yellow-400 to-amber-500 text-slate-900',
    accent: 'text-yellow-500', color: '#eab308',
  },
  Grassy: {
    label: 'Grassy', effect: 'Grass ×1.3 · Earthquake ×0.5', icon: GrassyIcon, particles: 'grassy',
    active: 'bg-gradient-to-br from-lime-400 via-emerald-500 to-green-700 text-white',
    accent: 'text-emerald-500', color: '#10b981',
  },
  Psychic: {
    label: 'Psychic', effect: 'Psychic ×1.3 · blocks priority', icon: PsychicIcon, particles: 'psychic',
    active: 'bg-gradient-to-br from-pink-400 via-fuchsia-500 to-violet-700 text-white',
    accent: 'text-fuchsia-500', color: '#d946ef',
  },
  Misty: {
    label: 'Misty', effect: 'Dragon ×0.5 · no status', icon: MistyIcon, particles: 'misty',
    active: 'bg-gradient-to-br from-pink-200 via-rose-200 to-violet-300 text-slate-900',
    accent: 'text-pink-400', color: '#f472b6',
  },
};

export function weatherTheme(w: Weather | ''): ConditionTheme | undefined {
  return (WEATHER_THEMES as Record<string, ConditionTheme>)[w];
}

export function terrainTheme(t: Terrain | ''): ConditionTheme | undefined {
  return TERRAIN_THEMES[t as Terrain];
}

export interface SideTheme extends ConditionTheme {
  /** Needs an ally, so only shown in Doubles. */
  doublesOnly?: boolean;
}

export const SIDE_THEMES: Record<keyof SideConditions, SideTheme> = {
  isReflect: {
    label: 'Reflect', effect: 'Physical damage ×0.5', icon: ReflectIcon, particles: 'reflect',
    active: 'bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 text-white',
    accent: 'text-sky-500', color: '#0ea5e9',
  },
  isLightScreen: {
    label: 'Light Screen', effect: 'Special damage ×0.5', icon: LightScreenIcon, particles: 'lightscreen',
    active: 'bg-gradient-to-br from-yellow-200 via-amber-300 to-pink-400 text-slate-900',
    accent: 'text-amber-500', color: '#f59e0b',
  },
  isAuroraVeil: {
    label: 'Aurora Veil', effect: 'All damage ×0.5', icon: AuroraIcon, particles: 'aurora',
    active: 'bg-gradient-to-br from-teal-300 via-cyan-500 to-violet-600 text-white',
    accent: 'text-teal-500', color: '#14b8a6',
  },
  isTailwind: {
    label: 'Tailwind', effect: 'Speed ×2', icon: TailwindIcon, particles: 'tailwind',
    active: 'bg-gradient-to-br from-emerald-300 via-teal-400 to-sky-500 text-white',
    accent: 'text-teal-500', color: '#2dd4bf',
  },
  isHelpingHand: {
    label: 'Helping Hand', effect: 'Your damage ×1.5', icon: HelpingHandIcon, particles: 'helpinghand', doublesOnly: true,
    active: 'bg-gradient-to-br from-orange-300 via-orange-500 to-red-500 text-white',
    accent: 'text-orange-500', color: '#f97316',
  },
  isFriendGuard: {
    label: 'Friend Guard', effect: 'Damage taken ×0.75', icon: FriendGuardIcon, particles: 'friendguard', doublesOnly: true,
    active: 'bg-gradient-to-br from-rose-300 via-pink-400 to-fuchsia-500 text-white',
    accent: 'text-pink-500', color: '#ec4899',
  },
};
