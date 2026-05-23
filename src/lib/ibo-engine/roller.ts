import type { AdvanceCategory, StructureType } from './types';

export const ADVANCEMENT_TREE: Record<AdvanceCategory, string[]> = {
  Agriculture: ['Farming', 'Irrigation', 'Storage', 'Crop Rotation'],
  Construction: ['Mining', 'Roads', 'Engineering', 'Architecture'],
  Maritime: ['Fishing', 'Sailing', 'Navigation', 'Warships'],
  Education: ['Writing', 'Philosophy', 'Free Education', 'Public Education'],
  Warfare: ['Tactics', 'Steel Weapons', 'Siegecraft', 'Fortification'],
  Spirituality: ['Myths', 'Priesthood', 'State Religion', 'Rituals'],
  Economy: ['Bartering', 'Currency', 'Trade Routes', 'Taxation'],
  Traditions: ['Arts', 'Law', 'Circus & Sports', 'Monuments'],
  Science: ['Math', 'Astronomy', 'Medicine', 'Metallurgy']
};

export const GOVERNMENT_TREE = {
  Democracy: ['Democracy', 'Civil Liberties', 'Representation', 'Voting'],
  Autocracy: ['Autocracy', 'Forced Labor', 'Absolute Power', 'Propaganda'],
  Theocracy: ['Theocracy', 'Dogma', 'Conversion', 'Fanaticism']
};

export const STRUCTURE_UNLOCKS: Record<string, StructureType> = {
  Writing: 'Academy',
  Tactics: 'Fortress',
  Fishing: 'Port',
  Myths: 'Temple',
  Bartering: 'Market',
  Arts: 'Obelisk',
  Math: 'Observatory'
};

export type GovernmentType = 'Democracy' | 'Autocracy' | 'Theocracy';

export type RollResolution =
  | {
      type: 'Advance';
      category: AdvanceCategory | GovernmentType;
      advance: string;
      dice: [number, number, number];
      description: string;
    }
  | {
      type: 'Recruit';
      description: string;
      dice: [number, number, number];
    };

/**
 * Helper to roll a standard 6-sided die.
 */
export function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * Rolls 3 standard 6-sided dice.
 * Returns an array of [die1, die2, die3].
 */
export function roll3Dice(): [number, number, number] {
  return [rollDie(), rollDie(), rollDie()];
}

/**
 * Maps the first two dice values (1-6) to their d3 values and determines the category.
 */
export function getCategoryFromDice(die1: number, die2: number): AdvanceCategory {
  const col = Math.ceil(die1 / 2); // 1, 2 -> 1; 3, 4 -> 2; 5, 6 -> 3
  const row = Math.ceil(die2 / 2); // 1, 2 -> 1; 3, 4 -> 2; 5, 6 -> 3

  if (col === 1) {
    if (row === 1) return 'Agriculture';
    if (row === 2) return 'Construction';
    return 'Maritime';
  } else if (col === 2) {
    if (row === 1) return 'Education';
    if (row === 2) return 'Warfare';
    return 'Spirituality';
  } else {
    if (row === 1) return 'Economy';
    if (row === 2) return 'Traditions';
    return 'Science';
  }
}

/**
 * Finds the currently chosen government if any, based on researched root advancements.
 */
export function getChosenGovernment(researched: string[]): GovernmentType | null {
  if (researched.includes('Democracy')) return 'Democracy';
  if (researched.includes('Autocracy')) return 'Autocracy';
  if (researched.includes('Theocracy')) return 'Theocracy';
  return null;
}

/**
 * Resolves an IBO advance roll deterministically given the current list of researched advancements
 * and the values of the 3 rolled dice.
 */
export function resolveAdvanceRoll(
  researched: string[],
  dice: [number, number, number]
): RollResolution {
  const [die1, die2, die3] = dice;
  const initialCategory = getCategoryFromDice(die1, die2);

  // Helper to resolve learning inside a standard or government category array
  const learnFromCategoryList = (
    categoryName: AdvanceCategory | GovernmentType,
    list: string[]
  ): { advance: string; description: string } => {
    const listResearched = list.filter((adv) => researched.includes(adv));
    const available = list.filter((adv) => !researched.includes(adv));

    if (listResearched.length === 0) {
      // Root is not researched yet, learn root. Third die is ignored.
      const root = list[0];
      return {
        advance: root,
        description: `IBO learns root advancement: ${root} (${categoryName}). Third die was ignored.`
      };
    }

    if (available.length === 3) {
      // 1 researched (root), 3 available. Convert die3 to d3.
      const d3 = Math.ceil(die3 / 2);
      const chosen = available[d3 - 1];
      return {
        advance: chosen,
        description: `IBO learns: ${chosen} (${categoryName}) using 3rd die ${die3} read as d3 (${d3}/3 available).`
      };
    }

    if (available.length === 2) {
      // 2 researched, 2 available. Convert die3 to d2.
      const d2 = die3 <= 3 ? 1 : 2;
      const chosen = available[d2 - 1];
      return {
        advance: chosen,
        description: `IBO learns: ${chosen} (${categoryName}) using 3rd die ${die3} read as d2 (${d2}/2 available).`
      };
    }

    // 3 researched, 1 available. Third die is ignored.
    const chosen = available[0];
    return {
      advance: chosen,
      description: `IBO learns the final remaining advancement: ${chosen} (${categoryName}). Third die was ignored.`
    };
  };

  // 1. Check if the initial category is full
  const initialList = ADVANCEMENT_TREE[initialCategory];
  const isInitialFull = initialList.every((adv) => researched.includes(adv));

  if (!isInitialFull) {
    const { advance, description } = learnFromCategoryList(initialCategory, initialList);
    return {
      type: 'Advance',
      category: initialCategory,
      advance,
      dice,
      description
    };
  }

  // 2. Category is full: IBO learns a Government Advancement instead
  const chosenGov = getChosenGovernment(researched);

  if (chosenGov === null) {
    // 2A. No government chosen yet: use third die as d3 to choose government
    const d3 = Math.ceil(die3 / 2); // 1-2 -> 1, 3-4 -> 2, 5-6 -> 3
    const govOptions: GovernmentType[] = ['Democracy', 'Autocracy', 'Theocracy'];
    const chosen = govOptions[d3 - 1];

    return {
      type: 'Advance',
      category: chosen,
      advance: chosen, // The root advance has the same name as the government type
      dice,
      description: `Initial category ${initialCategory} was full. IBO chooses Government form: ${chosen} using 3rd die ${die3} read as d3 (${d3}/3).`
    };
  }

  // 2B. Government already chosen: try to learn next advance in that government tree
  const govList = GOVERNMENT_TREE[chosenGov];
  const isGovFull = govList.every((adv) => researched.includes(adv));

  if (!isGovFull) {
    const { advance, description } = learnFromCategoryList(chosenGov, govList);
    return {
      type: 'Advance',
      category: chosenGov,
      advance,
      dice,
      description: `Initial category ${initialCategory} was full. ${description}`
    };
  }

  // 2C. Government is also full: IBO does not advance and recruits instead!
  return {
    type: 'Recruit',
    dice,
    description: `Initial category ${initialCategory} and Government ${chosenGov} are both completely full. IBO cannot advance and performs a RECRUIT action instead.`
  };
}
