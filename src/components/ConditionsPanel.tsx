import type {Terrain, Weather} from '../engine/types';
import {useCalc} from '../state/store';
import {TERRAIN_THEMES, WEATHER_THEMES, terrainTheme, weatherTheme, type ConditionTheme} from './conditionThemes';
import {Particles} from './Particles';

function Tile({theme, active, onClick}: {theme: ConditionTheme; active: boolean; onClick: () => void}) {
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
        <span className="text-sm font-semibold">{theme.label}</span>
      </div>
      <div className={`relative mt-0.5 truncate text-[11px] ${active ? 'opacity-90' : 'text-slate-500 dark:text-slate-400'}`}>
        {theme.effect}
      </div>
    </button>
  );
}

/** Weather and terrain pickers as themed tiles; click an active tile again to clear it. */
export function ConditionsPanel() {
  const weather = useCalc(s => s.field.weather);
  const terrain = useCalc(s => s.field.terrain);
  const updateField = useCalc(s => s.updateField);

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Weather</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-2">
          {(Object.keys(WEATHER_THEMES) as (keyof typeof WEATHER_THEMES)[]).map(w => (
            <Tile key={w} theme={WEATHER_THEMES[w]} active={weather === w} onClick={() => updateField({weather: weather === w ? '' : w})} />
          ))}
        </div>
      </div>
      <div>
        <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Terrain</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-2">
          {(Object.keys(TERRAIN_THEMES) as Terrain[]).map(t => (
            <Tile key={t} theme={TERRAIN_THEMES[t]} active={terrain === t} onClick={() => updateField({terrain: terrain === t ? '' : t})} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Ambient sky (weather) and ground (terrain) glow behind the results card. */
export function Ambience({weather, terrain}: {weather: Weather | ''; terrain: Terrain | ''}) {
  const w = weatherTheme(weather);
  const t = terrainTheme(terrain);
  return (
    <>
      {w && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-48 opacity-70 dark:opacity-60"
          style={{
            background: `linear-gradient(to bottom, ${w.color}40, transparent)`,
            maskImage: 'linear-gradient(to bottom, #000 30%, transparent)',
          }}
        >
          <div className="absolute inset-0 opacity-60 mix-blend-normal [&_.fx-glint]:!bg-amber-200 [&_.fx-rain]:![background:linear-gradient(to_bottom,transparent,rgb(96_165_250/.8))] [&_.fx-sand]:![background:linear-gradient(to_right,transparent,rgb(180_120_50/.8))] [&_.fx-snow]:!bg-sky-200">
            <Particles kind={w.particles} density={1.6} />
          </div>
        </div>
      )}
      {t && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 opacity-70 dark:opacity-60"
          style={{
            background: `linear-gradient(to top, ${t.color}40, transparent)`,
            maskImage: 'linear-gradient(to top, #000 30%, transparent)',
          }}
        />
      )}
    </>
  );
}

/** Small pill showing how much weather/terrain changed a move's damage. */
export function ModTag({theme, mod}: {theme: ConditionTheme; mod: number}) {
  const Icon = theme.icon;
  return (
    <span
      title={`${theme.label}: ×${mod} damage`}
      className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-px text-[10px] font-semibold tabular-nums"
      style={{backgroundColor: `${theme.color}22`, color: theme.color}}
    >
      <Icon size={12} />
      ×{mod}
    </span>
  );
}
