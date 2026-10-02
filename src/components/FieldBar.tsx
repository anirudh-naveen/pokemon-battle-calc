import {useState} from 'react';
import type {SideConditions, Terrain, Weather} from '../engine/types';
import {useCalc, type SideIndex} from '../state/store';
import {Chip, Segmented, Select} from './ui/primitives';

const WEATHERS: [Weather | '', string][] = [['', 'No weather'], ['Sun', '☀️ Sun'], ['Rain', '🌧️ Rain'], ['Sand', '🌪️ Sand'], ['Snow', '❄️ Snow']];
const TERRAINS: [Terrain | '', string][] = [['', 'No terrain'], ['Electric', '⚡ Electric'], ['Grassy', '🌿 Grassy'], ['Psychic', '🔮 Psychic'], ['Misty', '🌫️ Misty']];

const CONDITIONS: {key: keyof SideConditions; label: string; doublesOnly?: boolean}[] = [
  {key: 'isReflect', label: 'Reflect'},
  {key: 'isLightScreen', label: 'Light Screen'},
  {key: 'isAuroraVeil', label: 'Aurora Veil'},
  {key: 'isTailwind', label: 'Tailwind'},
  {key: 'isHelpingHand', label: 'Helping Hand', doublesOnly: true},
  {key: 'isFriendGuard', label: 'Friend Guard', doublesOnly: true},
];

export function FieldBar({names}: {names: [string, string]}) {
  const field = useCalc(s => s.field);
  const updateField = useCalc(s => s.updateField);
  const toggleSide = useCalc(s => s.toggleSide);
  const [open, setOpen] = useState(false);
  const visible = CONDITIONS.filter(c => !c.doublesOnly || field.gameType === 'Doubles');
  const active = ([0, 1] as SideIndex[]).flatMap(side =>
    visible.filter(c => field.sides[side][c.key]).map(c => ({side, ...c})));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-2">
        <Segmented
          value={field.gameType}
          options={['Singles', 'Doubles']}
          onChange={gameType => updateField({gameType})}
        />
        <Select aria-label="Weather" className="w-auto" value={field.weather} onChange={e => updateField({weather: e.target.value as Weather | ''})}>
          {WEATHERS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </Select>
        <Select aria-label="Terrain" className="w-auto" value={field.terrain} onChange={e => updateField({terrain: e.target.value as Terrain | ''})}>
          {TERRAINS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </Select>
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          aria-expanded={open}
          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-500/10"
        >
          {open ? 'Done' : '+ Side conditions'}
        </button>
        {!open && active.map(c => (
          <button
            key={`${c.side}-${c.key}`}
            type="button"
            onClick={() => toggleSide(c.side, c.key)}
            title="Remove"
            className="group inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200"
          >
            <span className="text-indigo-400">{names[c.side]}:</span> {c.label}
            <span className="text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-white">×</span>
          </button>
        ))}
      </div>
      {open && (
        <div className="mt-3 grid gap-3 border-t border-slate-100 pt-3 sm:grid-cols-2 dark:border-slate-800">
          {([0, 1] as SideIndex[]).map(side => (
            <div key={side}>
              <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {names[side]}'s side
              </div>
              <div className="flex flex-wrap gap-1.5">
                {visible.map(c => (
                  <Chip key={c.key} active={field.sides[side][c.key]} onClick={() => toggleSide(side, c.key)}>
                    {c.label}
                  </Chip>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
