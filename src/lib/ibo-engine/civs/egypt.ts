import type { CivilizationType, EventIcon, IboState } from '../types';
import type { CivilizationHandler } from './base';

export class EgyptCivilizationHandler implements CivilizationHandler {
  readonly type: CivilizationType = 'Egypt';
  readonly preferredAction: EventIcon = 'Influence';

  onAdvance(state: IboState, advance: string): void {
    // Architecture (Construction 2):
    // "When acquired, perform a CONSTRUCT action."
    if (advance === 'Architecture') {
      state.actionLog.push(`[Egypt - Architecture]: Architecture researched! Performing free CONSTRUCT action.`);
      // Svelte or engine can trigger construct. We log it and let it execute:
      if (state.cities.length > 0) {
        // Construct in first city
        const targetCity = state.cities[0];
        const nextIndex = state.scale.findIndex(s => s.structure !== null && s.structure !== 'Settlement');
        if (nextIndex !== -1) {
          const struct = state.scale[nextIndex].structure!;
          if (!targetCity.structures.includes(struct)) {
            state.scale[nextIndex].structure = null;
            // Shift
            for (let i = nextIndex; i < 7; i++) {
              state.scale[i].structure = state.scale[i + 1].structure;
            }
            state.scale[7].structure = null;
            targetCity.structures.push(struct);
            targetCity.size = targetCity.structures.length;
            state.actionLog.push(`[Egypt - Architecture]: Automatically constructed ${struct} in ${targetCity.name}.`);
          }
        }
      }
    }
  }

  onBattleEnd(state: IboState, won: boolean, unitsLost: number): void {
    // Embalming (Spirituality 1):
    // "Gains 1 Culture Token after every battle he takes part in."
    if (state.advances.includes('Embalming')) {
      state.resources.ideas += 1;
      state.actionLog.push(`[Egypt - Embalming]: Gained 1 Idea from historical combat preserves.`);
    }
  }
}
