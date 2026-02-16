import { useState, useEffect } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { MILESTONES } from '../data/milestones';
import { getConditionProgress } from '../engine/milestones';
import CollapsibleSection from './CollapsibleSection';

const CATEGORY_ICONS: Record<string, string> = {
  governance: '🏛️',
  diplomacy: '🌐',
  economy: '💰',
  social: '🤝',
  military: '⚔️',
};

const MILESTONE_VIEW_KEY = 'miranda-milestone-view';
type MilestoneViewMode = 'detail' | 'overview';

interface MilestonesPanelProps {
  bare?: boolean;
}

export default function MilestonesPanel({ bare }: MilestonesPanelProps) {
  const state = useGameStore(s => s);
  const achieved = state.achievedMilestoneIds ?? [];

  const [viewMode, setViewMode] = useState<MilestoneViewMode>(() => {
    try {
      const stored = localStorage.getItem(MILESTONE_VIEW_KEY);
      if (stored === 'overview' || stored === 'detail') return stored;
    } catch { /* ignore */ }
    return 'detail';
  });

  useEffect(() => {
    try { localStorage.setItem(MILESTONE_VIEW_KEY, viewMode); } catch { /* ignore */ }
  }, [viewMode]);

  const visibleMilestones = MILESTONES.filter(m => !m.hidden || achieved.includes(m.id));
  const hiddenCount = MILESTONES.filter(m => m.hidden && !achieved.includes(m.id)).length;

  const achievedList = visibleMilestones.filter(m => achieved.includes(m.id));
  const pendingList = visibleMilestones.filter(m => !achieved.includes(m.id));

  const overviewContent = (
    <div data-tutorial="milestones" className="mx-4 mb-4">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-slate-500 text-left">
            <th className="pb-1 font-medium w-6"></th>
            <th className="pb-1 font-medium">Milestone</th>
            <th className="pb-1 font-medium text-right pr-1">Progress</th>
          </tr>
        </thead>
        <tbody>
          {[...achievedList, ...pendingList].map(m => {
            const isAchieved = achieved.includes(m.id);
            const progress = isAchieved ? [] : getConditionProgress(m, state);
            const metCount = isAchieved ? m.conditions.length : progress.filter(Boolean).length;
            const icon = CATEGORY_ICONS[m.category] ?? '📋';
            return (
              <tr key={m.id} className={`border-t border-slate-700/30 ${isAchieved ? 'text-amber-300' : 'text-slate-300'}`}>
                <td className="py-1.5 pr-1" aria-hidden="true">{icon}</td>
                <td className="py-1.5 truncate max-w-0">
                  {m.name}
                  {isAchieved && <span className="text-amber-400 ml-1" aria-label="Achieved">&#10003;</span>}
                </td>
                <td className={`py-1.5 text-right pr-1 tabular-nums ${isAchieved ? 'text-amber-400' : metCount === m.conditions.length ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {metCount}/{m.conditions.length}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {hiddenCount > 0 && (
        <p className="text-xs text-slate-500 italic mt-2">
          {hiddenCount} hidden milestone{hiddenCount > 1 ? 's' : ''} remain...
        </p>
      )}
    </div>
  );

  const detailContent = (
    <div data-tutorial="milestones" className="space-y-3 mx-4 mb-4">
      {achievedList.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Achieved</h4>
          {achievedList.map(m => (
            <MilestoneCard key={m.id} milestone={m} achieved progress={[]} />
          ))}
        </div>
      )}

      {pendingList.length > 0 && (
        <div className="space-y-2">
          {achievedList.length > 0 && (
            <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">In Progress</h4>
          )}
          {pendingList.map(m => {
            const progress = getConditionProgress(m, state);
            return <MilestoneCard key={m.id} milestone={m} achieved={false} progress={progress} />;
          })}
        </div>
      )}

      {hiddenCount > 0 && (
        <p className="text-xs text-slate-500 italic">
          {hiddenCount} hidden milestone{hiddenCount > 1 ? 's' : ''} remain...
        </p>
      )}

      {visibleMilestones.length === 0 && (
        <p className="text-xs text-slate-500 italic">No milestones discovered yet.</p>
      )}
    </div>
  );

  const content = viewMode === 'overview' ? overviewContent : detailContent;

  const viewToggle = (
    <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-0.5" role="radiogroup" aria-label="Milestone view mode">
      <button
        role="radio"
        aria-checked={viewMode === 'overview'}
        onClick={() => setViewMode('overview')}
        className={`px-2.5 py-1 text-[10px] font-medium rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
          viewMode === 'overview' ? 'bg-slate-700 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        Overview
      </button>
      <button
        role="radio"
        aria-checked={viewMode === 'detail'}
        onClick={() => setViewMode('detail')}
        className={`px-2.5 py-1 text-[10px] font-medium rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
          viewMode === 'detail' ? 'bg-slate-700 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        Detail
      </button>
    </div>
  );

  if (bare) {
    return (
      <section>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mx-4 font-pixel">
          Milestones
        </h2>
        {content}
      </section>
    );
  }

  return (
    <CollapsibleSection id="milestones" title="Milestones" headerRight={viewToggle}>
      {content}
    </CollapsibleSection>
  );
}

function MilestoneCard({
  milestone,
  achieved,
  progress,
}: {
  milestone: typeof MILESTONES[number];
  achieved: boolean;
  progress: boolean[];
}) {
  const metCount = achieved ? milestone.conditions.length : progress.filter(Boolean).length;
  const totalCount = milestone.conditions.length;
  const icon = CATEGORY_ICONS[milestone.category] ?? '📋';

  return (
    <div
      className={`rounded-lg p-3 border ${
        achieved
          ? 'bg-amber-900/20 border-amber-500/30'
          : 'bg-slate-800/60 border-slate-700/40'
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="text-sm shrink-0" aria-hidden="true">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h5 className={`text-sm font-semibold truncate ${achieved ? 'text-amber-300' : 'text-slate-200'}`}>
              {milestone.name}
            </h5>
            {achieved && (
              <span className="text-amber-400 text-xs shrink-0" aria-label="Achieved">&#10003;</span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5 leading-snug">{milestone.description}</p>

          {/* Condition checklist */}
          <div className="mt-2 space-y-1" role="list" aria-label={`${milestone.name} conditions`}>
            {milestone.conditions.map((cond, i) => {
              const met = achieved || progress[i];
              return (
                <div key={i} className="flex items-center gap-1.5 text-xs" role="listitem">
                  <span className={`shrink-0 ${met ? 'text-emerald-400' : 'text-slate-600'}`} aria-hidden="true">
                    {met ? '●' : '○'}
                  </span>
                  <span className={met ? 'text-slate-300' : 'text-slate-500'}>
                    {cond.label}
                  </span>
                  <span className="sr-only">{met ? '(complete)' : '(incomplete)'}</span>
                </div>
              );
            })}
          </div>

          {/* Progress summary */}
          <p className="sr-only">
            {metCount} of {totalCount} conditions met
          </p>
        </div>
      </div>
    </div>
  );
}
