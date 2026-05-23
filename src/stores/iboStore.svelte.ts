import { IboEngine } from '../lib/ibo-engine/engine';
import type { IboState, GameLength, DifficultyLevel, CivilizationType, ResourceType, StructureType, CityMood, EventIcon } from '../lib/ibo-engine/types';

const STORAGE_KEY = 'clash-of-cultures-ibo-save';

class IboStoreManager {
  private engine: IboEngine | null = null;
  
  // Svelte 5 reactive state
  public state = $state<IboState | null>(null);

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Syncs the reactive store state with the engine's state and autosaves.
   */
  private syncState() {
    if (this.engine) {
      this.state = JSON.parse(JSON.stringify(this.engine.state));
      this.saveToStorage();
    }
  }

  /**
   * Initializes a brand-new solo IBO game state.
   */
  public newGame(gameLength: GameLength, difficulty: DifficultyLevel, civilization: string) {
    this.engine = new IboEngine(gameLength, difficulty, civilization);
    this.syncState();
  }

  /**
   * Loads game state from localStorage if it exists.
   */
  public loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedState = JSON.parse(saved) as IboState;
        // Instantiate a dummy engine and load the parsed state
        this.engine = new IboEngine(parsedState.gameLength, parsedState.difficulty, parsedState.civilization);
        this.engine.loadState(parsedState);
        this.state = parsedState;
      }
    } catch (e) {
      console.error('Failed to load IBO session state from localStorage:', e);
      this.clearGame();
    }
  }

  /**
   * Saves the current game state to localStorage.
   */
  public saveToStorage() {
    if (this.state) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.error('Failed to save IBO session state to localStorage:', e);
      }
    }
  }

  /**
   * Clears the current game state and local storage.
   */
  public clearGame() {
    this.engine = null;
    this.state = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear local storage:', e);
    }
  }

  /**
   * Manually adds resource of specified type.
   */
  public addResource(type: ResourceType, amount: number) {
    if (!this.engine) return;
    this.engine.addResource(type, amount);
    this.syncState();
  }

  /**
   * Manually spends resource of specified type.
   */
  public spendResource(type: ResourceType, amount: number): boolean {
    if (!this.engine) return false;
    const success = this.engine.spendResource(type, amount);
    this.syncState();
    return success;
  }

  /**
   * Performs an ADVANCE action (rolls and resolves advances or fallbacks).
   */
  public executeAdvance(customDice?: [number, number, number]) {
    if (!this.engine) return null;
    const resolution = this.engine.executeAdvanceAction(customDice);
    this.syncState();
    return resolution;
  }

  /**
   * Manually founds a new city.
   */
  public executeFoundCity(name: string, productionType?: ResourceType): boolean {
    if (!this.engine) return false;
    const success = this.engine.executeFoundCityAction(name, productionType);
    this.syncState();
    return success;
  }

  /**
   * Manually constructs a structure inside a specific city.
   */
  public executeConstruct(cityId: string): boolean {
    if (!this.engine) return false;
    const success = this.engine.executeConstructAction(cityId);
    this.syncState();
    return success;
  }

  /**
   * Manually adds a structure piece to the scale slots.
   */
  public addStructureToScale(structure: StructureType): boolean {
    if (!this.engine) return false;
    const success = this.engine.addStructureToScale(structure);
    this.syncState();
    return success;
  }

  /**
   * Changes the mood/angry status of a city.
   */
  public updateCityMood(cityId: string, mood: CityMood) {
    if (!this.engine) return;
    this.engine.updateCityMood(cityId, mood);
    this.syncState();
  }

  /**
   * Simulates and resolves an IBO RECRUIT action.
   */
  public executeRecruit() {
    if (!this.engine) return;
    this.engine.executeRecruitAction();
    this.syncState();
  }

  /**
   * Manually triggers next Age transition.
   */
  public nextAge() {
    if (!this.engine) return;
    this.engine.nextAge();
    this.syncState();
  }

  /**
   * Consumes one of the IBO's available turn actions.
   */
  public consumeAction() {
    if (!this.engine) return;
    this.engine.consumeAction();
    this.syncState();
  }

  /**
   * Resolves a drawn Event Card icon.
   */
  public resolveEventIcon(icon: EventIcon) {
    if (!this.engine) return;
    this.engine.resolveEventIcon(icon);
    this.syncState();
  }

  /**
   * Manually logs an entry into the Action Log feed.
   */
  public log(msg: string) {
    if (!this.engine) return;
    this.engine.log(msg);
    this.syncState();
  }
}

// Single singleton instance exported for app-wide reactive state bindings
export const iboStore = new IboStoreManager();
