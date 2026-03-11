export enum CityPiece {
  Settlement = 'Settlement',
  Port = 'Port',
  Academy = 'Academy',
  Fortress = 'Fortress',
  Temple = 'Temple',
  Market = 'Market',
  Obelisk = 'Obelisk',
  Observatory = 'Observatory',
}

export enum Resource {
  Food = 'Food',
  Wood = 'Wood',
  Ore = 'Ore',
  Gold = 'Gold',
  Ideas = 'Ideas',
}

export enum ArmyUnit {
  Infantry = 'Infantry',
  Cavalry = 'Cavalry',
  Elephant = 'Elephant',
  Leader = 'Leader',
}

export enum Mood {
  Angry = -1,
  Neutral = 0,
  Happy = 1,
}

export enum AdvCat {
  Agriculture = 'Agriculture',
  Construction = 'Construction',
  Maritime = 'Maritime',
  Education = 'Education',
  Warfare = 'Warfare',
  Spirituality = 'Spirituality',
  Economy = 'Economy',
  Traditions = 'Traditions',
  Science = 'Science',
}

export enum Difficulty {
  Easy = 'Easy',
  Easier = 'Easier',
  Normal = 'Normal',
  Harder = 'Harder',
  Hard = 'Hard',
}

/**
 * The icon printed on the top half of each Action Card.
 * Maps directly to IBO's action for the turn.
 *   Advance1 / Advance2  →  ADVANCE   (two distinct gear icons)
 *   Recruit              →  RECRUIT
 *   Attack               →  ATTACK
 *   Construct            →  CONSTRUCT (no icon / dotted circle)
 *   InfluenceCulture     →  INFLUENCE CULTURE
 *   CivSpecific          →  CIV SPECIFIC action
 */
export enum ActionCardIcon {
  Advance1         = 'Advance1',
  Advance2         = 'Advance2',
  Recruit          = 'Recruit',
  Attack           = 'Attack',
  Construct        = 'Construct',
  InfluenceCulture = 'InfluenceCulture',
  CivSpecific      = 'CivSpecific',
}

/** Which action an ActionCardIcon maps to for IBO. */
export const CARD_ICON_TO_ACTION: Record<ActionCardIcon, string> = {
  [ActionCardIcon.Advance1]:         'ADVANCE',
  [ActionCardIcon.Advance2]:         'ADVANCE',
  [ActionCardIcon.Recruit]:          'RECRUIT',
  [ActionCardIcon.Attack]:           'ATTACK',
  [ActionCardIcon.Construct]:        'CONSTRUCT',
  [ActionCardIcon.InfluenceCulture]: 'INFLUENCE CULTURE',
  [ActionCardIcon.CivSpecific]:      'CIV SPECIFIC',
};

/** Human-readable label for each icon. */
export const CARD_ICON_LABEL: Record<ActionCardIcon, string> = {
  [ActionCardIcon.Advance1]:         'Advance (⚙ I)',
  [ActionCardIcon.Advance2]:         'Advance (⚙ II)',
  [ActionCardIcon.Recruit]:          'Recruit',
  [ActionCardIcon.Attack]:           'Attack',
  [ActionCardIcon.Construct]:        'No Icon (Construct)',
  [ActionCardIcon.InfluenceCulture]: 'Influence Culture',
  [ActionCardIcon.CivSpecific]:      'Civ Specific',
};

/** Emoji used to represent each icon in the UI. */
export const CARD_ICON_EMOJI: Record<ActionCardIcon, string> = {
  [ActionCardIcon.Advance1]:         '⚙️',
  [ActionCardIcon.Advance2]:         '⚙️',
  [ActionCardIcon.Recruit]:          '🐴',
  [ActionCardIcon.Attack]:           '⚔️',
  [ActionCardIcon.Construct]:        '○',
  [ActionCardIcon.InfluenceCulture]: '🎭',
  [ActionCardIcon.CivSpecific]:      '🌟',
};

/**
 * Standard 42-card deck composition for the shared Action Card deck.
 * Distribution: 14 Advance (7 each type), 7 Recruit, 7 Attack,
 *               7 Construct, 7 Influence Culture = 42 total.
 * This gives ADVANCE a ~33% probability (matching the 1-or-2 → Advance rule).
 */
export const DEFAULT_DECK_COMPOSITION: Record<ActionCardIcon, number> = {
  [ActionCardIcon.Advance1]:         7,
  [ActionCardIcon.Advance2]:         7,
  [ActionCardIcon.Recruit]:          7,
  [ActionCardIcon.Attack]:           7,
  [ActionCardIcon.Construct]:        7,
  [ActionCardIcon.InfluenceCulture]: 7,
  [ActionCardIcon.CivSpecific]:      0,  // only relevant when using a Civ board
};

/** How IBO's action card draws are resolved each turn. */
export type CardDrawMode = 'deck' | 'roll' | 'manual';


export interface ScaleSlot {
  position: number;           // 0–7
  cityPiece: CityPiece | null;
  resourceToken: Resource | null; // only set when cityPiece = Settlement
  exhausted: boolean;
}

export interface City {
  id: string;
  resource: Resource;
  cityTrackIndex: number;     // position in cityTrack array
  cityPieces: CityPiece[];    // non-settlement city pieces
  hasSettlement: boolean;
  armyUnits: ArmyUnit[];
  ships: number;
  mood: Mood;
  size: number;               // total pieces including settlement
  underInfluence: boolean;
  hasWonder: boolean;
}

export interface Advancements {
  agriculture: number;
  construction: number;
  maritime: number;
  education: number;
  warfare: number;
  spirituality: number;
  economy: number;
  traditions: number;
  science: number;
  government: string | null;  // e.g. 'Democracy', 'Autocracy', etc.
  governmentLevel: number;    // 0–4
}

export interface IboState {
  cities: City[];
  cityTrack: string[];        // ordered list of city IDs (City-Track)
  scale: ScaleSlot[];
  advancements: Advancements;
  cultureTokens: number;
  actionCardCount: number;
  settlerCityId: string | null;
  captives: number;           // for Aztecs civ ability
  wonders: string[];          // wonder names IBO has built
  leaderOnBoard: boolean;
  activeLeader: string | null;
  /** Cards remaining in IBO's face-down pile (deck mode). */
  deckPile: ActionCardIcon[];
  /** Cards that have been played / discarded this game. */
  discardPile: ActionCardIcon[];
}

export interface LogStep {
  text: string;
  dice?: number[];
  cardIcon?: ActionCardIcon;  // displayed as a card chip in the log
  isPrompt?: boolean;         // pauses turn execution for user input
  promptKey?: string;
  promptLabel?: string;
  promptType?: 'number' | 'boolean' | 'select';
  promptOptions?: string[];
}

export interface TurnRecord {
  turn: number;
  age: number;
  steps: LogStep[];
  timestamp: string;
}

export interface Game {
  id?: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  currentAge: number;         // 1–6
  currentTurn: number;
  difficulty: Difficulty;
  shorterGame: boolean;
  iboState: IboState;
  civId: string | null;
  leaderId: string | null;
  turnHistory: TurnRecord[];
  /** How action cards are resolved on IBO's turn. */
  cardDrawMode: CardDrawMode;
  /** Whether to include Civ Specific cards in the deck. */
  includeCivSpecificCards: boolean;
}

// Cards per turn by Age and Difficulty
export const CARDS_PER_TURN: Record<Difficulty, number[]> = {
  [Difficulty.Easy]:   [1, 1, 1, 2, 2, 3],
  [Difficulty.Easier]: [1, 1, 2, 2, 2, 3],
  [Difficulty.Normal]: [1, 1, 2, 2, 3, 3],
  [Difficulty.Harder]: [1, 2, 2, 2, 3, 3],
  [Difficulty.Hard]:   [1, 2, 2, 3, 3, 3],
};

export const OBJECTIVES_BY_DIFFICULTY: Record<Difficulty, number> = {
  [Difficulty.Easy]:   2,
  [Difficulty.Easier]: 3,
  [Difficulty.Normal]: 4,
  [Difficulty.Harder]: 5,
  [Difficulty.Hard]:   6,
};

// 3×3 advance category lookup: [row 1-3][col 1-3]
export const ADVANCE_CATEGORY_TABLE: AdvCat[][] = [
  [AdvCat.Agriculture, AdvCat.Education,   AdvCat.Economy],
  [AdvCat.Construction, AdvCat.Warfare,    AdvCat.Traditions],
  [AdvCat.Maritime,    AdvCat.Spirituality, AdvCat.Science],
];

// City-piece added to Scale when IBO advances in a category
export const CATEGORY_TO_PIECE: Record<AdvCat, CityPiece> = {
  [AdvCat.Agriculture]:  CityPiece.Settlement,
  [AdvCat.Construction]: CityPiece.Settlement,
  [AdvCat.Maritime]:     CityPiece.Port,
  [AdvCat.Education]:    CityPiece.Academy,
  [AdvCat.Warfare]:      CityPiece.Fortress,
  [AdvCat.Spirituality]: CityPiece.Temple,
  [AdvCat.Economy]:      CityPiece.Market,
  [AdvCat.Traditions]:   CityPiece.Obelisk,
  [AdvCat.Science]:      CityPiece.Observatory,
};

export const GOVERNMENTS = [
  'Democracy',
  'Republic',
  'Monarchy',
  'Autocracy',
  'Theocracy',
  'Anarchy',
];
