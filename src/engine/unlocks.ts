import type { GameState } from '../types/game';
import type { Policy, UnlockCondition } from '../types/actions';
import type { BlocId } from '../types/blocs';
import { POLICIES } from '../data/policies';

/** Starting policies available from Turn 1 (no unlockCondition or type: 'always') */
export function getStartingPolicyIds(): string[] {
  return POLICIES
    .filter(p => !p.unlockCondition || p.unlockCondition.type === 'always')
    .map(p => p.id);
}

/** Check if a single unlock condition is met */
function isConditionMet(cond: UnlockCondition, state: GameState): boolean {
  switch (cond.type) {
    case 'always':
      return true;

    case 'turn':
      return cond.turn !== undefined && state.turn >= cond.turn;

    case 'bloc_loyalty': {
      if (!cond.blocId) return false;
      const bloc = state.blocs[cond.blocId as BlocId];
      if (!bloc) return false;
      if (cond.loyaltyMin !== undefined && bloc.loyalty < cond.loyaltyMin) return false;
      if (cond.loyaltyMax !== undefined && bloc.loyalty > cond.loyaltyMax) return false;
      return true;
    }

    case 'resource': {
      if (!cond.resource) return false;
      const val = state.resources[cond.resource];
      if (cond.resourceMin !== undefined && val < cond.resourceMin) return false;
      if (cond.resourceMax !== undefined && val > cond.resourceMax) return false;
      return true;
    }

    case 'event':
      return cond.eventId !== undefined && state.firedEventIds.includes(cond.eventId);

    case 'milestone':
      return cond.milestoneId !== undefined && state.achievedMilestoneIds.includes(cond.milestoneId);

    default:
      return false;
  }
}

/** Check if a policy's unlock condition is met (handles OR chains) */
export function isPolicyUnlockMet(policy: Policy, state: GameState): boolean {
  if (!policy.unlockCondition) return true;
  if (policy.unlockCondition.type === 'always') return true;

  // Check main condition
  if (isConditionMet(policy.unlockCondition, state)) return true;

  // Check OR chain
  let orCond = policy.unlockCondition.or;
  while (orCond) {
    if (isConditionMet(orCond, state)) return true;
    orCond = orCond.or;
  }

  return false;
}

/**
 * Process unlock checks. Call at end of each turn.
 * Returns the list of newly unlocked policy IDs.
 */
export function processUnlocks(state: GameState): string[] {
  const newlyUnlocked: string[] = [];

  for (const policy of POLICIES) {
    // Skip if already unlocked
    if (state.unlockedPolicyIds.includes(policy.id)) continue;

    // Check unlock condition
    if (isPolicyUnlockMet(policy, state)) {
      state.unlockedPolicyIds.push(policy.id);
      newlyUnlocked.push(policy.id);
    }
  }

  return newlyUnlocked;
}
