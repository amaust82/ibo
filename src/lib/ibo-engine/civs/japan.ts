import type { CivilizationType, EventIcon, IboState } from '../types';
import type { CivilizationHandler } from './base';

export class JapanCivilizationHandler implements CivilizationHandler {
  readonly type: CivilizationType = 'Japan';
  readonly preferredAction: EventIcon = 'Attack';

  onAdvance(state: IboState, advance: string): void {
    // Shogunate (Any Gov 1):
    if (advance === 'Shogunate' || advance === 'Democracy' || advance === 'Autocracy' || advance === 'Theocracy') {
      state.actionLog.push(`[Japan - Shogunate]: Shogunate government established! Tactically positioned for local defensive maneuvers.`);
    }

    // Pottery (Agriculture 3):
    // "After an ADVANCE, gain 1 Gold."
    if (state.advances.includes('Pottery')) {
      state.resources.gold += 1;
      state.actionLog.push(`[Japan - Pottery]: Gained +1 Gold from agrarian storage post advancement.`);
    }
  }
}
