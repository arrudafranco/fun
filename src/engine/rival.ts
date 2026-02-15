import type { GameState } from '../types/game';
import { getDifficultyConfig } from '../types/game';
import type { RivalBackground } from '../types/rival';
import { clamp, randomChoice } from '../utils/helpers';

// ── Rival action templates ──────────────────────────────────────────────

type PowerTier = 'low' | 'mid' | 'high';
type Weakness = 'legitimacy' | 'inflation' | 'no_majority' | 'polarization' | 'narrative' | 'baseline';

interface ActionTemplate {
  tier: PowerTier;
  weakness?: Weakness;  // if omitted, matches any weakness (baseline)
  text: string;
}

const RIVAL_ACTIONS: Record<RivalBackground, ActionTemplate[]> = {
  congressional_leader: [
    // Low tier
    { tier: 'low', text: 'Filing motions. Three hundred pages. Nobody reads them yet.' },
    { tier: 'low', text: 'Quietly meeting with freshman representatives after hours.' },
    { tier: 'low', text: 'Building a mailing list. Every disgruntled voter gets a letter.' },
    { tier: 'low', text: 'Hired two new staffers from your old campaign team.' },
    { tier: 'low', text: 'Gave a floor speech to an empty chamber. The transcript circulated anyway.' },
    { tier: 'low', weakness: 'legitimacy', text: 'Requesting an audit of last year\'s budget. Looking for cracks.' },
    { tier: 'low', weakness: 'inflation', text: 'Distributed grocery price comparisons to every legislator\'s inbox.' },
    // Mid tier
    { tier: 'mid', text: 'Whipping votes behind closed doors. The count is shifting.' },
    { tier: 'mid', text: 'Called a press conference on the capitol steps. Cameras everywhere.' },
    { tier: 'mid', text: 'Formed a bipartisan "accountability caucus." Your allies are nervous.' },
    { tier: 'mid', text: 'Blocked your infrastructure bill in committee. Smiled for the cameras.' },
    { tier: 'mid', text: 'Leaked a draft of your next budget proposal. The reaction was ugly.' },
    { tier: 'mid', weakness: 'polarization', text: 'United the opposition caucus around a single message. Yours is the problem.' },
    { tier: 'mid', weakness: 'no_majority', text: 'Rallied the crossbenchers. Your legislative agenda is stalling.' },
    { tier: 'mid', weakness: 'narrative', text: 'Circulated a counter-narrative memo to every newsroom in the capital.' },
    { tier: 'mid', weakness: 'legitimacy', text: 'Tabled a no-confidence motion. Not enough votes yet... but close.' },
    // High tier
    { tier: 'high', text: 'The opposition caucus votes in lockstep now. Every bill is a battle.' },
    { tier: 'high', text: 'Announced a shadow cabinet. The papers are running profiles.' },
    { tier: 'high', text: 'Held a rally on the national mall. Attendance exceeded expectations.' },
    { tier: 'high', weakness: 'legitimacy', text: 'Drafting articles of no confidence. The signatures are almost there.' },
    { tier: 'high', weakness: 'inflation', text: 'Introduced an emergency price stabilization act. Your move.' },
    { tier: 'high', weakness: 'no_majority', text: 'Controls the legislative calendar now. Nothing passes without approval.' },
  ],

  regional_governor: [
    // Low tier
    { tier: 'low', text: 'Opened a new clinic in the provinces. Local papers covered it warmly.' },
    { tier: 'low', text: 'Touring rural districts. Shaking hands, learning names.' },
    { tier: 'low', text: 'Hosted a town hall in the northern highlands. Standing room only.' },
    { tier: 'low', text: 'Published an op-ed about regional neglect. Polite, but pointed.' },
    { tier: 'low', text: 'Met with local business owners. Promised less interference from the capital.' },
    { tier: 'low', weakness: 'inflation', text: 'Announced a regional food subsidy. Funded from the provincial budget.' },
    { tier: 'low', weakness: 'legitimacy', text: 'Quietly polling in your weakest districts. Gathering ammunition.' },
    // Mid tier
    { tier: 'mid', text: 'Three more governors signed a joint statement backing the opposition.' },
    { tier: 'mid', text: 'Established a parallel development fund. Bypassing your ministries entirely.' },
    { tier: 'mid', text: 'Organized a governors\' summit. Your invitation got lost in the mail.' },
    { tier: 'mid', text: 'Regional police forces are coordinating under opposition direction now.' },
    { tier: 'mid', text: 'Blocked federal road construction in two provinces. "Permit issues."' },
    { tier: 'mid', weakness: 'narrative', text: 'Launched a regional media network. Your message doesn\'t reach the provinces anymore.' },
    { tier: 'mid', weakness: 'polarization', text: 'Playing peacemaker between factions. Making you look like the divisive one.' },
    { tier: 'mid', weakness: 'no_majority', text: 'Provincial legislators are siding with the governors over the capital.' },
    { tier: 'mid', weakness: 'inflation', text: 'Set up regional price controls. They\'re working... and that\'s the problem.' },
    // High tier
    { tier: 'high', text: 'Six provinces now operate semi-autonomously. Federal authority is theoretical.' },
    { tier: 'high', text: 'Declared a "regional state of emergency." The constitutional basis is thin.' },
    { tier: 'high', text: 'The provincial assemblies are drafting a confederal charter.' },
    { tier: 'high', weakness: 'legitimacy', text: 'Calling for a constitutional convention. Says the presidency has failed.' },
    { tier: 'high', weakness: 'narrative', text: 'Controls the narrative outside the capital. Your story ends at the city limits.' },
    { tier: 'high', weakness: 'no_majority', text: 'Provincial blocs are defecting en masse. The center cannot hold.' },
  ],

  retired_general: [
    // Low tier
    { tier: 'low', text: 'Gave an interview about "the old days." Nostalgia is a weapon.' },
    { tier: 'low', text: 'Visited the military academy. The cadets stood a little straighter.' },
    { tier: 'low', text: 'Published a memoir chapter. The implications about civilian leadership were clear.' },
    { tier: 'low', text: 'Having lunch with retired officers. Every week, same restaurant.' },
    { tier: 'low', text: 'Attended a veterans\' memorial ceremony. The speech was short and sharp.' },
    { tier: 'low', weakness: 'legitimacy', text: 'Mentioned "institutional stability" three times in one interview. A signal.' },
    { tier: 'low', weakness: 'polarization', text: 'Warned about "national fracture" on a morning talk show. Measured tone.' },
    // Mid tier
    { tier: 'mid', text: 'Active-duty officers are requesting transfers to units under friendly command.' },
    { tier: 'mid', text: 'Established a "national security advisory council." Parallel command structure.' },
    { tier: 'mid', text: 'Three garrison commanders attended a private dinner. No one reported what was discussed.' },
    { tier: 'mid', text: 'Defense contractors are routing proposals through the general\'s office first.' },
    { tier: 'mid', text: 'Published a white paper on "constitutional crisis protocols." Read between the lines.' },
    { tier: 'mid', weakness: 'legitimacy', text: 'Gave a televised address about "restoring order." Didn\'t specify whose order.' },
    { tier: 'mid', weakness: 'inflation', text: 'Proposed military-run supply distribution. "Efficiency," the general says.' },
    { tier: 'mid', weakness: 'narrative', text: 'Veterans\' groups are amplifying opposition messaging on every channel.' },
    { tier: 'mid', weakness: 'no_majority', text: 'Reminded the legislature that the military "serves the constitution, not the president."' },
    // High tier
    { tier: 'high', text: 'Military exercises near the capital. "Routine," according to the press office.' },
    { tier: 'high', text: 'The joint chiefs requested a "private consultation." The tone was not optional.' },
    { tier: 'high', text: 'Armored units repositioned to three provincial capitals overnight.' },
    { tier: 'high', weakness: 'legitimacy', text: 'Released a statement about "the constitutional duty to preserve the republic." Ominous.' },
    { tier: 'high', weakness: 'polarization', text: 'Offered to "mediate" between political factions. With tanks nearby.' },
    { tier: 'high', weakness: 'inflation', text: 'Promised military price enforcement. The markets are already responding.' },
  ],

  media_personality: [
    // Low tier
    { tier: 'low', text: 'Recording another podcast episode. Subscriber count climbing.' },
    { tier: 'low', text: 'Posted a thread dissecting your latest speech. Went viral by lunch.' },
    { tier: 'low', text: 'Appeared on three talk shows this week. Always charming, always on message.' },
    { tier: 'low', text: 'Started a YouTube documentary series. "Inside Miranda\'s Crisis."' },
    { tier: 'low', text: 'Trending on social media again. The algorithm favors outrage.' },
    { tier: 'low', weakness: 'inflation', text: 'Ran the grocery receipt segment again. Viewers know what a peso buys now.' },
    { tier: 'low', weakness: 'narrative', text: 'Fact-checked your press secretary live on air. It was devastating.' },
    // Mid tier
    { tier: 'mid', text: 'Launched a daily morning show. Higher ratings than state television.' },
    { tier: 'mid', text: 'Organized a public debate. Your spokesperson declined. That was the story.' },
    { tier: 'mid', text: 'Three major advertisers pulled from state media. Following the audience.' },
    { tier: 'mid', text: 'Published leaked internal memos. Your comms team is scrambling.' },
    { tier: 'mid', text: 'Created a citizen journalism network. Thousands of phones, all watching.' },
    { tier: 'mid', weakness: 'legitimacy', text: 'Ran a week-long series on "broken promises." Every episode lands.' },
    { tier: 'mid', weakness: 'polarization', text: 'Playing both sides on the culture divide. Stoking fires while looking concerned.' },
    { tier: 'mid', weakness: 'narrative', text: 'Hired your former press secretary. They know all the talking points.' },
    { tier: 'mid', weakness: 'inflation', text: 'Live-streamed from a supermarket. The empty shelves told the story.' },
    // High tier
    { tier: 'high', text: 'Prime time special. "The Failed Presidency." Airing tomorrow.' },
    { tier: 'high', text: 'Endorsed opposition candidates on every platform simultaneously. Coordinated strike.' },
    { tier: 'high', text: 'Organized a million-viewer livestream rally. The streets filled to match.' },
    { tier: 'high', weakness: 'legitimacy', text: 'Countdown clock on every broadcast. "Days until accountability."' },
    { tier: 'high', weakness: 'narrative', text: 'Controls the narrative completely. Your version of events doesn\'t reach anyone.' },
    { tier: 'high', weakness: 'no_majority', text: 'Running attack ads against every legislator who supports you. It\'s working.' },
  ],
};

const RIVAL_NAMES: Record<RivalBackground, string[]> = {
  congressional_leader: ['Senator Vidal', 'Senator Correa', 'Speaker Moreno'],
  regional_governor:    ['Governor Torres', 'Governor Almeida', 'Governor Fuentes'],
  retired_general:      ['General Cardoso', 'General Montoya', 'General Braga'],
  media_personality:    ['Ricardo Vox', 'Diana Cruz', 'Marco Estrella'],
};

const RIVAL_TITLES: Record<RivalBackground, string> = {
  congressional_leader: 'Congressional Leader',
  regional_governor:    'Regional Governor',
  retired_general:      'Retired General',
  media_personality:    'Media Personality',
};

const BACKGROUNDS: RivalBackground[] = [
  'congressional_leader', 'regional_governor', 'retired_general', 'media_personality',
];

export function generateRivalIdentity() {
  const background = randomChoice(BACKGROUNDS);
  const name = randomChoice(RIVAL_NAMES[background]);
  return {
    name,
    title: RIVAL_TITLES[background],
    background,
  };
}

/**
 * Calculate Rival power delta per turn based on game state.
 */
export function calculateRivalPowerDelta(state: GameState): number {
  let delta = 1; // Base growth (discontent is structural)

  // Polarization above 30: +1 per 5 points
  if (state.resources.polarization > 30) {
    delta += Math.floor((state.resources.polarization - 30) / 5);
  }

  // Inflation above 10: +2 per 5 points
  if (state.resources.inflation > 10) {
    delta += Math.floor((state.resources.inflation - 10) / 5) * 2;
  }

  // Low legitimacy
  if (state.resources.legitimacy < 40) {
    delta += 3;
  }

  // Low labor cohesion
  if (state.laborCohesion < 25) {
    delta += 2;
  }

  // Low narrative
  if (state.resources.narrative < 30) {
    delta += 1;
  }

  // High mobilization counters (-1 per 8 above 40)
  if (state.resources.mobilization > 40) {
    delta -= Math.floor((state.resources.mobilization - 40) / 8);
  }

  // High narrative counters (-2 if >50)
  if (state.resources.narrative > 50) {
    delta -= 2;
  }

  // High labor cohesion counters (-1 per 8 above 40)
  if (state.laborCohesion > 40) {
    delta -= Math.floor((state.laborCohesion - 40) / 8);
  }

  // High legitimacy counters (-2 if >70)
  if (state.resources.legitimacy > 70) {
    delta -= 2;
  }

  // No congressional majority: rival exploits legislative weakness
  if (!state.congress.friendlyMajority) {
    delta += 1;
  }

  // Cap total growth at +8 per turn
  const capped = Math.min(delta, 8);

  // Apply difficulty multiplier after cap
  const config = getDifficultyConfig(state.difficulty);
  return Math.round(capped * config.rivalGrowthMultiplier);
}

/**
 * Determine the player's most exploitable weakness from game state.
 */
function identifyDominantWeakness(state: GameState): Weakness {
  // Check each weakness condition in priority order
  const checks: { weakness: Weakness; condition: boolean; severity: number }[] = [
    { weakness: 'legitimacy', condition: state.resources.legitimacy < 50, severity: 50 - state.resources.legitimacy },
    { weakness: 'inflation', condition: state.resources.inflation > 12, severity: state.resources.inflation - 12 },
    { weakness: 'no_majority', condition: !state.congress.friendlyMajority, severity: 15 },
    { weakness: 'polarization', condition: state.resources.polarization > 40, severity: state.resources.polarization - 40 },
    { weakness: 'narrative', condition: state.resources.narrative < 40, severity: 40 - state.resources.narrative },
  ];

  let best: Weakness = 'baseline';
  let bestSeverity = 0;
  for (const c of checks) {
    if (c.condition && c.severity > bestSeverity) {
      best = c.weakness;
      bestSeverity = c.severity;
    }
  }
  return best;
}

/**
 * Determine power tier from rival power level.
 */
function getPowerTier(power: number): PowerTier {
  if (power >= 66) return 'high';
  if (power >= 36) return 'mid';
  return 'low';
}

/**
 * Generate a context-aware rival action line based on background, power tier, and player weakness.
 */
export function generateRivalAction(state: GameState): string {
  const templates = RIVAL_ACTIONS[state.rival.background];
  if (!templates) return '';

  const tier = getPowerTier(state.rival.power);
  const weakness = identifyDominantWeakness(state);

  // Get all lines for this tier
  const tierLines = templates.filter(t => t.tier === tier);

  // Prefer weakness-specific lines if available
  const weaknessLines = tierLines.filter(t => t.weakness === weakness);
  if (weaknessLines.length > 0) {
    // 70% chance to use weakness-specific, 30% general
    const pool = [...weaknessLines, ...weaknessLines, ...tierLines.filter(t => !t.weakness)];
    return randomChoice(pool).text;
  }

  // Fall back to general lines for this tier
  const generalLines = tierLines.filter(t => !t.weakness);
  if (generalLines.length > 0) {
    return randomChoice(generalLines).text;
  }

  // Ultimate fallback
  return randomChoice(tierLines).text;
}

/**
 * Check rival thresholds and return event IDs that should fire.
 */
export function checkRivalThresholds(state: GameState): number[] {
  const thresholds = [30, 50, 60, 70, 85, 95];
  const newThresholds: number[] = [];

  for (const threshold of thresholds) {
    if (
      state.rival.power >= threshold &&
      !state.rival.thresholdsFired.includes(threshold)
    ) {
      newThresholds.push(threshold);
    }
  }

  return newThresholds;
}

/**
 * Apply rival power delta and update state.
 */
export function processRivalTurn(state: GameState): void {
  const delta = calculateRivalPowerDelta(state);
  state.rival.powerDelta = delta;
  state.rival.power = clamp(state.rival.power + delta, 0, 100);

  // Generate rival action text for this turn
  state.rival.lastAction = generateRivalAction(state);

  // Track newly crossed thresholds
  const newThresholds = checkRivalThresholds(state);
  state.rival.thresholdsFired.push(...newThresholds);

  // Decrement countdowns
  if (state.rival.gridlockCountdown > 0) {
    state.rival.gridlockCountdown--;
  }
  if (state.rival.cultureWarCountdown > 0) {
    state.rival.cultureWarCountdown--;
    // Culture war: clergy and mainStreet loyalty check
    if (state.blocs.clergy.loyalty < 50) {
      state.blocs.clergy.loyalty = clamp(state.blocs.clergy.loyalty - 5, 0, 100);
    }
    if (state.blocs.mainStreet.loyalty < 50) {
      state.blocs.mainStreet.loyalty = clamp(state.blocs.mainStreet.loyalty - 5, 0, 100);
    }
  }

  // Activate countdowns from newly fired thresholds
  if (newThresholds.includes(50)) {
    state.rival.gridlockCountdown = 4;
  }
  if (newThresholds.includes(60)) {
    state.rival.cultureWarCountdown = 4;
  }
}
