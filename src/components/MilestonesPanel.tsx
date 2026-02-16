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

interface MilestonesPanelProps {
  bare?: boolean;
}

export default function MilestonesPanel({ bare }: MilestonesPanelProps) {
  const state = useGameStore(s => s);
  const achieved = state.achievedMilestoneIds ?? [];

  const visibleMilestones = MILESTONES.filter(m => !m.hidden || achieved.includes(m.id));
  const hiddenCount = MILESTONES.filter(m => m.hidden && !achieved.includes(m.id)).length;

  const achievedList = visibleMilestones.filter(m => achieved.includes(m.id));
  const pendingList = visibleMilestones.filter(m => !achieved.includes(m.id));

  const content = (
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
    <CollapsibleSection id="milestones" title="Milestones">
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
