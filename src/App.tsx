import {useState} from 'react';
import {FullscreenPrompt} from './components/FullscreenPrompt';
import {CollapseIcon, ExpandIcon} from './components/icons';
import {PokemonSide} from './components/PokemonCard';
import {RotatePrompt} from './components/RotatePrompt';
import {useFullscreen} from './hooks/useFullscreen';
import {SideConditionsPanel} from './components/SideConditionsPanel';
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
      className="grid size-8 place-items-center rounded-lg text-[var(--gold-light)] hover:bg-white/15"
    >
      {dark ? <img src="Solrock.png" alt="Solrock" className="size-8 object-contain" /> : <img src="Lunatone.png" alt="Lunatone" className="size-8 object-contain" />}
    </button>
  );
}

function FullscreenButton() {
  const {isFullscreen, supported, toggle} = useFullscreen();
  if (!supported) return null;
  return (
    <button
      type="button"
      onClick={() => void toggle()}
      aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
      title={isFullscreen ? 'Exit full screen' : 'Full screen'}
      className="hidden size-8 place-items-center rounded-lg text-[var(--gold-light)] hover:bg-white/15 [@media(pointer:fine)]:grid"
    >
      {isFullscreen ? <CollapseIcon size={18} /> : <ExpandIcon size={18} />}
    </button>
  );
}

export default function App() {
  const gameType = useCalc(s => s.field.gameType);
  const updateField = useCalc(s => s.updateField);
  const [copied, setCopied] = useState(false);

  return (
    <div className="mx-auto flex max-w-[120rem] flex-col gap-4 px-4 py-5 sm:px-6">
      <header className="champ-banner flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 text-white shadow-lg shadow-red-900/20">
        <img src="Machamp.png" alt="Machamp" className="size-10 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]" />
        <div className="min-w-0 flex-1">
          <h1 className="gold-text text-lg font-bold leading-tight tracking-tight">PokéBattleCalc</h1>
          <p className="text-xs text-red-100/90">Pokémon Champions</p>
        </div>
        <div className="flex w-full items-center justify-end gap-1 sm:w-auto">
          <div className="mr-auto inline-flex rounded-lg bg-black/20 sm:mr-0 p-0.5 ring-1 ring-[var(--gold)]/50">
            {(['Singles', 'Doubles'] as const).map(g => (
              <button
                key={g}
                type="button"
                aria-pressed={gameType === g}
                onClick={() => updateField({gameType: g})}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                  gameType === g ? 'bg-white text-red-700 shadow-sm' : 'text-red-50/80 hover:text-white'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(location.href).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            })}
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-50 hover:bg-white/15"
          >
            {copied ? 'Link copied' : 'Share'}
          </button>
          <FullscreenButton />
          <ThemeToggle />
        </div>
      </header>

      <main className="grid items-start gap-4 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,27rem)_minmax(0,1fr)] min-[1700px]:grid-cols-[minmax(0,1fr)_minmax(0,26rem)_minmax(0,1fr)]">
        <div className="lg:col-span-2 xl:sticky xl:top-4 xl:order-2 xl:col-span-1"><ResultsPanel /></div>
        {/* @container: each side decides from its own width whether the HP/status panel fits beside the card. */}
        <div className="@container flex min-w-0 flex-col gap-4 xl:order-1">
          <PokemonSide side={0} title="Your Pokémon" />
          <SideConditionsPanel side={0} />
        </div>
        <div className="@container flex min-w-0 flex-col gap-4 xl:order-3">
          <PokemonSide side={1} title="Opponent" />
          <SideConditionsPanel side={1} />
        </div>
      </main>

      <FullscreenPrompt />
      <RotatePrompt />

      <footer className="pb-4 text-center text-[11px] text-slate-400">
        Damage engine: <a className="underline" href="https://github.com/smogon/damage-calc">@smogon/calc</a> · Data: Pokémon Showdown ·
        Pokémon is © Nintendo / Game Freak / The Pokémon Company.
      </footer>
    </div>
  );
}
