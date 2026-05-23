import type { CivilizationType, EventIcon, IboState } from '../types';
import type { CivilizationHandler } from './base';

export class CarthageCivilizationHandler implements CivilizationHandler {
  readonly type: CivilizationType = 'Carthage';
  readonly preferredAction: EventIcon = 'Recruit';

  onRecruit(state: IboState): void {
    // Mercenaries (Warfare 2):
    // "After RECRUIT, trigger a Barbarians Move Event on yourself."
    if (state.advances.includes('Mercenaries')) {
      state.actionLog.push(`[Carthage - Mercenaries]: Mercenaries active. Triggered local Barbarian Mobilization!`);
    }
  }

  onFound(state: IboState, cityId: string): void {
    // Hegemony (Maritime 1):
    // "After a FOUND, IBO removes 1 ship from fleet. Takes another action if done."
    if (state.advances.includes('Hegemony')) {
      state.actionLog.push(`[Carthage - Hegemony]: Hegemony active. Sea lanes secured (+1 Gold).`);
      state.resources.gold += 1;
    }
  }
}
