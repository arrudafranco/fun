import type { GameState } from './game';
import type { ResourceState } from './resources';

export type MilestoneCategory = 'governance' | 'diplomacy' | 'economy' | 'social' | 'military';

export interface MilestoneCondition {
  type: 'resource_above' | 'resource_below' | 'bloc_loyalty_above' | 'all_blocs_above' | 'rival_power_below' | 'turn_reached' | 'no_active_crises' | 'congress_majority' | 'custom';
  resource?: keyof ResourceState;
  value?: number;
  blocId?: string;
  customFn?: (state: GameState) => boolean;
  label: string;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  conditions: MilestoneCondition[];
  hidden: boolean;
  rewardText: string;
  rewardType: 'policy_unlock' | 'mechanical' | 'narrative';
  rewardPolicyId?: string;
  rewardEffects?: { resources?: Partial<ResourceState>; rivalPower?: number };
  category: MilestoneCategory;
}
