import { useGameStore } from '../hooks/useGameStore';
import CollapsibleSection from './CollapsibleSection';

interface NewsLogProps {
  fullHeight?: boolean;
  /** When true, render without CollapsibleSection wrapper (used on mobile) */
  bare?: boolean;
}

export default function NewsLog({ fullHeight, bare }: NewsLogProps) {
  const newsLog = useGameStore(s => s.newsLog);
  const reversed = [...newsLog].reverse();

  const logContent = (
    <div
      role="log"
      aria-label="News log"
      data-tutorial="news-log"
      className={`${fullHeight ? '' : 'max-h-52'} overflow-y-auto rounded bg-slate-900 border border-slate-700/50 p-3 space-y-1 mx-4 mb-4`}
    >
      {reversed.length === 0 && (
        <p className="text-xs text-slate-500 italic">No news yet.</p>
      )}
      {reversed.map((entry, i) => {
        const toneColor = entry.tone === 'positive'
          ? 'text-emerald-400/80'
          : entry.tone === 'negative'
            ? 'text-rose-400/80'
            : 'text-slate-300';
        return (
          <div key={`${entry.turn}-${i}`} className="flex gap-2 text-xs">
            <span className="text-slate-500 font-mono shrink-0">T{entry.turn}</span>
            <span className={toneColor}>{entry.headline}</span>
          </div>
        );
      })}
    </div>
  );

  if (bare) {
    return (
      <section>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mx-4 font-pixel">
          News Log
        </h2>
        {logContent}
      </section>
    );
  }

  return (
    <CollapsibleSection id="news" title="News Log">
      {logContent}
    </CollapsibleSection>
  );
}
