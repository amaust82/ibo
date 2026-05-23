import type { CivilizationType, EventIcon, IboState } from '../types';
import type { CivilizationHandler } from './base';

export class MayaCivilizationHandler implements CivilizationHandler {
  readonly type: CivilizationType = 'Maya';
  readonly preferredAction: EventIcon = 'Advance';

  onFound(state: IboState, cityId: string): void {
    // Terracing (Agriculture 2):
    // "FOUND in reverse terrain order."
    if (state.advances.includes('Terracing')) {
      state.actionLog.push(`[Maya - Terracing]: Terraced agriculture configured in City ${cityId}.`);
    }
  }

  onConstruct(state: IboState, cityId: string, structure: string): void {
    // Stelas (Traditions 1):
    // "After CONSTRUCT, gain 1 Idea."
    if (state.advances.includes('Stelas')) {
      state.resources.ideas += 1;
      state.actionLog.push(`[Maya - Stelas]: Monumental Stela constructed! Gained +1 Idea.`);
    }
  }
}
