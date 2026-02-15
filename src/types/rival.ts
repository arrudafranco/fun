export type RivalBackground =
  | 'congressional_leader'
  | 'regional_governor'
  | 'retired_general'
  | 'media_personality';

export interface RivalState {
  name: string;
  title: string;
  background: RivalBackground;
  power: number;                    // 0-100, starts at 15
  powerDelta: number;               // Last turn's power change (for UI display)
  thresholdsFired: number[];        // Power levels already triggered
  gridlockCountdown: number;        // Turns remaining for gridlock effect (0 = inactive)
  cultureWarCountdown: number;      // Turns remaining for culture war effect (0 = inactive)
  lastAction: string;               // Flavor text describing rival's latest move
}

export const STARTING_RIVAL: Omit<RivalState, 'name' | 'title' | 'background'> = {
  power: 15,
  powerDelta: 0,
  thresholdsFired: [],
  gridlockCountdown: 0,
  cultureWarCountdown: 0,
  lastAction: '',
};
