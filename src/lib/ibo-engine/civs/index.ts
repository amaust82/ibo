import type { CivilizationType } from '../types';
import { GenericCivilizationHandler, type CivilizationHandler } from './base';
import { RomeCivilizationHandler } from './rome';
import { GreeceCivilizationHandler } from './greece';
import { ChinaCivilizationHandler } from './china';
import { VikingsCivilizationHandler } from './vikings';

export type { CivilizationHandler } from './base';
export { GenericCivilizationHandler } from './base';
export { RomeCivilizationHandler } from './rome';
export { GreeceCivilizationHandler } from './greece';
export { ChinaCivilizationHandler } from './china';
export { VikingsCivilizationHandler } from './vikings';

/**
 * Returns the corresponding civilization strategy handler class for a given CivilizationType.
 */
export function getCivHandler(type: CivilizationType): CivilizationHandler {
  switch (type) {
    case 'Rome':
      return new RomeCivilizationHandler();
    case 'Greece':
      return new GreeceCivilizationHandler();
    case 'China':
      return new ChinaCivilizationHandler();
    case 'Vikings':
      return new VikingsCivilizationHandler();
    case 'Generic':
    default:
      return new GenericCivilizationHandler();
  }
}
