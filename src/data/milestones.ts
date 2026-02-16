import type { Milestone } from '../types/milestones';

export const MILESTONES: Milestone[] = [
  // === VISIBLE MILESTONES (5) ===
  {
    id: 'miranda_model',
    name: 'The Miranda Model',
    description: 'Build a republic that others want to emulate. High legitimacy, no active crises, low polarization.',
    conditions: [
      { type: 'resource_above', resource: 'legitimacy', value: 80, label: 'Legitimacy above 80' },
      { type: 'no_active_crises', label: 'No active crises' },
      { type: 'resource_below', resource: 'polarization', value: 25, label: 'Polarization below 25' },
    ],
    hidden: false,
    rewardText: 'Foreign journalists write about Miranda with cautious admiration. The phrase "the Miranda Model" appears in three editorials. Your aide clips them for the scrapbook. You wonder how long the ink will last.',
    rewardType: 'policy_unlock',
    rewardPolicyId: 'international_summit',
    category: 'governance',
  },
  {
    id: 'full_employment',
    name: 'Full Employment',
    description: 'A workforce mobilized, labor united, and inflation under control.',
    conditions: [
      { type: 'resource_above', resource: 'mobilization', value: 80, label: 'Mobilization above 80' },
      { type: 'bloc_loyalty_above', blocId: 'labor', value: 65, label: 'Labor loyalty above 65' },
      { type: 'resource_below', resource: 'inflation', value: 8, label: 'Inflation below 8' },
    ],
    hidden: false,
    rewardText: 'The unemployment office closed early. Not for lack of staff, but for lack of applicants. The dockworkers\' choir rehearsed a new song. Something about "honest work." The factory owners sent a card.',
    rewardType: 'policy_unlock',
    rewardPolicyId: 'universal_basic_income',
    category: 'economy',
  },
  {
    id: 'the_peacemaker',
    name: 'The Peacemaker',
    description: 'A society at peace with itself. Low polarization, low dread, all blocs reasonably content.',
    conditions: [
      { type: 'resource_below', resource: 'polarization', value: 15, label: 'Polarization below 15' },
      { type: 'resource_below', resource: 'dread', value: 10, label: 'Dread below 10' },
      { type: 'all_blocs_above', value: 35, label: 'All blocs above 35 loyalty' },
    ],
    hidden: false,
    rewardText: 'Two rival newspaper editors were seen having lunch together. A small thing. But small things, accumulated, change the texture of a republic. Or so you tell yourself.',
    rewardType: 'mechanical',
    rewardEffects: { resources: { legitimacy: 10, narrative: 5 } },
    category: 'social',
  },
  {
    id: 'economic_tiger',
    name: 'Economic Tiger',
    description: 'Miranda\'s economy roars. Massive capital reserves, low inflation, independent central bank.',
    conditions: [
      { type: 'resource_above', resource: 'capital', value: 400, label: 'Capital above 400' },
      { type: 'resource_below', resource: 'inflation', value: 5, label: 'Inflation below 5' },
      { type: 'custom', customFn: (state) => state.centralBankIndependence > 70, label: 'Central Bank independence above 70' },
    ],
    hidden: false,
    rewardText: 'The financial papers ran a special edition. "Miranda\'s Miracle" was the headline. The Banks sent champagne. Your treasurer framed the budget surplus report. It was the first one he hadn\'t had to apologize for.',
    rewardType: 'policy_unlock',
    rewardPolicyId: 'sovereign_investment_fund',
    category: 'economy',
  },
  {
    id: 'united_front',
    name: 'United Front',
    description: 'A broad coalition of blocs stands behind you, with congressional majority to prove it.',
    conditions: [
      { type: 'custom', customFn: (state) => {
        const { blocs } = state;
        let count = 0;
        for (const id of Object.keys(blocs)) {
          if (blocs[id as keyof typeof blocs].loyalty > 50) count++;
        }
        return count >= 10;
      }, label: '10+ blocs with loyalty above 50' },
      { type: 'congress_majority', label: 'Congressional majority' },
    ],
    hidden: false,
    rewardText: 'The congressional hall erupted in applause. For once, the applause was for you, not despite you. Your chief of staff smiled. He almost never smiles. "Don\'t get used to it," he said.',
    rewardType: 'policy_unlock',
    rewardPolicyId: 'constitutional_convention',
    category: 'governance',
  },

  // === HIDDEN MILESTONES (4) ===
  {
    id: 'puppet_master',
    name: 'The Puppet Master',
    description: 'Master of the backroom. Multiple delayed effects running simultaneously.',
    conditions: [
      { type: 'custom', customFn: (state) => state.delayedEffects.length >= 3, label: '3+ active delayed effects' },
    ],
    hidden: true,
    rewardText: 'Your aide lost track of the favors owed and the favors outstanding. She started a spreadsheet. It crashed. "Too many dependencies," the error message said. You found that funnier than you should have.',
    rewardType: 'narrative',
    rewardEffects: { resources: { narrative: 5 } },
    category: 'military',
  },
  {
    id: 'against_all_odds',
    name: 'Against All Odds',
    description: 'Survive to the halfway point on crisis difficulty.',
    conditions: [
      { type: 'custom', customFn: (state) => state.difficulty === 'crisis', label: 'Crisis difficulty' },
      { type: 'turn_reached', value: 24, label: 'Reached turn 24' },
      { type: 'custom', customFn: (state) => !state.gameOver, label: 'Not game over' },
    ],
    hidden: true,
    rewardText: 'Halfway through. The odds were against you. They still are. But you\'re still standing, and in Miranda, standing counts for something.',
    rewardType: 'mechanical',
    rewardEffects: { resources: { legitimacy: 10 } },
    category: 'governance',
  },
  {
    id: 'the_reformer',
    name: 'The Reformer',
    description: 'Enact 30 or more policies over your term.',
    conditions: [
      { type: 'custom', customFn: (state) => state.policiesEnactedCount >= 30, label: '30+ policies enacted' },
    ],
    hidden: true,
    rewardText: 'Your desk drawers are full of signed orders. Thirty initiatives and counting. History will sort the good from the bad. For now, the Republic moves.',
    rewardType: 'narrative',
    rewardEffects: { resources: { legitimacy: 5 } },
    category: 'social',
  },
  {
    id: 'colossus_whisperer',
    name: 'Colossus Whisperer',
    description: 'Keep the Colossus happy while maintaining independence.',
    conditions: [
      { type: 'custom', customFn: (state) => state.colossus.patience > 80, label: 'Colossus patience above 80' },
      { type: 'custom', customFn: (state) => state.colossus.alignment < 30, label: 'Alignment below 30' },
    ],
    hidden: true,
    rewardText: 'The ambassador smiles through gritted teeth. Miranda refuses to bend, and yet the Colossus does not break relations. Your trade attach\u00e9 calls it "diplomatic aikido." You call it luck.',
    rewardType: 'policy_unlock',
    rewardPolicyId: 'trade_independence',
    category: 'diplomacy',
  },
];
