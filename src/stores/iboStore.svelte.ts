import { IboEngine } from '../lib/ibo-engine/engine';
import type { IboState, GameLength, DifficultyLevel, CivilizationType, ResourceType, StructureType, CityMood, EventIcon } from '../lib/ibo-engine/types';

const STORAGE_KEY = 'clash-of-cultures-ibo-save';
const SLOTS_LIST_KEY = 'clash-of-cultures-ibo-slots-list';
const ACTIVE_SLOT_KEY = 'clash-of-cultures-ibo-active-slot';
const SLOT_STATE_PREFIX = 'clash-of-cultures-ibo-slot-state-';

export interface SaveSlot {
  id: string;
  name: string;
  lastUpdated: string;
  civilization: CivilizationType;
  age: number;
}

class IboStoreManager {
  private engine: IboEngine | null = null;
  
  // History stack for the robust undo system
  private history: string[] = [];
  
  // Svelte 5 reactive state
  public state = $state<IboState | null>(null);
  public slots = $state<SaveSlot[]>([]);
  public activeSlotId = $state<string | null>(null);

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Refreshes the slots list from local storage.
   */
  public loadSlots() {
    try {
      const listStr = localStorage.getItem(SLOTS_LIST_KEY);
      if (listStr) {
        this.slots = JSON.parse(listStr) as SaveSlot[];
      } else {
        this.slots = [];
      }
    } catch (e) {
      console.error('Failed to load slots list:', e);
      this.slots = [];
    }
  }

  /**
   * Saves the slots metadata list to local storage.
   */
  private saveSlotsMetadata() {
    try {
      localStorage.setItem(SLOTS_LIST_KEY, JSON.stringify(this.slots));
    } catch (e) {
      console.error('Failed to save slots list:', e);
    }
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
   * Commits the current active state to the history stack prior to mutations.
   */
  private commitToHistory() {
    if (this.state) {
      this.history.push(JSON.stringify(this.state));
      // Cap at 20 operations to manage memory
      if (this.history.length > 20) {
        this.history.shift();
      }
    }
  }

  /**
   * Reverts the last state mutation.
   */
  public undo() {
    if (this.history.length > 0) {
      const prevStateStr = this.history.pop()!;
      const parsedState = JSON.parse(prevStateStr) as IboState;
      
      // Re-instantiate engine and load the historical snapshot
      this.engine = new IboEngine(parsedState.gameLength, parsedState.difficulty, parsedState.civilization, parsedState.tutorialMode);
      this.engine.loadState(parsedState);
      
      // Update reactive UI bindings and local storage
      this.state = parsedState;
      this.saveToStorage();
      this.log('[UNDO]: Reverted last action.');
    }
  }

  /**
   * Toggles the live onboarding mentor guide mid-match.
   */
  public toggleTutorialMode() {
    if (this.state && this.engine) {
      this.commitToHistory();
      this.state.tutorialMode = !this.state.tutorialMode;
      
      // Sync internal engine state structure
      const rawState = (this.engine as any)._state;
      if (rawState) {
        rawState.tutorialMode = this.state.tutorialMode;
      }
      
      this.saveToStorage();
      this.log(`[TUTORIAL]: Tutorial mentor guide toggled ${this.state.tutorialMode ? 'ON' : 'OFF'}.`);
    }
  }

  /**
   * Initializes a brand-new solo IBO game state and registers a named slot.
   */
  public newGame(gameLength: GameLength, difficulty: DifficultyLevel, civilization: string, tutorialMode: boolean = false) {
    this.history = []; // Reset history
    this.engine = new IboEngine(gameLength, difficulty, civilization, tutorialMode);
    
    // Generate a default slot ID and name
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date().toLocaleDateString();
    const defaultName = `${civilization} Campaign - ${dateStr} (${timestampStr})`;
    
    this.state = JSON.parse(JSON.stringify(this.engine.state));
    const slotId = `slot-${Date.now()}`;
    
    // Create new slot
    const slot: SaveSlot = {
      id: slotId,
      name: defaultName,
      lastUpdated: new Date().toLocaleString(),
      civilization: this.state!.civilization,
      age: this.state!.currentAge
    };
    
    this.slots.push(slot);
    this.activeSlotId = slotId;
    localStorage.setItem(ACTIVE_SLOT_KEY, slotId);
    
    // Save slot state
    localStorage.setItem(`${SLOT_STATE_PREFIX}${slotId}`, JSON.stringify(this.state));
    
    this.saveSlotsMetadata();
    this.saveToStorage();
  }

  /**
   * Create or update a named save slot for the current active state.
   */
  public saveCurrentGameAs(name: string, customSlotId?: string) {
    if (!this.state) return;
    
    const slotId = customSlotId || this.activeSlotId || `slot-${Date.now()}`;
    const cleanName = name.trim() || `Campaign ${new Date().toLocaleDateString()}`;
    
    // Check if slot already exists in metadata
    let slot = this.slots.find(s => s.id === slotId);
    if (slot) {
      slot.name = cleanName;
      slot.lastUpdated = new Date().toLocaleString();
      slot.civilization = this.state.civilization;
      slot.age = this.state.currentAge;
    } else {
      slot = {
        id: slotId,
        name: cleanName,
        lastUpdated: new Date().toLocaleString(),
        civilization: this.state.civilization,
        age: this.state.currentAge
      };
      this.slots.push(slot);
    }
    
    this.activeSlotId = slotId;
    localStorage.setItem(ACTIVE_SLOT_KEY, slotId);
    
    // Save slot state
    try {
      localStorage.setItem(`${SLOT_STATE_PREFIX}${slotId}`, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save slot state:', e);
    }
    
    this.saveSlotsMetadata();
    this.saveToStorage();
    this.log(`[SAVE]: Game saved as "${cleanName}".`);
  }

  /**
   * Loads a game state from a specific slot.
   */
  public loadFromSlot(slotId: string) {
    try {
      const saved = localStorage.getItem(`${SLOT_STATE_PREFIX}${slotId}`);
      if (saved) {
        const parsedState = JSON.parse(saved) as IboState;
        this.history = []; // Reset history stack for the new active session
        this.engine = new IboEngine(parsedState.gameLength, parsedState.difficulty, parsedState.civilization, parsedState.tutorialMode || false);
        this.engine.loadState(parsedState);
        this.state = parsedState;
        
        this.activeSlotId = slotId;
        localStorage.setItem(ACTIVE_SLOT_KEY, slotId);
        this.saveToStorage(); // Update the main active save fallback
        this.log(`[LOAD]: Loaded save slot "${this.slots.find(s => s.id === slotId)?.name || 'Named Slot'}".`);
      }
    } catch (e) {
      console.error(`Failed to load save slot ${slotId}:`, e);
    }
  }

  /**
   * Deletes a specific save slot.
   */
  public deleteSlot(slotId: string) {
    try {
      this.slots = this.slots.filter(s => s.id !== slotId);
      this.saveSlotsMetadata();
      localStorage.removeItem(`${SLOT_STATE_PREFIX}${slotId}`);
      
      if (this.activeSlotId === slotId) {
        this.activeSlotId = null;
        this.state = null;
        this.engine = null;
        this.history = [];
        localStorage.removeItem(ACTIVE_SLOT_KEY);
        localStorage.removeItem(STORAGE_KEY);
      }
      this.log(`[DELETE]: Deleted save slot.`);
    } catch (e) {
      console.error(`Failed to delete save slot ${slotId}:`, e);
    }
  }

  /**
   * Loads game state from localStorage if it exists.
   */
  public loadFromStorage() {
    this.loadSlots();
    try {
      const activeSlotId = localStorage.getItem(ACTIVE_SLOT_KEY);
      if (activeSlotId) {
        const saved = localStorage.getItem(`${SLOT_STATE_PREFIX}${activeSlotId}`);
        if (saved) {
          const parsedState = JSON.parse(saved) as IboState;
          this.engine = new IboEngine(parsedState.gameLength, parsedState.difficulty, parsedState.civilization, parsedState.tutorialMode || false);
          this.engine.loadState(parsedState);
          this.state = parsedState;
          this.activeSlotId = activeSlotId;
          return;
        }
      }
      
      // Fallback to legacy single-save storage
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedState = JSON.parse(saved) as IboState;
        this.engine = new IboEngine(parsedState.gameLength, parsedState.difficulty, parsedState.civilization, parsedState.tutorialMode || false);
        this.engine.loadState(parsedState);
        this.state = parsedState;
        
        // Auto-migrate legacy save to slot
        const slotId = `slot-${Date.now()}`;
        const defaultName = `Migrated Campaign - ${new Date().toLocaleDateString()}`;
        const slot: SaveSlot = {
          id: slotId,
          name: defaultName,
          lastUpdated: new Date().toLocaleString(),
          civilization: parsedState.civilization,
          age: parsedState.currentAge
        };
        this.slots.push(slot);
        this.activeSlotId = slotId;
        localStorage.setItem(ACTIVE_SLOT_KEY, slotId);
        localStorage.setItem(`${SLOT_STATE_PREFIX}${slotId}`, JSON.stringify(parsedState));
        this.saveSlotsMetadata();
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
        
        if (this.activeSlotId) {
          localStorage.setItem(`${SLOT_STATE_PREFIX}${this.activeSlotId}`, JSON.stringify(this.state));
          
          // Also update lastUpdated & age in slots metadata list
          const slot = this.slots.find(s => s.id === this.activeSlotId);
          if (slot) {
            slot.lastUpdated = new Date().toLocaleString();
            slot.age = this.state.currentAge;
            slot.civilization = this.state.civilization;
            this.saveSlotsMetadata();
          }
        }
      } catch (e) {
        console.error('Failed to save IBO session state to localStorage:', e);
      }
    }
  }

  /**
   * Clears the current game state and local storage, but leaves saved slots intact.
   */
  public clearGame() {
    this.engine = null;
    this.state = null;
    this.history = [];
    this.activeSlotId = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(ACTIVE_SLOT_KEY);
    } catch (e) {
      console.error('Failed to clear local storage:', e);
    }
  }

  /**
   * Manually adds resource of specified type.
   */
  public addResource(type: ResourceType, amount: number) {
    if (!this.engine) return;
    this.commitToHistory();
    this.engine.addResource(type, amount);
    this.syncState();
  }

  /**
   * Manually spends resource of specified type.
   */
  public spendResource(type: ResourceType, amount: number): boolean {
    if (!this.engine) return false;
    this.commitToHistory();
    const success = this.engine.spendResource(type, amount);
    this.syncState();
    return success;
  }

  /**
   * Performs an ADVANCE action (rolls and resolves advances or fallbacks).
   */
  public executeAdvance(customDice?: [number, number, number]) {
    if (!this.engine) return null;
    this.commitToHistory();
    const resolution = this.engine.executeAdvanceAction(customDice);
    this.syncState();
    return resolution;
  }

  /**
   * Manually founds a new city.
   */
  public executeFoundCity(name: string, productionType?: ResourceType): boolean {
    if (!this.engine) return false;
    this.commitToHistory();
    const success = this.engine.executeFoundCityAction(name, productionType);
    this.syncState();
    return success;
  }

  /**
   * Manually constructs a structure inside a specific city.
   */
  public executeConstruct(cityId: string): boolean {
    if (!this.engine) return false;
    this.commitToHistory();
    const success = this.engine.executeConstructAction(cityId);
    this.syncState();
    return success;
  }

  /**
   * Manually adds a structure piece to the scale slots.
   */
  public addStructureToScale(structure: StructureType): boolean {
    if (!this.engine) return false;
    this.commitToHistory();
    const success = this.engine.addStructureToScale(structure);
    this.syncState();
    return success;
  }

  /**
   * Changes the mood/angry status of a city.
   */
  public updateCityMood(cityId: string, mood: CityMood) {
    if (!this.engine) return;
    this.commitToHistory();
    this.engine.updateCityMood(cityId, mood);
    this.syncState();
  }

  /**
   * Simulates and resolves an IBO RECRUIT action.
   */
  public executeRecruit() {
    if (!this.engine) return;
    this.commitToHistory();
    this.engine.executeRecruitAction();
    this.syncState();
  }

  /**
   * Manually triggers next Round transition within current Age.
   */
  public nextRound() {
    if (!this.engine) return;
    this.commitToHistory();
    this.engine.nextRound();
    this.syncState();
  }

  /**
   * Manually triggers next Age transition.
   */
  public nextAge() {
    if (!this.engine) return;
    this.commitToHistory();
    this.engine.nextAge();
    this.syncState();
  }

  /**
   * Consumes one of the IBO's available turn actions.
   */
  public consumeAction() {
    if (!this.engine) return;
    this.commitToHistory();
    this.engine.consumeAction();
    this.syncState();
  }

  /**
   * Resolves a drawn Event Card icon.
   */
  public resolveEventIcon(icon: EventIcon) {
    if (!this.engine) return;
    this.commitToHistory();
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
