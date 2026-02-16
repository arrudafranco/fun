/**
 * Tests for Presidential Dispatch system: data completeness, writing style, template substitution, state management.
 */
import { describe, it, expect } from 'vitest';
import { createInitialState } from '../engine/gameState';
import {
  ENDINGS,
  PRESIDENTIAL_DISPATCHES,
  substituteDispatchVars,
} from '../data/endings';
import { seedRng } from '../utils/helpers';
import type { EndingId, GameState } from '../types/game';

const ALL_ENDING_IDS: EndingId[] = [
  'republic_endures',
  'a_new_story',
  'managers_victory',
  'hollow_republic',
  'protectorate',
  'shadow_republic',
  'impeached',
  'coup',
  'rival_wins',
  'new_compact',
];

function makeState(): GameState {
  seedRng(42);
  return createInitialState();
}

describe('Presidential Dispatches Data', () => {
  it('all 10 endings have PRESIDENTIAL_DISPATCHES entries', () => {
    for (const id of ALL_ENDING_IDS) {
      expect(PRESIDENTIAL_DISPATCHES[id], `Missing dispatch for ${id}`).toBeDefined();
    }
  });

  it('all dispatches have at least 2 paragraphs', () => {
    for (const id of ALL_ENDING_IDS) {
      const dispatch = PRESIDENTIAL_DISPATCHES[id];
      expect(dispatch.paragraphs.length, `${id} has too few paragraphs`).toBeGreaterThanOrEqual(2);
    }
  });

  it('all paragraph texts are non-empty strings', () => {
    for (const id of ALL_ENDING_IDS) {
      const dispatch = PRESIDENTIAL_DISPATCHES[id];
      for (const p of dispatch.paragraphs) {
        expect(typeof p.text).toBe('string');
        expect(p.text.trim().length, `Empty paragraph in ${id}`).toBeGreaterThan(0);
      }
    }
  });

  it('no em-dashes in any dispatch text', () => {
    for (const id of ALL_ENDING_IDS) {
      const dispatch = PRESIDENTIAL_DISPATCHES[id];
      for (const p of dispatch.paragraphs) {
        expect(p.text, `Em-dash found in ${id}`).not.toContain('\u2014');
        expect(p.text, `Em-dash entity found in ${id}`).not.toContain('—');
      }
    }
  });

  it('no colons in any dispatch text', () => {
    for (const id of ALL_ENDING_IDS) {
      const dispatch = PRESIDENTIAL_DISPATCHES[id];
      for (const p of dispatch.paragraphs) {
        expect(p.text, `Colon found in ${id}`).not.toContain(':');
      }
    }
  });

  it('all endings in ENDINGS match dispatch keys', () => {
    const endingKeys = Object.keys(ENDINGS).sort();
    const dispatchKeys = Object.keys(PRESIDENTIAL_DISPATCHES).sort();
    expect(dispatchKeys).toEqual(endingKeys);
  });
});

describe('Template Substitution', () => {
  it('replaces {rivalName} and {rivalTitle}', () => {
    const state = makeState();
    const result = substituteDispatchVars(
      '{rivalName} holds the title of {rivalTitle}',
      state
    );
    expect(result).not.toContain('{rivalName}');
    expect(result).not.toContain('{rivalTitle}');
    expect(result).toContain(state.rival.name);
    expect(result).toContain(state.rival.title);
  });

  it('replaces {turn}', () => {
    const state = makeState();
    state.turn = 24;
    const result = substituteDispatchVars('Month {turn} of presidency', state);
    expect(result).toBe('Month 24 of presidency');
  });

  it('replaces {milestonesCount}', () => {
    const state = makeState();
    state.achievedMilestoneIds = ['a', 'b', 'c'];
    const result = substituteDispatchVars('{milestonesCount} milestones', state);
    expect(result).toBe('3 milestones');
  });

  it('replaces {policiesCount}', () => {
    const state = makeState();
    state.policiesEnactedCount = 15;
    const result = substituteDispatchVars('{policiesCount} decisions', state);
    expect(result).toBe('15 decisions');
  });

  it('produces non-empty output for all dispatch paragraphs', () => {
    const state = makeState();
    state.turn = 48;
    state.achievedMilestoneIds = ['test'];
    state.policiesEnactedCount = 10;
    for (const id of ALL_ENDING_IDS) {
      const dispatch = PRESIDENTIAL_DISPATCHES[id];
      for (const p of dispatch.paragraphs) {
        const result = substituteDispatchVars(p.text, state);
        expect(result.trim().length, `Empty after substitution in ${id}`).toBeGreaterThan(0);
      }
    }
  });
});

describe('Conditional Paragraphs', () => {
  it('republic_endures shows narrative variant based on state', () => {
    const dispatch = PRESIDENTIAL_DISPATCHES.republic_endures;
    const conditionalParas = dispatch.paragraphs.filter(p => p.condition);
    expect(conditionalParas.length).toBeGreaterThan(0);

    // With high narrative, at least one conditional para should pass
    const highNarrative = makeState();
    highNarrative.resources.narrative = 70;
    const highPassing = conditionalParas.filter(p => p.condition!(highNarrative));
    expect(highPassing.length).toBeGreaterThan(0);
  });

  it('impeached shows early/late variants based on turn', () => {
    const dispatch = PRESIDENTIAL_DISPATCHES.impeached;
    const conditionalParas = dispatch.paragraphs.filter(p => p.condition);
    expect(conditionalParas.length).toBeGreaterThanOrEqual(2);

    // Early game
    const earlyState = makeState();
    earlyState.turn = 5;
    const earlyPassing = conditionalParas.filter(p => p.condition!(earlyState));
    expect(earlyPassing.length).toBeGreaterThanOrEqual(1);

    // Late game
    const lateState = makeState();
    lateState.turn = 45;
    const latePassing = conditionalParas.filter(p => p.condition!(lateState));
    expect(latePassing.length).toBeGreaterThanOrEqual(1);

    // Early and late should pick different paragraphs
    const earlyTexts = earlyPassing.map(p => p.text);
    const lateTexts = latePassing.map(p => p.text);
    const overlap = earlyTexts.filter(t => lateTexts.includes(t));
    expect(overlap.length, 'Early and late impeached should show different text').toBeLessThan(earlyTexts.length);
  });
});

describe('showDispatch State Management', () => {
  it('showDispatch initializes to false', () => {
    seedRng(1);
    const state = createInitialState();
    expect(state.showDispatch).toBe(false);
  });

  it('showDispatch is false when game is not over', () => {
    seedRng(1);
    const state = createInitialState();
    expect(state.gameOver).toBe(false);
    expect(state.showDispatch).toBe(false);
  });
});
