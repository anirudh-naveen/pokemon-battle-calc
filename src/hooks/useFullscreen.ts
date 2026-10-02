import {useCallback, useSyncExternalStore} from 'react';

// Safari < 16.4 only has the webkit-prefixed Fullscreen API.
type WebkitDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitFullscreenEnabled?: boolean;
  webkitExitFullscreen?: () => Promise<void>;
};
type WebkitElement = HTMLElement & {webkitRequestFullscreen?: () => Promise<void>};

const doc = document as WebkitDocument;

function subscribe(onChange: () => void) {
  document.addEventListener('fullscreenchange', onChange);
  document.addEventListener('webkitfullscreenchange', onChange);
  return () => {
    document.removeEventListener('fullscreenchange', onChange);
    document.removeEventListener('webkitfullscreenchange', onChange);
  };
}

const isFullscreenNow = () => Boolean(doc.fullscreenElement ?? doc.webkitFullscreenElement);

export const fullscreenSupported = Boolean(doc.fullscreenEnabled ?? doc.webkitFullscreenEnabled);

/** Current full-screen state plus a toggle; `supported` is false on e.g. iPhone Safari. */
export function useFullscreen() {
  const isFullscreen = useSyncExternalStore(subscribe, isFullscreenNow);

  const toggle = useCallback(async () => {
    try {
      if (isFullscreenNow()) {
        await (document.exitFullscreen?.() ?? doc.webkitExitFullscreen?.());
      } else {
        const el = document.documentElement as WebkitElement;
        await (el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.());
      }
    } catch {
      // The browser refused (e.g. not triggered by a click); nothing to do.
    }
  }, []);

  return {isFullscreen, supported: fullscreenSupported, toggle};
}
