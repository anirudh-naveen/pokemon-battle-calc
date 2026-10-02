import {useEffect, useState} from 'react';
import {useFullscreen} from '../hooks/useFullscreen';
import {ExpandIcon} from './icons';

const STORAGE_KEY = 'fullscreen-dismissed';
/** Desktop-sized window with a mouse or trackpad (phones get the rotate prompt instead). */
const DESKTOP_QUERY = '(pointer: fine) and (min-width: 1024px)';

/** A one-time corner card suggesting full screen to desktop users. */
export function FullscreenPrompt() {
  const {isFullscreen, supported, toggle} = useFullscreen();
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch { return false; }
  });
  const [ready, setReady] = useState(false);
  const [desktop, setDesktop] = useState(() => matchMedia(DESKTOP_QUERY).matches);

  useEffect(() => {
    const mq = matchMedia(DESKTOP_QUERY);
    const onChange = () => setDesktop(mq.matches);
    mq.addEventListener('change', onChange);
    // Wait a moment so the prompt doesn't compete with the page loading in.
    const timer = setTimeout(() => setReady(true), 1500);
    return () => { mq.removeEventListener('change', onChange); clearTimeout(timer); };
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* storage unavailable */ }
    setDismissed(true);
  };

  if (!supported || !desktop || dismissed || isFullscreen || !ready) return null;

  return (
    <div
      role="dialog"
      aria-label="Full screen suggestion"
      className="gold-trim fx-pop fixed bottom-5 right-5 z-50 flex w-80 items-start gap-3 rounded-2xl p-4 shadow-2xl shadow-black/30"
    >
      <div className="champ-banner grid size-10 shrink-0 place-items-center rounded-xl text-[var(--gold-light)]">
        <ExpandIcon size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Battle in full screen?</p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          More room for both Pokémon and the results. Press <kbd className="rounded border border-slate-300 px-1 font-sans text-[10px] dark:border-slate-600">Esc</kbd> to exit anytime.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => { void toggle(); dismiss(); }}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-500"
          >
            Full screen
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
