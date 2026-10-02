import {useState} from 'react';

export function RotatePrompt() {
    const [dismissed, setDismissed] = useState(() => {
        try {
            return localStorage.getItem("rotate-dismissed") === '1'
        } catch {
            return false
        }
    });

    if (dismissed) return null;

    return (
    <div className="rotate-prompt fixed inset-0 z-50 hidden flex-col items-center justify-center gap-4 bg-slate-950/90 p-8 text-center text-white backdrop-blur">
      <div className="rotate-phone h-16 w-10 rounded-lg border-2 border-[var(--gold)]" />
      <p className="text-lg font-semibold">Rotate your phone for the best view</p>
      <button
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold"
        onClick={() => {
          try { localStorage.setItem('rotate-dismissed', '1'); } catch { /* ignore */ }
          setDismissed(true);
        }}
      >
        Continue anyway
      </button>
    </div>
  );
}