import type {SideConditions} from '../engine/types';
import {useCalc, type SideIndex} from '../state/store';
import {SIDE_THEMES, type SideTheme} from './conditionThemes';
import {Particles} from './Particles';
import {Card} from './ui/primitives';

const KEYS = Object.keys(SIDE_THEMES) as (keyof SideConditions)[];

function Tile({theme, active, onClick}: {theme: SideTheme; active: boolean; onClick: () => void}) {
  const Icon = theme.icon;
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl px-3 py-2.5 text-left transition ${
        active
          ? `${theme.active} shadow-md ring-1 ring-black/5`
          : 'border border-slate-200 bg-white hover:-translate-y-px hover:border-slate-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600'
      }`}
    >
      {active && <Particles kind={theme.particles} />}
      <div className="relative flex items-center gap-2">
        <Icon size={18} className={active ? '' : theme.accent} />
        <span className="text-sm font-semibold leading-tight">{theme.label}</span>
      </div>
      <div className={`relative mt-0.5 text-[11px] leading-snug ${active ? 'opacity-90' : 'text-slate-500 dark:text-slate-400'}`}>
        {theme.effect}
      </div>
    </button>
  );
}

/** Screens, Tailwind and ally support for one side, shown under that side's Pokémon. */
export function SideConditionsPanel({side}: {side: SideIndex}) {
  const conditions = useCalc(s => s.field.sides[side]);
  const doubles = useCalc(s => s.field.gameType === 'Doubles');
  const species = useCalc(s => s.pokemon[side].species);
  const toggleSide = useCalc(s => s.toggleSide);
  const keys = KEYS.filter(k => doubles || !SIDE_THEMES[k].doublesOnly);

  return (
    <Card>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        <span>{species}'s side</span>
        {!doubles && <span className="normal-case tracking-normal text-slate-400">Ally effects appear in Doubles</span>}
      </div>
      <div className="grid grid-cols-2 gap-2 @[34rem]:grid-cols-3">
        {keys.map(k => (
          <Tile key={k} theme={SIDE_THEMES[k]} active={conditions[k]} onClick={() => toggleSide(side, k)} />
        ))}
      </div>
    </Card>
  );
}
