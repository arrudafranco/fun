/**
 * Tests for briefing system: positive reinforcement triggers, positivity guarantee, tone tags.
 */
import { describe, it, expect } from 'vitest';
import { createInitialState } from '../engine/gameState';
import { generateBriefingItems } from '../engine/briefing';
import { seedRng } from '../utils/helpers';
import type { GameState } from '../types/game';
import { deepClone } from '../utils/helpers';

function makeStateWithPrev(difficulty: 'standard' | 'story' | 'crisis' = 'standard'): GameState {
  seedRng(42);
  const state = createInitialState(difficulty);
  // Set previousResources so briefing has something to compare
  state.previousResources = deepClone(state.resources);
  return state;
}

describe('Briefing: Positive Triggers', () => {
  it('generates capital-above-250 vignette on threshold crossing', () => {
    const state = makeStateWithPrev();
    state.previousResources!.capital = 240;
    state.resources.capital = 260;
    const items = generateBriefingItems(state).items;
    const positive = items.filter(i => i.tone === 'positive');
    expect(positive.length).toBeGreaterThanOrEqual(1);
  });

  it('generates dread-below-20 vignette on threshold crossing', () => {
    const state = makeStateWithPrev();
    state.previousResources!.dread = 25;
    state.resources.dread = 15;
    const items = generateBriefingItems(state).items;
    const positive = items.filter(i => i.tone === 'positive');
    expect(positive.length).toBeGreaterThanOrEqual(1);
  });

  it('generates polarization-below-30 vignette on threshold crossing', () => {
    const state = makeStateWithPrev();
    state.previousResources!.polarization = 35;
    state.resources.polarization = 25;
    const items = generateBriefingItems(state).items;
    const positive = items.filter(i => i.tone === 'positive');
    expect(positive.length).toBeGreaterThanOrEqual(1);
  });

  it('generates mobilization-above-70 vignette on threshold crossing', () => {
    const state = makeStateWithPrev();
    state.previousResources!.mobilization = 65;
    state.resources.mobilization = 75;
    const items = generateBriefingItems(state).items;
    const positive = items.filter(i => i.tone === 'positive');
    expect(positive.length).toBeGreaterThanOrEqual(1);
  });

  it('generates legitimacy-above-75 vignette on threshold crossing', () => {
    const state = makeStateWithPrev();
    state.previousResources!.legitimacy = 70;
    state.resources.legitimacy = 80;
    const items = generateBriefingItems(state).items;
    const positive = items.filter(i => i.tone === 'positive');
    expect(positive.length).toBeGreaterThanOrEqual(1);
  });

  it('generates rival-retreating vignette when power drops >= 10', () => {
    const state = makeStateWithPrev();
    state.rival.power = 30;
    state.rival.powerDelta = -12;
    const items = generateBriefingItems(state).items;
    const rivalPositive = items.filter(i => i.type === 'rival' && i.tone === 'positive');
    expect(rivalPositive.length).toBeGreaterThanOrEqual(1);
  });

  it('does NOT fire positive triggers when conditions are bad', () => {
    const state = makeStateWithPrev();
    state.resources.capital = 15;
    state.resources.dread = 50;
    state.resources.polarization = 60;
    state.resources.mobilization = 15;
    state.resources.legitimacy = 25;
    state.rival.powerDelta = 5;
    const items = generateBriefingItems(state).items;
    const positive = items.filter(i => i.tone === 'positive');
    // Might still have bloc-based positives, but no resource positives
    const resourcePositive = items.filter(i => i.tone === 'positive' && i.type === 'resource');
    expect(resourcePositive.length).toBe(0);
  });
});

describe('Briefing: Positivity Guarantee', () => {
  it('swaps in a positive item when all top-3 are negative', () => {
    const state = makeStateWithPrev();
    // Create conditions for lots of negative items
    state.rival.lastAction = 'The Rival struck again.';
    state.activeCrises = [{ chainId: 'test', stageIndex: 0 }];
    state.previousResources!.legitimacy = 80;
    state.resources.legitimacy = 60; // 20-point drop triggers discovery text

    // But also have positive threshold crossings
    state.previousResources!.capital = 240;
    state.resources.capital = 260; // crosses 250 upward
    state.previousResources!.dread = 25;
    state.resources.dread = 15; // crosses 20 downward

    const items = generateBriefingItems(state).items;
    expect(items.length).toBe(3);
    const hasPositive = items.some(i => i.tone === 'positive');
    expect(hasPositive).toBe(true);
  });
});

describe('Briefing: Tone Tags', () => {
  it('all items have a tone tag', () => {
    for (let seed = 0; seed < 50; seed++) {
      seedRng(seed);
      const state = makeStateWithPrev();
      // Vary conditions
      state.resources.capital = 20 + seed;
      state.resources.dread = seed % 30;
      state.resources.polarization = 10 + seed;
      state.rival.power = 20 + seed;
      state.rival.powerDelta = (seed % 5) - 2;

      const items = generateBriefingItems(state).items;
      for (const item of items) {
        expect(item.tone).toBeDefined();
        expect(['positive', 'negative', 'neutral']).toContain(item.tone);
      }
    }
  });
});

describe('Briefing: Fuzz Positive Reinforcement', () => {
  it('at least some turns produce positive vignettes across 100 seeds with threshold crossings', () => {
    let turnsWithPositive = 0;
    const totalTurns = 100;

    for (let seed = 0; seed < totalTurns; seed++) {
      seedRng(seed);
      const state = makeStateWithPrev('story');
      // Simulate threshold crossings. Vary which threshold is crossed per seed.
      const variant = seed % 5;
      if (variant === 0) {
        state.previousResources!.capital = 240;
        state.resources.capital = 260; // crosses 250 upward
      } else if (variant === 1) {
        state.previousResources!.dread = 25;
        state.resources.dread = 15; // crosses 20 downward
      } else if (variant === 2) {
        state.previousResources!.polarization = 35;
        state.resources.polarization = 25; // crosses 30 downward
      } else if (variant === 3) {
        state.previousResources!.mobilization = 65;
        state.resources.mobilization = 75; // crosses 70 upward
      } else {
        state.previousResources!.legitimacy = 70;
        state.resources.legitimacy = 80; // crosses 75 upward
      }

      const items = generateBriefingItems(state).items;
      if (items.some(i => i.tone === 'positive')) {
        turnsWithPositive++;
      }
    }

    // With threshold crossings set up, most turns should have a positive item
    expect(turnsWithPositive).toBeGreaterThan(70);
  });
});
