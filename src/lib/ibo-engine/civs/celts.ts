import type { CivilizationType, EventIcon, IboState } from '../types';
import type { CivilizationHandler } from './base';

export class CeltsCivilizationHandler implements CivilizationHandler {
  readonly type: CivilizationType = 'Celts';
  readonly preferredAction: EventIcon = 'Attack';

  onAdvance(state: IboState, advance: string): void {
    // Druidic Influence (Spirituality 2):
    // "May INFLUENCE CULTURE on cities. Pay 3 Ideas to ADVANCE."
    if (advance === 'Druidic Influence') {
      state.actionLog.push(`[Celts - Druidic Influence]: Druidic Influence researched. Solo opponent now gains cultural options.`);
    }
  }

  onBattleEnd(state: IboState, won: boolean, unitsLost: number): void {
    // Tribal Warfare (Warfare 1):
    // "IBO ignores all Barbarians Move events and gains combat bonuses."
    if (state.advances.includes('Tribal Warfare') && won) {
      state.resources.gold += 1;
      state.actionLog.push(`[Celts - Tribal Warfare]: Plundered resources after successful combat (+1 Gold).`);
    }
  }
}
