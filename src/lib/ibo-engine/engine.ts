import type {
  DifficultyLevel,
  GameLength,
  IboState,
  ResourceType,
  ResourcePool,
  CityState,
  ScaleSlot,
  EventIcon,
  StructureType,
  CityMood
} from './types';
import { getCivHandler, type CivilizationHandler } from './civs';
import {
  resolveAdvanceRoll,
  ADVANCEMENT_TREE,
  STRUCTURE_UNLOCKS,
  type RollResolution
} from './roller';

/**
 * Returns the maximum actions for the IBO based on the variable difficulty table.
 */
export function getMaxActions(difficulty: DifficultyLevel, age: number): number {
  if (difficulty === 'Easy') {
    if (age <= 3) return 1;
    if (age <= 5) return 2;
    return 3;
  }
  if (difficulty === 'Easier') {
    if (age <= 2) return 1;
    if (age <= 5) return 2;
    return 3;
  }
  if (difficulty === 'Normal') {
    if (age <= 2) return 1;
    if (age <= 4) return 2;
    return 3;
  }
  if (difficulty === 'Harder') {
    if (age === 1) return 1;
    if (age <= 4) return 2;
    return 3;
  }
  if (difficulty === 'Hard') {
    if (age === 1) return 1;
    if (age === 2 || age === 3) return 2;
    return 3;
  }
  return 1;
}

/**
 * Maps standard categories to their unlockable building structures.
 */
export function getStructureForCategory(category: string): StructureType | null {
  if (category === 'Maritime') return 'Port';
  if (category === 'Education') return 'Academy';
  if (category === 'Warfare') return 'Fortress';
  if (category === 'Spirituality') return 'Temple';
  if (category === 'Economy') return 'Market';
  if (category === 'Traditions') return 'Obelisk';
  if (category === 'Science') return 'Observatory';
  return null;
}

export class IboEngine {
  private _state!: IboState;
  private civHandler!: CivilizationHandler;

  constructor(
    gameLength: GameLength,
    difficulty: DifficultyLevel,
    civilization: string
  ) {
    this.initialize(gameLength, difficulty, civilization);
  }

  /**
   * Initializes or resets the state to the beginning of the solo game.
   */
  public initialize(
    gameLength: GameLength,
    difficulty: DifficultyLevel,
    civilization: string
  ): void {
    const civType =
      civilization === 'Rome' ||
      civilization === 'Greece' ||
      civilization === 'China' ||
      civilization === 'Vikings'
        ? civilization
        : 'Generic';

    this.civHandler = getCivHandler(civType);

    // Initial scale slot setup: Settlements on 0, 3, 5, 7
    const scale: ScaleSlot[] = Array.from({ length: 8 }, (_, index) => {
      const hasSettlement = [0, 3, 5, 7].includes(index);
      return {
        index,
        structure: hasSettlement ? 'Settlement' : null
      };
    });

    // Starting city setup: size 1 Settlement, Happy mood, Food production type
    const startingCity: CityState = {
      id: 'city-a',
      name: 'City A (Food)',
      size: 1,
      mood: 'Happy',
      structures: ['Settlement'],
      isAngry: false,
      productionType: 'Food'
    };

    // Starting resource pool
    const resources: ResourcePool = {
      gold: 0,
      food: 0,
      ideas: 0,
      wood: 0,
      ore: 0
    };

    // Starting advances: standard Farming and Mining are pre-researched
    const advances = ['Farming', 'Mining'];

    const initialMaxActions = getMaxActions(difficulty, 1);

    this._state = {
      gameLength,
      difficulty,
      civilization: civType,
      currentAge: 1,
      currentAction: 1,
      maxActionsPerTurn: initialMaxActions,
      resources,
      scale,
      cities: [startingCity],
      advances,
      actionLog: ['Solo Game Initialized. Pre-researched: Farming, Mining. Scale initialized.']
    };

    // Run civ-specific wizard or setup overrides
    this.civHandler.onSetup?.(this._state);

    // Short game wizard setup
    if (gameLength === 'Short') {
      this.log('[Short Game Setup]: Triggering initial CONSTRUCT action.');
      this.executeConstructAction('city-a');
    }
  }

  /**
   * Read-only access to IBO State
   */
  public get state(): Readonly<IboState> {
    return this._state;
  }

  /**
   * Helper to write logs to actionLog list.
   */
  public log(msg: string): void {
    this._state.actionLog.push(msg);
  }

  /**
   * Increments resource pools.
   */
  public addResource(type: ResourceType, amount: number): void {
    const key = type.toLowerCase() as keyof ResourcePool;
    this._state.resources[key] += amount;
    this.log(`Resource added: +${amount} ${type}. Current: ${this._state.resources[key]}`);
  }

  /**
   * Modifies resource pools.
   */
  public spendResource(type: ResourceType, amount: number): boolean {
    const key = type.toLowerCase() as keyof ResourcePool;
    if (this._state.resources[key] >= amount) {
      this._state.resources[key] -= amount;
      this.log(`Resource spent: -${amount} ${type}. Current: ${this._state.resources[key]}`);
      return true;
    }
    return false;
  }

  /**
   * Shift scale pieces one space left from the deleted slot index.
   */
  private shiftScaleLeft(startingIndex: number): void {
    for (let i = startingIndex; i < 7; i++) {
      this._state.scale[i].structure = this._state.scale[i + 1].structure;
    }
    this._state.scale[7].structure = null;
  }

  /**
   * Founds a new city. Takes the left-most Settlement from the scale and places it on board.
   */
  public executeFoundCityAction(name: string, productionType?: ResourceType): boolean {
    if (this._state.cities.length >= 5) {
      this.log('Cannot found city: IBO is at the 5-city limit.');
      return false;
    }

    const leftMostIndex = this._state.scale.findIndex((slot) => slot.structure === 'Settlement');
    if (leftMostIndex === -1) {
      this.log('Cannot found city: No Settlement pieces left on scale.');
      return false;
    }

    // Remove Settlement from scale and shift
    this._state.scale[leftMostIndex].structure = null;
    this.shiftScaleLeft(leftMostIndex);

    // Create new city state
    const nextChar = String.fromCharCode(65 + this._state.cities.length); // 'A', 'B', 'C', ...
    const id = `city-${nextChar.toLowerCase()}`;
    const newCity: CityState = {
      id,
      name: `City ${nextChar}${productionType ? ` (${productionType})` : ''}`,
      size: 1,
      mood: 'Neutral',
      structures: ['Settlement'],
      isAngry: false,
      productionType
    };

    this._state.cities.push(newCity);
    this.log(`Founded new city: ${newCity.name} (${id}). Scale shifted left.`);

    // Run hooks
    this.civHandler.onFound?.(this._state, id);
    return true;
  }

  /**
   * Constructs the left-most building from the scale and adds it to the chosen city.
   */
  public executeConstructAction(cityId: string): boolean {
    const city = this._state.cities.find((c) => c.id === cityId);
    if (!city) {
      this.log(`Cannot construct: City ${cityId} not found.`);
      return false;
    }

    if (city.isAngry) {
      this.log(`Cannot construct: City ${city.name} is Angry.`);
      return false;
    }

    // Find the left-most non-Settlement structure slot on scale
    const index = this._state.scale.findIndex(
      (slot) => slot.structure !== null && slot.structure !== 'Settlement'
    );

    if (index === -1) {
      this.log('Cannot construct: No Buildings available on the scale.');
      return false;
    }

    const structure = this._state.scale[index].structure!;

    // Make sure city doesn't already have it
    if (city.structures.includes(structure)) {
      this.log(`Cannot construct: City ${city.name} already contains a ${structure}.`);
      return false;
    }

    // Perform construct
    this._state.scale[index].structure = null;
    this.shiftScaleLeft(index);

    city.structures.push(structure);
    city.size = city.structures.length;

    this.log(`Constructed ${structure} in ${city.name}. City size is now ${city.size}. Scale shifted left.`);

    // Run hooks
    this.civHandler.onConstruct?.(this._state, cityId, structure);
    return true;
  }

  /**
   * Manually adds a structure to the scale (lowest available spot closest to 0).
   */
  public addStructureToScale(structure: StructureType): boolean {
    const emptyIndex = this._state.scale.findIndex((slot) => slot.structure === null);
    if (emptyIndex === -1) {
      this.log(`Cannot place ${structure} on scale: Scale is full.`);
      return false;
    }
    this._state.scale[emptyIndex].structure = structure;
    this.log(`Placed ${structure} on Scale slot ${emptyIndex}.`);
    return true;
  }

  /**
   * Changes the mood of a specific city.
   */
  public updateCityMood(cityId: string, mood: CityMood): void {
    const city = this._state.cities.find((c) => c.id === cityId);
    if (city) {
      city.mood = mood;
      city.isAngry = mood === 'Angry';
      this.log(`City ${city.name} mood updated to: ${mood}.`);
    }
  }

  /**
   * Simulates rolling and resolving an ADVANCE action.
   */
  public executeAdvanceAction(customDice?: [number, number, number]): RollResolution {
    const dice = customDice || [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1
    ];

    const result = resolveAdvanceRoll(this._state.advances, dice);

    if (result.type === 'Advance') {
      const { advance, category } = result;

      // Add to researched list
      this._state.advances.push(advance);
      this.log(`[ADVANCE]: IBO researches advancement ${advance} (${category}).`);

      // Unlock building if applicable and place on scale
      const unlockedStructure = getStructureForCategory(category);
      if (unlockedStructure) {
        this.addStructureToScale(unlockedStructure);
      }

      // Check for China's Sprawling free found trigger
      if (this._state.civilization === 'China' && advance === 'Sprawling') {
        this.executeFoundCityAction('City B', 'Wood');
      }

      // Run civilization specific advance overrides
      this.civHandler.onAdvance?.(this._state, advance);
    } else {
      // It fallback to RECRUIT
      this.log(`[ADVANCE FALLBACK]: ${result.description}. Performing RECRUIT action instead.`);
      this.executeRecruitAction();
    }

    return result;
  }

  /**
   * Simulates and resolves a RECRUIT action.
   */
  public executeRecruitAction(): void {
    this.log('[RECRUIT]: Resolving IBO recruit actions across all active cities.');
    // Run hooks
    this.civHandler.onRecruit?.(this._state);
  }

  /**
   * Consumes an action index and manages turn boundaries.
   */
  public consumeAction(): void {
    if (this._state.currentAction < this._state.maxActionsPerTurn) {
      this._state.currentAction++;
    } else {
      this.log(`Turn Completed. All ${this._state.maxActionsPerTurn} actions performed.`);
    }
  }

  /**
   * Moves the game to the next Age, resetting actions counter.
   */
  public nextAge(): void {
    const nextAge = this._state.currentAge + 1;
    const maxAges = this._state.gameLength === 'Short' ? 4 : 6;

    if (nextAge > maxAges) {
      this.log(`Game Completed! Reached maximum Age ${maxAges}.`);
      return;
    }

    this._state.currentAge = nextAge;
    this._state.currentAction = 1;
    this._state.maxActionsPerTurn = getMaxActions(this._state.difficulty, nextAge);

    this.log(`--- Entered Age ${nextAge} --- Max Actions: ${this._state.maxActionsPerTurn}`);

    // If Shorter game and entering Status Phase, IBO researches 2 free advancements
    if (this._state.gameLength === 'Short' && nextAge === maxAges) {
      this.log('[Short Game Status Phase]: Triggering 2 free Status Phase advancements.');
      this.executeAdvanceAction();
      this.executeAdvanceAction();
    }
  }

  /**
   * Resolves physical Event Card icons manually chosen by user.
   */
  public resolveEventIcon(icon: EventIcon): void {
    this.log(`[Event Icon Triggered]: ${icon}`);
    switch (icon) {
      case 'Advance':
        this.executeAdvanceAction();
        break;
      case 'Recruit':
        this.executeRecruitAction();
        break;
      case 'Attack':
        this.log('[ATTACK]: Tactical Attack action triggered. Move armies towards targets.');
        break;
      case 'Influence':
        this.log('[INFLUENCE]: Culture Influence attempt resolved.');
        break;
      case 'Construct':
        // Try to construct in the city with the settler or largest city
        if (this._state.cities.length > 0) {
          const targetCity = this._state.cities[0].id;
          this.executeConstructAction(targetCity);
        }
        break;
      case 'CivSpecific':
        this.log(`[Civ Specific Action]: Performing ${this.civHandler.preferredAction} for ${this._state.civilization}.`);
        this.resolveEventIcon(this.civHandler.preferredAction);
        break;
      default:
        break;
    }
    this.consumeAction();
  }
}
