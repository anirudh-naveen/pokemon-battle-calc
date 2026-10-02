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
  burn: 9, paralysis: 6, poison: 8, toxic: 12, sleep: 3, freeze: 8,
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
            return <span key={i} className="fx-p fx-wind" style={{...style, left: '-30%', width: `${20 + p.size * 30}px`, animationDuration: `${1.4 * p.speed + 0.9}s`}} />;
          case 'helpinghand':
            return <span key={i} className="fx-p fx-star" style={{...style, top: '105%', animationDuration: `${2 * p.speed + 1.5}s`}} />;
          case 'friendguard':
            return <span key={i} className="fx-p fx-heart" style={{...style, top: '105%', animationDuration: `${2.5 * p.speed + 2}s`}} />;
          case 'burn':
            return <span key={i} className="fx-p fx-flame" style={{...style, top: '100%', left: `${10 + p.left * 0.8}%`, animationDuration: `${0.9 * p.speed + 0.6}s`, scale: `${0.7 + p.size * 0.8}`}} />;
          case 'paralysis':
            return <span key={i} className="fx-p fx-spark fx-spark-yellow" style={{...style, animationDuration: `${1 * p.speed + 0.6}s`, transform: `rotate(${p.size * 360}deg)`}} />;
          case 'poison':
          case 'toxic':
            return <span key={i} className={`fx-p fx-bubble ${kind === 'toxic' ? 'fx-bubble-toxic' : ''}`} style={{...style, top: '100%', width: `${4 + p.size * 6}px`, height: `${4 + p.size * 6}px`, animationDuration: `${1.8 * p.speed + 1.2}s`}} />;
          case 'sleep':
            return <span key={i} className="fx-p fx-zzz" style={{left: `${55 + i * 12}%`, top: '55%', animationDelay: `${-i * 0.8}s`, fontSize: `${10 + i * 3}px`}}>z</span>;
          case 'freeze':
            return <span key={i} className="fx-p fx-crystal" style={{...style, animationDuration: `${2 * p.speed + 1.5}s`}} />;
          case 'misty':
            return <span key={i} className="fx-p fx-fog" style={{...style, left: '-40%', animationDuration: `${6 * p.speed + 5}s`}} />;
        }
      })}
    </div>
  );
}
