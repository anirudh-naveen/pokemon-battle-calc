import {useState} from 'react';
import {Sprites} from '@pkmn/img';

/** Showdown dex art, falling back to the gen5 sprite (Champions-only Megas), then a placeholder. */
export function Sprite({species, size = 72}: {species: string; size?: number}) {
  const urls = [Sprites.getDexPokemon(species).url, Sprites.getPokemon(species, {gen: 'gen5'}).url];
  const [attempt, setAttempt] = useState({species, i: 0});
  const i = attempt.species === species ? attempt.i : 0;
  const url = urls[i];

  return (
    <div className="grid shrink-0 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800" style={{width: size, height: size}}>
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
    </div>
  );
}
