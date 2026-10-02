import {useMemo} from 'react';
import {toCalcPokemon} from '../engine/calc';
import {STAT_IDS, STAT_LABELS, type StatID, type StatusName} from '../engine/types';
import {useCalc, type SideIndex} from '../state/store';
import {STATUS_THEMES, hpColor} from './conditionThemes';
import {Particles} from './Particles';

const BOOST_STATS = STAT_IDS.filter(s => s !== 'hp') as Exclude<StatID, 'hp'>[];
const HP_PRESETS = [100, 75, 50, 25];

const label = 'text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400';

/** Current HP, status and stat stages for one Pokémon. */
export function BattleStatePanel({side}: {side: SideIndex}) {
  const pokemon = useCalc(s => s.pokemon[side]);
  const update = useCalc(s => s.updatePokemon);
  const maxHP = useMemo(() => toCalcPokemon(pokemon).maxHP(), [pokemon]);
  const curHP = Math.max(1, Math.floor((maxHP * pokemon.hpPercent) / 100));
  const anyBoost = BOOST_STATS.some(s => pokemon.boosts[s]);

  const setBoost = (stat: StatID, value: number) =>
    update(side, {boosts: {...pokemon.boosts, [stat]: Math.max(-6, Math.min(6, value))}});

  return (
    <div className="flex flex-col gap-4">
      {/* HP: a game-style bar with the slider laid over it. */}
      <div>
        <div className={`mb-1.5 flex items-baseline justify-between ${label}`}>
          <span>HP</span>
          <span className="normal-case tracking-normal tabular-nums text-slate-600 dark:text-slate-300">
            {curHP}/{maxHP} · {pokemon.hpPercent}%
          </span>
        </div>
        <div className="relative h-3 overflow-hidden rounded-full bg-slate-200 ring-1 ring-black/5 dark:bg-slate-800">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-[width,background-color] duration-300"
            style={{width: `${pokemon.hpPercent}%`, backgroundColor: hpColor(pokemon.hpPercent)}}
          />
          <input
            type="range" min={1} max={100} value={pokemon.hpPercent}
            onChange={e => update(side, {hpPercent: Number(e.target.value)})}
            aria-label="Current HP percent"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>
        <div className="mt-1.5 grid grid-cols-4 gap-1">
          {HP_PRESETS.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => update(side, {hpPercent: p})}
              className={`rounded-md py-0.5 text-[11px] font-semibold tabular-nums transition ${
                pokemon.hpPercent === p ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {p}%
            </button>
          ))}
        </div>
      </div>

      {/* Status: themed chips; click the active one again to cure it. */}
      <div>
        <div className={`mb-1.5 ${label}`}>Status</div>
        <div className="grid grid-cols-2 gap-1.5">
          {(Object.keys(STATUS_THEMES) as StatusName[]).map(st => {
            const t = STATUS_THEMES[st];
            const active = pokemon.status === st;
            return (
              <button
                key={st}
                type="button"
                title={t.effect}
                aria-pressed={active}
                onClick={() => update(side, {status: active ? '' : st})}
                className={`relative overflow-hidden rounded-lg px-2 py-1.5 text-left text-xs font-semibold transition ${
                  active ? `${t.active} shadow-sm` : 'border border-slate-200 bg-white/60 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-slate-600'
                }`}
              >
                {active && <Particles kind={t.particles} density={0.6} />}
                <span className="relative flex items-center gap-1.5">
                  <span className="size-2 shrink-0 rounded-full" style={{backgroundColor: t.color}} />
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stat stages */}
      <div>
        <div className={`mb-1.5 flex items-baseline justify-between ${label}`}>
          <span>Stat boosts</span>
          {anyBoost && (
            <button
              type="button"
              onClick={() => update(side, {boosts: {hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0}})}
              className="normal-case tracking-normal text-red-500 hover:underline"
            >
              reset
            </button>
          )}
        </div>
        <div className="space-y-1">
          {BOOST_STATS.map(stat => {
            const v = pokemon.boosts[stat];
            return (
              <div key={stat} className="grid grid-cols-[2.25rem_1.5rem_1fr_1.5rem] items-center gap-1.5 text-sm">
                <span className="font-medium text-slate-600 dark:text-slate-300">{STAT_LABELS[stat]}</span>
                <button
                  type="button" aria-label={`Lower ${STAT_LABELS[stat]}`} disabled={v <= -6}
                  onClick={() => setBoost(stat, v - 1)}
                  className="grid size-6 place-items-center rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
                >
                  −
                </button>
                {/* Six pips each way, filled from the centre. */}
                <div className="flex items-center justify-center gap-0.5" aria-label={`${STAT_LABELS[stat]} ${v > 0 ? '+' : ''}${v}`}>
                  {Array.from({length: 12}, (_, k) => {
                    const pos = k < 6 ? k - 6 : k - 5; // -6..-1, 1..6
                    const filled = pos < 0 ? v <= pos : v >= pos;
                    return (
                      <span
                        key={k}
                        className={`h-2.5 w-1 rounded-full ${k === 6 ? 'ml-1' : ''} ${
                          filled ? (pos > 0 ? 'bg-rose-500' : 'bg-sky-500') : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      />
                    );
                  })}
                </div>
                <button
                  type="button" aria-label={`Raise ${STAT_LABELS[stat]}`} disabled={v >= 6}
                  onClick={() => setBoost(stat, v + 1)}
                  className="grid size-6 place-items-center rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
                >
                  +
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
