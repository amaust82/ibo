<script lang="ts">
  import { iboStore, type SaveSlot } from '../../stores/iboStore.svelte';
  import type { GameLength, DifficultyLevel, CivilizationType } from '../ibo-engine/types';

  // Wizard state with default configurations
  let selectedLength = $state<GameLength>('Standard');
  let selectedDifficulty = $state<DifficultyLevel>('Normal');
  let selectedCiv = $state<CivilizationType>('Generic');

  // Descriptions for each solo civilization
  const civDescriptions: Record<CivilizationType, { name: string; icon: string; flavor: string; trait: string }> = {
    Generic: {
      name: 'Generic Standard',
      icon: '🏛️',
      flavor: 'Base ruleset without civilization-specific overrides. Recommended for learning the basic flow of the IBO.',
      trait: 'Standard Roller priority tree.'
    },
    Rome: {
      name: 'Roman Empire',
      icon: '🛡️',
      flavor: 'Militaristic dominance. Armies move swiftly. Preferred Event Action: CONSTRUCT (ignoring exhausted lands, triggers agricultural developments).',
      trait: 'Tactical aggression and roads expansion.'
    },
    Greece: {
      name: 'Ancient Greece',
      icon: '🏺',
      flavor: 'Philosophical and artistic advancement. Spreads cultural influence seamlessly. Preferred Event Action: RECRUIT (bonus ideas from Academies).',
      trait: 'Priority on Education and Academies.'
    },
    China: {
      name: 'Imperial China',
      icon: '🏯',
      flavor: 'Architectural growth. Preferred Event Action: CONSTRUCT. Unlocks the "Sprawling" advance early, triggering automatic expansion.',
      trait: 'Massive, rapid city construction.'
    },
    Vikings: {
      name: 'Norse Raiders',
      icon: '🪓',
      flavor: 'Maritime expertise and aggressive coastal raiding. Preferred Event Action: RECRUIT. Highly active in early naval navigation and longships.',
      trait: 'Aggressive naval expansion.'
    },
    Aztecs: {
      name: 'Aztecs',
      icon: '☀️',
      flavor: 'Militaristic captive extraction. Preferred Event Action: ATTACK. Sacrifices defeated units for resource advantages and plunders borders.',
      trait: 'Captives and combat sacrifices.'
    },
    Babylonia: {
      name: 'Babylonia',
      icon: '📐',
      flavor: 'Scientific and civic powerhouse. Preferred Event Action: ADVANCE. Accelerates science via Star Catalogues and Code of Laws.',
      trait: 'Ziggurats and star observations.'
    },
    Carthage: {
      name: 'Carthage',
      icon: '🐘',
      flavor: 'Maritime trade and powerful mercenaries. Preferred Event Action: RECRUIT. Deploys deadly Warbeasts and pirate fleets.',
      trait: 'Warbeasts and Pirate Allies.'
    },
    Celts: {
      name: 'Celts',
      icon: '🍀',
      flavor: 'Fierce tribal defenders and druidic influence. Preferred Event Action: ATTACK. Ignores standard movements and plunders adjacent borders.',
      trait: 'Tribal Allies and Druidic Influence.'
    },
    Egypt: {
      name: 'Egypt',
      icon: '☥',
      flavor: 'Monumental expansion along flood plains. Preferred Event Action: INFLUENCE. Speeds up building construction and gains VP from combat preserves.',
      trait: 'Architecture and Embalming VPs.'
    },
    Huns: {
      name: 'Huns',
      icon: '🏹',
      flavor: 'Highly nomadic mounted archers. Preferred Event Action: CONSTRUCT. Aggressively restricts settlement placements and plunders borders.',
      trait: 'Nomads and Mounted Archers.'
    },
    India: {
      name: 'India',
      icon: '🕉️',
      flavor: 'Spiritual and cultural proselytism. Preferred Event Action: INFLUENCE. Extends cultural influence range and deploys war elephants.',
      trait: 'Proselytism and Elephants.'
    },
    Japan: {
      name: 'Japan',
      icon: '⛩️',
      flavor: 'Feudal military shogunates. Preferred Event Action: ATTACK. Converts cultural targets and collects extra gold from agrarian advances.',
      trait: 'Shogunate and Pottery.'
    },
    Maya: {
      name: 'Maya',
      icon: '🌴',
      flavor: 'Architectural stelas and complex calendars. Preferred Event Action: ADVANCE. Boosts research output from constructions.',
      trait: 'Terracing and Astronomical Calendars.'
    },
    Persia: {
      name: 'Persia',
      icon: '🦁',
      flavor: 'Imperial banking and specialized Immortal regiments. Preferred Event Action: INFLUENCE. Generates gold during tactical movements.',
      trait: 'Immortals and Zoroastrianism.'
    },
    Phoenicia: {
      name: 'Phoenicia',
      icon: '⛵',
      flavor: 'Sovereign sea traders and alphabet scholars. Preferred Event Action: CONSTRUCT. Gains gold and ideas from coastal constructions.',
      trait: 'Cedars & Dyes and Alphabet.'
    }
  };

  const difficultyDetails = {
    Easy: 'IBO action counts scale gently. (Age 1-3: 1 action, Age 4-5: 2 actions, Age 6: 3 actions)',
    Easier: 'Slightly more active early actions. (Age 1-2: 1 action, Age 3-5: 2 actions, Age 6: 3 actions)',
    Normal: 'Standard Solo gaming balance. (Age 1-2: 1 action, Age 3-4: 2 actions, Age 5-6: 3 actions)',
    Harder: 'Fast-paced action scaling. (Age 1: 1 action, Age 2-4: 2 actions, Age 5-6: 3 actions)',
    Hard: 'Maximum action density. (Age 1: 1 action, Age 2-3: 2 actions, Age 4-6: 3 actions)'
  };

  let selectedTutorial = $state(false);

  function handleStart() {
    iboStore.newGame(selectedLength, selectedDifficulty, selectedCiv, selectedTutorial);
  }

  // Visualizer cycle state
  let isRolling = $state(false);

  function handleRandomize() {
    if (isRolling) return;
    isRolling = true;
    
    const civKeys = Object.keys(civDescriptions).filter(k => k !== 'Generic') as CivilizationType[];
    let counter = 0;
    
    const interval = setInterval(() => {
      selectedCiv = civKeys[Math.floor(Math.random() * civKeys.length)];
      counter++;
      if (counter > 10) {
        clearInterval(interval);
        isRolling = false;
        // Also log this choice
        console.log(`Randomized to: ${selectedCiv}`);
      }
    }, 100);
  }
</script>

<div class="setup-container">
  <!-- Saved Slots Section at the top -->
  {#if iboStore.slots && iboStore.slots.length > 0}
    <div class="wizard-card slots-card flex flex-col gap-sm" style="margin-bottom: 2rem; border-color: rgba(212, 175, 55, 0.3);">
      <h3 style="display: flex; align-items: center; gap: 0.5rem;">📂 Resume Ongoing Solo Conquest</h3>
      <p class="section-desc">Select and load an ongoing saved slot from your device.</p>
      
      <div class="slots-list" style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 200px; overflow-y: auto;">
        {#each iboStore.slots as slot}
          <div class="slot-item flex justify-between align-center" style="background-color: var(--bg-color); border: 1px solid var(--border-color); padding: 0.6rem 0.8rem; border-radius: var(--border-radius-md);">
            <div class="slot-info flex flex-col" style="text-align: left;">
              <span class="slot-name" style="font-weight: 700; color: var(--accent-gold);">{slot.name}</span>
              <span class="slot-meta" style="font-size: 0.75rem; color: var(--text-muted);">
                Civ: {slot.civilization} | Age: {slot.age} | Updated: {slot.lastUpdated}
              </span>
            </div>
            <div class="slot-actions flex gap-xs">
              <button class="btn btn-secondary" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;" onclick={() => iboStore.loadFromSlot(slot.id)}>
                Load Save
              </button>
              <button class="btn btn-reset" style="font-size: 0.8rem; padding: 0.3rem 0.6rem; background-color: var(--accent-crimson) !important;" onclick={() => { if(confirm('Delete save slot?')) iboStore.deleteSlot(slot.id); }}>
                Delete
              </button>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <div class="wizard-header">
    <span class="gold-subtitle">Campaign Setup</span>
    <h2>Establish Solo Conquest</h2>
    <p class="flavor-text">
      Select your parameters to configure the Clash of Cultures solo opponent. 
      The Barbarian Opponent adapts its decisions and actions based on these choices.
    </p>
  </div>

  <div class="wizard-grid">
    <!-- Game Length Section -->
    <div class="wizard-card flex flex-col gap-sm">
      <h3>1. Game Duration</h3>
      <p class="section-desc">Governs maximum Ages and starting assets.</p>
      
      <div class="selection-row">
        <button 
          class="option-btn {selectedLength === 'Standard' ? 'active' : ''}" 
          onclick={() => selectedLength = 'Standard'}
        >
          <span class="btn-title">Standard Game</span>
          <span class="btn-desc">6 Ages, standard setup</span>
        </button>
        <button 
          class="option-btn {selectedLength === 'Short' ? 'active' : ''}" 
          onclick={() => selectedLength = 'Short'}
        >
          <span class="btn-title">Short Game</span>
          <span class="btn-desc">4 Ages, starts with 1 free Construct</span>
        </button>
      </div>
    </div>

    <!-- Difficulty Section -->
    <div class="wizard-card flex flex-col gap-sm">
      <h3>2. AI Difficulty</h3>
      <p class="section-desc">Governs how many actions the IBO plays per turn.</p>
      
      <div class="selection-grid-diff">
        {#each Object.keys(difficultyDetails) as diff}
          <button 
            class="option-btn-small {selectedDifficulty === diff ? 'active' : ''}" 
            onclick={() => selectedDifficulty = diff as DifficultyLevel}
          >
            {diff}
          </button>
        {/each}
      </div>
      
      <div class="difficulty-explanation">
        <p>{difficultyDetails[selectedDifficulty]}</p>
      </div>
    </div>
  </div>

  <!-- Onboarding Tutorial Mode Card -->
  <div class="wizard-card flex flex-col gap-sm" style="background: linear-gradient(135deg, var(--card-bg-elevated) 0%, rgba(212, 175, 55, 0.02) 100%); border-color: rgba(212, 175, 55, 0.15); margin-bottom: 1.5rem;">
    <div class="flex justify-between align-center" style="width: 100%; display: flex; align-items: center; justify-content: space-between;">
      <div style="text-align: left;">
        <h3 style="display: flex; align-items: center; gap: 0.4rem; margin: 0; font-family: var(--font-heading); font-size: 1.15rem; color: var(--text-color);">🎓 Dynamic Mentor & Tutorial Guide</h3>
        <p class="section-desc" style="margin: 0.15rem 0 0 0; font-size: 0.8rem; color: var(--text-muted);">Activates step-by-step guidance on your dashboard to teach IBO rules as you play.</p>
      </div>
      
      <!-- Toggle button or checkbox -->
      <button 
        class="btn btn-secondary flex align-center gap-xs" 
        style="border-color: {selectedTutorial ? 'var(--accent-gold)' : 'var(--border-color)'}; color: {selectedTutorial ? 'var(--accent-gold)' : 'var(--text-color)'}; font-weight: 700; font-family: var(--font-heading); padding: 0.5rem 1rem; border-radius: var(--border-radius-md);"
        onclick={() => selectedTutorial = !selectedTutorial}
      >
        {selectedTutorial ? '🎓 ONBOARDING ACTIVE' : '🎓 GUIDE INACTIVE'}
      </button>
    </div>
  </div>

  <!-- Civilization Selection Section -->
  <div class="wizard-card civ-selection-card flex flex-col gap-md">
    <div class="flex justify-between align-center">
      <div>
        <h3>3. Opponent Civilization</h3>
        <p class="section-desc">Select the civilization overlay that the IBO will use during the game.</p>
      </div>
      
      <button 
        class="btn btn-secondary flex align-center gap-xs {isRolling ? 'rolling-anim' : ''}" 
        style="border-color: var(--accent-gold); color: var(--accent-gold); font-weight: 700; font-family: var(--font-heading);"
        onclick={handleRandomize}
        disabled={isRolling}
      >
        🎲 {isRolling ? 'Selecting...' : 'Roll Random Civ'}
      </button>
    </div>
    
    <div class="civ-list-grid">
      {#each Object.entries(civDescriptions) as [key, civ]}
        <button 
          class="civ-btn {selectedCiv === key ? 'active' : ''}" 
          onclick={() => selectedCiv = key as CivilizationType}
        >
          <div class="civ-icon-box">{civ.icon}</div>
          <div class="civ-info">
            <span class="civ-name" style="font-size: 0.85rem; line-height: 1.2;">{civ.name}</span>
            <span class="civ-trait" style="font-size: 0.65rem;">{civ.trait}</span>
          </div>
        </button>
      {/each}
    </div>

    <!-- Civilization Details display -->
    <div class="civ-details-panel">
      <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">
        {civDescriptions[selectedCiv].icon} <strong>{civDescriptions[selectedCiv].name}</strong>
      </div>
      <p class="civ-desc">{civDescriptions[selectedCiv].flavor}</p>
      <div class="civ-badge">
        <span>Strategic Anchor:</span> {civDescriptions[selectedCiv].trait}
      </div>
    </div>
  </div>

  <!-- Action Launch Button -->
  <div class="launch-box">
    <button class="btn btn-primary btn-launch" onclick={handleStart}>
      Begin Solo Conquest
    </button>
  </div>
</div>

<style>
  .setup-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    animation: fadeIn 350ms ease-out;
  }

  .wizard-header {
    text-align: center;
    margin-bottom: 2.5rem;
  }

  .gold-subtitle {
    color: var(--accent-gold);
    text-transform: uppercase;
    font-family: var(--font-heading);
    font-size: 0.85rem;
    letter-spacing: 2px;
    font-weight: 700;
  }

  .wizard-header h2 {
    font-family: var(--font-heading);
    font-size: 2.5rem;
    margin: 0.25rem 0 0.75rem 0;
    color: var(--text-color);
  }

  .flavor-text {
    max-width: 600px;
    margin: 0 auto;
    font-size: 0.95rem;
    color: var(--text-muted);
    line-height: 1.5;
  }

  .wizard-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  @media (max-width: 768px) {
    .wizard-grid {
      grid-template-columns: 1fr;
    }
  }

  .wizard-card {
    background-color: var(--card-bg-elevated);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-lg);
    padding: 1.5rem;
    box-shadow: var(--shadow-md);
    transition: border-color var(--transition-normal);
  }

  .wizard-card:hover {
    border-color: rgba(212, 175, 55, 0.2);
  }

  .wizard-card h3 {
    font-family: var(--font-heading);
    font-size: 1.25rem;
    margin: 0;
    color: var(--text-color);
  }

  .section-desc {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin: 0 0 0.5rem 0;
  }

  .selection-row {
    display: flex;
    gap: 0.75rem;
    flex-grow: 1;
  }

  .selection-grid-diff {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.4rem;
  }

  .option-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--bg-color);
    border: 1px solid var(--border-color);
    color: var(--text-color);
    padding: 1rem;
    border-radius: var(--border-radius-md);
    cursor: pointer;
    transition: all var(--transition-normal);
    text-align: center;
  }

  .option-btn-small {
    background: var(--bg-color);
    border: 1px solid var(--border-color);
    color: var(--text-color);
    padding: 0.6rem 0.2rem;
    font-size: 0.85rem;
    border-radius: var(--border-radius-md);
    cursor: pointer;
    transition: all var(--transition-normal);
    font-weight: 500;
  }

  .option-btn:hover, .option-btn-small:hover {
    border-color: var(--accent-gold);
    background-color: rgba(212, 175, 55, 0.05);
  }

  .option-btn.active, .option-btn-small.active {
    border-color: var(--accent-gold);
    background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(168, 124, 67, 0.05) 100%);
    box-shadow: 0 0 10px var(--accent-gold-glow);
    font-weight: 700;
  }

  .btn-title {
    font-weight: 700;
    font-size: 0.95rem;
    margin-bottom: 0.25rem;
  }

  .btn-desc {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .difficulty-explanation {
    background-color: var(--bg-color);
    border-left: 3px solid var(--accent-gold);
    padding: 0.75rem;
    border-radius: 0 var(--border-radius-sm) var(--border-radius-sm) 0;
    font-size: 0.8rem;
    color: var(--text-muted);
    min-height: 2.5rem;
    display: flex;
    align-items: center;
  }

  .difficulty-explanation p {
    margin: 0;
    line-height: 1.4;
  }

  .civ-selection-card {
    grid-column: 1 / -1;
  }

  .civ-list-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.75rem;
  }

  @media (max-width: 900px) {
    .civ-list-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (max-width: 550px) {
    .civ-list-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .civ-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: var(--bg-color);
    border: 1px solid var(--border-color);
    color: var(--text-color);
    padding: 0.75rem;
    border-radius: var(--border-radius-md);
    cursor: pointer;
    transition: all var(--transition-normal);
    text-align: left;
  }

  .civ-btn:hover {
    border-color: var(--accent-gold);
    background-color: rgba(212, 175, 55, 0.05);
  }

  .civ-btn.active {
    border-color: var(--accent-gold);
    background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(168, 124, 67, 0.05) 100%);
    box-shadow: 0 0 10px var(--accent-gold-glow);
  }

  .civ-icon-box {
    font-size: 1.5rem;
  }

  .civ-info {
    display: flex;
    flex-direction: column;
  }

  .civ-name {
    font-weight: 700;
    font-size: 0.9rem;
  }

  .civ-trait {
    font-size: 0.7rem;
    color: var(--text-muted);
  }

  .civ-details-panel {
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-md);
    padding: 1.25rem;
    margin-top: 0.5rem;
  }

  .civ-desc {
    margin: 0 0 1rem 0;
    font-size: 0.9rem;
    line-height: 1.5;
    color: var(--text-muted);
  }

  .civ-badge {
    display: inline-flex;
    align-items: center;
    background-color: rgba(212, 175, 55, 0.1);
    border: 1px solid var(--accent-gold-glow);
    padding: 0.25rem 0.75rem;
    border-radius: 100px;
    font-size: 0.75rem;
    color: var(--accent-gold);
    font-weight: 600;
  }

  .civ-badge span {
    color: var(--text-muted);
    margin-right: 0.25rem;
    font-weight: 400;
  }

  .launch-box {
    text-align: center;
    margin-top: 2.5rem;
  }

  .btn-launch {
    padding: 1rem 3rem;
    font-size: 1.2rem;
    font-weight: 700;
    font-family: var(--font-heading);
    box-shadow: var(--shadow-lg);
    border-radius: var(--border-radius-lg);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
