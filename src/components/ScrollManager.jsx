import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * On navigation: jump to #hash targets (waiting for lazy-loaded pages); otherwise scroll to the top and,
 * when the page (not just the hash) changed, move keyboard focus to <main> so screen-reader and keyboard users
 * start at the new content. Nothing is focused on the very first load.
 */
export default function ScrollManager() {
  const { pathname, hash } = useLocation();
  const previousPath = useRef(null);

  useEffect(() => {
    let timer;
    const pageChanged = previousPath.current !== null && previousPath.current !== pathname;
    previousPath.current = pathname;

    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      let tries = 0;
      const seek = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView();
        } else if (tries < 20) {
          tries += 1;
          timer = setTimeout(seek, 50);
        }
      };
      seek();
    } else {
      window.scrollTo(0, 0);
      if (pageChanged) document.getElementById('main')?.focus({ preventScroll: true });
    }
    return () => clearTimeout(timer);
  }, [pathname, hash]);

  return null;
}
