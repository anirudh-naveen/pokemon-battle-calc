import {useMemo} from 'react';
import {gen, toCalcPokemon, toId} from '../engine/calc';
import {SPECIES_NAMES, championsData, defaultAbility, defaultItem, defaultPokemon, presetFor, speciesInfo} from '../engine/defaults';
import {STAT_IDS, STAT_LABELS, type PokemonState} from '../engine/types';
import {useCalc, type SideIndex} from '../state/store';
import {BattleStatePanel} from './BattleStatePanel';
import {STATUS_THEMES, hpColor} from './conditionThemes';
import {CardAura} from './CardAura';
import {MoveSlot} from './MoveSlot';
import {SpEditor} from './SpEditor';
import {Sprite} from './Sprite';
import {Collapsible} from './ui/Collapsible';
import {Combobox} from './ui/Combobox';
import {Card, Field, Select, TypeBadge} from './ui/primitives';

const ALL_MOVES = [...gen.moves].map(m => m.name).filter(n => n !== '(No Move)').sort();

/** Read-only note of which Smogon build the Pokémon was loaded with (choosing presets comes later). */
function PresetLabel({species}: {species: string}) {
  const preset = presetFor(species);
  return (
    <div className="text-[11px] leading-snug text-slate-500 dark:text-slate-400">
      {preset ? (
        <>
          <span className="font-semibold text-slate-600 dark:text-slate-300">{preset.name}</span>
          <span> · {preset.source}</span>
        </>
      ) : (
        <span>No Smogon preset yet</span>
      )}
    </div>
  );
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

/**
 * A Pokémon card plus its HP/status/boosts panel. The panel sits beside the card on the
 * outer edge when the column is wide enough, and folds into the card otherwise.
 */
export function PokemonSide({side, title}: {side: SideIndex; title: string}) {
  return (
    <div className={`flex flex-col gap-4 @[40rem]:items-start ${side === 0 ? '@[40rem]:flex-row' : '@[40rem]:flex-row-reverse'}`}>
      <Card className="hidden w-56 shrink-0 @[40rem]:block">
        <BattleStatePanel side={side} />
      </Card>
      <PokemonCard side={side} title={title} />
    </div>
  );
}

export function PokemonCard({side, title}: {side: SideIndex; title: string}) {
  const pokemon = useCalc(s => s.pokemon[side]);
  const update = useCalc(s => s.updatePokemon);
  const setPokemon = useCalc(s => s.setPokemon);
  const sideConditions = useCalc(s => s.field.sides[side]);
  const doubles = useCalc(s => s.field.gameType === 'Doubles');
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
  const battleSummary = [
    `${pokemon.hpPercent}% HP`,
    pokemon.status ? STATUS_THEMES[pokemon.status].label : 'Healthy',
    ...STAT_IDS.filter(s => pokemon.boosts[s]).map(s => `${pokemon.boosts[s] > 0 ? '+' : ''}${pokemon.boosts[s]} ${STAT_LABELS[s]}`),
  ].join(' · ');

  const changeForme = (target: string) =>
    onChange({species: target, ability: defaultAbility(target), item: defaultItem(target)});

  return (
    <Card className="relative flex min-w-0 flex-1 flex-col gap-4">
      <CardAura conditions={sideConditions} doubles={doubles} />
      <div className="flex items-start gap-3">
        <Sprite species={pokemon.species} status={pokemon.status} />
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
            <span className="ml-auto whitespace-nowrap text-xs tabular-nums text-slate-500">
              {pokemon.hpPercent < 100 ? `${Math.max(1, Math.floor((maxHP * pokemon.hpPercent) / 100))}/` : ''}{maxHP} HP
            </span>
          </div>
          <PresetLabel species={pokemon.species} />
          <div className="h-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800" aria-hidden="true">
            <div className="h-full rounded-full transition-[width] duration-300" style={{width: `${pokemon.hpPercent}%`, backgroundColor: hpColor(pokemon.hpPercent)}} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Ability">
          <Select value={pokemon.ability} onChange={e => onChange({ability: e.target.value})}>
            {abilities.map(a => <option key={a}>{a}</option>)}
          </Select>
        </Field>
        <Field label="Item">
          <Combobox value={pokemon.item} options={championsData.items} onChange={item => onChange({item})} allowEmpty placeholder="None" ariaLabel="Item" />
        </Field>
      </div>

      <SpEditor side={side} pokemon={pokemon} onChange={onChange} />

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

      {/* Only when there's no room for the side panel (see PokemonSide). */}
      <div className="border-t border-slate-100 pt-3 @[40rem]:hidden dark:border-slate-800">
        <Collapsible
          title="HP, status & boosts"
          storageKey={`battle-state-${side}`}
          modified={!!advancedActive}
          summary={battleSummary}
        >
          <BattleStatePanel side={side} />
        </Collapsible>
      </div>
    </Card>
  );
}
