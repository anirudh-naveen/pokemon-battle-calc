/**
 * Picks one default build ("preset") per species from Smogon's Pokémon Champions data,
 * published by https://github.com/pkmn/smogon:
 *
 *   1. a hand-written Smogon analysis set (VGC first, then Battle Stadium Singles, then OU)
 *   2. otherwise the most common build in Smogon's usage stats (VGC, then BSS, then OU)
 *
 * Champions sets list Stat Points directly (their "evs" sum to 66), so no EV conversion is needed.
 * Every field is checked against the species' legal abilities/learnset and the item list.
 */
const BASE = 'https://pkmn.github.io/smogon/data';
/** [key in sets/champions.json, stats file, label] in order of preference. */
const FORMATS = [
  ['vgc2026', 'gen9championsvgc2026', 'VGC'],
  ['battlestadiumsingles', 'gen9championsbattlestadiumsingles', 'Battle Stadium Singles'],
  ['ou', 'gen9championsou', 'OU'],
] as const;

const STATS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as const;
type Stat = (typeof STATS)[number];

export interface Preset {
  /** e.g. "Chlorophyll Sweeper" or "Most used". */
  name: string;
  /** e.g. "Smogon VGC analysis" or "Smogon VGC usage". */
  source: string;
  ability: string;
  item: string;
  nature: string;
  sp: Record<Stat, number>;
  moves: string[];
}

interface Legal {
  abilities: string[];
  moves: string[];
}

type Slash<T> = T | T[];
interface SmogonSet {
  moves: Slash<string>[];
  ability?: Slash<string>;
  item?: Slash<string>;
  nature?: Slash<string>;
  evs?: Slash<Partial<Record<Stat, number>>>;
}
interface UsageEntry {
  abilities: Record<string, number>;
  items: Record<string, number>;
  spreads: Record<string, number>;
  moves: Record<string, number>;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/${path}`);
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

const first = <T>(v: Slash<T> | undefined): T | undefined => (Array.isArray(v) ? v[0] : v);
/** Keys of a usage table, most used first. */
const ranked = (table: Record<string, number> = {}) =>
  Object.entries(table).sort((a, b) => b[1] - a[1]).map(([k]) => k);

function validSp(sp: Partial<Record<Stat, number>> | undefined): Record<Stat, number> | null {
  if (!sp) return null;
  const out = Object.fromEntries(STATS.map(s => [s, Math.round(sp[s] ?? 0)])) as Record<Stat, number>;
  const total = STATS.reduce((sum, s) => sum + out[s], 0);
  return total <= 66 && STATS.every(s => out[s] >= 0 && out[s] <= 32) ? out : null;
}

/**
 * @param fallback species → base species whose sets/usage to borrow (battle-only formes).
 */
export async function buildPresets(
  legal: Record<string, Legal>, fallback: Record<string, string>, items: Set<string>, natures: Set<string>,
): Promise<Record<string, Preset>> {
  const sets = await getJson<Record<string, Record<string, Record<string, SmogonSet>>>>('sets/champions.json');
  const usage: Record<string, Record<string, UsageEntry>> = {};
  for (const [, file] of FORMATS) {
    try {
      usage[file] = (await getJson<{pokemon: Record<string, UsageEntry>}>(`stats/${file}.json`)).pokemon;
    } catch (e) {
      console.warn(`Skipping usage stats ${file}: ${(e as Error).message}`);
    }
  }

  const presets: Record<string, Preset> = {};
  for (const [name, info] of Object.entries(legal)) {
    const okMove = (m: string) => info.moves.includes(m);
    const okAbility = (a?: string) => !!a && info.abilities.includes(a);
    const okItem = (i?: string) => !!i && items.has(i);

    const keys = [name, fallback[name]].filter((k): k is string => !!k);

    // 1. Smogon analysis set
    for (const [key, , label] of FORMATS) {
      const entry = keys.map(k => Object.entries(sets[k]?.[key] ?? {})[0]).find(Boolean);
      if (!entry) continue;
      const [setName, set] = entry;
      // Slash options: take the first choice that's legal.
      const moves = [...new Set(set.moves.map(m => (Array.isArray(m) ? m.find(okMove) : okMove(m) ? m : undefined)).filter((m): m is string => !!m))];
      const ability = [set.ability].flat().find(okAbility);
      const nature = first(set.nature);
      const sp = validSp(first(set.evs));
      if (!ability || !sp || !nature || !natures.has(nature) || moves.length < 2) continue;
      presets[name] = {
        name: setName, source: `Smogon ${label} analysis`,
        ability, item: [set.item].flat().find(okItem) ?? '', nature, sp, moves: moves.slice(0, 4),
      };
      break;
    }
    if (presets[name]) continue;

    // 2. Most common build from usage stats
    for (const [, file, label] of FORMATS) {
      const u = keys.map(k => usage[file]?.[k]).find(Boolean);
      if (!u) continue;
      const ability = ranked(u.abilities).find(okAbility);
      const item = ranked(u.items).find(okItem) ?? '';
      const moves = ranked(u.moves).filter(okMove).slice(0, 4);
      // Spread keys look like "Jolly:2/32/0/0/0/32" (already Stat Points).
      let nature = '';
      let sp: Record<Stat, number> | null = null;
      for (const spread of ranked(u.spreads)) {
        const [n, values] = spread.split(':');
        const nums = values?.split('/').map(Number);
        const candidate = nums?.length === 6 ? validSp(Object.fromEntries(STATS.map((s, i) => [s, nums[i]]))) : null;
        if (natures.has(n) && candidate) { nature = n; sp = candidate; break; }
      }
      if (!ability || !sp || moves.length < 2) continue;
      presets[name] = {name: 'Most used', source: `Smogon ${label} usage`, ability, item, nature, sp, moves};
      break;
    }
  }
  return presets;
}
