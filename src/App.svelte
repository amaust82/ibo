<script lang="ts">
  import { iboStore } from './stores/iboStore.svelte';
  import GameToken from './lib/components/GameToken.svelte';
  import SetupWizard from './lib/components/SetupWizard.svelte';
  import GameTutorial from './lib/components/GameTutorial.svelte';
  import DiceRoller from './lib/components/DiceRoller.svelte';
  import type { EventIcon, ResourceType, StructureType, CityMood, IboState } from './lib/ibo-engine/types';

  // Svelte 5 Runes for Theme State
  let isDark = $state(true);

  // Tutorial view state (fully decoupled from game state)
  let showTutorial = $state(false);
  
  // Custom manual logging message
  let customLogMsg = $state('');

  // Save slot naming state
  let showSaveModal = $state(false);
  let saveCampaignName = $state('');

  // Contextual Help tooltips visible state
  let activeTooltip = $state<string | null>(null);
  let showRulesReference = $state(false);
  let selectedAdvance = $state<string | null>(null);

  // Status Phase Modal walkthrough state
  let showStatusModal = $state(false);
  let activeStatusStep = $state(1);
  let scoredObjectiveVp = $state(0);
  let statusPhaseResearchResult = $state<any>(null);

  function toggleTooltip(name: string) {
    if (activeTooltip === name) {
      activeTooltip = null;
    } else {
      activeTooltip = name;
    }
  }

  function handleStatusPhaseAdvance() {
    if (iboStore.state) {
      statusPhaseResearchResult = iboStore.executeAdvance();
    }
  }

  function handleStatusPhaseComplete() {
    if (scoredObjectiveVp > 0) {
      iboStore.addObjectiveVp(scoredObjectiveVp);
    }
    iboStore.nextAge();
    showStatusModal = false;
    activeStatusStep = 1;
    scoredObjectiveVp = 0;
    statusPhaseResearchResult = null;
  }

  // Dynamic Solo Mentor Guide logic
  function getMentorAdvice(state: IboState): { title: string; desc: string; step: string; rules: string[] } {
    const isRoundDone = state.currentAction >= state.maxActionsPerTurn;
    const latestLog = state.actionLog.length > 0 ? state.actionLog[state.actionLog.length - 1] : "";
    
    // Step 1: Initial Event Icon drawing
    if (state.currentAction === 0 && !isRoundDone) {
      return {
        title: "Draw Event Card 🎴",
        desc: "Draw a physical event card from the deck. Select the corresponding symbol in the **Event Card Solvers** panel to resolve it.",
        step: "Step 1: Draw Event",
        rules: [
          "Draw a physical event card from the Clash of Cultures main deck.",
          "Examine the icons at the bottom of the card (e.g. Advance, Recruit, Construct).",
          "If multiple icons exist, they must be resolved from left to right. Select the first solver icon on the screen."
        ]
      };
    }
    
    // Step 2: Next Actions in progress
    if (!isRoundDone) {
      if (latestLog.includes("[ADVANCE]:")) {
        return {
          title: "Advance Resolved - Scale Shift 📜",
          desc: "The IBO rolled for an advancement. Look at the technology unlocked and slide the corresponding building onto the Scale.",
          step: "Step 2: Research Tech",
          rules: [
            "Roll 3 dice on your tabletop and enter them in the app's Dice Roller card.",
            "The app evaluates combinations matching category priorities (Checking slots 1-4, government unlocks, then fallback checks).",
            "Identify the app's researched tech and place the unlocked building piece (e.g., Temple) at the lowest empty slot (0 to 7) of the Scale Tracker.",
            "If the app triggers a fallback, resolve a Recruit action instead of researching."
          ]
        };
      }
      
      if (latestLog.includes("[RECRUIT]:") || latestLog.includes("recruit")) {
        return {
          title: "Recruit Action Active ⚔️",
          desc: "The IBO resolves military recruits. Gather army units and deploy them in IBO borders.",
          step: "Step 2: Recruit Armies",
          rules: [
            "Gather IBO infantry/cavalry/ship pieces to deploy on your tabletop board.",
            "Place 1 new unit in each active IBO city, following reverse city-track order (City B, then City A) as resource limits allow.",
            "Ensure army sizes do not exceed 4 units per space (or city limit constraints).",
            "If Vikings or specialized maritime technologies are active, recruit Ships in sea areas/ports."
          ]
        };
      }
 
      if (latestLog.includes("Constructed") || latestLog.includes("Construct")) {
        return {
          title: "Construct Action Active 🧱",
          desc: "The IBO constructs a building structure piece. Remove it from scale slot 0 and place it on board.",
          step: "Step 2: Place Building",
          rules: [
            "Identify the target city (e.g., City A) and structure piece (e.g., Temple) specified in the app's Last Action box.",
            "Take that exact building piece from slot 0 on the app's Scale Tracker.",
            "Place the building inside the target city on your tabletop board.",
            "Slide all remaining building pieces on the scale one slot left (slot 1 moves to 0, slot 2 moves to 1, etc.) to keep the queue packed.",
            "Increase that city's size counter by 1 on your tabletop. Note that Angry cities block constructs."
          ]
        };
      }
 
      if (latestLog.includes("Founded") || latestLog.includes("Found")) {
        return {
          title: "Found City Active 🏛️",
          desc: "The IBO expands its empire. Place a Settlement piece on the board.",
          step: "Step 2: Found Settlement",
          rules: [
            "Take the left-most Settlement piece from slot 0 on the IBO's scale.",
            "Place it on the board on a hex adjacent to an existing city, choosing a hex matching the app's production type.",
            "Slide all remaining scale pieces one slot left to pack the vacant slots.",
            "Initialize the new city as size 1 (Neutral mood)."
          ]
        };
      }
 
      if (latestLog.includes("[ATTACK]:") || latestLog.includes("Attack")) {
        return {
          title: "Attack Action Active 🛡️",
          desc: "IBO forces mobilize and march towards your borders. Initiate battle if they collide.",
          step: "Step 2: Mobilize Armies",
          rules: [
            "IBO armies move towards the closest player army, settler, or city within their Land/Naval Aggression Range.",
            "If they enter the same hex as your units, initiate combat immediately on your tabletop.",
            "Roll combat dice and play action/leader cards according to battle rules.",
            "Note: Celts and Aztecs trigger specialized combat plundering VPs."
          ]
        };
      }
 
      if (latestLog.includes("[INFLUENCE]:") || latestLog.includes("Influence")) {
        return {
          title: "Influence Culture Active 🏺",
          desc: "The IBO attempts to exert cultural pressure on adjacent cities. Roll d6 on tabletop.",
          step: "Step 2: Cultural Influence",
          rules: [
            "Locate the IBO city attempting influence and target an adjacent player city.",
            "Roll a d6 on your tabletop to resolve the attempt.",
            "Success: place 1 custom influence cube of the IBO's color on that city space.",
            "Mesoamerican civs (like Maya/Aztecs) get proselytism range/roll overrides."
          ]
        };
      }
 
      return {
        title: "Resolve Event Solver ⚡",
        desc: "Check the current event symbol on your card. Click one of the Solver buttons (Advance, Recruit, Construct, Influence, Attack) to resolve it in the app and update trackers.",
        step: "Step 2: Resolve Symbol",
        rules: [
          "Check the event symbol shown on your drawn card.",
          "Click the matching solver button on the screen.",
          "Wait for the app to resolve prioritized rolls and output the tabletop steps."
        ]
      };
    }
    
    // Step 3: Turn Complete - Cleanups
    if (isRoundDone) {
      if (state.currentRound < 3) {
        return {
          title: "Round Complete ✨",
          desc: "All active actions for this round are complete! Perform standard tabletop cleanup, verify all IBO pieces match the digital trackers, and then click **'Next Turn / Next Round'**.",
          step: "Step 3: End of Round",
          rules: [
            "Ensure the app's resource counters match your physical board.",
            "Check that IBO cities and structure sizes are identical to the digital Active Cities Tracker.",
            "Clear card selections and click Next Turn / Next Round to increment rounds."
          ]
        };
      } else {
        return {
          title: "Age Complete - Status Phase 👑",
          desc: `You have completed all 3 Rounds of Age ${state.currentAge}. Click **'Resolve Status Phase'** to launch the interactive Status Phase walkthrough modal.`,
          step: "Step 3: Status Phase",
          rules: [
            "You have completed all 3 Rounds of the current Age!",
            "Click the 'Resolve Status Phase' button to trigger the app's interactive step-by-step Status Phase walkthrough.",
            "The app will automatically roll and resolve the IBO's free technology research in Step 2 of the modal."
          ]
        };
      }
    }
    
    return {
      title: "Tactical Planning 🧠",
      desc: "Observe the IBO's scale queues and counter limits to plan your strategic responses.",
      step: "Guide active",
      rules: [
        "Monitor the IBO's scale piece order (slots closest to 0 are founded or constructed first).",
        "Block IBO constructs by attacking and making their cities Angry.",
        "Check specialized leader attributes in the solo overlays to anticipate defense/combat modifiers."
      ]
    };
  }

  function handleSaveMatch() {
    if (saveCampaignName.trim()) {
      iboStore.saveCurrentGameAs(saveCampaignName.trim());
      showSaveModal = false;
    }
  }

  const LEADER_TRAITS: Record<string, { title: string; desc: string }> = {
    'Julius Caesar': {
      title: 'Legion Command',
      desc: 'Rome\'s armies gain +1 combat strength when invading cities or crossing borders during ATTACK actions.'
    },
    'Leonidas': {
      title: 'Phalanx Defense',
      desc: 'When defending IBO settlements, Leonidas ignores the first infantry casualty resolved in combat.'
    },
    'Qin Shi Huang': {
      title: 'Great Wall Overseer',
      desc: 'The IBO gains +1 Gold whenever a CONSTRUCT action adds a Fortress or Temple structure.'
    },
    'Ragnar Lodbrok': {
      title: 'Sea King Raid',
      desc: 'IBO ships can transport armies up to 3 spaces and plunder coastal settlement areas (+1 Gold).'
    },
    'Montezuma': {
      title: 'Sun God Captives',
      desc: 'Sacrifice any defeated player/barbarian unit to immediately gain +1 Gold or pacify an Angry city.'
    },
    'Hammurabi': {
      title: 'Code of Laws',
      desc: 'When a Status Phase research roll results in a fallback, Babylonia gains +1 Idea instead of Recruiting.'
    },
    'Hannibal Barca': {
      title: 'Elephant Charge',
      desc: 'Carthage\'s armies gain +1 combat die during battle rolls if they contain War Elephant units.'
    },
    'Boudica': {
      title: 'Druidic Revolt',
      desc: 'Fierce combat plundering allows the Celts to gain +1 Gold whenever an army defeats an enemy.'
    },
    'Cleopatra': {
      title: 'Nile Prosperity',
      desc: 'When founding cities or constructing Port structures along waterways, Cleopatra immediately generates +1 Food.'
    },
    'Attila': {
      title: 'Scourge of God',
      desc: 'Huns ignore standard terrain movement penalties when launching tactical cavalry sweeps into empty zones.'
    },
    'Ashoka': {
      title: 'Dharma Spreads',
      desc: 'When resolving INFLUENCE actions, Ashoka can place culture cubes at +1 range (up to 2 hexes away).'
    },
    'Oda Nobunaga': {
      title: 'Feudal Shogunate',
      desc: 'Defending samurai armies ignore combat terrain penalties in forests, mountains, or marsh areas.'
    },
    'Pacal the Great': {
      title: 'Astronomical Alignment',
      desc: 'Whenever the IBO researches a technology in the Science or Traditions category, generate +1 Idea.'
    },
    'Cyrus the Great': {
      title: 'Imperial Immortals',
      desc: 'Immortals army regiments gain +1 movement space during standard physical battlefield maneuvers.'
    },
    'Hiram I': {
      title: 'Maritime Traders',
      desc: 'Phoenicia generates +1 Gold whenever constructing Port structures or Settlements on coastal water spaces.'
    }
  };

  const ADVANCE_IBO_EFFECTS: Record<string, string> = {
    // Agriculture
    'Farming': 'Unlocks agricultural tiles. Standard pre-researched technology base.',
    'Irrigation': 'IBO harvesting yields +1 Food when cities are situated on river networks.',
    'Storage': 'Raises solo resource limits, granting +1 Action point threshold in transitions.',
    'Crop Rotation': 'Upgrades farm systems to generate +1 Food during harvesting rounds.',
    // Construction
    'Mining': 'Unlocks mountain resource extraction. Standard pre-researched technology base.',
    'Roads': 'Land movement speed and tactical mobilization is increased by +1 space.',
    'Engineering': 'IBO armies can cross major river boundaries without spending movement points.',
    'Architecture': 'Allows immediate queues. founding/constructing shifts scale queue elements.',
    // Maritime
    'Fishing': 'Unlocks Port structure placements. IBO earns +1 Food on coastal tiles.',
    'Sailing': 'Enables recruitment of ship pieces. Ships can navigate up to 2 spaces.',
    'Navigation': 'Armies can navigate deep ocean tiles without suffering transport attrition.',
    'Warships': 'IBO ship fleets receive +1 combat strength during naval engagements.',
    // Education
    'Writing': 'Unlocks Academy structure. Generates +1 Idea during research events.',
    'Philosophy': 'Earns Victory Points from city size. Fallbacks resolve with +1 Idea.',
    'Free Education': 'Decreases scientific overhead, generating +1 Idea during Status Phase.',
    'Public Education': 'Spreads solo enlightenment, generating passive Victory Points.',
    // Warfare
    'Tactics': 'Unlocks Fortress structure. IBO armies ignore first terrain penalty in battle.',
    'Steel Weapons': 'Aggressive infantry armies deal +1 damage on combat rolls of 5 or 6.',
    'Siegecraft': 'Fortress combat defense bonuses are neutralized when IBO attacks cities.',
    'Fortification': 'Increases city defense limits. Attacking player suffers -1 combat strength.',
    // Spirituality
    'Myths': 'Unlocks Temple structure. Pacifies 1 Angry city for free when researched.',
    'Priesthood': 'Allows priests to spread cultural influence at increased range.',
    'State Religion': 'Adds +1 Victory Point per Temple built on the tabletop board.',
    'Rituals': 'Generates +1 Gold from ceremonies when constructing temples.',
    // Economy
    'Bartering': 'Unlocks Market structure. Converts resources at a standard 2:1 ratio.',
    'Currency': 'Standardizes trade routes, generating +1 Gold during harvesting.',
    'Trade Routes': 'Earns bonus Gold and Food when adjacent to player cities.',
    'Taxation': 'Taxes active cities, generating +1 Gold per size 3+ city.',
    // Traditions
    'Arts': 'Unlocks Obelisk structure. Culture spreading is enhanced.',
    'Law': 'Maintains peace. Angry cities are pacified at half resource costs.',
    'Circus & Sports': 'Raises city mood. City size limits are expanded by 1 globally.',
    'Monuments': 'IBO gains +2 Victory Points for each Obelisk built.',
    // Science
    'Math': 'Unlocks Observatory structure. Passive science rolls receive +1 modifier.',
    'Astronomy': 'Calculates stars, yielding +1 Idea during solar advance roll events.',
    'Medicine': 'Reduces military casualties. Defeated armies revive 1 unit for free.',
    'Metallurgy': 'Speeds up resource extraction, yielding +1 Ore in mountain ranges.',
    // Democracy
    'Democracy': 'Establish voting blocks. The IBO city happiness increases to Happy.',
    'Civil Liberties': 'Grants passive defense. Cities ignore angry mood locks.',
    'Representation': 'Adds +1 Victory Point per size 2+ city founded by the IBO.',
    'Voting': 'Improves state transitions. Resolves fallbacks by gaining 1 resource of choice.',
    // Autocracy
    'Autocracy': 'Dictatorial command. Active army caps are increased from 4 to 5.',
    'Forced Labor': 'Enforces speed constructs. Sacrifices city happiness for a free building.',
    'Absolute Power': 'Armies deal +1 casualty during offensive combat actions.',
    'Propaganda': 'Negates player influence cubes placed on IBO cities.',
    // Theocracy
    'Theocracy': 'Spiritual government. Priests function as army commanders in battle.',
    'Dogma': 'Ignores player cultural advancements. Spreads influence at double rate.',
    'Conversion': 'Converts 1 player culture cube back to the IBO color each round.',
    'Fanaticism': 'IBO army units fight to the death, ignoring tactical retreat options.',
    // Civilization specific rules
    'Longships': 'Vikings longships constructed. Free Ship recruit and increased naval range.',
    'Provinces': 'Provinces established. Gained 1 free agricultural advance.',
    'Imperial Roads': 'Gained 1 free Gold after constructing a building.',
    'Sprawling': 'China sprawling activated. Founded 1 free city.',
    'Captives': 'Aztecs captives active. Captured units generate resource currency (+1 Gold).',
    'Human Sacrifice': 'Aztecs Human Sacrifice active. Gains combat advantage adjacent to temples.',
    'Ziggurats': 'Babylonia Ziggurats active. Free CONSTRUCT and +1 Idea triggered.',
    'Star Catalogues': 'Babylonia Star Catalogues passive active. Gained +1 Idea.',
    'Mercenaries': 'Carthage Mercenaries active. Triggered local Barbarian Mobilization!',
    'Hegemony': 'Carthage Hegemony active. Sea lanes secured (+1 Gold).',
    'Druidic Influence': 'Celts Druidic Influence active. Gains cultural action options.',
    'Tribal Warfare': 'Celts Tribal Warfare active. Plundered +1 Gold after combat wins.',
    'Architecture-Egypt': 'Egypt Architecture active. Free CONSTRUCT action resolved.',
    'Embalming': 'Egypt Embalming active. Gained +1 Idea from combat preserves.',
    'Nomads': 'Huns Nomads active. Settlements placed on slots 0, 1, 3, and 5.',
    'Hunnic Tribes': 'Huns Hunnic Tribes active. Gained +1 Idea.',
    'Proselytism': 'India Proselytism active. Cultural influence range increased by 1.',
    'Indian Elephants': 'India Indian Elephants active. Mobilized elephants during recruits.',
    'Shogunate': 'Japan Shogunate government active. Positions for defensive maneuvers.',
    'Pottery': 'Japan Pottery active. Gained +1 Gold from agrarian storage.',
    'Terracing': 'Maya Terracing active. Configured terraced agriculture.',
    'Stelas': 'Maya Stelas active. Gained +1 Idea.',
    'Immortals': 'Persia Immortals active. Gained +1 Gold from frontline maneuvers.',
    'Zoroastrianism': 'Persia Zoroastrianism active. Spiritual overlays activated (+1 VP).',
    'Alphabet': 'Phoenicia Alphabet active. Gained +1 Idea.',
    'Cedars & Dyes': 'Phoenicia Cedars & Dyes active. Gained +1 Gold from luxury exports.'
  };

  // Toggle Theme Logic
  function toggleTheme() {
    isDark = !isDark;
  }

  // Effect to synchronize theme classes with the document root
  $effect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('theme-dark');
      root.classList.remove('theme-light');
    } else {
      root.classList.add('theme-light');
      root.classList.remove('theme-dark');
    }
  });

  // Resource key conversions
  const resourceIcons: Record<ResourceType, 'gold' | 'food' | 'ideas' | 'wood' | 'ore'> = {
    Gold: 'gold',
    Food: 'food',
    Ideas: 'ideas',
    Wood: 'wood',
    Ore: 'ore'
  };

  // Convert StructureType to match GameToken name exactly
  function getStructureTokenName(structure: StructureType): any {
    if (structure === 'Settlement') return 'settlement';
    if (structure === 'Temple') return 'temple';
    if (structure === 'Fortress') return 'fortress';
    if (structure === 'Port') return 'port';
    if (structure === 'Academy') return 'academy';
    if (structure === 'Market') return 'market';
    if (structure === 'Obelisk') return 'obelisk';
    if (structure === 'Observatory') return 'observatory';
    return 'settlement';
  }

  // Custom log posting
  function handlePostCustomLog() {
    if (customLogMsg.trim()) {
      iboStore.log(`[USER NOTE]: ${customLogMsg.trim()}`);
      customLogMsg = '';
    }
  }

  // Reference binding for visual dice roller triggers
  let diceRollerRef = $state<any>(null);

  // Event handler for event buttons
  function handleEventIcon(icon: EventIcon) {
    if (icon === 'Advance' && diceRollerRef) {
      diceRollerRef.triggerExternalRoll(true);
    } else if (icon === 'CivSpecific' && iboStore.state?.civilization) {
      const civ = iboStore.state.civilization;
      // Romans, Greeks, and Chinese prefer Advance. Vikings prefer Recruit.
      if (civ !== 'Vikings' && diceRollerRef) {
        iboStore.log(`[Civ Specific Action]: Performing preferred ADVANCE action for ${civ}.`);
        diceRollerRef.triggerExternalRoll(true);
      } else {
        iboStore.resolveEventIcon(icon);
      }
    } else {
      iboStore.resolveEventIcon(icon);
    }
  }

  // Add a structure manually to scale helper
  let selectedManualStructure = $state<StructureType>('Settlement');
  function handleAddStructureToScale() {
    iboStore.addStructureToScale(selectedManualStructure);
  }

  // City founding configuration state
  let newCityProd = $state<ResourceType>('Food');
  function handleFoundCity() {
    const nextChar = String.fromCharCode(65 + (iboStore.state?.cities.length || 0));
    iboStore.executeFoundCity(`City ${nextChar}`, newCityProd);
  }

  // Translate low-level logs to high-level plain English tabletop summaries
  function translateLogToPlainEnglish(logs: string[]): string {
    if (!logs || logs.length === 0) return "No actions performed yet. Setup a match to begin!";
    
    let latestLog = logs[logs.length - 1];
    
    // Strip user note prefix
    if (latestLog.startsWith('[USER NOTE]:')) {
      return `✍️ **User Note added**: "${latestLog.replace('[USER NOTE]:', '').trim()}"`;
    }
    
    // Skip system/undo/save/load, resource spent, and transition banners to locate the actual gameplay action
    let index = logs.length - 1;
    while (index >= 0 && (
      logs[index].includes('--- Entered') || 
      logs[index].includes('Turn Completed') ||
      logs[index].includes('[UNDO]:') ||
      logs[index].includes('[SAVE]:') ||
      logs[index].includes('[LOAD]:') ||
      logs[index].includes('[DELETE]:') ||
      logs[index].includes('[INFLUENCE]: Player influence') ||
      logs[index].includes('[INFLUENCE]: IBO influence') ||
      logs[index].includes('[MILITARY]: Barbarian armies') ||
      logs[index].includes('Resource added:') ||
      logs[index].includes('Resource spent:') ||
      logs[index].includes('Logs Cleared.')
    )) {
      index--;
    }
    if (index >= 0) {
      latestLog = logs[index];
    }
    
    let text = "";
    
    if (latestLog.includes('[ADVANCE]:')) {
      const match = latestLog.match(/advancement (.*?)(?: \(|$)/);
      const adv = match ? match[1] : 'a new technology';
      text = `📜 The IBO researched the **${adv}** advancement and added the unlocked structure piece to its Scale Tracker queue.`;
    } else if (latestLog.includes('[ADVANCE FALLBACK]:')) {
      text = `🎲 The IBO rolled for an Advance, but hit a category fallback. It executed a **Recruit** action instead.`;
    } else if (latestLog.includes('[RECRUIT]:')) {
      text = `⚔️ The IBO resolved a **Recruit** action, mobilizing its military forces across all active cities.`;
    } else if (latestLog.includes('Constructed') && latestLog.includes('in City')) {
      const match = latestLog.match(/Constructed (.*?) in (City [A-Z])/);
      if (match) {
        text = `🧱 The IBO constructed a **${match[1]}** in **${match[2]}**, expanding the city limits.`;
      } else {
        text = `🧱 The IBO constructed a structure in its city, shifting the Scale Tracker.`;
      }
    } else if (latestLog.includes('Founded new city:')) {
      const match = latestLog.match(/Founded new city: (City [A-Z])/);
      const cityName = match ? match[1] : 'a new city';
      text = `🏛️ The IBO founded **${cityName}** on the board. Take a Settlement piece from slot 0 on the scale and place it on the board.`;
    } else if (latestLog.includes('[ATTACK]:')) {
      text = `🛡️ The IBO triggered an **Attack** event. Move the nearest IBO armies towards your borders/units to initiate combat.`;
    } else if (latestLog.includes('[INFLUENCE]:')) {
      text = `🏺 The IBO resolved an **Influence** event, attempting to expand its cultural dominance.`;
    } else if (latestLog.includes('[Event Icon Triggered]:')) {
      const match = latestLog.match(/Triggered\]: (.*?)$/);
      const icon = match ? match[1] : 'an action';
      text = `⚡ The IBO resolved a drawn **${icon}** event card icon.`;
    } else if (latestLog.includes('[Vikings - Longships]')) {
      text = `⛵ **Vikings unique rule triggered**: Longships researched! The IBO got a free Ship RECRUIT and increased Naval Range.`;
    } else if (latestLog.includes('[Rome - Provinces]')) {
      text = `🏛️ **Rome unique rule triggered**: Provinces researched! The IBO gained a free Agricultural advancement.`;
    } else if (latestLog.includes('[Rome - Imperial Roads]')) {
      text = `🛣️ **Rome unique rule triggered**: Gained 1 free Gold after constructing a building.`;
    } else if (latestLog.includes('[China - Sprawling]')) {
      text = `🇨🇳 **China unique rule triggered**: Sprawling researched! The IBO founded a free City.`;
    } else if (latestLog.includes('[Aztecs - Captives]')) {
      text = `☀️ **Aztecs unique rule triggered**: IBO captured defeated units and spent them as resource currency (+1 Gold).`;
    } else if (latestLog.includes('[Aztecs - Human Sacrifice]')) {
      text = `☀️ **Aztecs unique rule triggered**: Human Sacrifice researched! IBO gains combat advantage when fighting in or adjacent to its temples.`;
    } else if (latestLog.includes('[Babylonia - Ziggurats]')) {
      text = `📐 **Babylonia unique rule triggered**: Ziggurats researched! Triggered free CONSTRUCT action and +1 Idea.`;
    } else if (latestLog.includes('[Babylonia - Star Catalogues]')) {
      text = `📐 **Babylonia unique rule triggered**: Star Catalogues passive triggered: gained 1 Idea.`;
    } else if (latestLog.includes('[Carthage - Mercenaries]')) {
      text = `🐘 **Carthage unique rule triggered**: Mercenaries active. Triggered local Barbarian Mobilization!`;
    } else if (latestLog.includes('[Carthage - Hegemony]')) {
      text = `🐘 **Carthage unique rule triggered**: Hegemony active. Sea lanes secured (+1 Gold).`;
    } else if (latestLog.includes('[Celts - Druidic Influence]')) {
      text = `🍀 **Celts unique rule triggered**: Druidic Influence researched. Solo opponent now gains cultural options.`;
    } else if (latestLog.includes('[Celts - Tribal Warfare]')) {
      text = `🍀 **Celts unique rule triggered**: Plundered resources after successful combat (+1 Gold).`;
    } else if (latestLog.includes('[Egypt - Architecture]')) {
      text = `☥ **Egypt unique rule triggered**: Architecture researched! Performing free CONSTRUCT action.`;
    } else if (latestLog.includes('[Egypt - Embalming]')) {
      text = `☥ **Egypt unique rule triggered**: Embalming active. Gained 1 Idea from historical combat preserves.`;
    } else if (latestLog.includes('[Huns - Nomads]')) {
      text = `🏹 **Huns unique rule triggered**: Nomadic setup applied. Settlements placed on Scale slots 0, 1, 3, and 5.`;
    } else if (latestLog.includes('[Huns - Hunnic Tribes]')) {
      text = `🏹 **Huns unique rule triggered**: Hunnic Tribes researched! Gained 1 Idea.`;
    } else if (latestLog.includes('[India - Proselytism]')) {
      text = `🕉️ **India unique rule triggered**: Proselytism researched! Influence Culture range increased by 1 globally.`;
    } else if (latestLog.includes('[India - Indian Elephants]')) {
      text = `🕉️ **India unique rule triggered**: Armed war elephants mobilized during Recruit action.`;
    } else if (latestLog.includes('[Japan - Shogunate]')) {
      text = `⛩️ **Japan unique rule triggered**: Shogunate government established! Tactically positioned for local defensive maneuvers.`;
    } else if (latestLog.includes('[Japan - Pottery]')) {
      text = `⛩️ **Japan unique rule triggered**: Gained +1 Gold from agrarian storage post advancement.`;
    } else if (latestLog.includes('[Maya - Terracing]')) {
      text = `🌴 **Maya unique rule triggered**: Terracing active. Terraced agriculture configured.`;
    } else if (latestLog.includes('[Maya - Stelas]')) {
      text = `🌴 **Maya unique rule triggered**: Monumental Stela constructed! Gained +1 Idea.`;
    } else if (latestLog.includes('[Persia - Immortals]')) {
      text = `🦁 **Persia unique rule triggered**: Immortals active. Gained +1 Gold from operational frontlines.`;
    } else if (latestLog.includes('[Persia - Zoroastrianism]')) {
      text = `🦁 **Persia unique rule triggered**: Zoroastrian spiritual overlays activated (+1 VP).`;
    } else if (latestLog.includes('[Phoenicia - Alphabet]')) {
      text = `⛵ **Phoenicia unique rule triggered**: Alphabet researched! Gained 1 Idea.`;
    } else if (latestLog.includes('[Phoenicia - Cedars & Dyes]')) {
      text = `⛵ **Phoenicia unique rule triggered**: Cedars & Dyes active. Gained +1 Gold from luxury exports.`;
    } else {
      text = `🤖 **IBO Turn Action**: ${latestLog}`;
    }

    // Convert markdown **bold** to html <strong> tags
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }

  // Derived state to check if round actions are fully resolved
  let isRoundComplete = $derived(
    iboStore.state ? iboStore.state.currentAction >= iboStore.state.maxActionsPerTurn : false
  );
</script>

<header class="hero-header">
  <div class="container flex justify-between align-center">
    <div style="text-align: left;">
      <h1>Clash of Cultures</h1>
      <div class="hero-subtitle">Intelligent Barbarian Opponent Companion</div>
    </div>
    
    <!-- Premium Tactile Theme Switcher -->
    <button 
      class="theme-switch-container" 
      onclick={toggleTheme}
      aria-label="Toggle visual theme"
      style="background: none; border: none; cursor: pointer; text-align: inherit; padding: 0;"
    >
      <span class="theme-switch-label">{isDark ? 'Obsidian Dark' : 'Imperial Parchment'}</span>
      <div class="theme-switch"></div>
    </button>
  </div>
</header>

<main class="container">
  {#if showTutorial}
    <!-- Standalone How to Play Tutorial -->
    <GameTutorial onExit={() => showTutorial = false} />
  {:else if iboStore.state === null}
    <!-- Initialization Setup Wizard -->
    <SetupWizard onTutorial={() => showTutorial = true} />
  {:else}
    <!-- Active Game Tactical Dashboard (Grid with row-by-row structure) -->
    <div class="dashboard-grid">
      
      <!-- ================= GAME STATUS ROW ================= -->
      <div class="status-row-grid">
        <!-- Game State Status Header Card -->
        <div class="panel status-card flex flex-col gap-sm" style="margin: 0;">
          <div class="flex justify-between align-start border-bottom pb-sm">
            <div>
              <span class="gold-subtitle">Active Solo Match</span>
              <h2 style="font-family: var(--font-heading); font-size: 1.35rem; margin: 0; line-height: 1.2;">
                {iboStore.state.civilization} Empire
              </h2>
            </div>
            
            <div class="flex gap-xs" style="display: flex; align-items: center; gap: 0.5rem;">
              <button class="btn btn-secondary" onclick={() => { saveCampaignName = iboStore.slots.find(s => s.id === iboStore.activeSlotId)?.name || ''; showSaveModal = true; }} style="border-color: var(--accent-gold); color: var(--accent-gold); font-size: 0.75rem; padding: 0.35rem 0.65rem; font-weight: 700; white-space: nowrap; min-height: unset; height: fit-content; margin: 0; font-family: var(--font-heading);">
                💾 Save Match
              </button>
              <button class="btn btn-reset" onclick={() => { if(confirm('Exit match? Your active campaign will remain saved.')) iboStore.clearGame(); }}>
                Exit Match
              </button>
            </div>
          </div>

          <div class="grid grid-cols-4 gap-xs status-meta-grid">
            <div class="status-meta-item" style="padding: 0.35rem 0.15rem;">
              <span class="meta-label" style="font-size: 0.65rem;">Diff</span>
              <span class="meta-value" style="font-size: 0.85rem;">{iboStore.state.difficulty}</span>
            </div>
            <div class="status-meta-item" style="padding: 0.35rem 0.15rem;">
              <span class="meta-label" style="font-size: 0.65rem;">Age</span>
              <span class="meta-value" style="font-size: 0.85rem;">{iboStore.state.currentAge}</span>
            </div>
            <div class="status-meta-item" style="padding: 0.35rem 0.15rem;">
              <span class="meta-label" style="font-size: 0.65rem;">Round</span>
              <span class="meta-value" style="font-size: 0.85rem;">{iboStore.state.currentRound} / 3</span>
            </div>
            <div class="status-meta-item" style="padding: 0.35rem 0.15rem;">
              <span class="meta-label" style="font-size: 0.65rem;">Action</span>
              <span class="meta-value" style="font-size: 0.85rem;">{iboStore.state.currentAction} / {iboStore.state.maxActionsPerTurn}</span>
            </div>
          </div>

          <!-- Turn / Action progression -->
          <div class="action-progress-box flex flex-col gap-xs">
            <div class="flex justify-between font-sm">
              <span style="font-size: 0.75rem; font-weight: 600;">Actions resolved this Round:</span>
              <span class="accent-color" style="font-size: 0.75rem; font-weight: 700;">
                {iboStore.state.currentAction} / {iboStore.state.maxActionsPerTurn}
              </span>
            </div>
            <div class="progress-bar-bg">
              <div 
                class="progress-bar-fill" 
                style="width: {Math.min((iboStore.state.currentAction / iboStore.state.maxActionsPerTurn) * 100, 100)}%"
              ></div>
            </div>
          </div>

          <!-- Leader command badge -->
          {#if iboStore.state.leadersEnabled && iboStore.state.leaderName}
            {@const leaderName = iboStore.state.leaderName}
            {@const trait = LEADER_TRAITS[leaderName] || { title: 'Signature Leader', desc: 'Active solo leader tactical overlay.' }}
            <div class="leader-command-badge flex flex-col gap-xxs" style="border: 1px solid rgba(212, 175, 55, 0.4); background: linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(168, 124, 67, 0.03) 100%); border-radius: var(--border-radius-md); padding: 0.6rem 0.75rem; text-align: left; margin-top: 0.25rem; box-shadow: 0 2px 10px rgba(212, 175, 55, 0.05);">
              <div class="flex justify-between align-center" style="display: flex; align-items: center; justify-content: space-between;">
                <span style="font-size: 0.7rem; font-weight: 700; color: var(--accent-gold); text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 0.25rem;">👑 Leader Active</span>
                <span style="font-family: var(--font-heading); font-weight: 700; font-size: 0.9rem; color: var(--text-primary);">{leaderName}</span>
              </div>
              <div class="border-top" style="border-color: rgba(212, 175, 55, 0.15); margin-top: 0.2rem; padding-top: 0.2rem;">
                <span style="font-weight: 700; font-size: 0.75rem; color: var(--text-primary); display: block;">Tactical Trait: {trait.title}</span>
                <span style="font-size: 0.7rem; color: var(--text-muted); line-height: 1.3; display: block; margin-top: 0.1rem;">{trait.desc}</span>
              </div>
            </div>
          {/if}
        </div>

        <!-- Boardless Campaign Tracker Card -->
        <div class="panel status-card flex flex-col gap-sm" style="margin: 0; background: linear-gradient(135deg, var(--card-bg-elevated) 0%, rgba(212, 175, 55, 0.03) 100%); border-color: rgba(212, 175, 55, 0.15);">
          <div class="flex justify-between align-start border-bottom pb-sm">
            <div>
              <span class="gold-subtitle">Boardless Play State</span>
              <h2 style="font-family: var(--font-heading); font-size: 1.35rem; margin: 0; line-height: 1.2;">
                Tabletop Tracker
              </h2>
            </div>
          </div>

          <div class="flex flex-col gap-md" style="margin-top: 0.25rem;">
            <!-- IBO Influence on Player Cities -->
            <div class="flex justify-between align-center">
              <div class="flex flex-col text-left" style="min-width: 0;">
                <span class="font-sm" style="font-weight: 700; color: var(--accent-gold); font-size: 0.85rem;">🏺 IBO Culture on You</span>
                <span class="font-xs" style="color: var(--text-muted); font-size: 0.7rem; line-height: 1.2;">IBO influence cubes placed on your cities.</span>
              </div>
              <div class="flex align-center gap-xs">
                <button class="btn btn-secondary counter-btn" style="width: 26px; height: 26px; font-size: 0.8rem; padding: 0; min-height: unset;" onclick={() => iboStore.updateIboInfluenceOnPlayer(-1)}>-</button>
                <span style="font-size: 1.15rem; font-weight: 800; min-width: 20px; text-align: center;">{iboStore.state.iboInfluenceOnPlayer || 0}</span>
                <button class="btn btn-secondary counter-btn" style="width: 26px; height: 26px; font-size: 0.8rem; padding: 0; min-height: unset;" onclick={() => iboStore.updateIboInfluenceOnPlayer(1)}>+</button>
              </div>
            </div>

            <!-- Barbarian Armies Defeated -->
            <div class="flex justify-between align-center border-top pt-xs" style="border-color: var(--border-color); margin-top: 0.25rem;">
              <div class="flex flex-col text-left" style="min-width: 0;">
                <span class="font-sm" style="font-weight: 700; color: var(--accent-gold); font-size: 0.85rem;">⚔️ Barbarians Defeated</span>
                <span class="font-xs" style="color: var(--text-muted); font-size: 0.7rem; line-height: 1.2;">Number of barbarian armies eliminated.</span>
              </div>
              <div class="flex align-center gap-xs">
                <button class="btn btn-secondary counter-btn" style="width: 26px; height: 26px; font-size: 0.8rem; padding: 0; min-height: unset;" onclick={() => iboStore.updateBarbariansDefeated(-1)}>-</button>
                <span style="font-size: 1.15rem; font-weight: 800; min-width: 20px; text-align: center;">{iboStore.state.barbariansDefeated || 0}</span>
                <button class="btn btn-secondary counter-btn" style="width: 26px; height: 26px; font-size: 0.8rem; padding: 0; min-height: unset;" onclick={() => iboStore.updateBarbariansDefeated(1)}>+</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= LAST IBO RESOLUTION ALERT BOX (SPAN FULL ROW BELOW STATUS) ================= -->
      {#if iboStore.state.actionLog.length > 0}
        {@const logs = iboStore.state.actionLog}
        <div class="panel last-action-banner span-full flex flex-col gap-sm">
          <div class="flex justify-between align-center border-bottom pb-xs">
            <span class="gold-subtitle" style="display: flex; align-items: center; gap: 0.35rem;">
              📢 Last Action Summary
            </span>
            <span class="meta-label" style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">
              Action {iboStore.state.currentAction} / {iboStore.state.maxActionsPerTurn} Resolved
            </span>
          </div>
          
          <div class="flex align-center gap-md py-xs">
            <div class="last-action-icon-badge">🤖</div>
            <div class="flex flex-col" style="text-align: left; flex: 1; min-width: 0;">
              <span class="last-action-highlight">{@html translateLogToPlainEnglish(logs)}</span>
              {#if logs.length > 0}
                <span class="last-action-subtext">Technical Log: {logs[logs.length - 1]}</span>
              {/if}
            </div>
          </div>
        </div>
      {/if}

      <!-- ================= TUTORIAL MENTOR GUIDE (IF ACTIVE) ================= -->
      {#if iboStore.state.tutorialMode}
        {@const advice = getMentorAdvice(iboStore.state)}
        <div class="panel mentor-guide-banner span-full flex flex-col gap-sm">
          <div class="flex justify-between align-center border-bottom pb-xs" style="border-color: rgba(18,18,18,0.15);">
            <span class="gold-subtitle" style="display: flex; align-items: center; gap: 0.35rem;">
              🎓 Solo Mentor Guide ({advice.step})
            </span>
            <button class="btn btn-secondary" style="font-size: 0.65rem; padding: 0.25rem 0.5rem;" onclick={() => iboStore.toggleTutorialMode()}>
              Disable Guide
            </button>
          </div>
          
          <div class="flex align-center gap-md py-xs">
            <div class="last-action-icon-badge" style="border-color: var(--accent-gold); font-size: 1.5rem; background-color: rgba(212,175,55,0.05);">💡</div>
            <div class="flex flex-col" style="text-align: left; flex: 1; min-width: 0;">
              <span class="last-action-highlight" style="color: var(--text-primary); font-size: 1.05rem; font-weight: 700;">{advice.title}</span>
              <span class="last-action-subtext" style="color: var(--text-muted); font-size: 0.85rem; font-style: normal; margin-top: 0.25rem; line-height: 1.4;">
                {@html advice.desc.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
              </span>
            </div>
          </div>

          <!-- Expandable Tabletop Steps checklist -->
          <div class="border-top pt-xs flex flex-col gap-xs" style="border-color: rgba(18,18,18,0.15); margin-top: 0.5rem; text-align: left;">
            <button 
              class="btn btn-secondary font-sm flex align-center justify-between" 
              style="width: 100%; border-color: rgba(18,18,18,0.25); color: #121212; padding: 0.35rem 0.6rem; font-weight: 700; background-color: rgba(255,255,255,0.15);"
              onclick={() => showRulesReference = !showRulesReference}
            >
              <span>{showRulesReference ? '📖 Hide Tabletop Rules Guide' : '📖 Show Tabletop Rules Guide'}</span>
              <span style="font-size: 0.6rem;">{showRulesReference ? '▲' : '▼'}</span>
            </button>

            {#if showRulesReference}
              <div class="flex flex-col gap-xxs" style="animation: tooltipFadeIn 200ms ease-out; margin-top: 0.25rem;">
                <span class="font-xs" style="font-weight: 700; font-size: 0.75rem; text-transform: uppercase; color: #5b4512;">Tabletop Action Directives:</span>
                {#each advice.rules as rule, idx}
                  <div class="flex align-start gap-xs font-xs" style="line-height: 1.3; font-size: 0.75rem; padding: 0.15rem 0; border-bottom: 1px dashed rgba(18,18,18,0.08);">
                    <span style="font-weight: 700; color: #5b4512;">{idx + 1}.</span>
                    <span style="color: #222222; flex: 1;">{rule}</span>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      {/if}

      <!-- ================= EVENT SOLVERS & ROLLER ROW (TWO COLUMNS ON DESKTOP) ================= -->
      <div class="solvers-and-roller-row">
        <!-- Event Action Card Solver Panel -->
        <div class="panel event-solver-panel flex flex-col gap-md" style="margin: 0; height: 100%;">
          <div class="flex justify-between align-start" style="position: relative; width: 100%;">
            <div class="panel-header-desc">
              <h3 style="display: flex; align-items: center; gap: 0.35rem; margin: 0;">
                Event Card Solvers
                <button class="tooltip-btn" onclick={() => toggleTooltip('Solvers')} aria-label="Solvers Info">?</button>
              </h3>
              <p class="flavor-desc" style="margin: 0.25rem 0 0 0;">Click the corresponding icon to resolve drawn Event Card actions.</p>
            </div>
            <button class="btn btn-secondary btn-undo-event" onclick={() => iboStore.undo()} style="border-color: var(--accent-gold); color: var(--accent-gold); font-size: 0.85rem; padding: 0.35rem 0.6rem; white-space: nowrap; display: flex; align-items: center; gap: 0.25rem;">
              ↩️ Undo
            </button>

            {#if activeTooltip === 'Solvers'}
              <div class="glass-tooltip-overlay">
                <div class="flex justify-between align-center border-bottom pb-xs" style="margin-bottom: 0.4rem; border-color: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: space-between;">
                  <strong style="color: var(--accent-gold); font-size: 0.85rem; text-align: left;">🎓 Event Card Solver Guide</strong>
                  <button class="close-tooltip-btn" onclick={() => activeTooltip = null} style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.1rem; line-height: 1; padding: 0;">&times;</button>
                </div>
                <p class="font-xs" style="font-size: 0.75rem; line-height: 1.4; color: var(--text-muted); margin: 0; text-align: left; white-space: normal;">
                  Event cards drawn from your tabletop deck drive the solo opponent's turn. Look at the symbols at the bottom of the card and click the matching solver icon here. Svelte resolves state priority rolls automatically.
                </p>
              </div>
            {/if}
          </div>

          <div class="grid grid-cols-3 gap-sm">
            <button class="btn btn-action {isRoundComplete ? 'disabled-action' : ''}" onclick={() => handleEventIcon('Advance')} disabled={isRoundComplete}>
              <span class="action-icon">📜</span>
              <span class="action-label">Advance</span>
            </button>

            <button class="btn btn-action {isRoundComplete ? 'disabled-action' : ''}" onclick={() => handleEventIcon('Recruit')} disabled={isRoundComplete}>
              <span class="action-icon">⚔️</span>
              <span class="action-label">Recruit</span>
            </button>

            <button class="btn btn-action {isRoundComplete ? 'disabled-action' : ''}" onclick={() => handleEventIcon('Construct')} disabled={isRoundComplete}>
              <span class="action-icon">🧱</span>
              <span class="action-label">Construct</span>
            </button>

            <button class="btn btn-action {isRoundComplete ? 'disabled-action' : ''}" onclick={() => handleEventIcon('Influence')} disabled={isRoundComplete}>
              <span class="action-icon">🏺</span>
              <span class="action-label">Influence</span>
            </button>

            <button class="btn btn-action {isRoundComplete ? 'disabled-action' : ''}" onclick={() => handleEventIcon('Attack')} disabled={isRoundComplete}>
              <span class="action-icon">🛡️</span>
              <span class="action-label">Attack</span>
            </button>

            <button class="btn btn-action btn-action-civ {isRoundComplete ? 'disabled-action' : ''}" onclick={() => handleEventIcon('CivSpecific')} disabled={isRoundComplete}>
              <span class="action-icon">👑</span>
              <span class="action-label">Civ Rule</span>
            </button>
          </div>

          <!-- Fallback and Bypass actions -->
          <div class="flex gap-sm border-top pt-md">
            <button class="btn btn-secondary flex-grow" style="font-size: 0.8rem;" onclick={() => { iboStore.executeRecruit(); iboStore.consumeAction(); }} disabled={isRoundComplete}>
              ⚠️ Action Blocked (Recruit)
            </button>
            <button class="btn btn-secondary" style="font-size: 0.8rem;" onclick={() => iboStore.consumeAction()} disabled={isRoundComplete}>
              ⏭️ Skip
            </button>
          </div>

          <!-- Round & Age Transitions (Consolidated controls) -->
          {#if isRoundComplete}
            <div class="flex gap-sm border-top pt-md flex-col">
              {#if iboStore.state.currentRound < 3}
                <button class="btn btn-primary btn-next-age" onclick={() => iboStore.nextRound()} style="width: 100%; padding: 0.75rem; font-family: var(--font-heading); font-weight: 700;">
                  Next Turn / Next Round (Round {iboStore.state.currentRound} → {iboStore.state.currentRound + 1})
                </button>
              {:else}
                <div class="age-complete-notice flex flex-col gap-sm">
                  <div class="age-complete-alert text-center font-sm" style="background-color: rgba(212, 175, 55, 0.1); border: 1px solid var(--accent-gold); padding: 0.6rem; border-radius: var(--border-radius-sm); color: var(--accent-gold); font-weight: 600;">
                    ✨ All 3 Rounds completed in Age {iboStore.state.currentAge}! Resolve Status Phase on tabletop.
                  </div>
                  <button class="btn btn-primary btn-next-age" onclick={() => { showStatusModal = true; activeStatusStep = 1; }} style="width: 100%; padding: 0.75rem; font-family: var(--font-heading); font-weight: 700;">
                    Resolve Status Phase & Next Age
                  </button>
                </div>
              {/if}
            </div>
          {/if}
        </div>

        <!-- Advance Solver Component (Dice Roller) -->
        <DiceRoller bind:this={diceRollerRef} />
      </div>

      <!-- ================= SECOND ROW: SCALE (FULL WIDTH) ================= -->
      <div class="panel scale-tracker-panel flex flex-col gap-md span-full">
        <div class="flex justify-between align-center" style="position: relative; width: 100%;">
          <div>
            <h3 style="font-size: 1.15rem; display: flex; align-items: center; gap: 0.35rem; margin: 0;">
              Scale Tracker Queue
              <button class="tooltip-btn" onclick={() => toggleTooltip('Scale')} aria-label="Scale Info">?</button>
            </h3>
            <p class="flavor-desc" style="margin: 0.25rem 0 0 0;">Slots 0 to 7. Founding/Constructing takes pieces from left to right.</p>
          </div>

          {#if activeTooltip === 'Scale'}
            <div class="glass-tooltip-overlay">
              <div class="flex justify-between align-center border-bottom pb-xs" style="margin-bottom: 0.4rem; border-color: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: space-between;">
                <strong style="color: var(--accent-gold); font-size: 0.85rem; text-align: left;">🎓 Scale Tracker Guide</strong>
                <button class="close-tooltip-btn" onclick={() => activeTooltip = null} style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.1rem; line-height: 1; padding: 0;">&times;</button>
              </div>
              <p class="font-xs" style="font-size: 0.75rem; line-height: 1.4; color: var(--text-muted); margin: 0; text-align: left; white-space: normal;">
                This queue tracks settlements and unlocked buildings waiting to enter play. Take pieces from left to right when resolving founding and constructing. New advancements automatically add building structures to the lowest empty index.
              </p>
            </div>
          {/if}
          
          <!-- Manual scale structure insert -->
          <div class="flex align-center gap-xs">
            <select class="form-select font-sm" style="padding: 0.25rem 1.5rem 0.25rem 0.5rem;" bind:value={selectedManualStructure}>
              <option value="Settlement">Settlement</option>
              <option value="Temple">Temple</option>
              <option value="Fortress">Fortress</option>
              <option value="Port">Port</option>
              <option value="Academy">Academy</option>
              <option value="Market">Market</option>
              <option value="Obelisk">Obelisk</option>
              <option value="Observatory">Observatory</option>
            </select>
            <button class="btn btn-secondary" style="font-size: 0.7rem; padding: 0.3rem 0.5rem;" onclick={handleAddStructureToScale}>
              Add
            </button>
          </div>
        </div>

        <div class="scale-slots-row">
          {#each iboStore.state.scale as slot, i}
            <div class="scale-slot-card flex flex-col align-center justify-between {slot.structure ? 'has-piece' : 'empty-slot'}" style="min-width: 44px; height: 80px; padding: 0.4rem 0.15rem;">
              <span class="slot-index">{slot.index}</span>
              
              <div class="slot-token-housing">
                {#if slot.structure}
                  <GameToken name={getStructureTokenName(slot.structure)} size={24} />
                {:else}
                  <span class="slot-empty-dot"></span>
                {/if}
              </div>

              <span class="slot-label" style="font-size: 0.6rem;">{slot.structure || 'Empty'}</span>
            </div>
          {/each}
        </div>
      </div>

      <!-- ================= THIRD ROW: ADVANCEMENTS (FULL WIDTH) ================= -->
      <div class="panel tech-panel flex flex-col gap-md span-full" style="position: relative;">
        <h3 style="font-size: 1.15rem; display: flex; align-items: center; gap: 0.35rem; margin: 0;">
          Researched Advances Catalog
          <button class="tooltip-btn" onclick={() => toggleTooltip('Tech')} aria-label="Tech Info">?</button>
        </h3>

        {#if activeTooltip === 'Tech'}
          <div class="glass-tooltip-overlay">
            <div class="flex justify-between align-center border-bottom pb-xs" style="margin-bottom: 0.4rem; border-color: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: space-between;">
              <strong style="color: var(--accent-gold); font-size: 0.85rem; text-align: left;">🎓 Technology Catalog Guide</strong>
              <button class="close-tooltip-btn" onclick={() => activeTooltip = null} style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.1rem; line-height: 1; padding: 0;">&times;</button>
            </div>
            <p class="font-xs" style="font-size: 0.75rem; line-height: 1.4; color: var(--text-muted); margin: 0; text-align: left; white-space: normal;">
              This catalog shows all advancements the solo opponent has unlocked. Advances trigger building additions to the Scale queue (e.g. Science unlocks Observatory) and activate civilization-specific passive traits in battle or founding.
            </p>
          </div>
        {/if}
        <div class="tech-grid flex flex-wrap gap-xs">
          {#if iboStore.state.advances.length === 0}
            <span class="flavor-desc" style="font-style: italic;">No advances researched yet.</span>
          {:else}
            {#each iboStore.state.advances as adv}
              <span 
                class="tech-badge" 
                style="font-size: 0.7rem; padding: 0.2rem 0.5rem;"
                role="button"
                tabindex="0"
                onmouseenter={() => selectedAdvance = adv}
                onmouseleave={() => selectedAdvance = null}
                onclick={() => selectedAdvance = adv}
                onkeydown={(e) => e.key === 'Enter' && (selectedAdvance = adv)}
              >
                📜 {adv}
              </span>
            {/each}
          {/if}
        </div>

        {#if selectedAdvance}
          <div class="tech-inspector-box flex align-center gap-sm" style="animation: tooltipFadeIn 200ms ease-out; background: rgba(255,255,255,0.03); border: 1px dashed rgba(212, 175, 55, 0.2); border-radius: var(--border-radius-md); padding: 0.75rem 1rem; margin-top: 0.5rem; text-align: left;">
            <div style="font-size: 1.5rem;">📜</div>
            <div class="flex flex-col" style="flex: 1; min-width: 0;">
              <span style="font-weight: 700; color: var(--accent-gold); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px;">Advancement Strategy</span>
              <span style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary); margin-top: 0.1rem;">{selectedAdvance}</span>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0.2rem 0 0 0; line-height: 1.4;">
                {ADVANCE_IBO_EFFECTS[selectedAdvance] || 'Active solo campaign advancement strategy overlay.'}
              </p>
            </div>
            <button class="close-tooltip-btn" onclick={() => selectedAdvance = null} style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.2rem; align-self: flex-start; padding: 0;">&times;</button>
          </div>
        {:else}
          <div class="tech-inspector-placeholder" style="font-size: 0.75rem; color: var(--text-muted); font-style: italic; margin-top: 0.75rem; text-align: left; border-top: 1px dashed rgba(255,255,255,0.05); padding-top: 0.5rem;">
            💡 Hover or tap any researched advancement badge above to inspect its specific tabletop solo rules.
          </div>
        {/if}
      </div>

      <!-- ================= FOURTH ROW: RESOURCES (FULL WIDTH) ================= -->
      <div class="panel resource-panel flex flex-col gap-md span-full" style="position: relative;">
        <h3 style="font-size: 1.15rem; display: flex; align-items: center; gap: 0.35rem; margin: 0;">
          Tactile Resource Counters
          <button class="tooltip-btn" onclick={() => toggleTooltip('Resources')} aria-label="Resources Info">?</button>
        </h3>

        {#if activeTooltip === 'Resources'}
          <div class="glass-tooltip-overlay">
            <div class="flex justify-between align-center border-bottom pb-xs" style="margin-bottom: 0.4rem; border-color: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: space-between;">
              <strong style="color: var(--accent-gold); font-size: 0.85rem; text-align: left;">🎓 Resource Counters Guide</strong>
              <button class="close-tooltip-btn" onclick={() => activeTooltip = null} style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.1rem; line-height: 1; padding: 0;">&times;</button>
            </div>
            <p class="font-xs" style="font-size: 0.75rem; line-height: 1.4; color: var(--text-muted); margin: 0; text-align: left; white-space: normal;">
              Track the IBO's accumulated assets (Gold, Food, Ideas, Wood, Ore). Adjust manually with '+' and '-' to match harvesting payouts and combat costs. Resources are consumed for specific actions like advances and constructions.
            </p>
          </div>
        {/if}
        
        <div class="grid grid-cols-5 gap-sm">
          {#each Object.entries(iboStore.state.resources) as [key, value]}
            {@const resName = key.charAt(0).toUpperCase() + key.slice(1) as ResourceType}
            <div class="res-counter-card flex flex-col align-center justify-between" style="padding: 0.5rem 0.25rem;">
              <GameToken name={resourceIcons[resName]} size={28} />
              <span class="res-title" style="font-size: 0.7rem;">{resName}</span>
              <span class="res-value" style="font-size: 1.25rem; margin: 0.1rem 0 0.35rem 0;">{value}</span>
              
              <div class="flex gap-xs width-full" style="z-index: 2;">
                <button class="btn btn-secondary counter-btn" style="min-height: 18px; font-size: 0.7rem; padding: 0.1rem 0;" onclick={() => iboStore.spendResource(resName, 1)}>-</button>
                <button class="btn btn-secondary counter-btn" style="min-height: 18px; font-size: 0.7rem; padding: 0.1rem 0;" onclick={() => iboStore.addResource(resName, 1)}>+</button>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- ================= FIFTH ROW: CITIES (FULL WIDTH) ================= -->
      <div class="panel cities-panel flex flex-col gap-md span-full">
        <div class="flex justify-between align-center" style="position: relative; width: 100%;">
          <div>
            <h3 style="font-size: 1.15rem; display: flex; align-items: center; gap: 0.35rem; margin: 0;">
              Active Cities Tracker
              <button class="tooltip-btn" onclick={() => toggleTooltip('Cities')} aria-label="Cities Info">?</button>
            </h3>
            <p class="flavor-desc" style="margin: 0.25rem 0 0 0;">Mood determines size limits (Happy +1, Angry = 1).</p>
          </div>

          {#if activeTooltip === 'Cities'}
            <div class="glass-tooltip-overlay">
              <div class="flex justify-between align-center border-bottom pb-xs" style="margin-bottom: 0.4rem; border-color: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: space-between;">
                <strong style="color: var(--accent-gold); font-size: 0.85rem; text-align: left;">🎓 Cities Tracker Guide</strong>
                <button class="close-tooltip-btn" onclick={() => activeTooltip = null} style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.1rem; line-height: 1; padding: 0;">&times;</button>
              </div>
              <p class="font-xs" style="font-size: 0.75rem; line-height: 1.4; color: var(--text-muted); margin: 0; text-align: left; white-space: normal;">
                Track the IBO's cities on board. The IBO's city size matches the number of structures built in it. Angry cities are locked to size 1, ignoring existing structures and blocking construct solver actions until pacified. Happy cities get +1 effective size.
              </p>
            </div>
          {/if}
          
          <!-- Founding controller -->
          <div class="flex align-center gap-xs">
            <select class="form-select font-sm" style="padding: 0.25rem 1.5rem 0.25rem 0.5rem;" bind:value={newCityProd}>
              <option value="Food">Food</option>
              <option value="Wood">Wood</option>
              <option value="Ore">Ore</option>
              <option value="Gold">Gold</option>
              <option value="Ideas">Ideas</option>
            </select>
            <button class="btn btn-primary" style="font-size: 0.75rem; padding: 0.35rem 0.6rem;" onclick={handleFoundCity} disabled={iboStore.state.cities.length >= 5}>
              Found
            </button>
          </div>
        </div>

        <div class="cities-grid">
          {#each iboStore.state.cities as city}
            <div class="city-card panel flex flex-col gap-sm {city.isAngry ? 'angry-card' : ''}" style="padding: 0.65rem;">
              <div class="flex justify-between align-center">
                <strong class="city-name" style="font-size: 0.85rem;">{city.name}</strong>
                <span class="city-badge-size" style="font-size: 0.65rem; padding: 0.05rem 0.4rem;">Size: {city.size}</span>
              </div>

              <!-- Structures placed inside city -->
              <div class="city-structures-list flex gap-xs flex-wrap">
                {#each city.structures as struct}
                  <span class="struct-tag flex align-center gap-xxs" style="font-size: 0.6rem; padding: 0.1rem 0.3rem;" title={struct}>
                    <GameToken name={getStructureTokenName(struct)} size={12} />
                    {struct}
                  </span>
                {/each}
              </div>

              <!-- Boardless Player Culture Track -->
              <div class="flex justify-between align-center border-top pt-xs mt-xs" style="border-color: var(--border-color);">
                <span class="font-xs" style="font-weight: 700; color: var(--accent-gold); font-size: 0.75rem; display: flex; align-items: center; gap: 0.25rem;" title="Your influence cubes placed on this IBO city.">
                  🏺 Your Culture on IBO:
                </span>
                <div class="flex align-center gap-xs">
                  <button class="btn btn-secondary counter-btn" style="width: 22px; height: 22px; font-size: 0.7rem; padding: 0; min-height: unset;" onclick={() => iboStore.updatePlayerInfluence(city.id, -1)}>-</button>
                  <span style="font-size: 0.85rem; font-weight: 800; min-width: 15px; text-align: center;">{city.playerInfluenceCount || 0}</span>
                  <button class="btn btn-secondary counter-btn" style="width: 22px; height: 22px; font-size: 0.7rem; padding: 0; min-height: unset;" onclick={() => iboStore.updatePlayerInfluence(city.id, 1)}>+</button>
                </div>
              </div>

              <!-- Mood Controls -->
              <div class="flex justify-between align-center border-top pt-xs mt-xs">
                <div class="flex gap-xxs">
                  {#each ['Happy', 'Neutral', 'Angry'] as m}
                    <button 
                      class="mood-btn {m.toLowerCase()} {city.mood === m ? 'active' : ''}" 
                      style="padding: 0.1rem 0.3rem; font-size: 0.7rem;"
                      onclick={() => iboStore.updateCityMood(city.id, m as CityMood)}
                    >
                      {m === 'Happy' ? '😊' : m === 'Neutral' ? '😐' : '😡'}
                    </button>
                  {/each}
                </div>

                <button class="btn btn-secondary" style="font-size: 0.7rem; padding: 0.2rem 0.4rem;" onclick={() => iboStore.executeConstruct(city.id)}>
                  🧱 Build
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- ================= BOTTOM ROW: CONSOLE (FULL WIDTH) ================= -->
      <div class="panel log-feed-panel flex flex-col gap-md span-full">
        <div class="flex justify-between align-center">
          <h3 style="font-size: 1.1rem; margin: 0; font-family: var(--font-heading);">Console Feed</h3>
          <button class="btn btn-secondary" style="font-size: 0.7rem; padding: 0.15rem 0.4rem;" onclick={() => { if(confirm('Clear all logs?')) { iboStore.state!.actionLog = ['Logs Cleared.']; iboStore.saveToStorage(); } }}>
            Clear Logs
          </button>
        </div>

        <!-- Action Log entries -->
        <div class="action-log-box" id="action-log-viewport" style="height: 180px;">
          {#each iboStore.state.actionLog.slice().reverse() as entry}
            <div class="log-entry">
              <span class="log-timestamp">⚔️</span>
              <span class="log-msg">{entry}</span>
            </div>
          {/each}
        </div>

        <!-- Custom User Log Addition -->
        <div class="flex gap-xs">
          <input 
            type="text" 
            class="form-input" 
            style="font-size: 0.8rem; padding: 0.45rem;"
            placeholder="Add tabletop note (e.g. 'IBO lost 1 infantry')..." 
            bind:value={customLogMsg}
            onkeydown={(e) => e.key === 'Enter' && handlePostCustomLog()}
          />
          <button class="btn btn-primary" style="padding: 0.45rem 1rem;" onclick={handlePostCustomLog}>Post Note</button>
        </div>
      </div>

    </div>

    <!-- ================= PREMIUM STATUS PHASE WALKTHROUGH MODAL ================= -->
    {#if showStatusModal}
      <div class="modal-backdrop" onclick={() => { showStatusModal = false; }} aria-hidden="true">
        <div class="modal-content" onclick={(e) => e.stopPropagation()} aria-hidden="true">
          <!-- Modal Header -->
          <div class="flex justify-between align-center border-bottom pb-sm" style="margin-bottom: 0.5rem;">
            <div>
              <span class="gold-subtitle">Status Phase Walkthrough</span>
              <h2 style="font-size: 1.4rem; margin: 0; line-height: 1.2;">
                Age {iboStore.state.currentAge} Complete
              </h2>
            </div>
            <button class="close-tooltip-btn" onclick={() => { showStatusModal = false; }} style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.5rem; line-height: 1; padding: 0;">&times;</button>
          </div>

          <!-- Wizard Step Progress Indicator -->
          <div class="flex justify-between font-xs text-muted" style="margin-top: -0.25rem;">
            <span style="font-weight: 700; color: var(--accent-gold); letter-spacing: 1px;">STEP {activeStatusStep} OF 5</span>
            <span>{Math.round((activeStatusStep / 5) * 100)}% Complete</span>
          </div>
          <div class="progress-bar-bg" style="height: 6px; margin-top: -0.5rem; background-color: var(--bg-color); border: 1px solid var(--border-color); border-radius: 100px; overflow: hidden; width: 100%;">
            <div class="progress-bar-fill" style="width: {(activeStatusStep / 5) * 100}%; height: 100%; background: linear-gradient(90deg, var(--accent-gold) 0%, var(--accent-bronze) 100%); transition: width var(--transition-normal); border-radius: 100px;"></div>
          </div>

          <!-- Step Content Container -->
          <div class="modal-step-body" style="min-height: 200px; text-align: left;">
            {#if activeStatusStep === 1}
              <!-- Step 1: Scored Objectives -->
              <div class="flex flex-col gap-sm" style="animation: tooltipFadeIn 250ms ease-out;">
                <h3 style="font-size: 1.1rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.4rem;">
                  🎯 Step 1: Scored Objectives VP
                </h3>
                <p class="flavor-desc" style="font-size: 0.85rem; margin: 0; color: var(--text-secondary);">
                  Check the physical tabletop objective cards. Did the IBO fulfill any objective conditions? For each objective card completed, the IBO scores <strong>2 Victory Points</strong>.
                </p>
                <div class="flex align-center justify-between panel-elevated" style="padding: 0.75rem 1rem; border-radius: var(--border-radius-md); border: 1px solid var(--border-color); margin-top: 0.5rem; background-color: var(--bg-color);">
                  <span style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary);">Objective VPs Scored:</span>
                  <div class="flex align-center gap-sm">
                    <button class="btn btn-secondary counter-btn" style="width: 32px; height: 32px; font-size: 1rem; padding: 0; min-height: unset;" onclick={() => scoredObjectiveVp = Math.max(0, scoredObjectiveVp - 2)}>-</button>
                    <span style="font-size: 1.3rem; font-weight: 800; min-width: 30px; text-align: center; color: var(--text-primary);">{scoredObjectiveVp}</span>
                    <button class="btn btn-secondary counter-btn" style="width: 32px; height: 32px; font-size: 1rem; padding: 0; min-height: unset;" onclick={() => scoredObjectiveVp += 2}>+</button>
                  </div>
                </div>
                <div style="font-size: 0.75rem; color: var(--text-muted); font-style: italic; margin-top: 0.25rem;">
                  Note: The average objectives scored per Age is 1 card (2 VP). Verify placement criteria on board.
                </div>
              </div>
            {:else if activeStatusStep === 2}
              <!-- Step 2: Free Advance -->
              <div class="flex flex-col gap-sm" style="animation: tooltipFadeIn 250ms ease-out;">
                <h3 style="font-size: 1.1rem; color: var(--text-primary);">
                  📜 Step 2: Automated Free Advancement
                </h3>
                <p class="flavor-desc" style="font-size: 0.85rem; margin: 0; color: var(--text-secondary);">
                  In the Status Phase, the IBO receives one free tech advancement. Click the automated roller below. The app will resolve category priorities, research the technology, add any unlocked buildings to the Scale queue, and log it to the console.
                </p>

                {#if statusPhaseResearchResult === null}
                  <button class="btn btn-primary" onclick={handleStatusPhaseAdvance} style="width: 100%; padding: 0.75rem; margin-top: 0.5rem; text-transform: uppercase;">
                    🎲 Roll Automated Tech Roll
                  </button>
                {:else}
                  <div class="panel-elevated" style="padding: 0.75rem 1rem; border-radius: var(--border-radius-md); border: 1px solid var(--accent-gold); margin-top: 0.5rem; background-color: rgba(212, 175, 55, 0.05);">
                    <div style="font-weight: 700; color: var(--accent-gold); font-size: 0.9rem; margin-bottom: 0.25rem;">Research Roll Result:</div>
                    <div style="font-size: 0.85rem; line-height: 1.4; color: var(--text-primary);">
                      🎲 Rolled Sum: <strong>{statusPhaseResearchResult.sum}</strong> (Dice: {statusPhaseResearchResult.dice.join(', ')})<br/>
                      Category Checked: <strong>{statusPhaseResearchResult.category}</strong><br/>
                      {#if statusPhaseResearchResult.fallback}
                        ⚠️ Primary category failed fallback. Executing <strong>Recruit Action</strong> instead of tech advancement!
                      {:else}
                        Unlocked: <strong>{statusPhaseResearchResult.advance}</strong>!<br/>
                        {#if statusPhaseResearchResult.structure}
                          Scale Queue Update: Added <strong>{statusPhaseResearchResult.structure}</strong> to Scale queue!
                        {/if}
                      {/if}
                    </div>
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text-muted); font-style: italic; margin-top: 0.25rem;">
                    We have updated the app's Scale Tracker and Researched Catalog. Make corresponding adjustments on your physical tabletop.
                  </div>
                {/if}
              </div>
            {:else if activeStatusStep === 3}
              <!-- Step 3: Draw Cards -->
              <div class="flex flex-col gap-sm" style="animation: tooltipFadeIn 250ms ease-out;">
                <h3 style="font-size: 1.1rem; color: var(--text-primary);">
                  🎴 Step 3: Card Draws & Maintenance
                </h3>
                <p class="flavor-desc" style="font-size: 0.85rem; margin: 0; color: var(--text-secondary);">
                  Maintain the physical action and objective cards for the players:
                </p>
                <div class="flex flex-col gap-xxs" style="margin-top: 0.25rem;">
                  <div class="flex align-start gap-xs font-sm" style="line-height: 1.4;">
                    <span style="color: var(--accent-gold); font-weight: 700;">•</span>
                    <span style="color: var(--text-primary);"><strong>Human Player:</strong> Draw 1 Action Card and 1 Objective Card from their respective decks.</span>
                  </div>
                  <div class="flex align-start gap-xs font-sm" style="line-height: 1.4;">
                    <span style="color: var(--accent-gold); font-weight: 700;">•</span>
                    <span style="color: var(--text-primary);"><strong>IBO:</strong> Draw 1 Action Card and 1 Objective Card. Keep them face down near the IBO dashboard sheet. The app resolves objective card claims.</span>
                  </div>
                  <div class="flex align-start gap-xs font-sm" style="line-height: 1.4;">
                    <span style="color: var(--accent-gold); font-weight: 700;">•</span>
                    <span style="color: var(--text-primary);"><strong>Hand Limit:</strong> Ensure the human player discards down to the hand size limit (max 7 cards unless modified by tech).</span>
                  </div>
                </div>
              </div>
            {:else if activeStatusStep === 4}
              <!-- Step 4: Pacification -->
              <div class="flex flex-col gap-sm" style="animation: tooltipFadeIn 250ms ease-out;">
                <h3 style="font-size: 1.1rem; color: var(--text-primary);">
                  😡 Step 4: City Mood Pacification
                </h3>
                <p class="flavor-desc" style="font-size: 0.85rem; margin: 0; color: var(--text-secondary);">
                  Ensure all Angry cities are pacified. This is critical as angry moods lock city size to 1, preventing construction actions.
                </p>
                <div class="flex flex-col gap-xxs" style="margin-top: 0.25rem;">
                  <div class="flex align-start gap-xs font-sm" style="line-height: 1.4;">
                    <span style="color: var(--accent-gold); font-weight: 700;">•</span>
                    <span style="color: var(--text-primary);"><strong>Human Player:</strong> Pay 1 Food or 1 Gold per city size to reset any Angry city to Neutral mood.</span>
                  </div>
                  <div class="flex align-start gap-xs font-sm" style="line-height: 1.4;">
                    <span style="color: var(--accent-gold); font-weight: 700;">•</span>
                    <span style="color: var(--text-primary);"><strong>IBO Cities:</strong> The app automatically checks if the IBO has Angry cities. The player must pay 1 resource of that city's production type to pacify it on tabletop and the app's dashboard tracker.</span>
                  </div>
                  <div class="flex align-start gap-xs font-sm" style="line-height: 1.4;">
                    <span style="color: var(--accent-gold); font-weight: 700;">•</span>
                    <span style="color: var(--text-primary);">If the IBO cannot pay, the city remains Angry! Click city mood buttons on the app's dashboard to modify active states manually.</span>
                  </div>
                </div>
              </div>
            {:else if activeStatusStep === 5}
              <!-- Step 5: Transition to Next Age -->
              <div class="flex flex-col gap-sm" style="animation: tooltipFadeIn 250ms ease-out;">
                <h3 style="font-size: 1.1rem; color: var(--text-primary);">
                  👑 Step 5: Transition to Next Age
                </h3>
                <p class="flavor-desc" style="font-size: 0.85rem; margin: 0; color: var(--text-secondary);">
                  Status Phase tasks successfully checked off! Review current VPs and prepare the boards for the next Age.
                </p>
                <div class="panel-elevated text-center" style="padding: 1rem; border-radius: var(--border-radius-md); border: 1px solid var(--border-color); margin-top: 0.5rem; background-color: var(--bg-color);">
                  <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">IBO Age Summary</span>
                  <div style="font-size: 1.3rem; font-family: var(--font-heading); font-weight: 700; margin-top: 0.25rem; color: var(--text-primary);">
                    Age {iboStore.state.currentAge} Complete → Starting Age {iboStore.state.currentAge + 1}
                  </div>
                  <div style="font-size: 0.85rem; color: var(--accent-gold); font-weight: 600; margin-top: 0.25rem;">
                    Scored Objective VPs adding to campaign: +{scoredObjectiveVp} VP
                  </div>
                </div>
              </div>
            {/if}
          </div>

          <!-- Wizard Footer Controls -->
          <div class="flex justify-between border-top pt-md" style="margin-top: 0.5rem; gap: 1rem; border-color: var(--border-color);">
            <button 
              class="btn btn-secondary" 
              style="font-size: 0.8rem; padding: 0.5rem 1rem; text-transform: uppercase;" 
              disabled={activeStatusStep === 1}
              onclick={() => activeStatusStep--}
            >
              ◀ Back
            </button>

            {#if activeStatusStep < 5}
              <button 
                class="btn btn-primary" 
                style="font-size: 0.8rem; padding: 0.5rem 1.5rem; text-transform: uppercase;" 
                disabled={activeStatusStep === 2 && statusPhaseResearchResult === null}
                onclick={() => activeStatusStep++}
              >
                Next Step ▶
              </button>
            {:else}
              <button 
                class="btn btn-primary btn-next-age" 
                style="font-size: 0.8rem; padding: 0.5rem 1.5rem; text-transform: uppercase;" 
                onclick={handleStatusPhaseComplete}
              >
                Finish Status Phase & Next Age
              </button>
            {/if}
          </div>

        </div>
      </div>
    {/if}

    <!-- ================= PREMIUM SAVE CAMPAIGN MODAL ================= -->
    {#if showSaveModal}
      <div class="modal-backdrop" onclick={() => { showSaveModal = false; }} aria-hidden="true">
        <div class="modal-content" onclick={(e) => e.stopPropagation()} aria-hidden="true" style="max-width: 420px; padding: 1.5rem;">
          <div class="flex justify-between align-center border-bottom pb-sm" style="margin-bottom: 0.5rem;">
            <div>
              <span class="gold-subtitle">Campaign Save Slot</span>
              <h2 style="font-size: 1.25rem; margin: 0; line-height: 1.2;">💾 Save Campaign Match</h2>
            </div>
            <button class="close-tooltip-btn" onclick={() => { showSaveModal = false; }} style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.5rem; line-height: 1; padding: 0;">&times;</button>
          </div>
          
          <div class="flex flex-col gap-sm" style="text-align: left; margin-top: 0.5rem;">
            <p class="flavor-desc" style="font-size: 0.85rem; color: var(--text-secondary); margin: 0; line-height: 1.4;">
              Enter a descriptive name to save your active Clash of Cultures solo campaign slot:
            </p>
            
            <input 
              type="text" 
              class="form-input" 
              style="font-size: 0.9rem; padding: 0.6rem 0.8rem; margin: 0.5rem 0 0 0; width: 100%;"
              bind:value={saveCampaignName}
              placeholder="Enter campaign slot name..."
              onkeydown={(e) => e.key === 'Enter' && handleSaveMatch()}
            />
          </div>

          <div class="flex justify-between border-top pt-md" style="margin-top: 0.5rem; gap: 1rem; border-color: var(--border-color);">
            <button class="btn btn-secondary" style="font-size: 0.8rem; padding: 0.5rem 1rem; text-transform: uppercase;" onclick={() => showSaveModal = false}>
              Cancel
            </button>
            <button class="btn btn-primary" style="font-size: 0.8rem; padding: 0.5rem 1.5rem; text-transform: uppercase;" onclick={handleSaveMatch}>
              Confirm Save
            </button>
          </div>
        </div>
      </div>
    {/if}

  {/if}
</main>

<style>
  /* Streamlined tactile dashboard row-by-row layout */
  .dashboard-grid {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-top: 1rem;
    margin-bottom: 3rem;
    width: 100%;
  }

  .status-row-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    width: 100%;
  }

  @media (max-width: 768px) {
    .status-row-grid {
      grid-template-columns: 1fr;
    }
  }

  .solvers-and-roller-row {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;
    align-items: start;
    width: 100%;
  }

  @media (max-width: 800px) {
    .solvers-and-roller-row {
      grid-template-columns: 1fr;
    }
  }

  .status-card {
    background: linear-gradient(135deg, var(--card-bg-elevated) 0%, rgba(212, 175, 55, 0.03) 100%);
    border-color: rgba(212, 175, 55, 0.15);
  }

  .gold-subtitle {
    color: var(--accent-gold);
    text-transform: uppercase;
    font-family: var(--font-heading);
    font-size: 0.75rem;
    letter-spacing: 1.5px;
    font-weight: 700;
  }

  .pb-sm {
    padding-bottom: 0.75rem;
  }

  .border-bottom {
    border-bottom: 1px solid var(--border-color);
  }

  .btn-reset {
    font-size: 0.75rem !important;
    padding: 0.35rem 0.65rem !important;
    background-color: var(--accent-crimson) !important;
    color: #ffffff !important;
    border: 1px solid var(--accent-crimson) !important;
    font-weight: 700 !important;
    box-shadow: 0 2px 8px var(--accent-crimson-glow);
    transition: all var(--transition-fast) !important;
    white-space: nowrap;
  }

  .btn-reset:hover {
    background-color: hsl(0, 58%, 45%) !important;
    border-color: hsl(0, 58%, 45%) !important;
    box-shadow: 0 4px 12px var(--accent-crimson-glow) !important;
    transform: translateY(-1px);
  }

  .btn-reset:active {
    transform: translateY(1px);
  }

  .status-meta-grid {
    margin-top: 0.5rem;
  }

  .status-meta-item {
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);
    padding: 0.5rem;
    border-radius: var(--border-radius-md);
    text-align: center;
    display: flex;
    flex-direction: column;
  }

  .meta-label {
    font-size: 0.75rem;
    color: var(--text-muted);
    font-weight: 600;
    text-transform: uppercase;
  }

  .meta-value {
    font-weight: 700;
    font-size: 1.05rem;
    color: var(--text-color);
  }

  .action-progress-box {
    margin-top: 0.5rem;
  }

  .progress-bar-bg {
    width: 100%;
    height: 8px;
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: 100px;
    overflow: hidden;
  }

  .progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-gold) 0%, var(--accent-bronze) 100%);
    box-shadow: 0 0 8px var(--accent-gold-glow);
    border-radius: 100px;
    transition: width var(--transition-normal);
  }

  .event-solver-panel {
    background-color: var(--card-bg-elevated);
  }

  .panel-header-desc h3 {
    font-family: var(--font-heading);
    margin: 0;
    font-size: 1.25rem;
  }

  .flavor-desc {
    font-size: 0.8rem;
    color: var(--text-muted);
    margin: 0.25rem 0 0 0;
    line-height: 1.4;
  }

  .btn-action {
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);
    padding: 1rem 0.5rem;
    cursor: pointer;
    border-radius: var(--border-radius-md);
    transition: all var(--transition-normal);
    color: var(--text-color);
  }

  .btn-action.disabled-action {
    opacity: 0.45;
    cursor: not-allowed !important;
    border-color: var(--border-color) !important;
    box-shadow: none !important;
    transform: none !important;
    background-color: rgba(255, 255, 255, 0.02) !important;
  }

  .btn-action:hover {
    border-color: var(--accent-gold);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--accent-gold-glow);
  }

  .btn-action-civ {
    border-color: rgba(212, 175, 55, 0.3);
    background: linear-gradient(135deg, var(--bg-color) 0%, rgba(212, 175, 55, 0.05) 100%);
  }

  .btn-action-civ:hover {
    border-color: var(--accent-gold);
    background: linear-gradient(135deg, var(--bg-color) 0%, rgba(212, 175, 55, 0.1) 100%);
  }

  .action-icon {
    font-size: 1.75rem;
  }

  .action-label {
    font-weight: 700;
    font-size: 0.85rem;
    font-family: var(--font-heading);
  }

  .pt-md {
    padding-top: 1rem;
  }

  .log-feed-panel {
    background-color: var(--card-bg-elevated);
  }

  .log-feed-panel h3 {
    font-family: var(--font-heading);
    margin: 0;
    font-size: 1.2rem;
  }

  .action-log-box {
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-md);
    padding: 0.75rem;
    height: 160px;
    overflow-y: auto;
    font-family: monospace;
    font-size: 0.8rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .log-entry {
    display: flex;
    gap: 0.4rem;
    line-height: 1.4;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.05);
    padding-bottom: 0.2rem;
  }

  .log-timestamp {
    color: var(--accent-gold);
    flex-shrink: 0;
  }

  .log-msg {
    color: var(--text-color);
    word-break: break-word;
  }

  .scale-tracker-panel {
    background-color: var(--card-bg-elevated);
  }

  .scale-tracker-panel h3 {
    font-family: var(--font-heading);
    margin: 0;
    font-size: 1.25rem;
  }

  .scale-slots-row {
    display: flex;
    gap: 0.35rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
    width: 100%;
  }

  .scale-slot-card {
    flex: 1;
    min-width: 48px;
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-md);
    padding: 0.5rem 0.25rem;
    height: 85px;
    transition: all var(--transition-normal);
  }

  .scale-slot-card.has-piece {
    border-color: var(--accent-gold);
    background: linear-gradient(180deg, var(--bg-color) 0%, rgba(212, 175, 55, 0.05) 100%);
    box-shadow: 0 0 6px var(--accent-gold-glow);
  }

  .scale-slot-card.empty-slot {
    opacity: 0.6;
    border-style: dashed;
  }

  .slot-index {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-muted);
  }

  .slot-token-housing {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
  }

  .slot-empty-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--text-muted);
  }

  .slot-label {
    font-size: 0.65rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    text-align: center;
  }

  .resource-panel {
    background-color: var(--card-bg-elevated);
  }

  .resource-panel h3 {
    font-family: var(--font-heading);
    margin: 0;
    font-size: 1.25rem;
  }

  .res-counter-card {
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-md);
    padding: 0.75rem 0.4rem;
    text-align: center;
    box-shadow: var(--shadow-sm);
    transition: border-color var(--transition-normal);
  }

  .res-counter-card:hover {
    border-color: var(--accent-gold);
  }

  .res-title {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-muted);
    margin-top: 0.25rem;
  }

  .res-value {
    font-size: 1.6rem;
    font-family: var(--font-heading);
    font-weight: 700;
    margin: 0.15rem 0 0.5rem 0;
  }

  .counter-btn {
    flex: 1;
    padding: 0.2rem 0;
    font-size: 0.75rem;
    font-weight: 700;
    line-height: 1;
    min-height: 22px;
  }

  .cities-panel {
    background-color: var(--card-bg-elevated);
  }

  .cities-panel h3 {
    font-family: var(--font-heading);
    margin: 0;
    font-size: 1.25rem;
  }

  .cities-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  @media (max-width: 600px) {
    .cities-grid {
      grid-template-columns: 1fr;
    }
  }

  .city-card {
    background-color: var(--bg-color);
    padding: 0.85rem;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-md);
  }

  .angry-card {
    border-color: var(--accent-crimson) !important;
    background: linear-gradient(135deg, var(--bg-color) 0%, rgba(154, 42, 42, 0.05) 100%);
  }

  .city-name {
    font-family: var(--font-heading);
    font-size: 0.95rem;
  }

  .city-badge-size {
    font-size: 0.75rem;
    background-color: var(--card-bg-elevated);
    padding: 0.1rem 0.5rem;
    border-radius: 100px;
    border: 1px solid var(--border-color);
    font-weight: 600;
  }

  .city-structures-list {
    margin-top: 0.25rem;
    min-height: 22px;
  }

  .struct-tag {
    font-size: 0.65rem;
    background-color: var(--card-bg-elevated);
    border: 1px solid var(--border-color);
    padding: 0.15rem 0.4rem;
    border-radius: var(--border-radius-sm);
    font-weight: 600;
  }

  .gap-xxs {
    gap: 0.2rem;
  }

  .gap-xs {
    gap: 0.5rem;
  }

  .grid-cols-5 {
    grid-template-columns: repeat(5, 1fr);
  }

  @media (max-width: 600px) {
    .grid-cols-5 {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .mood-btn {
    border: 1px solid var(--border-color);
    background: var(--card-bg-elevated);
    cursor: pointer;
    border-radius: var(--border-radius-sm);
    padding: 0.15rem 0.35rem;
    font-size: 0.75rem;
    transition: all var(--transition-fast);
  }

  .mood-btn:hover {
    border-color: var(--text-muted);
  }

  .mood-btn.happy.active {
    background-color: rgba(47, 90, 62, 0.2);
    border-color: var(--accent-growth);
  }

  .mood-btn.neutral.active {
    background-color: rgba(212, 175, 55, 0.15);
    border-color: var(--accent-gold);
  }

  .mood-btn.angry.active {
    background-color: rgba(154, 42, 42, 0.2);
    border-color: var(--accent-crimson);
  }

  .tech-panel {
    background-color: var(--card-bg-elevated);
  }

  .tech-panel h3 {
    font-family: var(--font-heading);
    margin: 0;
    font-size: 1.25rem;
  }

  .tech-badge {
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);
    font-size: 0.75rem;
    padding: 0.25rem 0.6rem;
    border-radius: 100px;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-normal);
  }

  .tech-badge:hover {
    border-color: var(--accent-gold);
    background-color: rgba(212, 175, 55, 0.05);
    box-shadow: 0 0 6px var(--accent-gold-glow);
    transform: translateY(-1px);
  }

  .tech-badge:active {
    transform: translateY(1px);
  }



  .btn-next-age {
    background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-bronze) 100%);
    box-shadow: 0 4px 15px var(--accent-gold-glow);
    font-weight: 700;
  }

  .btn-next-age:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(212, 175, 55, 0.3);
  }

  .btn-next-age:active {
    transform: translateY(1px);
  }

  .last-action-banner {
    background: linear-gradient(135deg, var(--card-bg-elevated) 0%, rgba(212, 175, 55, 0.05) 100%) !important;
    border-color: rgba(212, 175, 55, 0.2) !important;
    box-shadow: 0 4px 15px var(--accent-gold-glow) !important;
    padding: 1rem 1.25rem !important;
    position: relative;
    border-left: 4px solid var(--accent-gold) !important;
  }

  .last-action-banner::before {
    display: none !important;
  }

  .pb-xs {
    padding-bottom: 0.4rem;
  }

  .py-xs {
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
  }

  .last-action-icon-badge {
    width: 42px;
    height: 42px;
    background-color: var(--canvas-bg);
    border: 1px solid var(--border-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    box-shadow: var(--shadow-sm);
    flex-shrink: 0;
  }

  .last-action-highlight {
    font-family: var(--font-body);
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.4;
  }

  .last-action-subtext {
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-top: 0.2rem;
    font-style: italic;
  }

  /* Premium glassmorphic onboarding tooltips */
  .tooltip-btn {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: rgba(212, 175, 55, 0.15);
    border: 1px solid var(--accent-gold);
    color: var(--accent-gold);
    font-size: 0.65rem;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-fast);
    padding: 0;
    margin-left: 0.25rem;
    vertical-align: middle;
  }

  .tooltip-btn:hover {
    background-color: var(--accent-gold);
    color: #ffffff;
    box-shadow: 0 0 6px var(--accent-gold-glow);
  }

  .glass-tooltip-overlay {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: rgba(20, 20, 20, 0.95);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid var(--accent-gold);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 10px var(--accent-gold-glow);
    border-radius: var(--border-radius-md);
    padding: 0.75rem 1rem;
    z-index: 99;
    margin-top: 0.5rem;
    animation: tooltipFadeIn 250ms ease-out;
  }

  :global(.theme-light) .glass-tooltip-overlay {
    background: rgba(255, 255, 255, 0.98) !important;
    border-color: var(--accent-gold) !important;
    box-shadow: 0 8px 32px rgba(0,0,0,0.15), 0 0 6px var(--accent-gold-glow) !important;
  }

  @keyframes tooltipFadeIn {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Inverted premium mentor guide banner style to stand out */
  .mentor-guide-banner {
    position: relative;
    padding: 1rem 1.25rem !important;
    border-radius: var(--border-radius-lg);
    box-shadow: 0 8px 24px rgba(212, 175, 55, 0.25) !important;
    transition: all var(--transition-normal);
    border-left: 5px solid var(--accent-gold) !important;
    
    /* Inverted colors: Gold background, dark text in dark mode */
    background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-bronze) 100%) !important;
    color: #121212 !important;
    border-color: var(--accent-gold) !important;
  }

  .mentor-guide-banner .gold-subtitle {
    color: #5b4512 !important; /* Dark gold subtitle for contrast */
  }

  .mentor-guide-banner .last-action-highlight {
    color: #000000 !important;
  }

  .mentor-guide-banner .last-action-subtext {
    color: #222222 !important;
  }

  .mentor-guide-banner .last-action-icon-badge {
    background-color: rgba(18, 18, 18, 0.08) !important;
    border-color: rgba(18, 18, 18, 0.15) !important;
    box-shadow: none !important;
  }

  .mentor-guide-banner .btn-secondary {
    border-color: rgba(18, 18, 18, 0.25) !important;
    color: #121212 !important;
    background-color: rgba(255, 255, 255, 0.2) !important;
  }

  .mentor-guide-banner .btn-secondary:hover {
    background-color: rgba(255, 255, 255, 0.4) !important;
  }

  /* Inverted colors for Light theme: Dark background, light text */
  :global(.theme-light) .mentor-guide-banner {
    background: linear-gradient(135deg, #181818 0%, #252525 100%) !important;
    color: #f4f1ea !important;
    border-color: var(--accent-gold) !important;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35) !important;
  }

  :global(.theme-light) .mentor-guide-banner .gold-subtitle {
    color: var(--accent-gold) !important;
  }

  :global(.theme-light) .mentor-guide-banner .last-action-highlight {
    color: #ffffff !important;
  }

  :global(.theme-light) .mentor-guide-banner .last-action-subtext {
    color: #cccccc !important;
  }

  :global(.theme-light) .mentor-guide-banner .last-action-icon-badge {
    background-color: rgba(255, 255, 255, 0.05) !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
  }

  :global(.theme-light) .mentor-guide-banner .btn-secondary {
    border-color: rgba(255, 255, 255, 0.2) !important;
    color: #f4f1ea !important;
    background-color: rgba(255, 255, 255, 0.05) !important;
  }

  :global(.theme-light) .mentor-guide-banner .btn-secondary:hover {
    background-color: rgba(255, 255, 255, 0.15) !important;
  }

  .mentor-guide-banner span {
    color: #121212 !important;
  }

  .mentor-guide-banner .font-xs {
    color: #222222 !important;
  }

  :global(.theme-light) .mentor-guide-banner span {
    color: #f4f1ea !important;
  }

  :global(.theme-light) .mentor-guide-banner .font-xs {
    color: #cccccc !important;
  }

  /* Status Phase Modal Backdrop & Styling */
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(10, 10, 10, 0.8);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: modalFadeIn 250ms ease-out;
  }

  .modal-content {
    background: linear-gradient(135deg, var(--card-bg-elevated) 0%, rgba(20, 20, 20, 0.98) 100%);
    border: 1px solid rgba(212, 175, 55, 0.25);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), 0 0 20px var(--accent-gold-glow);
    border-radius: var(--border-radius-lg);
    width: 95%;
    max-width: 580px;
    padding: 1.75rem 2rem;
    position: relative;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    animation: modalScaleIn 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  :global(.theme-light) .modal-backdrop {
    background-color: rgba(244, 241, 234, 0.8);
  }

  :global(.theme-light) .modal-content {
    background: linear-gradient(135deg, var(--card-bg-elevated) 0%, rgba(255, 255, 255, 0.98) 100%) !important;
    border-color: rgba(212, 175, 55, 0.3) !important;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15), 0 0 12px var(--accent-gold-glow) !important;
  }

  .close-tooltip-btn {
    transition: all var(--transition-fast);
  }
  .close-tooltip-btn:hover {
    color: var(--accent-gold) !important;
    transform: scale(1.1);
  }

  @keyframes modalFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes modalScaleIn {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .modal-step-body {
    padding: 0.25rem 0;
  }

  .panel-elevated {
    background-color: var(--canvas-bg);
    border: 1px solid var(--border-color);
  }
</style>
