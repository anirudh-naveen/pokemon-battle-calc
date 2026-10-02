import {useMemo, type CSSProperties} from 'react';
import type {ParticleKind} from './conditionThemes';

/** Deterministic pseudo-random so particles don't jump around between renders. */
function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

const COUNTS: Record<ParticleKind, number> = {
  sun: 6, rain: 18, sand: 14, snow: 16, electric: 7, grassy: 10, psychic: 3, misty: 5,
  reflect: 1, lightscreen: 7, aurora: 3, tailwind: 10, helpinghand: 9, friendguard: 7,
};

/** Animated weather/terrain particles. Fills its nearest positioned ancestor. */
export function Particles({kind, density = 1}: {kind: ParticleKind; density?: number}) {
  const items = useMemo(() => {
    const n = Math.max(1, Math.round(COUNTS[kind] * density));
    return Array.from({length: n}, (_, i) => ({
      left: rand(i + 1) * 100,
      top: rand(i + 101) * 100,
      delay: -rand(i + 201) * 6,
      speed: 0.6 + rand(i + 301) * 0.8,
      size: rand(i + 401),
    }));
  }, [kind, density]);

  return (
    <div className="fx-layer pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {kind === 'sun' && <div className="fx-sun-rays" />}
      {(kind === 'reflect' || kind === 'lightscreen') && <div className={kind === 'reflect' ? 'fx-hex' : 'fx-prism'} />}
      {(kind === 'reflect' || kind === 'lightscreen') && <div className="fx-sheen" />}
      {items.map((p, i) => {
        const style: CSSProperties = {left: `${p.left}%`, top: `${p.top}%`, animationDelay: `${p.delay}s`};
        switch (kind) {
          case 'sun':
            return <span key={i} className="fx-p fx-glint" style={{...style, animationDuration: `${2.5 * p.speed + 1.5}s`}} />;
          case 'rain':
            return <span key={i} className="fx-p fx-rain" style={{...style, top: '-20%', height: `${10 + p.size * 10}px`, animationDuration: `${0.45 * p.speed + 0.25}s`}} />;
          case 'sand':
            return <span key={i} className="fx-p fx-sand" style={{...style, left: '-15%', width: `${8 + p.size * 16}px`, animationDuration: `${0.9 * p.speed + 0.5}s`}} />;
          case 'snow':
            return <span key={i} className="fx-p fx-snow" style={{...style, top: '-10%', width: `${2 + p.size * 4}px`, height: `${2 + p.size * 4}px`, animationDuration: `${3 * p.speed + 2}s`}} />;
          case 'electric':
            return <span key={i} className="fx-p fx-spark" style={{...style, animationDuration: `${1.2 * p.speed + 0.8}s`, transform: `rotate(${p.size * 360}deg)`}} />;
          case 'grassy':
            return <span key={i} className="fx-p fx-leaf" style={{...style, top: '105%', width: `${4 + p.size * 4}px`, height: `${4 + p.size * 4}px`, animationDuration: `${3 * p.speed + 2.5}s`}} />;
          case 'psychic':
            return <span key={i} className="fx-p fx-ripple" style={{left: '50%', top: '50%', animationDelay: `${-i * 0.9}s`}} />;
          case 'reflect':
            return null;
          case 'lightscreen':
            return <span key={i} className="fx-p fx-glint fx-glint-prism" style={{...style, animationDuration: `${2 * p.speed + 1.2}s`}} />;
          case 'aurora':
            return <span key={i} className="fx-p fx-aurora" style={{top: `${10 + i * 28}%`, animationDelay: `${-i * 2.3}s`, animationDuration: `${7 + i * 2}s`}} />;
          case 'tailwind':
            return <span key={i} className="fx-p fx-wind" style={{...style, left: '-30%', width: `${20 + p.size * 30}px`, animationDuration: `${0.7 * p.speed + 0.4}s`}} />;
          case 'helpinghand':
            return <span key={i} className="fx-p fx-star" style={{...style, top: '105%', animationDuration: `${2 * p.speed + 1.5}s`}} />;
          case 'friendguard':
            return <span key={i} className="fx-p fx-heart" style={{...style, top: '105%', animationDuration: `${2.5 * p.speed + 2}s`}} />;
          case 'misty':
            return <span key={i} className="fx-p fx-fog" style={{...style, left: '-40%', animationDuration: `${6 * p.speed + 5}s`}} />;
        }
      })}
    </div>
  );
}
