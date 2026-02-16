import type { GameState, BriefingItem } from '../types/game';
import type { ResourceState } from '../types/resources';
import type { BlocId } from '../types/blocs';
import { BLOC_DEFINITIONS } from '../data/blocs';

const BLOC_DISPLAY: Partial<Record<BlocId, string>> = {
  finance: 'Miranda National Bank',
  labor: 'The dockworkers\' union',
  syndicate: 'The Underworld',
  military: 'The generals',
  enforcers: 'The Enforcers',
  court: 'The Court',
  media: 'The Heralds',
  academy: 'The Scholars',
  artists: 'The Artists\' quarter',
  clergy: 'The Clergy',
  mainStreet: 'Main Street',
  tech: 'The tech sector',
  industry: 'The factory owners',
  agri: 'The Landowners',
};

/**
 * Generate narrative briefing items based on what happened this turn.
 * Compares current state to previousResources to detect notable changes.
 * Returns at most 3 items, prioritized by dramatic impact.
 */
export function generateBriefingItems(state: GameState): BriefingItem[] {
  const prev = state.previousResources;
  if (!prev) return [];

  const candidates: (BriefingItem & { priority: number })[] = [];

  // 1. Rival action is always included if present (highest priority)
  if (state.rival.lastAction) {
    candidates.push({
      type: 'rival',
      text: state.rival.lastAction,
      priority: 100,
    });
  }

  // 2. Crisis events fired this turn
  if (state.activeCrises.length > 0) {
    const crisis = state.activeCrises[0];
    const stage = crisis.stageIndex;
    if (stage === 0) {
      candidates.push({
        type: 'crisis',
        text: 'Reports of unusual activity across the capital. Your aide recommends keeping the schedule clear.',
        priority: 95,
      });
    } else if (stage >= 2) {
      candidates.push({
        type: 'crisis',
        text: 'The crisis deepens. Official statements are starting to contradict each other.',
        priority: 95,
      });
    }
  }

  // 3. Discovery fired (check if legitimacy dropped significantly from discovery exposure)
  const legitDrop = prev.legitimacy - state.resources.legitimacy;
  if (legitDrop >= 15) {
    candidates.push({
      type: 'discovery',
      text: 'An old backroom deal surfaced in the Heralds. The Court is not amused. Your aide suggests a vacation.',
      priority: 90,
    });
  }

  // 4. Resource threshold crossings
  const res = state.resources;

  // Rival crossed 50
  if (state.rival.power >= 50 && (state.rival.power - (state.rival.powerDelta ?? 0)) < 50) {
    candidates.push({
      type: 'rival',
      text: 'The Rival\'s caucus blocked three bills this week. Main Street shopkeepers have started using the word "gridlock" as a verb.',
      priority: 85,
    });
  }

  // Rival crossed 75
  if (state.rival.power >= 75 && (state.rival.power - (state.rival.powerDelta ?? 0)) < 75) {
    candidates.push({
      type: 'rival',
      text: 'The Rival held a rally in Constitution Square. The crowd was larger than yours. The police estimate was "concerning."',
      priority: 88,
    });
  }

  // Inflation crossed 10
  if (res.inflation >= 10 && prev.inflation < 10) {
    candidates.push({
      type: 'resource',
      text: 'The price of bread doubled. A bakery in the old quarter hung a sign: "We accept tears."',
      priority: 80,
    });
  }

  // Inflation crossed 18
  if (res.inflation >= 18 && prev.inflation < 18) {
    candidates.push({
      type: 'resource',
      text: 'The currency exchange kiosks have stopped updating their boards. "What\'s the point," the attendant said.',
      priority: 82,
    });
  }

  // Narrative dropped below 30
  if (res.narrative < 30 && prev.narrative >= 30) {
    candidates.push({
      type: 'resource',
      text: 'The morning newspapers ran identical front pages. None of them were yours.',
      priority: 78,
    });
  }

  // Narrative rose above 60
  if (res.narrative >= 60 && prev.narrative < 60) {
    candidates.push({
      type: 'resource',
      text: 'The schoolchildren wrote essays about the Republic. Most of them were favorable. All of them mentioned you.',
      priority: 70,
    });
  }

  // Mobilization dropped below 20
  if (res.mobilization < 20 && prev.mobilization >= 20) {
    candidates.push({
      type: 'resource',
      text: 'The rally planned for Sunday was cancelled. "Low expected turnout," the organizers said. They didn\'t look surprised.',
      priority: 75,
    });
  }

  // Polarization crossed 60
  if (res.polarization >= 60 && prev.polarization < 60) {
    candidates.push({
      type: 'resource',
      text: 'Two cafes on the same street hung opposing banners. Their owners stopped speaking last month.',
      priority: 72,
    });
  }

  // Dread crossed 40
  if (res.dread >= 40 && prev.dread < 40) {
    candidates.push({
      type: 'resource',
      text: 'The night patrols doubled. Citizens learned to walk faster and look straight ahead.',
      priority: 74,
    });
  }

  // 5. Bloc loyalty crossing 30 (dropped below) or 70 (rose above)
  for (const blocId of Object.keys(state.blocs) as BlocId[]) {
    const bloc = state.blocs[blocId];
    const display = BLOC_DISPLAY[blocId] ?? BLOC_DEFINITIONS[blocId]?.name ?? blocId;

    // Crossed below 30
    if (bloc.loyalty < 30) {
      // Check if this is a recent drop (we don't have previous bloc state easily,
      // so just generate these occasionally based on the current low value)
      if (bloc.loyalty < 25 && bloc.loyalty > 20) {
        const texts: Record<string, string> = {
          finance: 'Miranda National Bank moved its reserves to a Colossus subsidiary. Their press release thanked you for "the learning experience."',
          labor: 'The dockworkers\' choir cancelled their national theater performance. "We have nothing to sing about," the conductor said.',
          military: 'The generals\' weekly briefing was unusually short. They left without saluting.',
          media: 'The Heralds ran a blank front page. "We thought it was more honest," the editor explained.',
          court: 'The judges started citing precedents from before the Republic. A quiet form of protest.',
        };
        if (texts[blocId]) {
          candidates.push({
            type: 'bloc_shift',
            text: texts[blocId],
            priority: 65,
          });
        }
      }
    }

    // Crossed above 70
    if (bloc.loyalty >= 70 && bloc.loyalty <= 75) {
      const texts: Record<string, string> = {
        labor: 'The dockworkers\' choir performed at the national theater. Standing ovation. The factory owners left at intermission.',
        finance: 'The Banks sent a crystal decanter to the palace. The card read: "To continued cooperation."',
        military: 'The generals invited you to observe field exercises. They named the maneuver after your birthday.',
        syndicate: 'A man in an expensive suit arrived at the palace. He left a card and a bottle of wine from a vineyard that doesn\'t exist on any map.',
        media: 'The Heralds ran a feature series on your economic vision. It was almost entirely accurate.',
      };
      if (texts[blocId]) {
        candidates.push({
          type: 'bloc_shift',
          text: texts[blocId],
          priority: 60,
        });
      }
    }
  }

  // 6. Policy unlocks
  if (state.newlyUnlockedPolicyIds.length > 0) {
    candidates.push({
      type: 'unlock',
      text: 'A man in an expensive suit arrived at the palace. He left a card. New options are available.',
      priority: 50,
    });
  }

  // 7. Colossus patience dropping
  if (state.colossus.patience < 30) {
    candidates.push({
      type: 'resource',
      text: 'The Colossus ambassador\'s smile is getting thinner. Her entourage is getting larger.',
      priority: 55,
    });
  }

  // Sort by priority (highest first) and take top 3
  candidates.sort((a, b) => b.priority - a.priority);
  return candidates.slice(0, 3).map(({ priority, ...item }) => item);
}
