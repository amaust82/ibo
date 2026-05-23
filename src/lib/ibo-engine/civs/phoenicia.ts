import type { CivilizationType, EventIcon, IboState } from '../types';
import type { CivilizationHandler } from './base';

export class PhoeniciaCivilizationHandler implements CivilizationHandler {
  readonly type: CivilizationType = 'Phoenicia';
  readonly preferredAction: EventIcon = 'Construct';

  onAdvance(state: IboState, advance: string): void {
    // Alphabet (Education 1):
    // "Pay 4 Gold to both ADVANCE and gain 1 Idea."
    if (advance === 'Alphabet') {
      state.resources.ideas += 1;
      state.actionLog.push(`[Phoenicia - Alphabet]: Alphabet researched! Gained 1 Idea.`);
    }
  }

  onConstruct(state: IboState, cityId: string, structure: string): void {
    // Cedars & Dyes (Economy 2):
    if (state.advances.includes('Cedars & Dyes')) {
      state.resources.gold += 1;
      state.actionLog.push(`[Phoenicia - Cedars & Dyes]: Trade ships exported luxury goods (+1 Gold).`);
    }
  }
}
