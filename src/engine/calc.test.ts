import {describe, expect, it} from 'vitest';
import {calcMove, effectiveSpeed, toCalcPokemon} from './calc';
import {defaultField, defaultPokemon} from './defaults';
import type {PokemonState} from './types';

const garchomp = (): PokemonState => ({
  ...defaultPokemon('Garchomp'),
  nature: 'Jolly',
  sp: {hp: 2, atk: 32, def: 0, spa: 0, spd: 0, spe: 32},
  moves: ['Earthquake', 'Dragon Claw', 'Rock Slide', 'Fire Fang'],
});

describe('Champions stats', () => {
  it('uses Lv50, IV31 and Stat Points', () => {
    const p = toCalcPokemon(garchomp());
    expect(p.level).toBe(50);
    // HP = base + SP + 75; others = floor((base + 20 + SP) * nature)
    expect(p.stats).toEqual({hp: 185, atk: 182, def: 115, spa: 90, spd: 105, spe: 169});
  });
});

describe('damage', () => {
  const target = () => ({...defaultPokemon('Incineroar'), nature: 'Careful'});

  it('returns a sensible range and KO text', () => {
    const r = calcMove(garchomp(), target(), defaultField(), 0, 0)!;
    expect(r.minDamage).toBeGreaterThan(0);
    expect(r.maxDamage).toBeGreaterThanOrEqual(r.minDamage);
    expect(r.rolls).toHaveLength(16);
    expect(r.koText).toMatch(/HKO/);
  });

  it('applies spread reduction in Doubles', () => {
    const singles = calcMove(garchomp(), target(), defaultField(), 0, 0)!;
    const doubles = calcMove(garchomp(), target(), {...defaultField(), gameType: 'Doubles'}, 0, 0)!;
    expect(doubles.maxDamage).toBeLessThan(singles.maxDamage);
  });

  it('applies Reflect on the defender side only', () => {
    const field = defaultField();
    const base = calcMove(garchomp(), target(), field, 0, 0)!;
    field.sides[1].isReflect = true;
    expect(calcMove(garchomp(), target(), field, 0, 0)!.maxDamage).toBeLessThan(base.maxDamage);
    // Reflect on the attacker's own side does nothing to its attacks.
    const own = defaultField();
    own.sides[0].isReflect = true;
    expect(calcMove(garchomp(), target(), own, 0, 0)!.maxDamage).toBe(base.maxDamage);
  });

  it('boosts Fire moves in Sun', () => {
    const base = calcMove(garchomp(), target(), defaultField(), 0, 3)!;
    const sun = calcMove(garchomp(), target(), {...defaultField(), weather: 'Sun'}, 0, 3)!;
    expect(sun.maxDamage).toBeGreaterThan(base.maxDamage);
  });

  it('handles Champions-only Mega abilities', () => {
    const meganium = {...defaultPokemon('Meganium-Mega'), moves: ['Weather Ball']};
    const r = calcMove(meganium, defaultPokemon('Tyranitar'), {...defaultField(), weather: 'Sand'}, 0, 0)!;
    expect(r.type).toBe('Fire');
  });

  it('returns null for empty move slots', () => {
    expect(calcMove({...garchomp(), moves: ['']}, target(), defaultField(), 0, 0)).toBeNull();
  });
});

describe('speed', () => {
  it('doubles under Tailwind', () => {
    const field = defaultField();
    const base = effectiveSpeed(garchomp(), field, 0);
    field.sides[0].isTailwind = true;
    expect(effectiveSpeed(garchomp(), field, 0)).toBe(base * 2);
  });
});
