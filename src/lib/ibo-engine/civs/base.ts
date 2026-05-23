import type { CivilizationType, EventIcon, IboState } from '../types';

export interface CivilizationHandler {
  readonly type: CivilizationType;
  readonly preferredAction: EventIcon;

  /**
   * Hook triggered during IBO companion setup/wizard initialization.
   */
  onSetup?(state: IboState): void;

  /**
   * Hook triggered immediately after the IBO learns an advancement.
   */
  onAdvance?(state: IboState, advance: string): void;

  /**
   * Hook triggered immediately after a new city is founded.
   */
  onFound?(state: IboState, cityId: string): void;

  /**
   * Hook triggered immediately after a construction action is completed in a city.
   */
  onConstruct?(state: IboState, cityId: string, structure: string): void;

  /**
   * Hook triggered immediately after a recruit action is resolved.
   */
  onRecruit?(state: IboState): void;

  /**
   * Hook triggered after a battle completes.
   */
  onBattleEnd?(state: IboState, won: boolean, unitsLost: number): void;
}

/**
 * Default generic civilization handler implementing standard IBO rules.
 */
export class GenericCivilizationHandler implements CivilizationHandler {
  readonly type: CivilizationType = 'Generic';
  readonly preferredAction: EventIcon = 'Advance'; // Generic defaults to Advance
}
