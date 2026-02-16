import { useState, useEffect, useCallback } from 'react';

/**
 * Returns true after `delayMs` of no mouse/keyboard/touch activity.
 * Resets on any user interaction.
 */
export function useInactivityGlow(delayMs = 120_000): boolean {
  const [glowing, setGlowing] = useState(false);

  const reset = useCallback(() => {
    setGlowing(false);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    function startTimer() {
      clearTimeout(timer);
      setGlowing(false);
      timer = setTimeout(() => setGlowing(true), delayMs);
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'] as const;
    events.forEach(e => window.addEventListener(e, startTimer, { passive: true }));
    startTimer();

    return () => {
      clearTimeout(timer);
      events.forEach(e => window.removeEventListener(e, startTimer));
    };
  }, [delayMs, reset]);

  return glowing;
}
