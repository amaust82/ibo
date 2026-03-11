import { Injectable, signal, computed } from '@angular/core';
import {
  Game, IboState, City, ScaleSlot, Advancements,
  CityPiece, Resource, ArmyUnit, Mood, Difficulty,
  CARDS_PER_TURN, ActionCardIcon, DEFAULT_DECK_COMPOSITION, CardDrawMode,
} from '../models/game.models';
import { DbService } from './db.service';

@Injectable({ providedIn: 'root' })
export class GameStateService {
  readonly game = signal<Game | null>(null);

  readonly iboState = computed(() => this.game()?.iboState ?? null);
  readonly currentAge = computed(() => this.game()?.currentAge ?? 1);
  readonly currentTurn = computed(() => this.game()?.currentTurn ?? 0);
  readonly cardsThisTurn = computed(() => {
    const g = this.game();
    if (!g) return 1;
    return CARDS_PER_TURN[g.difficulty][g.currentAge - 1];
  });

  constructor(private db: DbService) {}

  loadGame(game: Game): void {
    this.game.set(structuredClone(game));
  }

  async saveCurrentGame(): Promise<void> {
    const g = this.game();
    if (!g) return;
    const id = await this.db.saveGame(g);
    this.game.update(current => current ? { ...current, id } : current);
  }

  /** Mutate the game state and auto-save. */
  updateGame(updater: (g: Game) => void): void {
    this.game.update(g => {
      if (!g) return g;
      const clone = structuredClone(g);
      updater(clone);
      return clone;
    });
    this.saveCurrentGame();
  }

  updateIboState(updater: (s: IboState) => void): void {
    this.updateGame(g => updater(g.iboState));
  }

  advanceTurn(): void {
    this.updateGame(g => {
      g.currentTurn += 1;
    });
  }

  advanceAge(): void {
    this.updateGame(g => {
      g.currentAge = Math.min(6, g.currentAge + 1);
      g.currentTurn = 0;
    });
  }

  getCity(cityId: string): City | undefined {
    return this.iboState()?.cities.find(c => c.id === cityId);
  }

  getCitiesByTrackOrder(reverse = false): City[] {
    const state = this.iboState();
    if (!state) return [];
    const ordered = state.cityTrack
      .map(id => state.cities.find(c => c.id === id))
      .filter((c): c is City => !!c);
    return reverse ? [...ordered].reverse() : ordered;
  }

  getSmallestNonAngryCities(): City[] {
    const state = this.iboState();
    if (!state) return [];
    const eligible = state.cities.filter(c => c.mood !== Mood.Angry);
    const minSize = Math.min(...eligible.map(c => c.size));
    return eligible.filter(c => c.size === minSize);
  }

  get landAggressionRange(): number {
    const adv = this.iboState()?.advancements;
    if (!adv) return 1;
    return 1 + adv.warfare;
  }

  get navalAggressionRange(): number {
    const adv = this.iboState()?.advancements;
    if (!adv) return 1;
    return 1 + adv.maritime;
  }

  get hasMarket(): boolean {
    const state = this.iboState();
    if (!state) return false;
    return state.cities.some(c => c.cityPieces.includes(CityPiece.Market));
  }
}

// ─── Factory helpers ──────────────────────────────────────────────────────────

export function createInitialScale(setupNote?: string): ScaleSlot[] {
  // China and Huns start with settlements at 0,1,3,5 instead of 0,3,5,7
  const isAlternatSetup = setupNote?.includes('0, 1, 3');
  const settlementPositions = isAlternatSetup ? [0, 1, 3, 5] : [0, 3, 5, 7];
  const resources = [Resource.Food, Resource.Wood, Resource.Ore, Resource.Gold];

  return Array.from({ length: 8 }, (_, i) => {
    const settlementIndex = settlementPositions.indexOf(i);
    if (settlementIndex !== -1) {
      return {
        position: i,
        cityPiece: CityPiece.Settlement,
        resourceToken: resources[settlementIndex],
        exhausted: false,
      };
    }
    return { position: i, cityPiece: null, resourceToken: null, exhausted: false };
  });
}

export function createInitialCities(): { cities: City[]; cityTrack: string[] } {
  const resources = [Resource.Food, Resource.Wood, Resource.Ore, Resource.Gold];
  const cities: City[] = resources.map((resource, index) => ({
    id: resource,
    resource,
    cityTrackIndex: index,
    cityPieces: [],
    hasSettlement: true,
    armyUnits: [ArmyUnit.Infantry],
    ships: 0,
    mood: Mood.Happy,
    size: 1,
    underInfluence: false,
    hasWonder: false,
  }));
  return {
    cities,
    cityTrack: resources as string[],
  };
}

/** Build and shuffle a fresh action card deck from the composition map. */
export function buildDeck(includeCivSpecific: boolean): ActionCardIcon[] {
  const comp = { ...DEFAULT_DECK_COMPOSITION };
  if (!includeCivSpecific) comp[ActionCardIcon.CivSpecific] = 0;
  const deck: ActionCardIcon[] = [];
  for (const [icon, count] of Object.entries(comp) as [ActionCardIcon, number][]) {
    for (let i = 0; i < count; i++) deck.push(icon);
  }
  return shuffleDeck(deck);
}

/** Fisher-Yates shuffle (returns a new array). */
export function shuffleDeck(deck: ActionCardIcon[]): ActionCardIcon[] {
  const d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

export function createInitialIboState(setupNote?: string, includeCivSpecific = false): IboState {
  const scale = createInitialScale(setupNote);
  const { cities, cityTrack } = createInitialCities();
  return {
    cities,
    cityTrack,
    scale,
    advancements: {
      agriculture: 0, construction: 0, maritime: 0,
      education: 0, warfare: 0, spirituality: 0,
      economy: 0, traditions: 0, science: 0,
      government: null, governmentLevel: 0,
    },
    cultureTokens: 0,
    actionCardCount: 1,
    settlerCityId: Resource.Food,
    captives: 0,
    wonders: [],
    leaderOnBoard: false,
    activeLeader: null,
    deckPile: buildDeck(includeCivSpecific),
    discardPile: [],
  };
}

export function createNewGame(
  name: string,
  difficulty: Difficulty,
  civId: string | null,
  leaderId: string | null,
  cardDrawMode: CardDrawMode,
  includeCivSpecificCards: boolean,
  setupNote?: string,
  shorterGame = false,
): Game {
  const now = new Date().toISOString();
  return {
    name,
    createdAt: now,
    updatedAt: now,
    currentAge: 1,
    currentTurn: 0,
    difficulty,
    shorterGame,
    iboState: createInitialIboState(setupNote, includeCivSpecificCards),
    civId,
    leaderId,
    turnHistory: [],
    cardDrawMode,
    includeCivSpecificCards,
  };
}
