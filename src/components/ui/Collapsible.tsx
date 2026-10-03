import {useId, useState, type ReactNode} from 'react';

interface Props {
  title: ReactNode;
  /** Remembers open/closed per viewer under this key. */
  storageKey: string;
  /** Shown beside the title, open or closed (e.g. the nature picker). */
  extra?: ReactNode;
  /** Shown in place of the content while collapsed. */
  summary?: ReactNode;
  /** Small dot on the header, e.g. when something inside differs from the default. */
  modified?: boolean;
  defaultOpen?: boolean;
  children: ReactNode;
}

function readOpen(key: string, fallback: boolean) {
  try {
    const v = localStorage.getItem(`open:${key}`);
    return v === null ? fallback : v === '1';
  } catch {
    return fallback;
  }
}

/** A section with a clickable header that shows or hides its content. Open by default. */
export function Collapsible({title, storageKey, extra, summary, modified, defaultOpen = true, children}: Props) {
  const [open, setOpen] = useState(() => readOpen(storageKey, defaultOpen));
  const id = useId();

  const toggle = () => {
    setOpen(o => {
      try { localStorage.setItem(`open:${storageKey}`, o ? '0' : '1'); } catch { /* storage unavailable */ }
      return !o;
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls={id}
          className="-ml-1 flex items-center gap-1.5 rounded-md px-1 py-0.5 uppercase tracking-wide hover:text-slate-700 dark:hover:text-slate-200"
        >
          <span className={`inline-block text-[10px] transition-transform ${open ? 'rotate-90' : ''}`} aria-hidden="true">▸</span>
          {title}
          {modified && <span className="size-1.5 rounded-full bg-red-500" aria-label="modified" />}
        </button>
        {extra}
      </div>
      {open ? (
        <div id={id} className="mt-2">{children}</div>
      ) : (
        summary && <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{summary}</div>
      )}
    </div>
  );
}
