export interface Leader {
  id: string;
  name: string;
  ability: string;
  aiNote: string;
}

export interface CivLeaders {
  civId: string;
  leaders: Leader[];
}

export const CIV_LEADERS: CivLeaders[] = [
  {
    civId: 'aztecs',
    leaders: [
      { id: 'acamapichtli', name: 'Acamapichtli', ability: 'After CONSTRUCT, if able, spend 2 Captives to CONSTRUCT again.', aiNote: 'After CONSTRUCT: if 2+ captives available, spend them to CONSTRUCT again.' },
      { id: 'ahuitzotl', name: 'Ahuitzotl', ability: 'When attacking a city at least 3 spaces away from any IBO city, +1 Block in first round.', aiNote: '+1 Block when attacking distant cities (3+ spaces from any IBO city).' },
      { id: 'marqzen', name: 'Marqzen', ability: 'When in battle against an army of 3 or more units, enemy gets -1 attack die.', aiNote: 'Enemy loses 1 attack die when facing 3+ unit armies.' },
    ],
  },
  {
    civId: 'babylonia',
    leaders: [
      { id: 'hammurabi', name: 'Hammurabi', ability: 'Place a Fortress on the Scale. After a CONSTRUCT, shift all Fortresses one more space left. After any non-Angry city is captured, perform RECRUIT.', aiNote: 'Starts with Fortress on scale. Fortress shifts extra after CONSTRUCT. RECRUIT after city captured.' },
      { id: 'nabopolassar', name: 'Nabopolassar', ability: 'After any of his non-Angry cities are captured, perform RECRUIT.', aiNote: 'RECRUIT immediately after any non-Angry city is captured.' },
      { id: 'nebuchadnezzar', name: 'Nebuchadnezzar II', ability: 'Reveal Great Garden. You can\'t build it. IBO can build it without proper category unlocked, 3C, 2+ cubes in Agr or Con, and 2 city-pieces.', aiNote: 'Reveals Great Gardens. IBO can build it at reduced cost (3C, 2 city-pieces).' },
    ],
  },
  {
    civId: 'carthage',
    leaders: [
      { id: 'hannibal', name: 'Hannibal', ability: 'In the 1st round of combat, you can never gain more than +2 hits vs IBO\'s armies.', aiNote: "Player's combat bonus is capped at +2 hits in first round." },
      { id: 'hanno', name: 'Hanno', ability: '+2 hits in all Naval battles.', aiNote: '+2 hits in all naval combat.' },
      { id: 'queendido', name: 'Queen Dido', ability: 'After a FOUND, IBO performs an additional ACTION.', aiNote: 'After every FOUND city: perform an extra action.' },
    ],
  },
  {
    civId: 'celts',
    leaders: [
      { id: 'queenboudica', name: 'Queen Boudica', ability: 'After a FOUND, shift left-most Settlement two more spaces left (swap with any piece it bumps into). During an ATTACK, once battle is determined, IBO RECRUITS 1 unit into the attacking army.', aiNote: 'After FOUND: settlement shifts 2 extra left. Before attack: recruit 1 unit into army.' },
      { id: 'vercingetorix', name: 'Vercingetorix', ability: 'IBO will play Action Cards for all barbarian battles against you.', aiNote: 'Always plays action cards vs you in barbarian battles.' },
      { id: 'viriatus', name: 'Viriatus', ability: "Terror: can remove one unit from attacked IBO city and place it in next city in reverse city-track order.", aiNote: 'Terror ability: moves 1 unit from attacked city to next reverse city-track city.' },
    ],
  },
  {
    civId: 'china',
    leaders: [
      { id: 'empresswuzetian', name: 'Empress Wu Zetian', ability: 'After an ADVANCE in Agriculture, IBO pays 1C to take another ADVANCE action.', aiNote: 'After Agriculture ADVANCE: pay 1 culture to ADVANCE again.' },
      { id: 'qinshihuang', name: 'Qin Shi Huang', ability: 'After an ADVANCE in Warfare, IBO pays 1C to take another ADVANCE action.', aiNote: 'After Warfare ADVANCE: pay 1 culture to ADVANCE again.' },
      { id: 'suntzu', name: 'Sun Tzu', ability: 'After an ADVANCE in Education, IBO pays 1C to take another ADVANCE action.', aiNote: 'After Education ADVANCE: pay 1 culture to ADVANCE again.' },
    ],
  },
  {
    civId: 'egypt',
    leaders: [
      { id: 'cleopatra', name: 'Cleopatra', ability: 'INFLUENCE CULTURE range increased by 1 in all cities. After a RECRUIT or CONSTRUCT, put a token on this board. Remove 2 tokens to ADVANCE.', aiNote: '+1 influence range. Gains tokens from RECRUIT/CONSTRUCT; remove 2 tokens to ADVANCE.' },
      { id: 'imhotep', name: 'Imhotep', ability: '+2 hits against Coastal Cities.', aiNote: '+2 hits when attacking coastal cities.' },
      { id: 'ramsesii', name: 'Ramses II', ability: '+2 hits against Coastal Cities.', aiNote: '+2 hits when attacking coastal cities.' },
    ],
  },
  {
    civId: 'greece',
    leaders: [
      { id: 'alexanderthegreat', name: 'Alexander the Great', ability: '+X hits in all battles. X = (Number of IBO cities) - 1.', aiNote: '+X hits in all battles where X = IBO city count - 1.' },
      { id: 'leonidas', name: 'Leonidas', ability: '+2 hits for each unit IBO\'s Army is outnumbered by.', aiNote: '+2 hits per unit IBO is outnumbered in a battle.' },
      { id: 'pericles', name: 'Pericles', ability: 'After an ADVANCE in Education, IBO pays 1C to take another ADVANCE action.', aiNote: 'After Education ADVANCE: pay 1 culture to ADVANCE again.' },
    ],
  },
  {
    civId: 'huns',
    leaders: [
      { id: 'attila', name: 'Attila', ability: 'In 1st round of battle where IBO has Cavalry, Cavalry Clash Icons act as both +2 hit and 1 Block.', aiNote: 'Cavalry Clash icons = +2 hit AND Block in first round of battle.' },
      { id: 'bleda', name: 'Bleda', ability: "When attacking a city, defender cannot use Action Cards in the 1st round of combat.", aiNote: 'Defender cannot use action cards in first round of city attacks.' },
      { id: 'rugila', name: 'Rugila', ability: "IBO will capture size-1 barbarian cities instead of Razing them. Barbarian cities made Happy when captured.", aiNote: 'Captures size-1 barbarian cities (not razes). Captured barbarian cities become Happy.' },
    ],
  },
  {
    civId: 'india',
    leaders: [
      { id: 'akbar', name: 'Akbar the Great', ability: '+1 hit for each Elephant he has in a battle. IBO may reroll failed INFLUENCE CULTURE rolls once.', aiNote: '+1 hit per elephant in battle. Reroll failed influence culture once.' },
      { id: 'ashoka', name: 'Ashoka the Great', ability: 'After an ADVANCE in a new category, IBO pays 1C to take another ADVANCE action.', aiNote: 'After ADVANCE into a new category: pay 1 culture to ADVANCE again.' },
      { id: 'srigupta', name: 'Maharaja Sri Gupta', ability: 'Academies gain the power of Observatories. Observatories gain the power of Academies. All IBO Fortresses are +3 hits instead of +1.', aiNote: 'Academies and Observatories swap powers. Fortresses give +3 hits (not +1).' },
    ],
  },
  {
    civId: 'japan',
    leaders: [
      { id: 'gotoba', name: 'Emperor Go-Toba', ability: 'When defending, +1 Block in 1st round of combat. After CONSTRUCT, perform an INFLUENCE CULTURE from the city that just constructed.', aiNote: '+1 Block when defending (1st round). After CONSTRUCT: Influence Culture from that city.' },
      { id: 'jimmu', name: 'Emperor Jimmu', ability: 'Before INFLUENCE CULTURE action, IBO influences back a piece under your influence in one of his cities. Then makes the attempt as normal.', aiNote: 'Before influencing: IBO reclaims one influenced piece in his city first.' },
      { id: 'suiko', name: 'Empress Suiko', ability: '+2 hits when attacking.', aiNote: '+2 hits in all attacks.' },
    ],
  },
  {
    civId: 'maya',
    leaders: [
      { id: 'pakal', name: "K'inich Janaab' Pakal", ability: 'When defending, +1 Block in 1st round of combat. After CONSTRUCT, perform an INFLUENCE CULTURE from the city that just constructed.', aiNote: '+1 Block when defending (1st round). After CONSTRUCT: Influence Culture from that city.' },
      { id: 'siyaj', name: "Siyaj K'ak'", ability: '+2 hits when attacking.', aiNote: '+2 hits in all attacks.' },
      { id: 'wakchanil', name: 'Wak Chanil Ajaw', ability: 'After CONSTRUCT, perform an INFLUENCE CULTURE from the city that just constructed.', aiNote: 'After CONSTRUCT: Influence Culture from that city.' },
    ],
  },
  {
    civId: 'persia',
    leaders: [
      { id: 'cyrus', name: 'Cyrus the Great', ability: "During Combat, if IBO's Action Card doesn't trigger, discard it to give his army +2 hits. After CONSTRUCT, pay 1C to this card. When 2C are on this card, discard both to CONSTRUCT again.", aiNote: 'Failed action card → +2 hits. Accumulate culture to CONSTRUCT again.' },
      { id: 'darius', name: 'Darius', ability: 'During Wonder Check!, will build Wonder with 3 non-settlement City-Pieces and 3C.', aiNote: 'Wonder Check requires only 3 city-pieces and 3 culture (reduced cost).' },
      { id: 'xerxes', name: 'Xerxes', ability: 'No special ability listed.', aiNote: 'No AI-affecting ability.' },
    ],
  },
  {
    civId: 'phoenicia',
    leaders: [
      { id: 'ithobaal', name: 'Ithobaal', ability: '+1 hit per Temple built in IBO\'s cities. After an ADVANCE in Construction, IBO pays 1C to take another ADVANCE action.', aiNote: '+1 hit per Temple. After Construction ADVANCE: pay 1 culture to ADVANCE again.' },
      { id: 'kinghiram', name: 'King Hiram', ability: 'During Comp Obj, IBO gains 1C if any of his ships or cities are within 2 of any of your cities.', aiNote: 'During objectives: gain 1 culture if ships or cities near player cities.' },
      { id: 'pygmalion', name: 'Pygmalion', ability: 'During Comp Obj, you lose 1 resource for each of your cities within 2 of IBO\'s ships.', aiNote: 'Player loses resources for cities near IBO ships during objectives.' },
    ],
  },
  {
    civId: 'rome',
    leaders: [
      { id: 'augustus', name: 'Emperor Augustus', ability: '+2 hits when attacking. After IBO captures a city, increase its Mood one step and RECRUIT in that city alone.', aiNote: '+2 hits attacking. After capturing: boost mood and RECRUIT in captured city.' },
      { id: 'caesar', name: 'Gaius Julius Caesar', ability: "IBO's cities are considered 2 spaces further away during your INFLUENCE CULTURE attempts.", aiNote: "IBO's cities count as 2 spaces further for player's Influence Culture range." },
      { id: 'sulla', name: 'Sulla', ability: '+2 hits when attacking.', aiNote: '+2 hits in all attacks.' },
    ],
  },
  {
    civId: 'vikings',
    leaders: [
      { id: 'cnut', name: 'Cnut the Great', ability: 'During End Game Scoring, IBO\'s city furthest from his starting space earns him ½VP per space away. Put a Port on the Scale.', aiNote: 'Starts with Port on scale. Furthest city scores ½VP per space at game end.' },
      { id: 'ericthered', name: 'Eric the Red', ability: 'During End Game Scoring, IBO gets 1VP per each Sea Area he has a ship present.', aiNote: '1VP per sea area with IBO ships at game end.' },
      { id: 'ragnar', name: 'Ragnar Lodbrok', ability: '+2 hits in any land battle adjacent to a Sea Area with his ships.', aiNote: '+2 hits in land battles near sea areas with IBO ships.' },
    ],
  },
];
