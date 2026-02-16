import type { Policy } from '../types/actions';
import Tooltip from './Tooltip';
import { getEffectTags, formatPolicyEffects } from '../utils/policyEffects';

export const CATEGORY_COLORS: Record<string, string> = {
  economic: 'bg-emerald-800/80 text-emerald-200',
  labor: 'bg-sky-800/80 text-sky-200',
  backroom: 'bg-violet-800/80 text-violet-200',
  rhetoric: 'bg-orange-800/80 text-orange-200',
  security: 'bg-rose-800/80 text-rose-200',
  diplomatic: 'bg-teal-800/80 text-teal-200',
  institutional: 'bg-amber-800/80 text-amber-200',
};

export const CATEGORY_BORDER: Record<string, string> = {
  economic: 'border-l-emerald-400',
  labor: 'border-l-sky-400',
  backroom: 'border-l-violet-400',
  rhetoric: 'border-l-orange-400',
  security: 'border-l-rose-400',
  diplomatic: 'border-l-teal-400',
  institutional: 'border-l-amber-400',
};

export const CATEGORY_DOT: Record<string, string> = {
  economic: 'bg-emerald-400',
  labor: 'bg-sky-400',
  backroom: 'bg-violet-400',
  rhetoric: 'bg-orange-400',
  security: 'bg-rose-400',
  diplomatic: 'bg-teal-400',
  institutional: 'bg-amber-400',
};

interface PolicyCardProps {
  policy: Policy;
  selected: boolean;
  disabled: boolean;
  disabledReason?: string | null;
  effectiveCost: number;
  onToggle: () => void;
  onDetail?: () => void;
  locked?: boolean;
  lockHint?: string;
  isNew?: boolean;
  compact?: boolean;
}

export default function PolicyCard({
  policy, selected, disabled, disabledReason, effectiveCost,
  onToggle, onDetail, locked, lockHint, isNew, compact,
}: PolicyCardProps) {
  const colorClass = CATEGORY_COLORS[policy.category] ?? 'bg-slate-600 text-slate-200';
  const borderClass = CATEGORY_BORDER[policy.category] ?? 'border-l-slate-500';
  const dotClass = CATEGORY_DOT[policy.category] ?? 'bg-slate-400';

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled && !locked) onToggle();
    }
  }

  // Compact mobile row
  if (compact) {
    if (locked) {
      return (
        <div
          className="flex items-center gap-2 px-3 py-2.5 min-h-[44px] rounded-lg bg-slate-800/60 opacity-40 grayscale"
          aria-label={`${policy.name}, locked`}
        >
          <span className={`w-2 h-2 rounded-full ${dotClass} shrink-0`} aria-hidden="true" />
          <svg aria-hidden="true" className="w-3 h-3 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span className="text-sm text-slate-400 flex-1 truncate">{policy.name}</span>
        </div>
      );
    }

    return (
      <div
        className={`flex items-center gap-2 px-3 py-2.5 min-h-[44px] rounded-lg transition-colors ${
          selected ? 'bg-cyan-900/40 ring-1 ring-cyan-500/50' :
          'bg-slate-800/60 hover:bg-slate-800'
        } ${disabled ? 'opacity-60' : ''}`}
      >
        {/* Category dot */}
        <span className={`w-2 h-2 rounded-full ${dotClass} shrink-0`} aria-hidden="true" />

        {/* Name - tappable to open detail */}
        <button
          onClick={onDetail}
          className="text-sm text-slate-200 flex-1 truncate text-left focus:outline-none focus-visible:underline"
          aria-label={`View details for ${policy.name}`}
        >
          {policy.name}
          {isNew && <span className="ml-1.5 text-[9px] text-cyan-400 font-bold uppercase">New</span>}
        </button>

        {/* Cost badge */}
        <span className="text-xs text-slate-400 tabular-nums shrink-0">{effectiveCost}</span>

        {/* Checkbox toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); if (!disabled) onToggle(); }}
          disabled={disabled && !selected}
          className={`
            w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 transition-colors
            focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500
            ${selected
              ? 'bg-cyan-600 border-cyan-500'
              : disabled
                ? 'border-slate-600 cursor-not-allowed'
                : 'border-slate-500 hover:border-cyan-500'}
          `}
          aria-label={selected ? `Deselect ${policy.name}` : `Select ${policy.name}`}
          aria-checked={selected}
          role="checkbox"
        >
          {selected && (
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
              <path d="M5 12l5 5L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>
    );
  }

  // Locked policy card (desktop)
  if (locked) {
    return (
      <Tooltip text={lockHint ?? 'Locked'}>
        <div
          role="checkbox"
          aria-checked={false}
          aria-disabled={true}
          aria-label={`${policy.name}, ${policy.category}, locked`}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className={`
            rounded-xl p-4 border border-l-4 transition-all select-none
            ${borderClass}
            border-slate-600/40 bg-slate-800/90
            opacity-40 grayscale cursor-not-allowed
          `}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <h4 className="text-sm font-semibold text-slate-100 truncate flex items-center gap-1.5">
              <svg aria-hidden="true" className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              {policy.name}
            </h4>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full whitespace-nowrap ${colorClass}`}>
              {policy.category}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 italic">
            {lockHint ?? 'Locked'}
          </div>
        </div>
      </Tooltip>
    );
  }

  const effectTags = getEffectTags(policy);
  const structuredEffects = formatPolicyEffects(policy);
  const fullTooltip = structuredEffects
    ? `${policy.tooltip}\n---\n${structuredEffects}`
    : policy.tooltip;

  return (
    <Tooltip text={fullTooltip}>
      <div
        role="checkbox"
        aria-checked={selected}
        aria-disabled={disabled}
        aria-label={`${policy.name}, ${policy.category}, cost ${effectiveCost}${isNew ? ', newly available' : ''}`}
        tabIndex={0}
        onClick={() => !disabled && onToggle()}
        onKeyDown={handleKeyDown}
        className={`
          rounded-xl p-4 border border-l-4 transition-all select-none relative
          ${borderClass}
          ${selected
            ? 'border-cyan-400 ring-2 ring-cyan-400/50 bg-slate-700'
            : 'border-slate-600/40 bg-slate-800/90'}
          ${disabled
            ? 'opacity-60 grayscale border-slate-600 cursor-not-allowed'
            : 'cursor-pointer hover:border-slate-500/60'}
          ${!selected && !disabled && 'focus:ring-2 focus:ring-cyan-500'}
        `}
      >
        {isNew && (
          <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-full bg-cyan-500 text-slate-900 animate-pulse">
            New!
          </span>
        )}
        <div className="flex items-center justify-between gap-2 mb-2">
          <h4 className="text-sm font-semibold text-slate-100 truncate">{policy.name}</h4>
          {disabled && disabledReason && <span className="text-[10px] text-amber-400 italic shrink-0">{disabledReason}</span>}
          {disabled && !disabledReason && <span className="text-[10px] text-slate-400 italic shrink-0">Unavailable</span>}
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full whitespace-nowrap ${colorClass}`}>
            {policy.category}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Cost: <span className="text-slate-200 font-medium">{effectiveCost}</span></span>
          {policy.targetBloc && (
            <span className="text-[10px] text-violet-400 italic">Choose a bloc</span>
          )}
        </div>
        {effectTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2" aria-hidden="true">
            {effectTags.map((tag, i) => (
              <span key={i} className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${tag.color}`}>
                {tag.text}
              </span>
            ))}
          </div>
        )}
      </div>
    </Tooltip>
  );
}
