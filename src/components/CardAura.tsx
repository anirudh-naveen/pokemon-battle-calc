import type {CSSProperties} from 'react';
import type {SideConditions} from '../engine/types';
import {SIDE_THEMES} from './conditionThemes';

const ORDER: (keyof SideConditions)[] = ['isReflect', 'isLightScreen', 'isAuroraVeil', 'isTailwind', 'isHelpingHand', 'isFriendGuard'];
const STYLE: Record<keyof SideConditions, string> = {
  isReflect: 'aura-reflect', isLightScreen: 'aura-lightscreen', isAuroraVeil: 'aura-aurora',
  isTailwind: 'aura-tailwind', isHelpingHand: 'aura-helpinghand', isFriendGuard: 'aura-friendguard',
};

/**
 * Side conditions drawn on the Pokémon card's border: each active condition adds its own
 * animated ring just outside the card, plus a small emblem sitting on the top edge.
 */
export function CardAura({conditions, doubles}: {conditions: SideConditions; doubles: boolean}) {
  const active = ORDER.filter(k => conditions[k] && (doubles || !SIDE_THEMES[k].doublesOnly));
  if (!active.length) return null;
  return (
    <>
      {active.map((k, i) => (
        <div
          key={k}
          aria-hidden="true"
          className={`aura-ring ${STYLE[k]}`}
          style={{'--c': SIDE_THEMES[k].color, inset: `${-3 - i * 4}px`} as CSSProperties}
        />
      ))}
      <div className="absolute -top-3 left-5 z-10 flex gap-1">
        {active.map(k => {
          const t = SIDE_THEMES[k];
          const Icon = t.icon;
          return (
            <span
              key={k}
              title={`${t.label}: ${t.effect}`}
              className={`grid size-6 place-items-center rounded-full shadow-md ring-2 ring-[var(--page-bg)] ${t.active}`}
            >
              <Icon size={13} />
            </span>
          );
        })}
      </div>
    </>
  );
}
