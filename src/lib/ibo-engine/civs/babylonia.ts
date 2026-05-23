import type { CivilizationType, EventIcon, IboState } from '../types';
import type { CivilizationHandler } from './base';

export class BabyloniaCivilizationHandler implements CivilizationHandler {
  readonly type: CivilizationType = 'Babylonia';
  readonly preferredAction: EventIcon = 'Advance';

  onAdvance(state: IboState, advance: string): void {
    // Ziggurats (Any Gov 1):
    // "When acquired, perform an ADVANCE, CONSTRUCT and gain 1 Culture Token."
    if (advance === 'Ziggurats' || advance === 'Democracy' || advance === 'Autocracy' || advance === 'Theocracy') {
      state.actionLog.push(`[Babylonia - Ziggurats]: Ziggurats researched! Triggered free CONSTRUCT action and +1 Idea.`);
      state.resources.ideas += 1;
    }

    // Star Catalogues (Science 1):
    // "Gains 1 Culture Token when triggering an event."
    if (state.advances.includes('Star Catalogues')) {
      state.resources.ideas += 1;
      state.actionLog.push(`[Babylonia - Star Catalogues]: Star Catalogues passive triggered: gained 1 Idea.`);
    }
  }
}
