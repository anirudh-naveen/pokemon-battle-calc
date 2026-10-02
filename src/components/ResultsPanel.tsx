import {useMemo, useState} from 'react';
import {calcMove, effectiveSpeed, type MoveResult} from '../engine/calc';
import {useCalc, type SideIndex} from '../state/store';
import {Card, TypeBadge} from './ui/primitives';

function koTone(r: MoveResult) {
  if (r.maxDamage === 0) return {bar: 'bg-slate-300', text: 'text-slate-400'};
  if (r.koHits === 1) return {bar: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400'};
  if (r.koHits === 2) return {bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400'};
  return {bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400'};
}

function ResultRow({result}: {result: MoveResult}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const tone = koTone(result);
  const min = Math.min(100, result.minPercent);
  const max = Math.min(100, result.maxPercent);
  const status = result.category === 'Status';

  return (
    <li className="rounded-xl transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        disabled={status || result.maxDamage === 0}
        className="w-full px-3 py-2.5 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="truncate font-semibold">{result.move}</span>
          <TypeBadge type={result.type} small />
          <span className="ml-auto shrink-0 whitespace-nowrap text-sm font-semibold tabular-nums">
            {status ? <span className="font-normal text-slate-400">Status move</span>
              : result.maxDamage === 0 ? <span className="font-normal text-slate-400">Immune</span>
                : `${result.minPercent.toFixed(1)} – ${result.maxPercent.toFixed(1)}%`}
          </span>
        </div>
        {!status && result.maxDamage > 0 && (
          <>
            <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className={`absolute inset-y-0 left-0 ${tone.bar}`} style={{width: `${min}%`}} />
              <div className={`absolute inset-y-0 ${tone.bar} opacity-40`} style={{left: `${min}%`, width: `${max - min}%`}} />
            </div>
            <div className={`mt-1 text-xs font-medium ${tone.text}`}>
              {result.koText || 'Not a KO'}
            </div>
          </>
        )}
      </button>
      {open && !status && (
        <div className="space-y-2 px-3 pb-3 text-xs text-slate-500 dark:text-slate-400">
          <p className="leading-relaxed text-slate-700 dark:text-slate-300">{result.description}</p>
          <p className="font-mono tabular-nums">Rolls: {result.rolls.join(', ')}</p>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(result.description).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
              });
            }}
            className="font-medium text-indigo-600 hover:underline dark:text-indigo-300"
          >
            {copied ? 'Copied!' : 'Copy description'}
          </button>
        </div>
      )}
    </li>
  );
}

export function ResultsPanel() {
  const pokemon = useCalc(s => s.pokemon);
  const field = useCalc(s => s.field);
  const swap = useCalc(s => s.swap);
  const [dir, setDir] = useState<SideIndex>(0);
  const attacker = pokemon[dir];
  const defender = pokemon[dir === 0 ? 1 : 0];

  const results = useMemo(
    () => attacker.moves
      .map((_, i) => {
        try {
          return calcMove(attacker, defender, field, dir, i);
        } catch (e) {
          console.error(e);
          return null;
        }
      })
      .filter((r): r is MoveResult => r !== null),
    [attacker, defender, field, dir],
  );
  const speeds = useMemo(() => [effectiveSpeed(pokemon[0], field, 0), effectiveSpeed(pokemon[1], field, 1)], [pokemon, field]);
  const faster = speeds[0] === speeds[1] ? null : speeds[0] > speeds[1] ? 0 : 1;

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="grid flex-1 grid-cols-2 rounded-lg bg-slate-100 p-0.5 text-xs font-semibold dark:bg-slate-800">
          {([0, 1] as SideIndex[]).map(i => (
            <button
              key={i}
              type="button"
              aria-pressed={dir === i}
              onClick={() => setDir(i)}
              className={`truncate rounded-md px-2 py-1.5 transition ${
                dir === i ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {pokemon[i].species} → {pokemon[i === 0 ? 1 : 0].species}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={swap}
          title="Swap Pokémon"
          aria-label="Swap Pokémon"
          className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          ⇄
        </button>
      </div>

      {results.length ? (
        <ul className="-mx-1 space-y-0.5">
          {results.map((r, i) => <ResultRow key={`${dir}-${i}-${r.move}`} result={r} />)}
        </ul>
      ) : (
        <p className="py-8 text-center text-sm text-slate-400">Add moves to {attacker.species} to see damage.</p>
      )}

      <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs dark:bg-slate-800/60">
        <span className="font-medium text-slate-500 dark:text-slate-400">Speed</span>
        <span className="tabular-nums">
          <span className={faster === 0 ? 'font-semibold' : 'text-slate-500'}>{pokemon[0].species} {speeds[0]}</span>
          <span className="mx-1.5 text-slate-400">{faster === null ? '=' : faster === 0 ? '>' : '<'}</span>
          <span className={faster === 1 ? 'font-semibold' : 'text-slate-500'}>{speeds[1]} {pokemon[1].species}</span>
        </span>
      </div>
    </Card>
  );
}
