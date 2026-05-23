import type { CivilizationType, EventIcon, IboState } from '../types';
import type { CivilizationHandler } from './base';

export class IndiaCivilizationHandler implements CivilizationHandler {
  readonly type: CivilizationType = 'India';
  readonly preferredAction: EventIcon = 'Influence';

  onAdvance(state: IboState, advance: string): void {
    // Proselytism (Spirituality 2):
    // "Range for Influence Culture is increased by 1."
    if (advance === 'Proselytism') {
      state.actionLog.push(`[India - Proselytism]: Proselytism researched! Influence Culture range increased by 1 globally.`);
    }
  }

  onRecruit(state: IboState): void {
    // Indian Elephants (Agriculture 2):
    if (state.advances.includes('Indian Elephants')) {
      state.actionLog.push(`[India - Indian Elephants]: Armed war elephants mobilized during Recruit action.`);
    }
  }
}
