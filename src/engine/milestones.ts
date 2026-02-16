import type { GameState } from '../types/game';
import type { Milestone, MilestoneCondition } from '../types/milestones';
import type { BlocId } from '../types/blocs';
import { ALL_BLOC_IDS } from '../types/blocs';
import { MILESTONES } from '../data/milestones';

/** Evaluate a single milestone condition against the current state. */
export function evaluateCondition(cond: MilestoneCondition, state: GameState): boolean {
  switch (cond.type) {
    case 'resource_above':
      return cond.resource !== undefined && cond.value !== undefined &&
        state.resources[cond.resource] > cond.value;

    case 'resource_below':
      return cond.resource !== undefined && cond.value !== undefined &&
        state.resources[cond.resource] < cond.value;

    case 'bloc_loyalty_above':
      if (!cond.blocId || cond.value === undefined) return false;
      return state.blocs[cond.blocId as BlocId]?.loyalty > cond.value;

    case 'all_blocs_above':
      if (cond.value === undefined) return false;
      return ALL_BLOC_IDS.every(id => state.blocs[id].loyalty > cond.value!);

    case 'rival_power_below':
      return cond.value !== undefined && state.rival.power < cond.value;

    case 'turn_reached':
      return cond.value !== undefined && state.turn >= cond.value;

    case 'no_active_crises':
      return state.activeCrises.length === 0;

    case 'congress_majority':
      return state.congress.friendlyMajority;

    case 'custom':
      return cond.customFn ? cond.customFn(state) : false;

    default:
      return false;
  }
}

/** Get progress for each condition in a milestone. */
export function getConditionProgress(milestone: Milestone, state: GameState): boolean[] {
  return milestone.conditions.map(cond => evaluateCondition(cond, state));
}

/**
 * Check all milestones and return IDs of newly achieved ones.
 * Does not re-trigger already achieved milestones.
 */
export function checkMilestones(state: GameState): string[] {
  const newlyAchieved: string[] = [];
  const achieved = state.achievedMilestoneIds ?? [];

  for (const milestone of MILESTONES) {
    if (achieved.includes(milestone.id)) continue;

    const allMet = milestone.conditions.every(cond => evaluateCondition(cond, state));
    if (allMet) {
      newlyAchieved.push(milestone.id);
    }
  }

  return newlyAchieved;
}
