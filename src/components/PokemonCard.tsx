import {useMemo, useState} from 'react';
import {gen, toCalcPokemon, toId} from '../engine/calc';
import {SPECIES_NAMES, championsData, defaultAbility, defaultItem, defaultPokemon, speciesInfo} from '../engine/defaults';
import {STAT_IDS, STAT_LABELS, type PokemonState, type StatusName} from '../engine/types';
import {useCalc, type SideIndex} from '../state/store';
import {MoveSlot} from './MoveSlot';
import {SideAura} from './SideAura';
import {SpEditor} from './SpEditor';
import {Sprite} from './Sprite';
import {Combobox} from './ui/Combobox';
import {Card, Field, Select, TypeBadge} from './ui/primitives';

const ALL_MOVES = [...gen.moves].map(m => m.name).filter(n => n !== '(No Move)').sort();
const NATURES = [...gen.natures].sort((a, b) => a.name.localeCompare(b.name));
const STATUSES: [StatusName | '', string][] = [
  ['', 'Healthy'], ['brn', 'Burned'], ['par', 'Paralyzed'], ['psn', 'Poisoned'],
  ['tox', 'Badly poisoned'], ['slp', 'Asleep'], ['frz', 'Frozen'],
];

function natureLabel(n: (typeof NATURES)[number]) {
  if (!n.plus || !n.minus || n.plus === n.minus) return `${n.name} (neutral)`;
  return `${n.name} (+${STAT_LABELS[n.plus]} −${STAT_LABELS[n.minus]})`;
}

/** "Charizard-Mega-X" → "Mega X", "Garchomp-Mega" → "Mega". */
function megaLabel(forme: string) {
  const suffix = forme.split('-Mega')[1]?.replace(/^-/, '');
  return suffix ? `Mega ${suffix}` : 'Mega';
}

/** The other Mega/base forme to toggle to, if any. */
function megaToggle(name: string): {label: string; target: string} | null {
  const species = gen.species.get(toId(name));
  if (!species) return null;
  if (name.includes('-Mega')) return {label: 'Revert', target: species.baseSpecies ?? name.split('-Mega')[0]};
  const megas = (species.otherFormes ?? []).filter(f => f.includes('-Mega'));
  return megas.length ? {label: 'Mega Evolve', target: megas[0]} : null;
}

export function PokemonCard({side, title}: {side: SideIndex; title: string}) {
  const pokemon = useCalc(s => s.pokemon[side]);
  const update = useCalc(s => s.updatePokemon);
  const setPokemon = useCalc(s => s.setPokemon);
  const sideConditions = useCalc(s => s.field.sides[side]);
  const doubles = useCalc(s => s.field.gameType === 'Doubles');
  const [showMore, setShowMore] = useState(false);
  const onChange = (patch: Partial<PokemonState>) => update(side, patch);

  const species = gen.species.get(toId(pokemon.species));
  const info = speciesInfo(pokemon.species);
  const moveOptions = info.moves.length ? info.moves : ALL_MOVES;
  const abilities = [...new Set([...info.abilities, pokemon.ability].filter(Boolean))];
  const calcPokemon = useMemo(() => toCalcPokemon(pokemon), [pokemon]);
  const maxHP = calcPokemon.maxHP();
  const mega = megaToggle(pokemon.species);
  const megaForms = species?.name.includes('-Mega') ? [] : (species?.otherFormes ?? []).filter(f => f.includes('-Mega'));
  const advancedActive = pokemon.status || pokemon.hpPercent < 100 || STAT_IDS.some(s => pokemon.boosts[s]);

  const changeForme = (target: string) =>
    onChange({species: target, ability: defaultAbility(target), item: defaultItem(target)});

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <Sprite species={pokemon.species} />
          <SideAura conditions={sideConditions} doubles={doubles} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</span>
            {mega && (
              <div className="flex gap-1">
                {(megaForms.length > 1 ? megaForms : [mega.target]).map(target => (
                  <button
                    key={target}
                    type="button"
                    onClick={() => changeForme(target)}
                    className="rounded-full border border-fuchsia-300 px-2 py-0.5 text-[11px] font-semibold text-fuchsia-600 transition hover:bg-fuchsia-50 dark:border-fuchsia-500/50 dark:text-fuchsia-300 dark:hover:bg-fuchsia-500/10"
                  >
                    {megaForms.length > 1 ? megaLabel(target) : mega.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Combobox
            ariaLabel="Pokémon"
            value={pokemon.species}
            options={SPECIES_NAMES}
            onChange={name => name && setPokemon(side, defaultPokemon(name))}
            placeholder="Search Pokémon"
          />
          <div className="flex items-center gap-1.5">
            {species?.types.map(t => <TypeBadge key={t} type={t} />)}
            <span className="ml-auto text-xs tabular-nums text-slate-500">{maxHP} HP</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Field label="Ability">
          <Select value={pokemon.ability} onChange={e => onChange({ability: e.target.value})}>
            {abilities.map(a => <option key={a}>{a}</option>)}
          </Select>
        </Field>
        <Field label="Item">
          <Combobox value={pokemon.item} options={championsData.items} onChange={item => onChange({item})} allowEmpty placeholder="None" ariaLabel="Item" />
        </Field>
        <Field label="Nature" className="col-span-2 sm:col-span-1">
          <Select value={pokemon.nature} onChange={e => onChange({nature: e.target.value})}>
            {NATURES.map(n => <option key={n.name} value={n.name}>{natureLabel(n)}</option>)}
          </Select>
        </Field>
      </div>

      <SpEditor pokemon={pokemon} onChange={onChange} />

      <div>
        <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Moves</div>
        <div className="space-y-1.5">
          {pokemon.moves.map((move, i) => (
            <MoveSlot
              key={i}
              index={i}
              move={move}
              crit={pokemon.crits[i]}
              options={moveOptions}
              onChange={m => {
                const moves = [...pokemon.moves];
                moves[i] = m;
                onChange({moves});
              }}
              onToggleCrit={() => {
                const crits = [...pokemon.crits];
                crits[i] = !crits[i];
                onChange({crits});
              }}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setShowMore(v => !v)}
          aria-expanded={showMore}
          className="flex w-full items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <span className={`transition ${showMore ? 'rotate-90' : ''}`}>▸</span>
          Boosts, status & HP
          {advancedActive && <span className="size-1.5 rounded-full bg-red-500" aria-label="modified" />}
        </button>
        {showMore && (
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-5 gap-1.5">
              {STAT_IDS.filter(s => s !== 'hp').map(stat => (
                <Field key={stat} label={STAT_LABELS[stat]}>
                  <Select
                    value={pokemon.boosts[stat]}
                    onChange={e => onChange({boosts: {...pokemon.boosts, [stat]: Number(e.target.value)}})}
                    className={`px-1 text-center ${pokemon.boosts[stat] > 0 ? 'text-rose-500' : pokemon.boosts[stat] < 0 ? 'text-sky-500' : ''}`}
                  >
                    {Array.from({length: 13}, (_, k) => 6 - k).map(n => (
                      <option key={n} value={n}>{n > 0 ? `+${n}` : n}</option>
                    ))}
                  </Select>
                </Field>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Status">
                <Select value={pokemon.status} onChange={e => onChange({status: e.target.value as StatusName | ''})}>
                  {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </Select>
              </Field>
              <Field label={`Current HP · ${Math.max(1, Math.floor((maxHP * pokemon.hpPercent) / 100))}/${maxHP}`}>
                <div className="flex items-center gap-2 py-1.5">
                  <input
                    type="range" min={1} max={100} value={pokemon.hpPercent}
                    onChange={e => onChange({hpPercent: Number(e.target.value)})}
                    className="h-1.5 w-full accent-red-500"
                    aria-label="Current HP percent"
                  />
                  <span className="w-9 text-right text-sm tabular-nums">{pokemon.hpPercent}%</span>
                </div>
              </Field>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
