import { useEffect, useRef, useCallback } from 'react';
import type { Policy } from '../types/actions';
import { getEffectTags, formatPolicyEffects } from '../utils/policyEffects';
import { CATEGORY_COLORS, CATEGORY_BORDER } from './PolicyCard';

interface PolicyDetailSheetProps {
  policy: Policy;
  effectiveCost: number;
  selected: boolean;
  disabled: boolean;
  disabledReason?: string | null;
  locked?: boolean;
  lockHint?: string;
  isNew?: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export default function PolicyDetailSheet({
  policy, effectiveCost, selected, disabled, disabledReason,
  locked, lockHint, isNew, onToggle, onClose,
}: PolicyDetailSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => buttonRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }, [onClose]);

  const colorClass = CATEGORY_COLORS[policy.category] ?? 'bg-slate-600 text-slate-200';
  const borderClass = CATEGORY_BORDER[policy.category] ?? 'border-l-slate-500';
  const effectTags = getEffectTags(policy);
  const structuredEffects = formatPolicyEffects(policy);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-detail-title"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`relative max-h-[70vh] w-full rounded-t-2xl bg-slate-900 border-t border-l-4 ${borderClass} border-slate-600 overflow-y-auto animate-slideUp`}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-slate-600" aria-hidden="true" />
        </div>

        <div className="px-5 pb-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 id="policy-detail-title" className="text-lg font-semibold text-slate-100">
                  {policy.name}
                </h2>
                {isNew && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-full bg-cyan-500 text-slate-900">
                    New
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${colorClass}`}>
                {policy.category}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              aria-label="Close"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Cost */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-slate-400">
              Cost: <span className="text-slate-200 font-semibold">{effectiveCost}</span>
            </span>
            {policy.capitalCost !== effectiveCost && (
              <span className="text-xs text-slate-500 line-through">{policy.capitalCost}</span>
            )}
            {policy.targetBloc && (
              <span className="text-xs text-violet-400 italic">Requires bloc target</span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            {policy.tooltip}
          </p>

          {/* Effect tags */}
          {effectTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {effectTags.map((tag, i) => (
                <span key={i} className={`text-xs font-medium px-2 py-1 rounded ${tag.color}`}>
                  {tag.text}
                </span>
              ))}
            </div>
          )}

          {/* Detailed effects */}
          {structuredEffects && (
            <div className="text-xs text-slate-400 bg-slate-800/80 rounded-lg p-3 mb-5 whitespace-pre-line">
              {structuredEffects}
            </div>
          )}

          {/* Disabled reason */}
          {locked && (
            <p className="text-xs text-amber-400 italic mb-4">{lockHint ?? 'Locked'}</p>
          )}
          {!locked && disabled && disabledReason && (
            <p className="text-xs text-amber-400 italic mb-4">{disabledReason}</p>
          )}

          {/* Action button */}
          {!locked && (
            <button
              ref={buttonRef}
              onClick={() => { onToggle(); onClose(); }}
              disabled={disabled && !selected}
              className={`
                w-full py-3.5 rounded-xl text-sm font-semibold transition-colors
                focus:outline-none focus:ring-2 focus:ring-cyan-500
                ${selected
                  ? 'bg-cyan-700 hover:bg-cyan-600 text-white'
                  : disabled
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-700 hover:bg-cyan-800 text-slate-200'}
              `}
            >
              {selected ? 'Deselect' : disabled ? 'Unavailable' : 'Select'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
