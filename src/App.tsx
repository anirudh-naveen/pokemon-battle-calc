import {useState} from 'react';
import {useShallow} from 'zustand/react/shallow';
import {FieldBar} from './components/FieldBar';
import {PokemonCard} from './components/PokemonCard';
import {ResultsPanel} from './components/ResultsPanel';
import {useCalc} from './state/store';

function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      onClick={() => {
        const next = !dark;
        document.documentElement.classList.toggle('dark', next);
        try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch { /* storage unavailable */ }
        setDark(next);
      }}
      className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-800"
    >
      {dark ? '☀︎' : '☾'}
    </button>
  );
}

export default function App() {
  const names = useCalc(useShallow(s => [s.pokemon[0].species, s.pokemon[1].species] as [string, string]));
  const [copied, setCopied] = useState(false);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6">
      <header className="flex items-center gap-3">
        <div className="grid size-8 place-items-center rounded-lg bg-indigo-500 text-sm font-bold text-white">C</div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold leading-tight">Champions Damage Calc</h1>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">Pokémon Champions · Lv 50 · Stat Points</p>
        </div>
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(location.href).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          })}
          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {copied ? 'Link copied' : 'Share'}
        </button>
        <ThemeToggle />
      </header>

      <FieldBar names={names} />

      <main className="grid items-start gap-4 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,27rem)_minmax(0,1fr)]">
        <div className="lg:col-span-2 xl:sticky xl:top-4 xl:order-2 xl:col-span-1"><ResultsPanel /></div>
        <div className="xl:order-1"><PokemonCard side={0} title="Your Pokémon" /></div>
        <div className="xl:order-3"><PokemonCard side={1} title="Opponent" /></div>
      </main>

      <footer className="pb-4 text-center text-[11px] text-slate-400">
        Damage engine: <a className="underline" href="https://github.com/smogon/damage-calc">@smogon/calc</a> · Data: Pokémon Showdown ·
        Pokémon is © Nintendo / Game Freak / The Pokémon Company.
      </footer>
    </div>
  );
}
