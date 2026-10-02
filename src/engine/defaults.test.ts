import {describe, expect, it} from 'vitest';
import {calcMove} from './calc';
import {championsData, defaultField, defaultPokemon} from './defaults';
import {SP_MAX, SP_TOTAL, STAT_IDS} from './types';

describe('Smogon presets', () => {
  const presets = Object.entries(championsData.presets);

  it('cover most species', () => {
    expect(presets.length).toBeGreaterThan(Object.keys(championsData.species).length * 0.8);
  });

  it.each(presets)('%s is a legal build', (species, p) => {
    const legal = championsData.species[species];
    expect(legal.abilities).toContain(p.ability);
    for (const move of p.moves) expect(legal.moves).toContain(move);
    if (p.item) expect(championsData.items).toContain(p.item);
    const total = STAT_IDS.reduce((sum, s) => sum + p.sp[s], 0);
    expect(total).toBeLessThanOrEqual(SP_TOTAL);
    for (const s of STAT_IDS) expect(p.sp[s]).toBeLessThanOrEqual(SP_MAX);
  });

  it('are loaded for new Pokémon', () => {
    const p = defaultPokemon('Garchomp');
    const preset = championsData.presets.Garchomp;
    expect(p.nature).toBe(preset.nature);
    expect(p.moves.filter(Boolean)).toEqual(preset.moves);
    expect(p.moves).toHaveLength(4);
  });

  it('give Megas their Mega Stone', () => {
    expect(defaultPokemon('Charizard-Mega-Y').item).toBe('Charizardite Y');
  });

  it('fall back to blank defaults when Smogon has nothing', () => {
    const missing = Object.keys(championsData.species).find(s => !championsData.presets[s])!;
    expect(defaultPokemon(missing).moves).toEqual(['', '', '', '']);
  });

  it('produce working calcs', () => {
    const r = calcMove(defaultPokemon('Garchomp'), defaultPokemon('Incineroar'), defaultField(), 0, 0);
    expect(r?.maxDamage).toBeGreaterThan(0);
  });
});
