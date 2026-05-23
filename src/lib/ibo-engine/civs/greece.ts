import type { CivilizationType, EventIcon, IboState } from '../types';
import type { CivilizationHandler } from './base';

export class GreeceCivilizationHandler implements CivilizationHandler {
  readonly type: CivilizationType = 'Greece';
  readonly preferredAction: EventIcon = 'Recruit';

  onRecruit(state: IboState): void {
    // Formal Training (Education 1):
    // "During RECRUIT, gain 1 Idea for each Academy."
    if (state.advances.includes('Formal Training')) {
      let academyCount = 0;
      for (const city of state.cities) {
        if (city.structures.includes('Academy')) {
          academyCount++;
        }
      }
      if (academyCount > 0) {
        state.resources.ideas += academyCount;
        state.actionLog.push(
          `[Greece - Formal Training]: Gained ${academyCount} Idea(s) from Academies during Recruit action.`
        );
      }
    }
  }
}
