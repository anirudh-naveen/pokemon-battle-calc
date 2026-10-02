import {useEffect, useId, useMemo, useRef, useState, type ReactNode} from 'react';

interface Props {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  /** Renders extra content (e.g. a type badge) next to each option. */
  renderOption?: (option: string) => ReactNode;
  allowEmpty?: boolean;
  className?: string;
  ariaLabel?: string;
}

const MAX_RESULTS = 60;

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Lightweight searchable dropdown with keyboard support. */
export function Combobox({value, options, onChange, placeholder, renderOption, allowEmpty, className = '', ariaLabel}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const id = useId();

  const filtered = useMemo(() => {
    const q = normalize(query);
    const list = q
      ? options
        .filter(o => normalize(o).includes(q))
        .sort((a, b) => Number(!normalize(a).startsWith(q)) - Number(!normalize(b).startsWith(q)))
      : options;
    const sliced = list.slice(0, MAX_RESULTS);
    return allowEmpty && !q ? ['', ...sliced] : sliced;
  }, [options, query, allowEmpty]);

  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({block: 'nearest'});
  }, [active]);

  const commit = (v: string) => {
    onChange(v);
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        role="combobox"
        aria-label={ariaLabel ?? placeholder}
        aria-expanded={open}
        aria-controls={id}
        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 dark:border-slate-700 dark:bg-slate-900"
        placeholder={open ? value || placeholder : placeholder}
        value={open ? query : value}
        onFocus={e => { setOpen(true); setActive(0); e.target.select(); }}
        onBlur={() => setTimeout(() => { setOpen(false); setQuery(''); }, 120)}
        onChange={e => { setQuery(e.target.value); setActive(0); setOpen(true); }}
        onKeyDown={e => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, filtered.length - 1)); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
          else if (e.key === 'Enter' && filtered[active] !== undefined) { e.preventDefault(); commit(filtered[active]); }
          else if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
        }}
      />
      {open && filtered.length > 0 && (
        <ul
          ref={listRef}
          id={id}
          role="listbox"
          className="absolute z-30 mt-1 max-h-64 w-full min-w-48 overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          {filtered.map((o, i) => (
            <li
              key={o || '__empty'}
              role="option"
              aria-selected={o === value}
              onMouseDown={e => { e.preventDefault(); commit(o); }}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-center justify-between gap-2 px-2.5 py-1.5 ${
                i === active ? 'bg-indigo-50 dark:bg-indigo-500/15' : ''
              } ${o === value ? 'font-semibold' : ''}`}
            >
              <span className={o ? '' : 'text-slate-400'}>{o || '(none)'}</span>
              {o && renderOption?.(o)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
