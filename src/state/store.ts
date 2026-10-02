import {create} from 'zustand';
import {compressToEncodedURIComponent, decompressFromEncodedURIComponent} from 'lz-string';
import {defaultField, defaultPokemon} from '../engine/defaults';
import type {FieldState, PokemonState} from '../engine/types';

export type SideIndex = 0 | 1;

interface CalcState {
  pokemon: [PokemonState, PokemonState];
  field: FieldState;
  updatePokemon: (i: SideIndex, patch: Partial<PokemonState>) => void;
  setPokemon: (i: SideIndex, p: PokemonState) => void;
  updateField: (patch: Partial<FieldState>) => void;
  toggleSide: (i: SideIndex, key: keyof FieldState['sides'][0]) => void;
  swap: () => void;
}

const initial = (): Pick<CalcState, 'pokemon' | 'field'> => ({
  pokemon: [defaultPokemon('Garchomp'), defaultPokemon('Incineroar')],
  field: defaultField(),
});

function fromHash(): Pick<CalcState, 'pokemon' | 'field'> | null {
  try {
    const raw = location.hash.slice(1);
    if (!raw) return null;
    const parsed = JSON.parse(decompressFromEncodedURIComponent(raw) ?? '');
    if (!parsed?.pokemon?.length || !parsed.field) return null;
    return parsed;
  } catch {
    return null;
  }
}

export const useCalc = create<CalcState>()(set => ({
  ...(fromHash() ?? initial()),
  updatePokemon: (i, patch) => set(s => {
    const pokemon = [...s.pokemon] as CalcState['pokemon'];
    pokemon[i] = {...pokemon[i], ...patch};
    return {pokemon};
  }),
  setPokemon: (i, p) => set(s => {
    const pokemon = [...s.pokemon] as CalcState['pokemon'];
    pokemon[i] = p;
    return {pokemon};
  }),
  updateField: patch => set(s => ({field: {...s.field, ...patch}})),
  toggleSide: (i, key) => set(s => {
    const sides = [...s.field.sides] as FieldState['sides'];
    sides[i] = {...sides[i], [key]: !sides[i][key]};
    return {field: {...s.field, sides}};
  }),
  swap: () => set(s => ({
    pokemon: [s.pokemon[1], s.pokemon[0]],
    field: {...s.field, sides: [s.field.sides[1], s.field.sides[0]]},
  })),
}));

/** Keep the URL hash in sync so any calc can be shared by link. */
let timer: ReturnType<typeof setTimeout> | undefined;
useCalc.subscribe(s => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const hash = compressToEncodedURIComponent(JSON.stringify({pokemon: s.pokemon, field: s.field}));
    history.replaceState(null, '', `#${hash}`);
  }, 300);
});
