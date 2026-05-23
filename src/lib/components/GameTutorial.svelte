<script lang="ts">
  const { onExit }: { onExit: () => void } = $props();

  interface TutorialStep {
    heading: string;
    body: string;
    example?: string;
    tip?: string;
    warning?: string;
  }

  interface TutorialChapter {
    title: string;
    icon: string;
    steps: TutorialStep[];
  }

  const chapters: TutorialChapter[] = [
    // ── Chapter 1 ──────────────────────────────────────────────────────────
    {
      title: 'Welcome to Clash of Cultures',
      icon: '🌍',
      steps: [
        {
          heading: 'What Is Clash of Cultures?',
          body: `Clash of Cultures is a civilization-building board game for 2–4 players (or solo with the IBO companion). Over a series of <strong>Ages</strong>, you grow a fledgling settlement into a mighty empire by expanding across a hex map, advancing your technology, building cities, and clashing with rivals.
          <br/><br/>
          Every decision you make — where to settle, what to research, when to attack — shapes the arc of your civilization. The game rewards smart planning over brute force, and no two games play out the same way.`,
          tip: 'A Standard game lasts 6 Ages. A Short game lasts 4 Ages. Each Age ends with a Status Phase where you score objectives, collect resources, and prepare for the next Age.'
        },
        {
          heading: 'How Do You Win?',
          body: `Victory is measured in <strong>Victory Points (VP)</strong>. Points come from many sources throughout the game:
          <br/><br/>
          <ul>
            <li>🏙️ <strong>Cities</strong> — each city you control earns VP at game end</li>
            <li>🏛️ <strong>Structures</strong> — buildings inside your cities add VP</li>
            <li>📜 <strong>Objective Cards</strong> — secret goals scored during Status Phases</li>
            <li>📚 <strong>Advancements</strong> — researching certain technologies awards VP</li>
            <li>🎭 <strong>Culture</strong> — spreading your culture earns bonus VP</li>
            <li>🏆 <strong>Wonders</strong> — building Wonders grants large point bonuses</li>
          </ul>
          <br/>
          The player with the most VP at the end of the final Age wins. Ties are broken by the number of cities controlled.`,
        },
        {
          heading: 'What\'s In The Box?',
          body: `Before your first game, take a moment to familiarise yourself with the components:
          <br/><br/>
          <ul>
            <li>🗺️ <strong>Hex Tiles</strong> — double-sided terrain tiles that form the board</li>
            <li>🎴 <strong>Action Cards</strong> — your hand of cards dictates what you can do each turn</li>
            <li>📋 <strong>Objective Cards</strong> — secret VP goals</li>
            <li>🎲 <strong>Dice</strong> — used for advancement research and combat</li>
            <li>🏠 <strong>Miniatures & Tokens</strong> — cities, armies, culture cubes, resource tokens</li>
            <li>📊 <strong>Player Boards</strong> — track your resources, culture level, and city count</li>
            <li>⚡ <strong>Event Cards</strong> — drawn each round, trigger global effects</li>
          </ul>`,
          tip: 'Punch out all tokens and sort them by type before your first game. It saves a lot of time at setup.'
        }
      ]
    },

    // ── Chapter 2 ──────────────────────────────────────────────────────────
    {
      title: 'The Board & Map',
      icon: '🗺️',
      steps: [
        {
          heading: 'Building the Board',
          body: `The board is built from <strong>hex tiles</strong> placed at the start of the game. Each tile shows a terrain type and often has a <strong>resource symbol</strong> on it.
          <br/><br/>
          In a standard setup, tiles are placed face-down and revealed when a city is founded on or adjacent to them. This creates a feeling of exploration — you don't know exactly what's out there until you push into it.`,
          tip: 'In solo play, you can optionally reveal the full board at setup for easier planning. Check your rulebook for the solo variant setup.'
        },
        {
          heading: 'Terrain Types',
          body: `Each hex belongs to one terrain category. Terrain affects <strong>movement costs</strong>, <strong>resources</strong>, and <strong>combat defence bonuses</strong>:
          <br/><br/>
          <ul>
            <li>🌾 <strong>Plains</strong> — open terrain, free to move through; produce <strong>Food</strong></li>
            <li>🌲 <strong>Forest</strong> — units may enter and <em>can still be moved again</em> later in the turn, but <strong>cannot initiate combat</strong> after entering a forest that turn; produce <strong>Wood</strong></li>
            <li>⛰️ <strong>Mountain</strong> — units may enter, but <strong>cannot be moved at all for the rest of that turn</strong> (a hard stop); produce <strong>Ore</strong>; +1 defence bonus in combat</li>
            <li>🌊 <strong>Sea</strong> — impassable to land units; requires the Sailing advancement to cross with Ships</li>
            <li>🌵 <strong>Barrens</strong> — passable but barren; requires certain advancements to produce resources</li>
          </ul>`,
          example: 'Example: You move an Infantry unit into a Mountain hex. The move succeeds normally — but that Infantry <strong>cannot be moved again for the rest of this turn</strong>, even if you play more Move action cards. Plan accordingly, especially when moving a group: units that enter Mountains are "done" for the turn.'
        },
        {
          heading: 'Region Tokens & Special Tiles',
          body: `Some hex tiles have a <strong>region token</strong> face-down on them. When a unit moves onto such a tile for the first time, flip the token. Region tokens can be:
          <br/><br/>
          <ul>
            <li>💰 <strong>Bonus Resources</strong> — immediately gain gold, food, or ore</li>
            <li>⚔️ <strong>Barbarians</strong> — a combat event triggers; defeat them to claim the land</li>
            <li>📜 <strong>Ancient Ruins</strong> — gain a free advancement or resource bundle</li>
            <li>🌿 <strong>Natural Wonder</strong> — the hex becomes permanently worth +1 VP at game end</li>
          </ul>`,
          tip: 'Region tokens are a great early source of free resources. Plan your first expansion toward unexplored tiles!'
        }
      ]
    },

    // ── Chapter 3 ──────────────────────────────────────────────────────────
    {
      title: 'Your Empire at a Glance',
      icon: '👑',
      steps: [
        {
          heading: 'Your Player Board',
          body: `Each player has a <strong>Player Board</strong> that tracks the most important stats of your civilization:
          <br/><br/>
          <ul>
            <li>📊 <strong>Resource Tracks</strong> — Gold, Food, Ideas, Wood, Ore (each capped at 8, or 12 with upgrades)</li>
            <li>🏙️ <strong>City Track</strong> — the number of cities you currently control (max 5 in standard play)</li>
            <li>🎭 <strong>Culture Track</strong> — how far your cultural influence spreads</li>
            <li>📚 <strong>Advancement Board</strong> — shows which technologies you have researched</li>
          </ul>
          <br/>
          Your board is your command centre. Check it constantly — a good Clash of Cultures player always knows exactly what they have and what they need.`,
        },
        {
          heading: 'The Advancement Board',
          body: `The Advancement Board is a grid showing all researachable technologies, organised into <strong>9 categories</strong>:
          <br/><br/>
          <ul>
            <li>🏗️ Construction, ⚔️ Military, 🌾 Agriculture</li>
            <li>💡 Science, 🎭 Culture, 🏛️ Government</li>
            <li>⛵ Seafaring, 🔱 Urban Development, 🔬 Philosophy</li>
          </ul>
          <br/>
          Each category has 3 tiers. Higher-tier advancements require you to already own lower-tier ones in that category. Many advancements unlock new buildings for your cities or grant special abilities.`,
          tip: 'You start with Farming (Agriculture I) and Mining (Construction I) already researched. These let you produce Food and build basic structures from turn one.'
        },
        {
          heading: 'Army Pool & Units',
          body: `Your army pool contains all the military units available to you. In a standard game each player has:
          <br/><br/>
          <ul>
            <li>⚔️ <strong>6 Infantry</strong> — cheap, flexible land units (1 attack die each)</li>
            <li>🐴 <strong>3 Cavalry</strong> — fast movers, 2 movement points (1 attack die each, unlocked via Military)</li>
            <li>⛵ <strong>2 Ships</strong> — naval units, required to cross water (unlocked via Seafaring)</li>
          </ul>
          <br/>
          Units placed on the board are taken from your pool. When units are eliminated, they return to your pool — ready to be recruited again later.`,
          warning: 'You can never have more units on the board than your pool contains. If all your Infantry are deployed, you can\'t recruit more until some are eliminated or the pool is expanded via advancements.'
        }
      ]
    },

    // ── Chapter 4 ──────────────────────────────────────────────────────────
    {
      title: 'Resources — The Lifeblood',
      icon: '⚙️',
      steps: [
        {
          heading: 'The Five Resources',
          body: `Everything in Clash of Cultures costs resources. You have five types, each tracked separately on your player board:
          <br/><br/>
          <ul>
            <li>🟡 <strong>Gold</strong> — the universal currency; used for units, buildings, and bribing events</li>
            <li>🟢 <strong>Food</strong> — fuels city founding and some buildings; cities "eat" food during the Status Phase</li>
            <li>💡 <strong>Ideas</strong> — the fuel for research; needed to advance technology</li>
            <li>🪵 <strong>Wood</strong> — required for most construction projects</li>
            <li>⛏️ <strong>Ore</strong> — needed for higher-tier buildings and military units</li>
          </ul>`,
          tip: 'Gold is the most flexible resource. When in doubt, prioritise gold-producing cities early — it smooths out any resource shortage.'
        },
        {
          heading: 'Collecting Resources',
          body: `You collect resources in two ways:
          <br/><br/>
          <strong>1. Status Phase Collection</strong> — at the end of each Age, each of your cities produces resources equal to its production type (Food, Gold, Ideas, Wood, or Ore). More cities = more resources per Age.
          <br/><br/>
          <strong>2. Action Cards</strong> — some action cards include small resource bonuses when played. A "Move" card might come with a food bonus, for example.
          <br/><br/>
          Resources are capped at 8 per type (or 12 with the Granary or Marketplace advancements). Anything over the cap is lost, so plan ahead!`,
          example: 'Example: You have 3 cities — one produces Food, one produces Gold, one produces Ideas. At the Status Phase you gain +1 Food, +1 Gold, and +1 Ideas from your cities, plus any bonus resources from Structures built inside them.'
        },
        {
          heading: 'Spending Resources Wisely',
          body: `Resources are spent during your turn to pay for actions. Common costs:
          <br/><br/>
          <ul>
            <li>🏙️ <strong>Found a City</strong> — 2 Food (or 1 Food with Agriculture II)</li>
            <li>⚔️ <strong>Recruit Infantry</strong> — 1 Gold each</li>
            <li>🏗️ <strong>Construct a Building</strong> — typically 1–2 Gold + Wood or Ore</li>
            <li>📚 <strong>Research an Advancement</strong> — 1–3 Ideas + sometimes Gold</li>
          </ul>
          <br/>
          Never hoard resources beyond your cap — it's wasted potential. If you're sitting at 7 Ideas with nothing to research, spend some before the end of the Age or buy a building you've been putting off.`,
          warning: 'Resource caps are easy to forget. A common beginner mistake is reaching the Status Phase with 8 Gold and gaining 2 more — those extra 2 are simply lost.'
        }
      ]
    },

    // ── Chapter 5 ──────────────────────────────────────────────────────────
    {
      title: 'Starting the Game',
      icon: '🚀',
      steps: [
        {
          heading: 'Initial Setup Steps',
          body: `Before the first Age begins, follow these steps in order:
          <br/><br/>
          <ol>
            <li>Place the hex map tiles face-down in the agreed configuration</li>
            <li>Each player places their <strong>starting city</strong> on a designated start hex (usually a Plains tile)</li>
            <li>Flip the starting city's hex and its immediate neighbours face-up</li>
            <li>Each player places <strong>2 Infantry</strong> adjacent to their starting city</li>
            <li>Deal each player their starting hand of <strong>Action Cards</strong> (usually 3)</li>
            <li>Give each player their starting resources: <strong>2 Gold, 1 Food, 1 Ideas</strong></li>
            <li>Mark <strong>Farming</strong> and <strong>Mining</strong> as researched on your Advancement Board</li>
            <li>Shuffle the Event Deck and place it face-down near the board</li>
          </ol>`,
          tip: 'The player who most recently visited a museum goes first! (Or just roll a die.)'
        },
        {
          heading: 'Your Starting Position',
          body: `Every player begins identically: one City of size 1 (just the city tile itself, Happy mood, producing Food), plus 2 Infantry nearby. Your city is set to <strong>Happy</strong> by default.
          <br/><br/>
          City Mood works as follows:
          <br/><br/>
          <ul>
            <li>😊 <strong>Happy</strong> — city produces normally; Happiness token on it</li>
            <li>😐 <strong>Neutral</strong> — city produces normally; no token</li>
            <li>😠 <strong>Angry</strong> — city does NOT produce resources this Status Phase</li>
          </ul>
          <br/>
          Mood changes based on events, attacks, and certain advancements. Keep your cities happy to maintain steady income!`,
          example: 'Example starting state: Your city on a Plains hex produces 1 Food per Status Phase. You have 2 Infantry at its gates, 2 Gold, 1 Food, 1 Ideas in your stockpile, and Farming + Mining on your advancement board.'
        },
        {
          heading: 'Action Cards & Your Hand',
          body: `Action Cards are the engine of your turn. Each card has one <strong>Action Type</strong> printed on it, and you play one card per action you take. At the start of each Age, you draw back up to your hand size.
          <br/><br/>
          The five action types are:
          <br/><br/>
          <ul>
            <li>📚 <strong>Advance</strong> — research a technology</li>
            <li>🏗️ <strong>Construct</strong> — build a structure or found a new city</li>
            <li>⚔️ <strong>Recruit</strong> — add units to the board</li>
            <li>🚶 <strong>Move</strong> — move units across the map</li>
            <li>🎭 <strong>Influence</strong> — place culture cubes to spread your civilization</li>
          </ul>`,
          tip: 'You don\'t have to use a card\'s action. You can "discard" any card to take a weaker, free version of any action instead — but this is usually a last resort.'
        }
      ]
    },

    // ── Chapter 6 ──────────────────────────────────────────────────────────
    {
      title: 'Your Turn — Action Cards',
      icon: '🎴',
      steps: [
        {
          heading: 'Structure of Your Turn',
          body: `On your turn you take the following steps in order:
          <br/><br/>
          <ol>
            <li><strong>Draw</strong> — replenish your hand to your current hand size (usually 3)</li>
            <li><strong>Play Actions</strong> — play Action Cards one at a time, resolving each before playing the next. You may play as many or as few as you want (but you only draw to hand size at the start, not mid-turn)</li>
            <li><strong>Pass</strong> — when you're done, play passes to the left (or the IBO acts, in solo)</li>
          </ol>
          <br/>
          You are never forced to play all your cards. Sometimes holding a card for next turn is the right move.`,
          tip: 'Planning your actions in advance is key. Look at your hand at the start of your turn and decide the optimal sequence before playing anything.'
        },
        {
          heading: 'Playing Action Cards',
          body: `To play an action card, place it face-up in front of you (it stays there until the Age ends, acting as a reminder of what you've done). Then resolve the printed action:
          <br/><br/>
          <ul>
            <li><strong>Advance</strong> — choose a technology you can afford and attempt research (more in Chapter 7)</li>
            <li><strong>Construct</strong> — spend resources to build a structure in one of your cities, OR found a new city on an empty hex (more in Chapter 8)</li>
            <li><strong>Recruit</strong> — spend Gold to place units from your pool onto any of your cities (more in Chapter 9)</li>
            <li><strong>Move</strong> — move any or all of your units, up to their movement allowance (more in Chapter 9)</li>
            <li><strong>Influence</strong> — place culture cubes from your supply onto cities within your culture range (more in Chapter 11)</li>
          </ul>`,
          example: 'Example turn: You hold [Advance] [Move] [Recruit]. You play Advance first to research Masonry. Then play Move to push 3 Infantry toward a rival\'s border. You keep [Recruit] for next turn — you\'ll want to replenish those troops.'
        },
        {
          heading: 'Card Discarding & Efficiency',
          body: `Each card you play is "used" — it sits face-up in front of you as a record of your actions this Age. At the <strong>Status Phase</strong>, all played cards are shuffled back into your deck and you draw a fresh hand.
          <br/><br/>
          This means your actions are <strong>limited per Age</strong> by the cards you draw. A hand of 3 cards = 3 potential actions per turn. Managing this hand is one of the most important skills in Clash of Cultures.
          <br/><br/>
          Some advancements (like Philosophy or Code of Laws) increase your hand size, letting you take more actions per turn. These are extremely powerful.`,
          warning: 'You cannot play the same card twice in one turn. Each card type can only be used once per action phase — plan your hand accordingly.'
        }
      ]
    },

    // ── Chapter 7 ──────────────────────────────────────────────────────────
    {
      title: 'Advancing Technology',
      icon: '📚',
      steps: [
        {
          heading: 'How Research Works',
          body: `When you play an <strong>Advance</strong> card, choose one technology from your Advancement Board that you <strong>don\'t already own</strong> and that you meet the prerequisites for (if any). Then:
          <br/><br/>
          <ol>
            <li>Check the <strong>Ideas cost</strong> printed on the advancement tile</li>
            <li>Pay the Ideas (and any Gold cost shown)</li>
            <li>Roll the <strong>Research Dice</strong> — usually 1–3 dice depending on the tier</li>
            <li>If the roll meets the printed <strong>difficulty number</strong>, the research succeeds! Claim the tile</li>
            <li>If the roll fails, nothing happens — try again next turn (or spend a Bonus Die token to reroll)</li>
          </ol>`,
          example: 'Example: You attempt to research Masonry (Construction II). Cost: 2 Ideas. Difficulty: 4. You pay 2 Ideas, roll 2 dice. You roll a 2 and a 5 — total 7, which meets the difficulty of 4. Masonry is yours!'
        },
        {
          heading: 'The Advancement Tree',
          body: `Advancements are arranged in a <strong>3-tier tree</strong> within each category. To unlock Tier 2, you must own at least one Tier 1 advancement in that category. To unlock Tier 3, you must own Tier 2.
          <br/><br/>
          The nine categories each offer a distinct strategic path:
          <br/><br/>
          <ul>
            <li>🏗️ <strong>Construction</strong> — unlock better buildings (Fortress, Library, Aqueduct)</li>
            <li>⚔️ <strong>Military</strong> — unlock Cavalry, Siege Weapons, improved combat</li>
            <li>🌾 <strong>Agriculture</strong> — cheaper city founding, better food production</li>
            <li>💡 <strong>Science</strong> — larger hand size, more research dice</li>
            <li>🎭 <strong>Culture</strong> — expanded culture range, more cubes</li>
            <li>🏛️ <strong>Government</strong> — powerful civic abilities (Democracy, Republic, etc.)</li>
            <li>⛵ <strong>Seafaring</strong> — unlock naval units and water crossing</li>
            <li>🔱 <strong>Urban Development</strong> — bigger cities, more structures, Wonder access</li>
            <li>🔬 <strong>Philosophy</strong> — VP bonuses and advanced scoring options</li>
          </ul>`,
          tip: 'Pick 2–3 categories to specialise in rather than spreading thin. A focused tech path is much more powerful than a scattered one.'
        },
        {
          heading: 'What Advancements Unlock',
          body: `Beyond their direct effects, many advancements <strong>unlock new structure types</strong> you can build in cities. This is tracked on the <strong>City Scale</strong> — a public display showing which buildings are available.
          <br/><br/>
          Examples:
          <br/><br/>
          <ul>
            <li><strong>Masonry (Construction II)</strong> → unlocks Fortress (gives +2 defence in combat)</li>
            <li><strong>Education (Science II)</strong> → unlocks Library (+1 Idea production per Status Phase)</li>
            <li><strong>Code of Laws (Government II)</strong> → hand size increases by 1</li>
            <li><strong>Sailing (Seafaring I)</strong> → allows you to recruit Ships</li>
          </ul>
          <br/>
          Some advancements also give immediate <strong>VP</strong> when researched — check the tile for a trophy icon.`,
          tip: 'Always read what an advancement unlocks before researching it. Sometimes a cheaper Tier 1 advancement unlocks exactly the building you need — skip straight there rather than climbing the whole tree.'
        }
      ]
    },

    // ── Chapter 8 ──────────────────────────────────────────────────────────
    {
      title: 'Building Your Cities',
      icon: '🏙️',
      steps: [
        {
          heading: 'Founding New Cities',
          body: `To expand your empire, you <strong>Found</strong> new cities. Using a <strong>Construct</strong> action card:
          <br/><br/>
          <ol>
            <li>Choose an <strong>empty land hex</strong> that is not adjacent to any other city (yours or an opponent\'s)</li>
            <li>Pay <strong>2 Food</strong> (reduced to 1 with Agriculture II advancement)</li>
            <li>Place a <strong>size-1 city tile</strong> on the hex — this is your new settlement</li>
            <li>Flip any face-down tiles that are now adjacent to the new city</li>
            <li>Set the city\'s production to any one resource type (Food, Gold, Ideas, Wood, or Ore)</li>
          </ol>
          <br/>
          Each new city expands your resource income. More cities = more actions per Status Phase.`,
          tip: 'Choose city production based on what you need most. If you\'re running low on Ideas for research, produce Ideas. If you need units, produce Gold.'
        },
        {
          heading: 'Constructing Structures',
          body: `Using a <strong>Construct</strong> action card, you can build structures inside your existing cities. Each structure increases the city\'s <strong>size</strong> by 1:
          <br/><br/>
          <ul>
            <li><strong>Size 1</strong> — just the city tile itself (base state)</li>
            <li><strong>Size 2</strong> — one structure added (+1 production)</li>
            <li><strong>Size 3</strong> — two structures (max without Urban Development)</li>
          </ul>
          <br/>
          Structure costs vary, but typically require <strong>Gold + Wood or Ore</strong>. Available structures depend on your researched advancements (tracked on the City Scale).
          <br/><br/>
          Common early-game structures:
          <ul>
            <li>🌾 <strong>Farm</strong> — +1 Food per Status Phase (requires Farming)</li>
            <li>⛏️ <strong>Mine</strong> — +1 Ore per Status Phase (requires Mining)</li>
            <li>📦 <strong>Storehouse</strong> — raises your resource cap by 4</li>
          </ul>`,
          example: 'Example: Your Gold-producing city at size 1 earns 1 Gold per Age. You build a Market (Size 2). Now it produces 2 Gold per Age. You then build a Library (Size 3) which adds 1 Idea. Next Status Phase: +2 Gold, +1 Idea from that single city.'
        },
        {
          heading: 'City Mood',
          body: `Every city has a <strong>Mood</strong> that affects whether it produces resources:
          <br/><br/>
          <ul>
            <li>😊 <strong>Happy</strong> — produces resources normally; gains a Happy token</li>
            <li>😐 <strong>Neutral</strong> — produces resources normally; no token</li>
            <li>😠 <strong>Angry</strong> — does <em>not</em> produce resources during the Status Phase</li>
          </ul>
          <br/>
          Cities become Angry when:
          <ul>
            <li>They are attacked (even if you repel the attacker)</li>
            <li>Certain Event Cards trigger unrest</li>
            <li>You fail to feed them (if the Famine event occurs)</li>
          </ul>
          <br/>
          Cities become Happy again during the Status Phase — unless the cause of anger persists.`,
          warning: 'An Angry city in a key production slot can cripple your economy for an entire Age. Prioritise defending high-value cities, and research Temples (Culture I) to keep cities happy.'
        }
      ]
    },

    // ── Chapter 9 ──────────────────────────────────────────────────────────
    {
      title: 'Armies & Movement',
      icon: '⚔️',
      steps: [
        {
          heading: 'Recruiting Units',
          body: `To add military units to the board, play a <strong>Recruit</strong> action card. Then:
          <br/><br/>
          <ol>
            <li>Choose one of your cities as the recruitment point</li>
            <li>Pay the Gold cost for each unit you want to recruit:<br/> — Infantry: 1 Gold each<br/> — Cavalry: 2 Gold each (requires Military I)<br/> — Ship: 2 Gold each (requires Seafaring I)</li>
            <li>Place the recruited units on or adjacent to that city</li>
          </ol>
          <br/>
          You can recruit as many units as you can afford in a single Recruit action — there's no limit per action card, only your Gold and available pool size.`,
          tip: 'Recruit near the front line when possible. Placing units directly onto a city near enemy territory saves movement actions on future turns.'
        },
        {
          heading: 'Moving Units',
          body: `To move units, play a <strong>Move</strong> action card. Then:
          <br/><br/>
          <ol>
            <li>Select any number of your units on the board</li>
            <li>Move each selected unit up to its <strong>movement allowance</strong>: Infantry = 1, Cavalry = 2</li>
            <li>Units may move through friendly cities freely (at no extra cost)</li>
            <li>Terrain restrictions differ: <strong>Forest</strong> — the unit can still be moved again later this turn, but cannot fight; <strong>Mountain</strong> — the unit <em>cannot move at all</em> for the rest of the turn, no exceptions</li>
            <li>If a unit enters a hex with an enemy unit or city, combat occurs (Chapter 10)</li>
          </ol>
          <br/>
          You can split your units across multiple destinations in a single Move action — you don\'t have to move them all to the same place.`,
          example: 'Example: You have 4 Infantry in City A and 2 Cavalry at City B. You play Move. You move 2 Infantry one hex east into a Mountain hex — those Infantry are now done moving for the turn. The 2 Cavalry ride 2 hexes north to secure a resource tile. All from one Move card.'
        },
        {
          heading: 'Stacking & Zone Control',
          body: `Units share hexes within limits:
          <br/><br/>
          <ul>
            <li>A hex can hold a maximum of <strong>4 friendly units</strong></li>
            <li>You cannot move through a hex occupied by enemy units (you must fight them or go around)</li>
            <li>You <em>can</em> pass through hexes occupied by <strong>friendly</strong> units</li>
            <li>Cities count as controlled by whoever owns the city tile — enemy units cannot pass through your cities</li>
          </ul>
          <br/>
          Concentration is power in combat, but spreading units across the map gives you more territory control and threatens multiple fronts.`,
          warning: 'Don\'t leave cities undefended! An unguarded city can be captured by a single enemy Infantry in one move. Always keep at least 1–2 units in each city, especially those near rival empires.'
        }
      ]
    },

    // ── Chapter 10 ─────────────────────────────────────────────────────────
    {
      title: 'Combat',
      icon: '🗡️',
      steps: [
        {
          heading: 'Initiating Combat',
          body: `Combat occurs when you move a unit into a hex that contains an <strong>enemy unit or an undefended enemy city</strong>. Combat is resolved immediately before any further movement.
          <br/><br/>
          The player who moved into the hex is the <strong>Attacker</strong>. The player who was already there is the <strong>Defender</strong>.
          <br/><br/>
          Important: You choose how many of your units to send into the combat hex. You don\'t have to send everyone — but only units in the combat hex may participate.`,
          tip: 'Always count the defence situation before attacking. Attacking 2 Infantry defended in a Mountain hex with only 2 of your own Infantry is often suicidal — the terrain gives them a free bonus die.'
        },
        {
          heading: 'Resolving Combat',
          body: `Combat is resolved in <strong>simultaneous rounds</strong> until one side is eliminated or retreats:
          <br/><br/>
          <ol>
            <li><strong>Each side rolls dice</strong> — one die per unit participating in combat</li>
            <li><strong>Each 5 or 6</strong> rolled = 1 hit on the opposing force</li>
            <li><strong>Defender terrain bonus</strong> — if defending in a Mountain or behind a Fortress, the defender rolls +1 bonus die</li>
            <li><strong>Remove casualties</strong> — each hit removes one enemy unit (attacker chooses which of their units to remove; defender chooses which of their units to remove)</li>
            <li><strong>Repeat</strong> until one side is fully eliminated or the defender retreats</li>
          </ol>
          <br/>
          The defender may choose to <strong>retreat</strong> before any combat round — they move all surviving units one hex away from the combat. The attacker may then advance into the vacated hex.`,
          example: `📋 Worked Example — A Classic Skirmish:
          <br/><br/>
          You attack a rival's Plains hex with <strong>3 Infantry</strong>. They have <strong>2 Infantry</strong> defending.
          <br/><br/>
          <strong>Round 1:</strong><br/>
          You roll 3 dice: 🎲 6, 2, 5 → 2 hits!<br/>
          They roll 2 dice: 🎲 3, 5 → 1 hit!<br/>
          Result: 2 of their Infantry are eliminated. 1 of your Infantry is eliminated.
          <br/><br/>
          <strong>All defenders are eliminated</strong> — combat ends. You advance your 2 surviving Infantry into the hex. If it contained an enemy city, you now capture it!`
        },
        {
          heading: 'Capturing Cities & Aftermath',
          body: `If you win combat in a hex containing an enemy city, you <strong>capture that city</strong>:
          <br/><br/>
          <ul>
            <li>Replace the enemy city tile with your own</li>
            <li>The city immediately becomes <strong>Angry</strong> (occupied territory is unhappy)</li>
            <li>The city keeps its current structures — you now benefit from any buildings inside</li>
            <li>The previous owner loses the city from their count — and if they drop below 1 city, they may be eliminated</li>
          </ul>
          <br/>
          Captured cities are valuable but fragile. They start Angry (no production this Age) and are often far from your other defences — easy targets for a counter-attack.`,
          warning: 'Overextending is a common beginner trap. Capturing a distant city with 1 unit left is often a mistake — the original owner can recapture it next turn with 2 Infantry and very little cost.'
        }
      ]
    },

    // ── Chapter 11 ─────────────────────────────────────────────────────────
    {
      title: 'Cultural Influence',
      icon: '🎭',
      steps: [
        {
          heading: 'What is Cultural Influence?',
          body: `Culture is the alternative to military conquest. Instead of attacking a city with armies, you can <strong>convert</strong> it using cultural pressure — place enough culture cubes on it and it peacefully joins your empire.
          <br/><br/>
          Your <strong>Culture Track</strong> on your player board shows how many culture cubes you may have in play at once, and how far from your cities they can be placed. The track advances when you research Culture-category advancements.
          <br/><br/>
          Culture is often underestimated by new players — but it wins games. VP from the culture track can rival points from combat.`,
          tip: 'The Culture track also awards VP directly. Each step up the culture track at game end earns points. High culture civilizations regularly outscore military-focused ones.'
        },
        {
          heading: 'Placing Culture Cubes',
          body: `When you play an <strong>Influence</strong> action card:
          <br/><br/>
          <ol>
            <li>Choose a target city — it must be within your culture range (shown on the Culture Track)</li>
            <li>Place one of your culture cubes from your supply onto the target city</li>
            <li>If the city already has your cubes on it, add to the stack</li>
            <li>You may place multiple cubes in one action if you have enough supply</li>
          </ol>
          <br/>
          You can target <strong>any city</strong> within range — your own (to protect from rival conversion), a neutral unowned city, or an <strong>enemy city</strong> (to eventually convert it).`,
          example: `📋 Worked Example — Converting a City:
          <br/><br/>
          Your rival has a <strong>size-2 city</strong> (meaning it has 2 structures inside). To convert it, you need culture cubes equal to the city's size = <strong>2 cubes</strong>.
          <br/><br/>
          <strong>Age 3:</strong> You play Influence — place 1 culture cube on their city.
          <br/>
          <strong>Age 4:</strong> You play Influence again — place a 2nd cube on the same city.
          <br/>
          <strong>Conversion!</strong> With 2 cubes on a size-2 city, it converts. Remove the rival's city tile and replace it with yours. Their army in the city is expelled (moved one hex away). The city joins your empire — Angry, but yours.`
        },
        {
          heading: 'Protecting Your Cities from Conversion',
          body: `Your own cities can be converted by rivals too! To defend:
          <br/><br/>
          <ul>
            <li><strong>Place your own cubes</strong> on your cities — rival cubes can\'t convert a city as long as your cubes outnumber theirs</li>
            <li><strong>Build a Temple</strong> (Culture I advancement) — removes a rival cube from any adjacent city once per Age</li>
            <li><strong>Research Nationalism</strong> (Government III) — makes your cities immune to conversion while you hold this card</li>
          </ul>
          <br/>
          When a rival places a cube on your city, you and the rival now have competing stacks. <strong>The culture that reaches the city-size number first wins</strong> — so speed matters.`,
          warning: 'A size-3 city (3 structures) requires 3 cubes to convert. But a rival placing 2 cubes on your unguarded city is an urgent threat. React immediately — even one defensive cube of your own resets the race.'
        }
      ]
    },

    // ── Chapter 12 ─────────────────────────────────────────────────────────
    {
      title: 'The Status Phase',
      icon: '📊',
      steps: [
        {
          heading: 'When Does the Status Phase Trigger?',
          body: `After all players have taken their turns in a round, that round ends. After a set number of rounds (usually 3), the Age ends and the <strong>Status Phase</strong> begins.
          <br/><br/>
          The Status Phase is a multi-step administrative sequence that happens between Ages. It's when you collect resources, score objectives, research a bonus advancement, and prepare for the next Age.
          <br/><br/>
          Think of it as a "halftime" — the game pauses for bookkeeping, then continues more intense than before.`,
          tip: 'Plan your turns with the Status Phase in mind. If you\'re 1 Ideas short of a research attempt, try to grab that Ideas before the round ends — you\'ll lose momentum if you have to wait an entire Age.'
        },
        {
          heading: 'Status Phase Steps',
          body: `Resolve these steps in order, with all players completing each step before moving on:
          <br/><br/>
          <ol>
            <li>🎯 <strong>Score Objectives</strong> — reveal and score any completed Objective Cards; gain their VP</li>
            <li>💰 <strong>Collect Resources</strong> — each Happy or Neutral city produces its resource (Angry cities produce nothing)</li>
            <li>📚 <strong>Free Advancement</strong> — each player may attempt to research one advancement for free (pay Ideas cost, roll dice, but no Gold cost)</li>
            <li>🃏 <strong>Draw Cards</strong> — shuffle played action cards back into your deck; draw back to hand size</li>
            <li>😊 <strong>Resolve Mood</strong> — Angry cities become Neutral; Neutral cities remain; Happy cities stay Happy</li>
            <li>⏭️ <strong>Advance Age</strong> — move the Age marker forward; draw and resolve the Event Card for the new Age</li>
          </ol>`,
        },
        {
          heading: 'Objective Cards',
          body: `At game start, each player draws <strong>3 Objective Cards</strong> kept secret. These are scored during the Status Phase:
          <br/><br/>
          Example objectives:
          <ul>
            <li><em>"Control 3 cities"</em> — score 3 VP if you have 3+ cities right now</li>
            <li><em>"Have 6 Gold in your stockpile"</em> — score 2 VP if you currently hold 6+ Gold</li>
            <li><em>"Own a Tier 3 advancement"</em> — score 4 VP if you have researched any Tier 3 technology</li>
          </ul>
          <br/>
          Each objective can only be scored <strong>once</strong>. Once you score it, discard it and draw a replacement if any remain in the deck.
          <br/><br/>
          Objectives are crucial — a player who consistently meets their objectives every Status Phase gains a massive VP advantage.`,
          tip: 'Keep your objectives in mind when making decisions. If your objective is "control 3 cities" and you\'re at 2, prioritise founding over researching that cool Tier 3 tech.'
        }
      ]
    },

    // ── Chapter 13 ─────────────────────────────────────────────────────────
    {
      title: 'Winning the Game',
      icon: '🏆',
      steps: [
        {
          heading: 'End Game Trigger',
          body: `The game ends at the conclusion of the <strong>final Age</strong> (Age 6 in Standard, Age 4 in Short). When the last Age\'s Status Phase is complete, the game moves into Final Scoring.
          <br/><br/>
          Some Event Cards can also trigger an early end-game — for example, a "Great Plague" or "Age of Conquest" event may advance the Age marker faster, compressing the game. Stay alert to the Event Deck!`,
          tip: 'In the final Age, shift your priorities toward scoring. Researching a Tier 3 tech in Age 6 might be too slow to matter — converting that Advance action into a city founding or structure build might yield more VP.'
        },
        {
          heading: 'Final Scoring',
          body: `After the final Status Phase, score all VP sources:
          <br/><br/>
          <ol>
            <li>🏙️ <strong>Cities</strong> — 1 VP per city you control</li>
            <li>🏛️ <strong>Structures</strong> — 1 VP per structure across all your cities</li>
            <li>📚 <strong>Advancements</strong> — some advancements print VP values; add them up</li>
            <li>🎭 <strong>Culture Track</strong> — VP equal to your current Culture Track position</li>
            <li>📜 <strong>Remaining Objectives</strong> — score any unscored objectives you still hold if they\'re currently met</li>
            <li>🏆 <strong>Wonders</strong> — each Wonder you control is worth a printed VP value (usually 4–8 VP)</li>
          </ol>
          <br/>
          Total all sources. The highest VP wins!`,
          example: 'Example Final Score: 4 Cities (4 VP) + 7 Structures (7 VP) + Advancements (Philosophy III = 3 VP, Democracy = 2 VP) + Culture Track position 5 (5 VP) + 1 Wonder (6 VP) + Objectives scored during game (8 VP) = 35 VP total.'
        },
        {
          heading: 'A Final Word — And Good Luck!',
          body: `You now know the fundamentals of Clash of Cultures! To recap the core loop:
          <br/><br/>
          <ol>
            <li>🚀 <strong>Expand</strong> — found cities, explore the map</li>
            <li>📚 <strong>Advance</strong> — research tech that unlocks powerful buildings and abilities</li>
            <li>🏙️ <strong>Build</strong> — grow your cities with structures for more production</li>
            <li>⚔️ <strong>Contest</strong> — fight or culturally convert rivals for their cities</li>
            <li>🎯 <strong>Score</strong> — meet objectives each Age and end the game with the most VP</li>
          </ol>
          <br/>
          Every game tells a different story. Good luck, and may your civilization endure the ages!`,
          tip: 'Ready to jump in? Head back to the Setup menu, configure your solo match against the Intelligent Barbarian Opponent (IBO), and put your knowledge to the test!'
        }
      ]
    }
  ];

  // ── Navigation state ─────────────────────────────────────────────────────
  let currentChapter = $state(0);
  let currentStep = $state(0);

  const currentChapterData = $derived(chapters[currentChapter]);
  const currentStepData = $derived(currentChapterData.steps[currentStep]);
  const totalSteps = $derived(currentChapterData.steps.length);
  const isFirst = $derived(currentChapter === 0 && currentStep === 0);
  const isLast = $derived(
    currentChapter === chapters.length - 1 &&
    currentStep === chapters[chapters.length - 1].steps.length - 1
  );

  // Track highest unlocked step per chapter for the progress dots
  const completedSteps = $derived.by(() => {
    const visited: Record<number, number> = {};
    visited[currentChapter] = currentStep;
    return visited;
  });

  function nextStep() {
    if (currentStep < totalSteps - 1) {
      currentStep++;
    } else if (currentChapter < chapters.length - 1) {
      currentChapter++;
      currentStep = 0;
    }
    scrollToContent();
  }

  function prevStep() {
    if (currentStep > 0) {
      currentStep--;
    } else if (currentChapter > 0) {
      currentChapter--;
      currentStep = chapters[currentChapter].steps.length - 1;
    }
    scrollToContent();
  }

  function goToChapter(idx: number) {
    currentChapter = idx;
    currentStep = 0;
    scrollToContent();
  }

  function scrollToContent() {
    // Smooth scroll back to top of content area on step change
    if (typeof window !== 'undefined') {
      const el = document.getElementById('tutorial-content-top');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Overall progress as a percentage
  const overallProgress = $derived.by(() => {
    let total = 0;
    let done = 0;
    chapters.forEach((ch, ci) => {
      ch.steps.forEach((_, si) => {
        total++;
        if (ci < currentChapter || (ci === currentChapter && si <= currentStep)) done++;
      });
    });
    return Math.round((done / total) * 100);
  });
</script>

<div class="tutorial-shell">
  <!-- ── Top Bar ─────────────────────────────────────────────────────────── -->
  <header class="tutorial-header">
    <div class="tutorial-header-inner">
      <div class="tutorial-brand">
        <span class="tutorial-book-icon">📖</span>
        <div>
          <div class="tutorial-title-label">How to Play</div>
          <div class="tutorial-subtitle-label">Clash of Cultures</div>
        </div>
      </div>

      <div class="tutorial-progress-wrap">
        <div class="tutorial-progress-bar-bg">
          <div
            class="tutorial-progress-bar-fill"
            style="width: {overallProgress}%"
          ></div>
        </div>
        <span class="tutorial-progress-pct">{overallProgress}% complete</span>
      </div>

      <button class="btn-exit-tutorial" onclick={onExit}>
        ← Back to Setup
      </button>
    </div>
  </header>

  <div class="tutorial-body">
    <!-- ── Chapter Rail (sidebar on desktop, strip on mobile) ─────────────── -->
    <nav class="chapter-rail" aria-label="Tutorial chapters">
      {#each chapters as chapter, idx}
        <button
          class="chapter-rail-item {idx === currentChapter ? 'active' : ''} {idx < currentChapter ? 'done' : ''}"
          onclick={() => goToChapter(idx)}
          aria-label="Go to chapter {idx + 1}: {chapter.title}"
        >
          <span class="chapter-rail-icon">{chapter.icon}</span>
          <span class="chapter-rail-label">
            <span class="chapter-num">Ch. {idx + 1}</span>
            <span class="chapter-name">{chapter.title}</span>
          </span>
          {#if idx < currentChapter}
            <span class="chapter-done-tick">✓</span>
          {/if}
        </button>
      {/each}
    </nav>

    <!-- ── Main Content Area ──────────────────────────────────────────────── -->
    <main class="tutorial-main" id="tutorial-content-top">

      <!-- Chapter heading -->
      <div class="chapter-heading-row">
        <span class="chapter-badge">{currentChapterData.icon} Chapter {currentChapter + 1} of {chapters.length}</span>
        <h2 class="chapter-title">{currentChapterData.title}</h2>

        <!-- Step dots -->
        <div class="step-dots" aria-label="Steps in this chapter">
          {#each currentChapterData.steps as _, si}
            <button
              class="step-dot {si === currentStep ? 'active' : ''} {si < currentStep ? 'done' : ''}"
              onclick={() => { currentStep = si; scrollToContent(); }}
              aria-label="Go to step {si + 1}"
            ></button>
          {/each}
        </div>
      </div>

      <!-- Step content card -->
      <article class="step-card">
        <h3 class="step-heading">{currentStepData.heading}</h3>
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        <div class="step-body">{@html currentStepData.body}</div>

        {#if currentStepData.example}
          <div class="step-example">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html currentStepData.example}
          </div>
        {/if}

        {#if currentStepData.tip}
          <div class="step-tip">
            <span class="step-tip-icon">💡</span>
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            <span>{@html currentStepData.tip}</span>
          </div>
        {/if}

        {#if currentStepData.warning}
          <div class="step-warning">
            <span class="step-tip-icon">⚠️</span>
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            <span>{@html currentStepData.warning}</span>
          </div>
        {/if}
      </article>

      <!-- ── Navigation Footer ───────────────────────────────────────────── -->
      <div class="tutorial-nav-footer">
        <button
          class="btn-nav btn-nav-prev"
          onclick={prevStep}
          disabled={isFirst}
          aria-label="Previous step"
        >
          ← Previous
        </button>

        <div class="nav-step-info">
          Step {currentStep + 1} of {totalSteps}
        </div>

        <button
          class="btn-nav btn-nav-next {isLast ? 'btn-nav-finish' : ''}"
          onclick={isLast ? onExit : nextStep}
          aria-label={isLast ? 'Finish tutorial' : 'Next step'}
        >
          {isLast ? '🏆 Finish Tutorial' : 'Next →'}
        </button>
      </div>
    </main>
  </div>
</div>

<style>
  /* ── Shell & Layout ─────────────────────────────────────────────────────── */
  .tutorial-shell {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: var(--canvas-bg);
    animation: fadeInTutorial 350ms ease-out;
  }

  @keyframes fadeInTutorial {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Header ─────────────────────────────────────────────────────────────── */
  .tutorial-header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: var(--glass-bg);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border-color);
    box-shadow: var(--shadow-md);
  }

  .tutorial-header-inner {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0.75rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .tutorial-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
  }

  .tutorial-book-icon {
    font-size: 1.75rem;
  }

  .tutorial-title-label {
    font-family: var(--font-heading);
    font-size: 1rem;
    font-weight: 700;
    color: var(--accent-gold);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    line-height: 1;
  }

  .tutorial-subtitle-label {
    font-size: 0.75rem;
    color: var(--text-muted);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-top: 2px;
  }

  .tutorial-progress-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .tutorial-progress-bar-bg {
    flex: 1;
    height: 6px;
    background: var(--border-color);
    border-radius: 99px;
    overflow: hidden;
  }

  .tutorial-progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-gold), var(--accent-bronze));
    border-radius: 99px;
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .tutorial-progress-pct {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-muted);
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  .btn-exit-tutorial {
    flex-shrink: 0;
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    font-family: var(--font-body);
    font-size: 0.85rem;
    font-weight: 600;
    padding: 0.5rem 1rem;
    border-radius: var(--border-radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
    white-space: nowrap;
  }

  .btn-exit-tutorial:hover {
    border-color: var(--accent-gold);
    color: var(--accent-gold);
    background: var(--accent-gold-glow);
  }

  /* ── Body (sidebar + main) ──────────────────────────────────────────────── */
  .tutorial-body {
    display: flex;
    flex: 1;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  /* ── Chapter Rail ───────────────────────────────────────────────────────── */
  .chapter-rail {
    width: 260px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 1.5rem 1rem;
    border-right: 1px solid var(--border-color);
    position: sticky;
    top: 57px; /* header height */
    height: calc(100vh - 57px);
    overflow-y: auto;
  }

  .chapter-rail-item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.6rem 0.75rem;
    border-radius: var(--border-radius-md);
    background: transparent;
    border: 1px solid transparent;
    cursor: pointer;
    color: var(--text-secondary);
    text-align: left;
    transition: all var(--transition-fast);
    width: 100%;
    position: relative;
  }

  .chapter-rail-item:hover {
    background: var(--card-bg);
    border-color: var(--border-color);
    color: var(--text-primary);
  }

  .chapter-rail-item.active {
    background: linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(168, 124, 67, 0.06));
    border-color: rgba(212, 175, 55, 0.4);
    color: var(--text-primary);
    box-shadow: 0 0 12px var(--accent-gold-glow);
  }

  .chapter-rail-item.done {
    color: var(--text-muted);
  }

  .chapter-rail-icon {
    font-size: 1.1rem;
    flex-shrink: 0;
  }

  .chapter-rail-label {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .chapter-num {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--accent-gold);
    line-height: 1;
  }

  .chapter-name {
    font-size: 0.8rem;
    font-weight: 600;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .chapter-done-tick {
    font-size: 0.75rem;
    color: var(--accent-olive);
    font-weight: 700;
    flex-shrink: 0;
  }

  /* ── Main Content ───────────────────────────────────────────────────────── */
  .tutorial-main {
    flex: 1;
    padding: 2rem 2.5rem;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* ── Chapter Heading ────────────────────────────────────────────────────── */
  .chapter-heading-row {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .chapter-badge {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--accent-gold);
    font-family: var(--font-heading);
  }

  .chapter-title {
    font-family: var(--font-heading);
    font-size: clamp(1.4rem, 3vw, 2rem);
    color: var(--text-primary);
    margin: 0;
    line-height: 1.2;
  }

  .step-dots {
    display: flex;
    gap: 0.4rem;
    align-items: center;
    margin-top: 0.25rem;
  }

  .step-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid var(--border-color);
    background: transparent;
    cursor: pointer;
    padding: 0;
    transition: all var(--transition-fast);
  }

  .step-dot.active {
    background: var(--accent-gold);
    border-color: var(--accent-gold);
    box-shadow: 0 0 8px var(--accent-gold-glow);
    transform: scale(1.25);
  }

  .step-dot.done {
    background: var(--accent-bronze);
    border-color: var(--accent-bronze);
  }

  .step-dot:hover {
    border-color: var(--accent-gold);
  }

  /* ── Step Card ──────────────────────────────────────────────────────────── */
  .step-card {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-lg);
    padding: 2rem 2.5rem;
    box-shadow: var(--shadow-md);
    position: relative;
    overflow: hidden;
    flex: 1;
  }

  .step-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--accent-gold), var(--accent-bronze));
    opacity: 0.85;
  }

  .step-heading {
    font-family: var(--font-heading);
    font-size: 1.3rem;
    color: var(--text-primary);
    margin: 0 0 1.25rem 0;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--border-color);
  }

  .step-body {
    font-size: 0.95rem;
    line-height: 1.75;
    color: var(--text-secondary);
  }

  .step-body :global(ul),
  .step-body :global(ol) {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .step-body :global(li) {
    color: var(--text-secondary);
  }

  .step-body :global(strong) {
    color: var(--text-primary);
    font-weight: 700;
  }

  /* ── Example callout ────────────────────────────────────────────────────── */
  .step-example {
    margin-top: 1.5rem;
    background: linear-gradient(135deg, rgba(212, 175, 55, 0.08), rgba(168, 124, 67, 0.04));
    border: 1px solid rgba(212, 175, 55, 0.25);
    border-left: 4px solid var(--accent-gold);
    border-radius: var(--border-radius-md);
    padding: 1.25rem 1.5rem;
    font-size: 0.9rem;
    line-height: 1.7;
    color: var(--text-secondary);
  }

  .step-example :global(strong) {
    color: var(--text-primary);
  }

  /* ── Tip callout ────────────────────────────────────────────────────────── */
  .step-tip {
    margin-top: 1.25rem;
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    background: rgba(140, 160, 100, 0.08);
    border: 1px solid rgba(140, 160, 100, 0.2);
    border-radius: var(--border-radius-md);
    padding: 1rem 1.25rem;
    font-size: 0.88rem;
    line-height: 1.65;
    color: var(--text-secondary);
  }

  .step-warning {
    margin-top: 1.25rem;
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    background: rgba(190, 80, 60, 0.08);
    border: 1px solid rgba(190, 80, 60, 0.25);
    border-radius: var(--border-radius-md);
    padding: 1rem 1.25rem;
    font-size: 0.88rem;
    line-height: 1.65;
    color: var(--text-secondary);
  }

  .step-tip-icon {
    font-size: 1.1rem;
    flex-shrink: 0;
    margin-top: 1px;
  }

  /* ── Navigation Footer ──────────────────────────────────────────────────── */
  .tutorial-nav-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .btn-nav {
    font-family: var(--font-heading);
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    padding: 0.7rem 1.5rem;
    border-radius: var(--border-radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
    border: 1px solid var(--border-color);
    background: var(--card-bg);
    color: var(--text-primary);
    min-width: 140px;
  }

  .btn-nav:hover:not(:disabled) {
    border-color: var(--accent-gold);
    color: var(--accent-gold);
    background: var(--accent-gold-glow);
  }

  .btn-nav:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .btn-nav-next {
    background: linear-gradient(135deg, var(--accent-gold), var(--accent-bronze));
    color: hsl(220, 15%, 8%);
    border-color: transparent;
    box-shadow: 0 4px 15px var(--accent-gold-glow);
  }

  .btn-nav-next:hover:not(:disabled) {
    filter: brightness(1.1);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px var(--accent-gold-glow);
    color: hsl(220, 15%, 8%);
  }

  .btn-nav-finish {
    background: linear-gradient(135deg, hsl(140, 50%, 38%), hsl(140, 40%, 28%));
    color: white;
    border-color: transparent;
    box-shadow: 0 4px 15px rgba(80, 160, 80, 0.3);
  }

  .btn-nav-finish:hover:not(:disabled) {
    filter: brightness(1.12);
    transform: translateY(-1px);
    color: white;
  }

  .nav-step-info {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
    text-align: center;
  }

  /* ── Mobile Responsive ──────────────────────────────────────────────────── */
  @media (max-width: 900px) {
    .tutorial-body {
      flex-direction: column;
    }

    .chapter-rail {
      width: 100%;
      height: auto;
      position: static;
      flex-direction: row;
      overflow-x: auto;
      overflow-y: hidden;
      padding: 0.75rem 1rem;
      gap: 0.4rem;
      border-right: none;
      border-bottom: 1px solid var(--border-color);
      scrollbar-width: none;
    }

    .chapter-rail::-webkit-scrollbar { display: none; }

    .chapter-rail-item {
      flex-direction: column;
      align-items: center;
      text-align: center;
      min-width: 60px;
      padding: 0.5rem 0.5rem;
      gap: 0.2rem;
    }

    .chapter-rail-label {
      align-items: center;
    }

    .chapter-name {
      display: none;
    }

    .chapter-done-tick {
      position: absolute;
      top: 2px;
      right: 4px;
      font-size: 0.6rem;
    }

    .tutorial-main {
      padding: 1.25rem 1rem;
    }

    .step-card {
      padding: 1.25rem 1rem;
    }

    .tutorial-header-inner {
      gap: 0.75rem;
      padding: 0.6rem 1rem;
    }

    .tutorial-subtitle-label {
      display: none;
    }

    .tutorial-progress-pct {
      display: none;
    }

    .btn-exit-tutorial {
      font-size: 0.75rem;
      padding: 0.4rem 0.7rem;
    }
  }

  @media (max-width: 500px) {
    .btn-nav {
      min-width: 100px;
      padding: 0.6rem 0.8rem;
      font-size: 0.8rem;
    }

    .chapter-title {
      font-size: 1.2rem;
    }
  }
</style>
