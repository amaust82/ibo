import type { CivilizationType, EventIcon, IboState } from '../types';
import type { CivilizationHandler } from './base';

export class AztecsCivilizationHandler implements CivilizationHandler {
  readonly type: CivilizationType = 'Aztecs';
  readonly preferredAction: EventIcon = 'Attack';

  onBattleEnd(state: IboState, won: boolean, unitsLost: number): void {
    // Captives (Warfare 1):
    // "Up to 4 defeated non-Leader Army units are placed here as Captives. 1/2 VP each. Will spend Captives as Gold if need be."
    if (state.advances.includes('Captives')) {
      // Simulate adding a captive to IBO state (represented as resource increment or logs)
      state.resources.gold += 1; // Simplify: gain gold as representation of captives trade/spending
      state.actionLog.push(`[Aztecs - Captives]: IBO captured defeated units and spent them as resource currency (+1 Gold).`);
    }
  }

  onAdvance(state: IboState, advance: string): void {
    // Human Sacrifice (Spirituality 1):
    if (advance === 'Human Sacrifice') {
      state.actionLog.push(`[Aztecs - Human Sacrifice]: Human Sacrifice researched. IBO gains combat advantage when fighting in or adjacent to its temples.`);
    }
  }
}
