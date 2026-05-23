import type { CivilizationType, EventIcon, IboState } from '../types';
import type { CivilizationHandler } from './base';

export class RomeCivilizationHandler implements CivilizationHandler {
  readonly type: CivilizationType = 'Rome';
  readonly preferredAction: EventIcon = 'Construct';

  onAdvance(state: IboState, advance: string): void {
    // Provinces (Any Government 1):
    // "When acquired, perform an ADVANCE in Agriculture. IBO ignores 'Exhausted Land' Events."
    if (advance === 'Provinces' || advance === 'Democracy' || advance === 'Autocracy' || advance === 'Theocracy') {
      // Note: Provinces is the Rome-specific name for slot 1 of any government.
      // We will perform a free agriculture advancement.
      // Find the next unresearched Agriculture advance:
      const agList = ['Farming', 'Irrigation', 'Storage', 'Crop Rotation'];
      const nextAg = agList.find((adv) => !state.advances.includes(adv));
      if (nextAg) {
        state.advances.push(nextAg);
        state.actionLog.push(`[Rome - Provinces]: Free Advance in Agriculture researched: ${nextAg}`);
      }
    }
  }

  onConstruct(state: IboState, cityId: string, structure: string): void {
    // Imperial Roads (Construction 3):
    // "After CONSTRUCT (not FOUND), IBO gains Gold."
    if (state.advances.includes('Imperial Roads') && structure !== 'Settlement') {
      state.resources.gold += 1;
      state.actionLog.push(`[Rome - Imperial Roads]: Gained 1 Gold after constructing ${structure} in City ${cityId}.`);
    }
  }
}
