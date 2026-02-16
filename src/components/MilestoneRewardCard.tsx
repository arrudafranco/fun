import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../hooks/useGameStore';

export default function MilestoneRewardCard() {
  const pendingMilestoneReward = useGameStore(s => s.pendingMilestoneReward);
  const dismissMilestoneReward = useGameStore(s => s.dismissMilestoneReward);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pendingMilestoneReward) {
      const id = requestAnimationFrame(() => buttonRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [pendingMilestoneReward]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      dismissMilestoneReward();
      return;
    }

    // Focus trap
    if (e.key === 'Tab' && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, [dismissMilestoneReward]);

  if (!pendingMilestoneReward) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="milestone-reward-title"
      onKeyDown={handleKeyDown}
    >
      <div ref={dialogRef} className="bg-slate-800 border border-amber-500/40 rounded-2xl shadow-2xl max-w-lg w-full mx-4 my-4 overflow-hidden shrink-0">
        <div className="h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-transparent" />
        <div className="p-6">
          <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1">
            Milestone Achieved
          </p>
          <h2 id="milestone-reward-title" className="text-xl font-bold text-amber-300 mb-4">
            {pendingMilestoneReward.name}
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed italic mb-6">
            {pendingMilestoneReward.rewardText}
          </p>
          <button
            ref={buttonRef}
            onClick={() => dismissMilestoneReward()}
            className="w-full px-4 py-3 rounded-lg bg-amber-800/60 hover:bg-amber-700/60 text-amber-50 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
