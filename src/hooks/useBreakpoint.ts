import { useSyncExternalStore } from 'react';

const DESKTOP_QUERY = '(min-width: 768px)';

function subscribe(callback: () => void) {
  const mql = window.matchMedia(DESKTOP_QUERY);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getSnapshot() {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

function getServerSnapshot() {
  return true; // Default to desktop for SSR
}

export function useBreakpoint() {
  const isDesktop = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { isMobile: !isDesktop };
}
