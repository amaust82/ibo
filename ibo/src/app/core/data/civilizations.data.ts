import { AdvCat } from '../models/game.models';

export interface CivAbility {
  triggerCat: AdvCat | null;
  triggerCount: number;   // advancement count that unlocks this ability
  name: string;
  description: string;   // full text for reference
  aiNote: string;        // how this changes IBO behavior
}

export interface Civilization {
  id: string;
  name: string;
  abilities: CivAbility[];
  setupNote?: string;    // any special setup instructions
}

export const CIVILIZATIONS: Civilization[] = [
  {
    id: 'aztecs',
    name: 'Aztecs',
    abilities: [
      {
        triggerCat: AdvCat.Warfare, triggerCount: 1, name: 'Captives',
        description: 'Up to 4 defeated non-Leader Army units are placed as Captives (½VP each). IBO will spend Captives as Culture if needed.',
        aiNote: 'Track captives. IBO can spend captives as culture.',
      },
      {
        triggerCat: AdvCat.Spirituality, triggerCount: 1, name: 'Human Sacrifice',
        description: 'FOUND in reverse Terrain order. During Comp Obj, gain 1C per 3 Angry cities on/adjacent to his cities.',
        aiNote: 'FOUND in reverse terrain order.',
      },
      {
        triggerCat: AdvCat.Traditions, triggerCount: 1, name: 'Aztec Gold',
        description: 'During Comp Obj, gain 1 Mood per each size-2+ city.',
        aiNote: 'Score bonus moods for large cities.',
      },
      {
        triggerCat: null, triggerCount: 1, name: 'Tribute Empire',
        description: 'During Comp Obj, cities within 2 each lose an Infantry unit which becomes a Captive, if possible.',
        aiNote: 'Strips enemy infantry near IBO cities as captives during objectives.',
      },
    ],
  },
  {
    id: 'babylonia',
    name: 'Babylonia',
    abilities: [
      {
        triggerCat: AdvCat.Construction, triggerCount: 2, name: 'Canals',
        description: 'During Comp Obj, gain 1 Mood for each size-2+ city. Pay 6M to CONSTRUCT.',
        aiNote: 'Can spend mood to construct.',
      },
      {
        triggerCat: AdvCat.Education, triggerCount: 1, name: 'Code of Laws',
        description: 'Gains an Action card with each successful INFLUENCE CULTURE action.',
        aiNote: 'Gains action card on successful influence culture.',
      },
      {
        triggerCat: AdvCat.Science, triggerCount: 1, name: 'Star Catalogues',
        description: 'Gains 1C when triggering an event.',
        aiNote: 'Gains 1 culture whenever an event is triggered.',
      },
      {
        triggerCat: null, triggerCount: 1, name: 'Ziggurats',
        description: 'When acquired, perform an ADVANCE, CONSTRUCT and gain 1C.',
        aiNote: 'On acquisition: immediately ADVANCE, CONSTRUCT, gain 1 culture.',
      },
    ],
  },
  {
    id: 'carthage',
    name: 'Carthage',
    abilities: [
      {
        triggerCat: AdvCat.Agriculture, triggerCount: 2, name: 'Warbeasts',
        description: "Leader leaves behind Elephant instead of Infantry when it moves.",
        aiNote: 'Leader leaves Elephant instead of Infantry when moving.',
      },
      {
        triggerCat: AdvCat.Maritime, triggerCount: 1, name: 'Hegemony',
        description: 'After a FOUND, IBO removes 1 ship from his largest fleet. If done so, IBO takes another action.',
        aiNote: 'After FOUND: remove 1 ship from largest fleet, then take an extra action.',
      },
      {
        triggerCat: AdvCat.Maritime, triggerCount: 2, name: 'Pirate Allies',
        description: "Pirates are considered IBO's ships during IBO's turn.",
        aiNote: 'Pirates count as IBO ships on IBO turns.',
      },
      {
        triggerCat: AdvCat.Warfare, triggerCount: 2, name: 'Mercenaries',
        description: 'After RECRUIT, trigger a Barbarians Move Event on yourself.',
        aiNote: 'After RECRUIT, Barbarians Move triggers on the player.',
      },
    ],
  },
  {
    id: 'celts',
    name: 'Celts',
    abilities: [
      {
        triggerCat: AdvCat.Warfare, triggerCount: 1, name: 'Tribal Warfare',
        description: '+1 hit in land battles for every 2 barbarian units within 2 of battle.',
        aiNote: '+1 hit per 2 barbarian units within 2 of battle.',
      },
      {
        triggerCat: AdvCat.Warfare, triggerCount: 2, name: 'Tribal Allies',
        description: 'IBO will never target barbarians with ATTACKs. IBO ignores all Barbarians Move events.',
        aiNote: 'IBO never attacks barbarians; ignores Barbarians Move events.',
      },
      {
        triggerCat: AdvCat.Spirituality, triggerCount: 2, name: 'Druidic Influence',
        description: 'May INFLUENCE CULTURE on barbarian cities. Mark success with Culture. Worth 1VP. Max 1 per city.',
        aiNote: 'Can Influence Culture barbarian cities.',
      },
      {
        triggerCat: AdvCat.Economy, triggerCount: 1, name: 'Tribute Trade',
        description: 'Pay 3 Mood to ADVANCE.',
        aiNote: 'IBO can spend mood to ADVANCE.',
      },
    ],
  },
  {
    id: 'china',
    name: 'China',
    setupNote: 'Place settlements on 0, 1, 3, and 5 on the Scale instead of 0, 3, 5, 7.',
    abilities: [
      {
        triggerCat: AdvCat.Agriculture, triggerCount: 3, name: 'Rice Paddies',
        description: 'During Comp Obj, gain 1 mood per Food resource on/adjacent to IBO cities. Pay 4M to ADVANCE.',
        aiNote: 'Can spend mood to ADVANCE.',
      },
      {
        triggerCat: AdvCat.Agriculture, triggerCount: 2, name: 'Sprawling',
        description: 'When acquired, perform a FOUND. After this FOUND, shift all Settlements one extra space left.',
        aiNote: 'On acquisition: FOUND immediately; shift settlements extra left after.',
      },
      {
        triggerCat: AdvCat.Science, triggerCount: 2, name: 'Fireworks',
        description: 'When defending, get 1 Block in the 1st round of combat.',
        aiNote: '+1 Block when defending (1st combat round).',
      },
      {
        triggerCat: null, triggerCount: 1, name: 'Fighting Bands',
        description: 'After a FOUND action, make the city Happy and perform a RECRUIT action in the new city.',
        aiNote: 'After FOUND: city becomes Happy; RECRUIT in new city.',
      },
    ],
  },
  {
    id: 'egypt',
    name: 'Egypt',
    abilities: [
      {
        triggerCat: AdvCat.Agriculture, triggerCount: 2, name: 'Flood Plains',
        description: 'During Comp Obj, gain 1 Mood for each Food resource adjacent to his cities. Pay 6M to CONSTRUCT.',
        aiNote: 'Can spend mood to CONSTRUCT.',
      },
      {
        triggerCat: AdvCat.Construction, triggerCount: 2, name: 'Architecture',
        description: 'When acquired, perform a CONSTRUCT.',
        aiNote: 'On acquisition: immediately CONSTRUCT.',
      },
      {
        triggerCat: AdvCat.Spirituality, triggerCount: 1, name: 'Embalming',
        description: 'Gains 1C after every battle he takes part in.',
        aiNote: 'Gains 1 culture after every battle.',
      },
      {
        triggerCat: AdvCat.Spirituality, triggerCount: 2, name: 'Man God',
        description: 'Gain an extra action with his 1st and 2nd Government Advancements. Perform immediately if already has them.',
        aiNote: 'Extra action when gaining 1st/2nd government advancement.',
      },
    ],
  },
  {
    id: 'greece',
    name: 'Greece',
    abilities: [
      {
        triggerCat: AdvCat.Education, triggerCount: 1, name: 'Formal Training',
        description: 'During RECRUIT, gain 1 Mood for each Academy. During Comp Obj, pay 4M to ADVANCE.',
        aiNote: 'Gains mood per Academy on RECRUIT. Can spend mood to ADVANCE.',
      },
      {
        triggerCat: AdvCat.Warfare, triggerCount: 2, name: 'Spartans',
        description: 'You cannot play Action cards in the 1st round of battle against IBO.',
        aiNote: 'Player cannot use Action Cards in first combat round.',
      },
      {
        triggerCat: AdvCat.Traditions, triggerCount: 1, name: 'Hellenization',
        description: "IBO can INFLUENCE CULTURE from your cities under his Influence.",
        aiNote: 'IBO can use player cities (under his influence) as Influence Culture sources.',
      },
      {
        triggerCat: null, triggerCount: 1, name: 'City-States',
        description: "After CONSTRUCT, IBO's Settler is moved to the largest city in City-Track Order that can still grow.",
        aiNote: 'After CONSTRUCT: settler moves to largest growable city.',
      },
    ],
  },
  {
    id: 'huns',
    name: 'Huns',
    setupNote: "Place settlements on 0, 1, 3, and 5 on the Scale. Leader leaves behind Cavalry instead of Infantry.",
    abilities: [
      {
        triggerCat: AdvCat.Agriculture, triggerCount: 1, name: 'Nomads',
        description: "Leader leaves behind Cavalry instead of Infantry when it moves.",
        aiNote: 'Leader leaves Cavalry instead of Infantry when moving.',
      },
      {
        triggerCat: AdvCat.Agriculture, triggerCount: 2, name: 'Mounted Archers',
        description: "Your lone settlers within Land Aggression Range can't FOUND or form Trade Routes with IBO's cities.",
        aiNote: "Player settlers near IBO cities can't found cities or trade.",
      },
      {
        triggerCat: AdvCat.Warfare, triggerCount: 1, name: 'Raiders',
        description: "IBO can never FOUND within 2 of your cities, unless within his own Land Aggression Range.",
        aiNote: 'IBO avoids founding within 2 of player cities (unless within aggression range).',
      },
      {
        triggerCat: null, triggerCount: 1, name: 'Hunnic Tribes',
        description: "Will pay a Culture to redirect Barbarians Move Events to you instead of him.",
        aiNote: 'IBO pays 1 culture to redirect Barbarians Move events to the player.',
      },
    ],
  },
  {
    id: 'india',
    name: 'India',
    abilities: [
      {
        triggerCat: AdvCat.Agriculture, triggerCount: 2, name: 'Indian Elephants',
        description: "Leader leaves behind Elephant instead of Infantry when it moves.",
        aiNote: 'Leader leaves Elephant instead of Infantry when moving.',
      },
      {
        triggerCat: AdvCat.Spirituality, triggerCount: 2, name: 'Proselytism',
        description: 'Range for INFLUENCE CULTURE is increased by 1.',
        aiNote: '+1 range for all Influence Culture actions.',
      },
      {
        triggerCat: AdvCat.Economy, triggerCount: 2, name: 'Prosperity',
        description: 'During Raze City, all his cities are made Happy. Gains 1C for each of your cities under his Influence.',
        aiNote: 'All cities become Happy during Raze. +1C per influenced player city.',
      },
      {
        triggerCat: AdvCat.Traditions, triggerCount: 2, name: 'Peace & Poetry',
        description: 'During Comp Obj, gain 1 Mood for each Angry city. Pay 4M to ADVANCE.',
        aiNote: 'Scores mood for angry cities. Can spend mood to ADVANCE.',
      },
    ],
  },
  {
    id: 'japan',
    name: 'Japan',
    abilities: [
      {
        triggerCat: AdvCat.Agriculture, triggerCount: 3, name: 'Pottery',
        description: 'After an ADVANCE, gain 1 Mood. During Comp Obj, pay 3M for 2C.',
        aiNote: 'Gains 1 mood after every ADVANCE. Can convert mood to culture during objectives.',
      },
      {
        triggerCat: AdvCat.Agriculture, triggerCount: 2, name: 'Horsemanship',
        description: 'If you play a Non-Combat Action card and you\'re within 2 of IBO\'s cities, roll a die. On 5 or 6, return card to your hand canceled.',
        aiNote: "Player's non-combat action cards within 2 may be canceled (5-6 on d6).",
      },
      {
        triggerCat: AdvCat.Warfare, triggerCount: 1, name: 'Subterfuge',
        description: "If you have an Army or City within 2 of an IBO city, you may discard an Action Card to cancel IBO's free actions from discarding Action Cards after his 3rd or 4th advance in certain categories.",
        aiNote: "Player can cancel IBO's free actions by discarding an action card.",
      },
      {
        triggerCat: null, triggerCount: 1, name: 'Shogunate',
        description: 'In Battle, if his Action card fails to trigger, discard it and IBO gains a combat die.',
        aiNote: 'When IBO action card fails: discard it and gain a combat die instead.',
      },
    ],
  },
  {
    id: 'maya',
    name: 'Maya',
    abilities: [
      {
        triggerCat: AdvCat.Agriculture, triggerCount: 2, name: 'Terracing',
        description: 'FOUND in reverse Terrain order. During Comp Obj, gain 1 Mood per Angry city on/adjacent to his cities. Pay 6M to CONSTRUCT.',
        aiNote: 'FOUND in reverse terrain order. Can spend mood to CONSTRUCT.',
      },
      {
        triggerCat: AdvCat.Traditions, triggerCount: 1, name: 'Stelas',
        description: 'After CONSTRUCT, gain 1C.',
        aiNote: 'Gains 1 culture after every CONSTRUCT.',
      },
      {
        triggerCat: AdvCat.Traditions, triggerCount: 2, name: 'Ballcourts',
        description: 'After RECRUIT, IBO recruits 1 more unit (starting at beginning of reverse City-Track order).',
        aiNote: 'One extra unit recruited after RECRUIT (from beginning of reverse order).',
      },
      {
        triggerCat: AdvCat.Science, triggerCount: 2, name: 'Calendar',
        description: 'IBO pays 1C to cancel any Event icon he triggers.',
        aiNote: 'IBO can spend 1 culture to cancel triggered event icons.',
      },
    ],
  },
  {
    id: 'persia',
    name: 'Persia',
    abilities: [
      {
        triggerCat: AdvCat.Agriculture, triggerCount: 2, name: 'Elephants',
        description: "Leader leaves behind Elephant instead of Infantry when it moves.",
        aiNote: 'Leader leaves Elephant instead of Infantry when moving.',
      },
      {
        triggerCat: AdvCat.Warfare, triggerCount: 2, name: 'Immortals',
        description: 'In Battle, IBO spends up to 4C for +1 hit each, if it gains another hit.',
        aiNote: 'In battle: IBO can spend up to 4 culture for +1 hit each (if it would score a hit).',
      },
      {
        triggerCat: AdvCat.Spirituality, triggerCount: 2, name: 'Zoroastrianism',
        description: 'May target one of your Army units outside a city with an INFLUENCE CULTURE action.',
        aiNote: 'Can Influence Culture target enemy army units outside cities.',
      },
      {
        triggerCat: AdvCat.Economy, triggerCount: 2, name: 'Banking',
        description: 'During Comp Obj, if he has any Culture, he gains 1C.',
        aiNote: 'During objectives: if IBO has any culture, gains 1 more.',
      },
    ],
  },
  {
    id: 'phoenicia',
    name: 'Phoenicia',
    abilities: [
      {
        triggerCat: AdvCat.Maritime, triggerCount: 1, name: 'City Independence',
        description: "IBO's Ports can not be Culturally Influenced and are worth an extra ½VP.",
        aiNote: "IBO's Ports cannot be culturally influenced. +½VP per Port.",
      },
      {
        triggerCat: AdvCat.Maritime, triggerCount: 2, name: 'Biremes',
        description: '+2 hits in Naval Combat.',
        aiNote: '+2 hits in all naval combat.',
      },
      {
        triggerCat: AdvCat.Education, triggerCount: 1, name: 'Alphabet',
        description: "During Comp Obj, gain 1 Mood for each of your cities within 2 of his cities. Pay 4M to both ADVANCE and Gain 1C.",
        aiNote: 'Can spend mood to ADVANCE and gain 1 culture.',
      },
      {
        triggerCat: AdvCat.Economy, triggerCount: 2, name: 'Cedars & Dyes',
        description: 'During Comp Obj, if you have a port within 3 of one of his ports, IBO gains 2C.',
        aiNote: 'During objectives: if player has a Port near IBO Port, IBO gains 2 culture.',
      },
    ],
  },
  {
    id: 'rome',
    name: 'Rome',
    abilities: [
      {
        triggerCat: AdvCat.Construction, triggerCount: 3, name: 'Aqueducts',
        description: 'When acquired, perform an ADVANCE in Agriculture. IBO ignores Exhausted Land Events.',
        aiNote: 'On acquisition: ADVANCE in Agriculture. Ignores Exhausted Land events.',
      },
      {
        triggerCat: AdvCat.Construction, triggerCount: 3, name: 'Imperial Roads',
        description: 'Before defending an attack, IBO will move one unit from the closest city to the attacked city. May exceed City-Limit but not 4.',
        aiNote: 'Before defending: move 1 unit from nearest city to defend.',
      },
      {
        triggerCat: AdvCat.Economy, triggerCount: 1, name: 'Slave Economy',
        description: 'After CONSTRUCT (not FOUND), IBO gains Mood. Pay 3M and make city Angry to CONSTRUCT (not FOUND) again in same city.',
        aiNote: 'Gains mood after CONSTRUCT. Can pay 3 mood + make city angry to CONSTRUCT again.',
      },
      {
        triggerCat: null, triggerCount: 1, name: 'Provinces',
        description: "Leader leaves behind Cavalry instead of Infantry. Captured cities are made Neutral instead of Angry.",
        aiNote: 'Leader leaves Cavalry. Captured cities become Neutral (not Angry).',
      },
    ],
  },
  {
    id: 'vikings',
    name: 'Vikings',
    abilities: [
      {
        triggerCat: AdvCat.Maritime, triggerCount: 1, name: 'Shipcraft',
        description: 'During land ATTACK or FOUND, IBO may count through a single water area without ships. When acquired, RECRUIT a Ship (if possible). +1 Naval Aggression Range.',
        aiNote: 'Can cross 1 water area without ships (attack/found). +1 naval range. Recruits ship on acquisition.',
      },
      {
        triggerCat: AdvCat.Maritime, triggerCount: 2, name: 'Longships',
        description: 'During Comp Obj, you lose 1 resource for each of your cities within 2 of IBO\'s ships.',
        aiNote: 'Player loses resources for cities near IBO ships during objectives.',
      },
      {
        triggerCat: AdvCat.Economy, triggerCount: 2, name: 'Marauders',
        description: 'After any battle that IBO loses 2+ units, place 1C on this card. Each Culture is 1VP.',
        aiNote: 'Track "Marauder Culture": gain 1C (worth 1VP) each time IBO loses 2+ units in battle.',
      },
      {
        triggerCat: AdvCat.Spirituality, triggerCount: 2, name: 'Runestones',
        description: 'During End Game Scoring, IBO\'s city furthest from his starting space earns him ½VP per space away.',
        aiNote: 'At end game: furthest city scores ½VP per space from start.',
      },
    ],
  },
];
