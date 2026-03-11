import { AdvCat } from '../models/game.models';

export interface AdvancementInfo {
  category: AdvCat;
  level: number;   // 1–4
  name: string;
}

export const ADVANCEMENTS: AdvancementInfo[] = [
  // Agriculture
  { category: AdvCat.Agriculture, level: 1, name: 'Plow' },
  { category: AdvCat.Agriculture, level: 2, name: 'Irrigation' },
  { category: AdvCat.Agriculture, level: 3, name: 'Crop Rotation' },
  { category: AdvCat.Agriculture, level: 4, name: 'Fertilizer' },
  // Construction
  { category: AdvCat.Construction, level: 1, name: 'Masonry' },
  { category: AdvCat.Construction, level: 2, name: 'Engineering' },
  { category: AdvCat.Construction, level: 3, name: 'Architecture' },
  { category: AdvCat.Construction, level: 4, name: 'Urban Planning' },
  // Maritime
  { category: AdvCat.Maritime, level: 1, name: 'Sailing' },
  { category: AdvCat.Maritime, level: 2, name: 'Navigation' },
  { category: AdvCat.Maritime, level: 3, name: 'Cartography' },
  { category: AdvCat.Maritime, level: 4, name: 'Astronomy' },
  // Education
  { category: AdvCat.Education, level: 1, name: 'Writing' },
  { category: AdvCat.Education, level: 2, name: 'Code of Laws' },
  { category: AdvCat.Education, level: 3, name: 'Philosophy' },
  { category: AdvCat.Education, level: 4, name: 'Printing Press' },
  // Warfare
  { category: AdvCat.Warfare, level: 1, name: 'Bronze Working' },
  { category: AdvCat.Warfare, level: 2, name: 'Iron Working' },
  { category: AdvCat.Warfare, level: 3, name: 'Steel Weapons' },
  { category: AdvCat.Warfare, level: 4, name: 'Gunpowder' },
  // Spirituality
  { category: AdvCat.Spirituality, level: 1, name: 'Myths' },
  { category: AdvCat.Spirituality, level: 2, name: 'Priesthood' },
  { category: AdvCat.Spirituality, level: 3, name: 'State Religion' },
  { category: AdvCat.Spirituality, level: 4, name: 'Rituals' },
  // Economy
  { category: AdvCat.Economy, level: 1, name: 'Barter' },
  { category: AdvCat.Economy, level: 2, name: 'Currency' },
  { category: AdvCat.Economy, level: 3, name: 'Banking' },
  { category: AdvCat.Economy, level: 4, name: 'Stock Market' },
  // Traditions
  { category: AdvCat.Traditions, level: 1, name: 'Folklore' },
  { category: AdvCat.Traditions, level: 2, name: 'Arts' },
  { category: AdvCat.Traditions, level: 3, name: 'Literature' },
  { category: AdvCat.Traditions, level: 4, name: 'Cultural Identity' },
  // Science
  { category: AdvCat.Science, level: 1, name: 'Mathematics' },
  { category: AdvCat.Science, level: 2, name: 'Medicine' },
  { category: AdvCat.Science, level: 3, name: 'Chemistry' },
  { category: AdvCat.Science, level: 4, name: 'Scientific Method' },
];

export const WONDERS = [
  'Great Wall',
  'Great Lighthouse',
  'Great Library',
  'Colosseum',
  'Stonehenge',
  'Parthenon',
  'Great Gardens',
  'Pyramids',
];
