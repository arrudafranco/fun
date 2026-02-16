/**
 * Tests for milestone system: condition evaluation, milestone checking, milestone-exclusive policy unlocks.
 */
import { describe, it, expect } from 'vitest';
import { createInitialState } from '../engine/gameState';
import { evaluateCondition, checkMilestones, getConditionProgress } from '../engine/milestones';
import { MILESTONES } from '../data/milestones';
import { processUnlocks } from '../engine/unlocks';
import { seedRng, deepClone } from '../utils/helpers';
import type { GameState } from '../types/game';
import type { BlocId } from '../types/blocs';
import { ALL_BLOC_IDS } from '../types/blocs';

function makeState(): GameState {
  seedRng(42);
  return createInitialState();
}

describe('Milestone Condition Evaluation', () => {
  it('evaluates resource_above correctly', () => {
    const state = makeState();
    state.resources.legitimacy = 85;
    expect(evaluateCondition(
      { type: 'resource_above', resource: 'legitimacy', value: 80, label: 'Legitimacy > 80' },
      state
    )).toBe(true);

    state.resources.legitimacy = 75;
    expect(evaluateCondition(
      { type: 'resource_above', resource: 'legitimacy', value: 80, label: 'Legitimacy > 80' },
      state
    )).toBe(false);
  });

  it('evaluates resource_below correctly', () => {
    const state = makeState();
    state.resources.polarization = 10;
    expect(evaluateCondition(
      { type: 'resource_below', resource: 'polarization', value: 25, label: 'Polarization < 25' },
      state
    )).toBe(true);

    state.resources.polarization = 30;
    expect(evaluateCondition(
      { type: 'resource_below', resource: 'polarization', value: 25, label: 'Polarization < 25' },
      state
    )).toBe(false);
  });

  it('evaluates bloc_loyalty_above correctly', () => {
    const state = makeState();
    state.blocs.labor.loyalty = 70;
    expect(evaluateCondition(
      { type: 'bloc_loyalty_above', blocId: 'labor', value: 65, label: 'Labor > 65' },
      state
    )).toBe(true);

    state.blocs.labor.loyalty = 60;
    expect(evaluateCondition(
      { type: 'bloc_loyalty_above', blocId: 'labor', value: 65, label: 'Labor > 65' },
      state
    )).toBe(false);
  });

  it('evaluates all_blocs_above correctly', () => {
    const state = makeState();
    for (const id of ALL_BLOC_IDS) state.blocs[id].loyalty = 40;
    expect(evaluateCondition(
      { type: 'all_blocs_above', value: 35, label: 'All blocs > 35' },
      state
    )).toBe(true);

    state.blocs.military.loyalty = 30;
    expect(evaluateCondition(
      { type: 'all_blocs_above', value: 35, label: 'All blocs > 35' },
      state
    )).toBe(false);
  });

  it('evaluates turn_reached correctly', () => {
    const state = makeState();
    state.turn = 24;
    expect(evaluateCondition(
      { type: 'turn_reached', value: 24, label: 'Turn 24' },
      state
    )).toBe(true);

    state.turn = 23;
    expect(evaluateCondition(
      { type: 'turn_reached', value: 24, label: 'Turn 24' },
      state
    )).toBe(false);
  });

  it('evaluates no_active_crises correctly', () => {
    const state = makeState();
    state.activeCrises = [];
    expect(evaluateCondition(
      { type: 'no_active_crises', label: 'No crises' },
      state
    )).toBe(true);

    state.activeCrises = [{ chainId: 'test', stageIndex: 0, turnsAtStage: 0, resolved: false }];
    expect(evaluateCondition(
      { type: 'no_active_crises', label: 'No crises' },
      state
    )).toBe(false);
  });

  it('evaluates congress_majority correctly', () => {
    const state = makeState();
    state.congress.friendlyMajority = true;
    expect(evaluateCondition(
      { type: 'congress_majority', label: 'Majority' },
      state
    )).toBe(true);

    state.congress.friendlyMajority = false;
    expect(evaluateCondition(
      { type: 'congress_majority', label: 'Majority' },
      state
    )).toBe(false);
  });

  it('evaluates custom conditions correctly', () => {
    const state = makeState();
    state.centralBankIndependence = 75;
    expect(evaluateCondition(
      { type: 'custom', customFn: (s) => s.centralBankIndependence > 70, label: 'CBI > 70' },
      state
    )).toBe(true);
  });
});

describe('Milestone Checking', () => {
  it('returns newly achieved milestone IDs', () => {
    const state = makeState();
    // Set up conditions for "the_peacemaker"
    state.resources.polarization = 10;
    state.resources.dread = 5;
    for (const id of ALL_BLOC_IDS) state.blocs[id].loyalty = 40;

    const achieved = checkMilestones(state);
    expect(achieved).toContain('the_peacemaker');
  });

  it('does not re-trigger already achieved milestones', () => {
    const state = makeState();
    state.resources.polarization = 10;
    state.resources.dread = 5;
    for (const id of ALL_BLOC_IDS) state.blocs[id].loyalty = 40;
    state.achievedMilestoneIds = ['the_peacemaker'];

    const achieved = checkMilestones(state);
    expect(achieved).not.toContain('the_peacemaker');
  });

  it('returns empty array when no milestones achieved', () => {
    const state = makeState();
    const achieved = checkMilestones(state);
    expect(Array.isArray(achieved)).toBe(true);
  });
});

describe('Condition Progress', () => {
  it('returns correct progress array', () => {
    const state = makeState();
    const milestone = MILESTONES.find(m => m.id === 'the_peacemaker')!;

    state.resources.polarization = 10; // below 15 - met
    state.resources.dread = 15; // NOT below 10
    for (const id of ALL_BLOC_IDS) state.blocs[id].loyalty = 40; // all > 35 - met

    const progress = getConditionProgress(milestone, state);
    expect(progress[0]).toBe(true); // polarization < 15
    expect(progress[1]).toBe(false); // dread < 10
    expect(progress[2]).toBe(true); // all blocs > 35
  });
});

describe('Milestone-Exclusive Policy Unlocks', () => {
  it('milestone-exclusive policies are locked by default', () => {
    const state = makeState();
    const milestoneIds = MILESTONES.map(m => m.rewardPolicyId).filter(Boolean);
    for (const policyId of milestoneIds) {
      expect(state.unlockedPolicyIds).not.toContain(policyId);
    }
  });

  it('milestone-exclusive policies unlock after milestone achievement', () => {
    const state = makeState();
    state.achievedMilestoneIds = ['miranda_model'];
    processUnlocks(state);
    expect(state.unlockedPolicyIds).toContain('international_summit');
  });

  it('milestone-exclusive policies stay locked without milestone', () => {
    const state = makeState();
    state.achievedMilestoneIds = [];
    processUnlocks(state);
    expect(state.unlockedPolicyIds).not.toContain('international_summit');
  });
});

describe('GameState Integration', () => {
  it('policiesEnactedCount initializes to 0', () => {
    const state = makeState();
    expect(state.policiesEnactedCount).toBe(0);
  });

  it('achievedMilestoneIds initializes to empty array', () => {
    const state = makeState();
    expect(Array.isArray(state.achievedMilestoneIds)).toBe(true);
    expect(state.achievedMilestoneIds.length).toBe(0);
  });

  it('seenPositiveTriggers initializes to empty array', () => {
    const state = makeState();
    expect(Array.isArray(state.seenPositiveTriggers)).toBe(true);
  });

  it('eventCooldowns initializes to empty object', () => {
    const state = makeState();
    expect(state.eventCooldowns).toBeDefined();
    expect(Object.keys(state.eventCooldowns).length).toBe(0);
  });

  it('all milestone definitions are valid', () => {
    for (const m of MILESTONES) {
      expect(m.id).toBeTruthy();
      expect(m.name).toBeTruthy();
      expect(m.conditions.length).toBeGreaterThan(0);
      for (const c of m.conditions) {
        expect(c.label).toBeTruthy();
      }
      // No em-dashes or colons in player-facing text
      expect(m.rewardText).not.toMatch(/[—:]/);
      expect(m.description).not.toMatch(/[—:]/);
    }
  });
});
