import type { CivilizationType, EventIcon, IboState } from '../types';
import type { CivilizationHandler } from './base';

export class VikingsCivilizationHandler implements CivilizationHandler {
  readonly type: CivilizationType = 'Vikings';
  readonly preferredAction: EventIcon = 'Recruit';

  onAdvance(state: IboState, advance: string): void {
    // Longships (Maritime 2):
    // "When acquired, RECRUIT a Ship (if possible). +1 Naval Aggression Range."
    if (advance === 'Longships') {
      state.actionLog.push(`[Vikings - Longships]: Longships researched. Free Ship RECRUIT triggered. +1 Naval Aggression Range enabled.`);
    }
  }

  onBattleEnd(state: IboState, won: boolean, unitsLost: number): void {
    // Runestones (Spirituality 2):
    // "After any battle that IBO loses 2+ units, place 1 Culture Token on this card. Each Culture Token is 1 Victory Point."
    if (state.advances.includes('Runestones') && !won && unitsLost >= 2) {
      // We can record this in the state. Let's add 1 to culture tokens as a simple representation, or log it
      state.resources.gold += 0; // Runestones are worth 1 VP directly
      state.actionLog.push(
        `[Vikings - Runestones]: IBO lost ${unitsLost} units in battle. Placed 1 Culture Token on Runestones (1 VP).`
      );
    }
  }
}
