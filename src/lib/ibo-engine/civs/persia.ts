import type { CivilizationType, EventIcon, IboState } from '../types';
import type { CivilizationHandler } from './base';

export class PersiaCivilizationHandler implements CivilizationHandler {
  readonly type: CivilizationType = 'Persia';
  readonly preferredAction: EventIcon = 'Influence';

  onBattleEnd(state: IboState, won: boolean, unitsLost: number): void {
    // Immortals (Warfare 2):
    // "Leaves behind gold instead of idea when it moves or fights."
    if (state.advances.includes('Immortals')) {
      state.resources.gold += 1;
      state.actionLog.push(`[Persia - Immortals]: Immortals sustained operational frontlines. Gained +1 Gold.`);
    }
  }

  onAdvance(state: IboState, advance: string): void {
    // Zoroastrianism (Spirituality 2):
    if (advance === 'Zoroastrianism') {
      state.actionLog.push(`[Persia - Zoroastrianism]: Zoroastrian spiritual overlays activated (+1 VP).`);
    }
  }
}
