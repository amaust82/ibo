export type GameLength = 'Standard' | 'Short';

export type DifficultyLevel = 'Easy' | 'Easier' | 'Normal' | 'Harder' | 'Hard';

export type CivilizationType = 
  | 'Generic' | 'Rome' | 'Greece' | 'China' | 'Vikings'
  | 'Aztecs' | 'Babylonia' | 'Carthage' | 'Celts' | 'Egypt'
  | 'Huns' | 'India' | 'Japan' | 'Maya' | 'Persia' | 'Phoenicia';

export type ResourceType = 'Gold' | 'Food' | 'Ideas' | 'Wood' | 'Ore';

export interface ResourcePool {
  gold: number;
  food: number;
  ideas: number;
  wood: number;
  ore: number;
}

export type CityMood = 'Happy' | 'Neutral' | 'Angry';

export type StructureType = 
  | 'Settlement' 
  | 'Temple' 
  | 'Fortress' 
  | 'Academy' 
  | 'Market' 
  | 'Port' 
  | 'Obelisk'
  | 'Observatory';

export interface CityState {
  id: string;
  name: string;
  size: number;
  mood: CityMood;
  structures: StructureType[];
  isAngry: boolean;
  productionType?: ResourceType; // e.g., Wood city, Ore city
}

export interface ScaleSlot {
  index: number; // 0 to 7
  structure: StructureType | null;
}

export type EventIcon = 
  | 'Advance'
  | 'Recruit'
  | 'Attack'
  | 'Influence'
  | 'Construct'
  | 'CivSpecific';

export type AdvanceCategory = 
  | 'Agriculture'
  | 'Construction'
  | 'Maritime'
  | 'Education'
  | 'Warfare'
  | 'Spirituality'
  | 'Economy'
  | 'Traditions'
  | 'Science';

export interface RollResult {
  dice: [number, number, number];
  sum: number;
  category: AdvanceCategory;
}

export interface IboState {
  gameLength: GameLength;
  difficulty: DifficultyLevel;
  civilization: CivilizationType;
  currentAge: number; // 1 to 6 (or 4)
  currentRound: number; // 1 to 3 rounds in an Age
  currentAction: number; // Active action count in current turn
  maxActionsPerTurn: number;
  resources: ResourcePool;
  scale: ScaleSlot[]; // length 8 (0 to 7)
  cities: CityState[];
  advances: string[]; // Researched advance names (e.g. "Priesthood")
  actionLog: string[];
  tutorialMode: boolean;
}
