import type { CivilizationType, EventIcon, IboState } from '../types';
import type { CivilizationHandler } from './base';

export class ChinaCivilizationHandler implements CivilizationHandler {
  readonly type: CivilizationType = 'China';
  readonly preferredAction: EventIcon = 'Construct';

  onAdvance(state: IboState, advance: string): void {
    // Sprawling (Agriculture 2):
    // "When acquired, perform a FOUND."
    if (advance === 'Sprawling') {
      state.actionLog.push(`[China - Sprawling]: Sprawling researched. Free FOUND action triggered.`);
      // Note: We trigger a FOUND event. The core engine will handle founding.
      // Svelte or core engine class will see this and process it.
    }
  }

  onFound(state: IboState, cityId: string): void {
    // Fighting Bands (Any Government 1):
    // "After a FOUND action, make the city Angry and perform a RECRUIT action in the new city."
    if (state.advances.includes('Fighting Bands')) {
      const city = state.cities.find((c) => c.id === cityId);
      if (city) {
        city.isAngry = true;
        city.mood = 'Angry';
        state.actionLog.push(
          `[China - Fighting Bands]: New City ${city.name} (${cityId}) made Angry. Free RECRUIT triggered in this city.`
        );
      }
    }
  }
}
