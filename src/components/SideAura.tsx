import type {SideConditions} from '../engine/types';
import {SIDE_THEMES} from './conditionThemes';
import {Particles} from './Particles';

/** Effects layered over a Pokémon's sprite for the conditions active on its side. */
export function SideAura({conditions, doubles}: {conditions: SideConditions; doubles: boolean}) {
  const on = (k: keyof SideConditions) => conditions[k] && (doubles || !SIDE_THEMES[k].doublesOnly);
  const barriers = (['isAuroraVeil', 'isReflect', 'isLightScreen'] as const).filter(on);
  return (
    <>
      {barriers.map((k, i) => (
        <div
          key={k}
          className="fx-barrier"
          style={{['--barrier' as string]: `${SIDE_THEMES[k].color}cc`, inset: `${-3 - i * 4}px`}}
        />
      ))}
      {on('isTailwind') && <div className="absolute inset-0 overflow-hidden rounded-xl [&_.fx-wind]:!bg-gradient-to-r [&_.fx-wind]:from-transparent [&_.fx-wind]:to-teal-400"><Particles kind="tailwind" density={0.6} /></div>}
      {on('isHelpingHand') && <div className="absolute inset-0 overflow-hidden rounded-xl [&_.fx-star]:!bg-orange-400"><Particles kind="helpinghand" density={0.6} /></div>}
      {on('isFriendGuard') && <div className="absolute inset-0 overflow-hidden rounded-xl [&_.fx-heart]:!bg-pink-400"><Particles kind="friendguard" density={0.6} /></div>}
    </>
  );
}
