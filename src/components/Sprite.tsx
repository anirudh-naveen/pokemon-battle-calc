import {useState} from 'react';
import {Sprites} from '@pkmn/img';
import type {CSSProperties} from 'react';
import type {StatusName} from '../engine/types';
import {STATUS_THEMES} from './conditionThemes';
import {Particles} from './Particles';

/** Showdown dex art, falling back to the gen5 sprite (Champions-only Megas), then a placeholder. */
export function Sprite({species, size = 72, status = ''}: {species: string; size?: number; status?: StatusName | ''}) {
  const theme = status ? STATUS_THEMES[status] : undefined;
  const urls = [Sprites.getDexPokemon(species).url, Sprites.getPokemon(species, {gen: 'gen5'}).url];
  const [attempt, setAttempt] = useState({species, i: 0});
  const i = attempt.species === species ? attempt.i : 0;
  const url = urls[i];

  return (
    <div
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 ${status ? `status-${status}` : ''}`}
      style={{width: size, height: size, ['--status-color' as string]: theme?.color} as CSSProperties}
      title={theme ? `${theme.label}: ${theme.effect}` : undefined}
    >
      {theme && <div className="fx-status-glow" />}
      {url ? (
        <img
          src={url}
          alt={species}
          className="max-h-full max-w-full object-contain [image-rendering:auto]"
          style={{width: size - 8, height: size - 8}}
          onError={() => setAttempt({species, i: i + 1})}
        />
      ) : (
        <span className="text-2xl text-slate-300">?</span>
      )}
      {status === 'frz' && <div className="fx-ice" />}
      {theme && <Particles kind={theme.particles} />}
    </div>
  );
}
