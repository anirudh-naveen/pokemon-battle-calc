import type {ReactNode, SelectHTMLAttributes} from 'react';

const TYPE_COLORS: Record<string, string> = {
  Normal: '#9fa19f', Fire: '#e62829', Water: '#2980ef', Electric: '#fac000', Grass: '#3fa129',
  Ice: '#3dcef3', Fighting: '#ff8000', Poison: '#9141cb', Ground: '#915121', Flying: '#81b9ef',
  Psychic: '#ef4179', Bug: '#91a119', Rock: '#afa981', Ghost: '#704170', Dragon: '#5060e1',
  Dark: '#624d4e', Steel: '#60a1b8', Fairy: '#ef70ef', Stellar: '#40b5a5', '???': '#68a090',
};

export function TypeBadge({type, small}: {type: string; small?: boolean}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-md font-semibold uppercase tracking-wide text-white ${
        small ? 'px-1.5 py-px text-[10px]' : 'px-2 py-0.5 text-[11px]'
      }`}
      style={{backgroundColor: TYPE_COLORS[type] ?? '#888'}}
    >
      {type}
    </span>
  );
}

export function Field({label, children, className = ''}: {label: string; children: ReactNode; className?: string}) {
  return (
    <label className={`flex min-w-0 flex-col gap-1 ${className}`}>
      <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
      {children}
    </label>
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`${props.className?.includes('w-') ? '' : 'w-full'} min-w-0 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20 dark:border-slate-700 dark:bg-slate-900 ${props.className ?? ''}`}
    />
  );
}

export function Chip({active, onClick, children, title}: {active: boolean; onClick: () => void; children: ReactNode; title?: string}) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
        active
          ? 'border-red-500 bg-red-500 text-white shadow-sm'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
      }`}
    >
      {children}
    </button>
  );
}

export function Segmented<T extends string>({value, options, onChange}: {value: T; options: T[]; onChange: (v: T) => void}) {
  return (
    <div className="inline-flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
      {options.map(o => (
        <button
          key={o}
          type="button"
          aria-pressed={o === value}
          onClick={() => onChange(o)}
          className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
            o === value ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function Card({children, className = ''}: {children: ReactNode; className?: string}) {
  return (
    <section className={`gold-trim rounded-2xl p-4 shadow-sm shadow-amber-900/5 ${className}`}>
      {children}
    </section>
  );
}
