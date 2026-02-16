import { useEffect, useRef, useCallback, useState } from 'react';
import { useGameStore } from '../hooks/useGameStore';

export default function TurnBriefing() {
  const showBriefing = useGameStore(s => s.showBriefing);
  const briefingItems = useGameStore(s => s.briefingItems);
  const dismissBriefing = useGameStore(s => s.dismissBriefing);
  const dialogRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [countdown, setCountdown] = useState(8);

  // Auto-focus button when modal opens
  useEffect(() => {
    if (showBriefing) {
      setCountdown(8);
      const id = requestAnimationFrame(() => buttonRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [showBriefing]);

  // Auto-advance countdown
  useEffect(() => {
    if (!showBriefing) return;
    if (countdown <= 0) {
      dismissBriefing();
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [showBriefing, countdown, dismissBriefing]);

  const handleDismiss = useCallback(() => {
    dismissBriefing();
  }, [dismissBriefing]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDismiss();
    }
  }, [handleDismiss]);

  if (!showBriefing || briefingItems.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      role="dialog"
      aria-modal="true"
      aria-labelledby="briefing-title"
      onKeyDown={handleKeyDown}
      onClick={handleDismiss}
    >
      <div
        ref={dialogRef}
        className="bg-slate-900 border border-slate-600 rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6"
        onClick={e => e.stopPropagation()}
      >
        <h2
          id="briefing-title"
          className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 font-pixel"
        >
          Turn Report
        </h2>

        <div className="flex flex-col gap-4 mb-6">
          {briefingItems.map((item, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-slate-600 text-sm mt-0.5 shrink-0" aria-hidden="true">
                {item.type === 'rival' ? '\u25A0' : item.type === 'crisis' ? '\u26A0' : '\u2022'}
              </span>
              <p className={`text-sm leading-relaxed ${
                item.type === 'rival' ? 'text-amber-300 italic' :
                item.type === 'crisis' ? 'text-rose-300' :
                'text-slate-300'
              }`}>
                {item.text}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button
            ref={buttonRef}
            onClick={handleDismiss}
            className="px-6 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            Continue
          </button>
          <span className="text-xs text-slate-600" aria-live="polite">
            Auto-advancing in {countdown}s
          </span>
        </div>
      </div>
    </div>
  );
}
