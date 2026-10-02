import {gen, toCalcPokemon, toId} from '../engine/calc';
import {SP_MAX, SP_TOTAL, STAT_IDS, STAT_LABELS, type PokemonState, type StatID} from '../engine/types';

const NATURES = [...gen.natures].sort((a, b) => a.name.localeCompare(b.name));

function natureLabel(n: (typeof NATURES)[number]) {
  if (!n.plus || !n.minus || n.plus === n.minus) return `${n.name} (neutral)`;
  return `${n.name} (+${STAT_LABELS[n.plus]} −${STAT_LABELS[n.minus]})`;
}

interface Props {
  pokemon: PokemonState;
  onChange: (patch: Partial<PokemonState>) => void;
}

/** Six compact rows: base stat, Stat Point slider, final Lv50 stat. Nature arrows on the labels. */
export function SpEditor({pokemon, onChange}: Props) {
  const species = gen.species.get(toId(pokemon.species));
  const stats = toCalcPokemon(pokemon).rawStats;
  const nature = gen.natures.get(toId(pokemon.nature));
  const used = STAT_IDS.reduce((sum, s) => sum + pokemon.sp[s], 0);
  const left = SP_TOTAL - used;

  const setSp = (stat: StatID, value: number) => {
    const others = used - pokemon.sp[stat];
    const clamped = Math.max(0, Math.min(SP_MAX, SP_TOTAL - others, Math.round(value) || 0));
    onChange({sp: {...pokemon.sp, [stat]: clamped}});
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        <span>Stat Points</span>
        <label className="flex items-center gap-1.5 normal-case tracking-normal">
          <span className="sr-only">Nature</span>
          <select
            value={pokemon.nature}
            onChange={e => onChange({nature: e.target.value})}
            aria-label="Nature"
            className="rounded-md border border-slate-200 bg-white/70 px-1.5 py-0.5 text-xs font-semibold text-slate-700 outline-none focus:border-red-400 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
          >
            {NATURES.map(n => <option key={n.name} value={n.name}>{natureLabel(n)}</option>)}
          </select>
        </label>
        <span className={`ml-auto whitespace-nowrap ${left === 0 ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
          {left} / {SP_TOTAL} left
          {used > 0 && (
            <button type="button" onClick={() => onChange({sp: {hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0}})} className="ml-2 normal-case text-red-500 hover:underline">
              reset
            </button>
          )}
        </span>
      </div>
      <div className="space-y-1">
        {STAT_IDS.map(stat => {
          const plus = nature?.plus === stat && nature.minus !== stat;
          const minus = nature?.minus === stat && nature.plus !== stat;
          const base = species?.baseStats[stat] ?? 0;
          return (
            <div key={stat} className="grid grid-cols-[2.75rem_2rem_1fr_2.5rem_2.75rem] items-center gap-2 text-sm">
              <span className={`font-medium ${plus ? 'text-rose-500' : minus ? 'text-sky-500' : 'text-slate-600 dark:text-slate-300'}`}>
                {STAT_LABELS[stat]}
                {plus && <span aria-label="boosted by nature"> ▲</span>}
                {minus && <span aria-label="lowered by nature"> ▼</span>}
              </span>
              <span className="text-right tabular-nums text-slate-400">{base}</span>
              <input
                type="range"
                min={0}
                max={SP_MAX}
                value={pokemon.sp[stat]}
                onChange={e => setSp(stat, Number(e.target.value))}
                aria-label={`${STAT_LABELS[stat]} Stat Points`}
                className="h-1.5 w-full cursor-pointer accent-red-500"
              />
              <input
                type="number"
                min={0}
                max={SP_MAX}
                value={pokemon.sp[stat]}
                onChange={e => setSp(stat, Number(e.target.value))}
                aria-label={`${STAT_LABELS[stat]} Stat Points value`}
                className="w-full rounded-md border border-slate-200 bg-transparent px-1 py-0.5 text-center tabular-nums outline-none focus:border-red-400 dark:border-slate-700"
              />
              <span className="text-right font-semibold tabular-nums">{stats[stat]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
