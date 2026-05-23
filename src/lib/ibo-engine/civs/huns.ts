import type { CivilizationType, EventIcon, IboState } from '../types';
import type { CivilizationHandler } from './base';

export class HunsCivilizationHandler implements CivilizationHandler {
  readonly type: CivilizationType = 'Huns';
  readonly preferredAction: EventIcon = 'Construct';

  onSetup(state: IboState): void {
    // Nomads (Agriculture 1):
    // "During setup, place settlements on 0, 1, 3, & 5 of scale."
    state.scale[0].structure = 'Settlement';
    state.scale[1].structure = 'Settlement';
    state.scale[3].structure = 'Settlement';
    state.scale[5].structure = 'Settlement';
    state.actionLog.push(`[Huns - Nomads]: Nomadic setup applied. Settlements placed on Scale slots 0, 1, 3, and 5.`);
  }

  onAdvance(state: IboState, advance: string): void {
    // Hunnic Tribes (Any Gov 1):
    // "Leader leaves behind Culture Tokens instead of Influence."
    if (advance === 'Hunnic Tribes' || advance === 'Democracy' || advance === 'Autocracy' || advance === 'Theocracy') {
      state.resources.ideas += 1;
      state.actionLog.push(`[Huns - Hunnic Tribes]: Hunnic Tribes researched! Gained 1 Idea.`);
    }
  }
}
