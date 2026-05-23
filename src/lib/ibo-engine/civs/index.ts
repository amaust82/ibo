import type { CivilizationType } from '../types';
import { GenericCivilizationHandler, type CivilizationHandler } from './base';
import { RomeCivilizationHandler } from './rome';
import { GreeceCivilizationHandler } from './greece';
import { ChinaCivilizationHandler } from './china';
import { VikingsCivilizationHandler } from './vikings';
import { AztecsCivilizationHandler } from './aztecs';
import { BabyloniaCivilizationHandler } from './babylonia';
import { CarthageCivilizationHandler } from './carthage';
import { CeltsCivilizationHandler } from './celts';
import { EgyptCivilizationHandler } from './egypt';
import { HunsCivilizationHandler } from './huns';
import { IndiaCivilizationHandler } from './india';
import { JapanCivilizationHandler } from './japan';
import { MayaCivilizationHandler } from './maya';
import { PersiaCivilizationHandler } from './persia';
import { PhoeniciaCivilizationHandler } from './phoenicia';

export type { CivilizationHandler } from './base';
export { GenericCivilizationHandler } from './base';
export { RomeCivilizationHandler } from './rome';
export { GreeceCivilizationHandler } from './greece';
export { ChinaCivilizationHandler } from './china';
export { VikingsCivilizationHandler } from './vikings';
export { AztecsCivilizationHandler } from './aztecs';
export { BabyloniaCivilizationHandler } from './babylonia';
export { CarthageCivilizationHandler } from './carthage';
export { CeltsCivilizationHandler } from './celts';
export { EgyptCivilizationHandler } from './egypt';
export { HunsCivilizationHandler } from './huns';
export { IndiaCivilizationHandler } from './india';
export { JapanCivilizationHandler } from './japan';
export { MayaCivilizationHandler } from './maya';
export { PersiaCivilizationHandler } from './persia';
export { PhoeniciaCivilizationHandler } from './phoenicia';

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
    case 'Aztecs':
      return new AztecsCivilizationHandler();
    case 'Babylonia':
      return new BabyloniaCivilizationHandler();
    case 'Carthage':
      return new CarthageCivilizationHandler();
    case 'Celts':
      return new CeltsCivilizationHandler();
    case 'Egypt':
      return new EgyptCivilizationHandler();
    case 'Huns':
      return new HunsCivilizationHandler();
    case 'India':
      return new IndiaCivilizationHandler();
    case 'Japan':
      return new JapanCivilizationHandler();
    case 'Maya':
      return new MayaCivilizationHandler();
    case 'Persia':
      return new PersiaCivilizationHandler();
    case 'Phoenicia':
      return new PhoeniciaCivilizationHandler();
    case 'Generic':
    default:
      return new GenericCivilizationHandler();
  }
}
