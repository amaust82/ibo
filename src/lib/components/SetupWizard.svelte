<script lang="ts">
  import { iboStore } from '../../stores/iboStore.svelte';
  import type { GameLength, DifficultyLevel, CivilizationType } from '../ibo-engine/types';

  // Wizard state with default configurations
  let selectedLength = $state<GameLength>('Standard');
  let selectedDifficulty = $state<DifficultyLevel>('Normal');
  let selectedCiv = $state<CivilizationType>('Generic');

  // Descriptions for each solo civilization
  const civDescriptions = {
    Generic: {
      name: 'Generic Standard',
      icon: '🏛️',
      flavor: 'Base ruleset without civilization-specific overrides. Recommended for learning the basic flow of the IBO.',
      trait: 'Standard Roller priority tree.'
    },
    Rome: {
      name: 'Roman Empire',
      icon: '🛡️',
      flavor: 'Militaristic dominance. Armies move swiftly. Preferred Event Action: ATTACK. Replaces standard construct with roads/forts logic.',
      trait: 'Tactical aggression and expansion.'
    },
    Greece: {
      name: 'Ancient Greece',
      icon: '🏺',
      flavor: 'Philosophical and artistic advancement. Spreads cultural influence seamlessly. Preferred Event Action: INFLUENCE.',
      trait: 'Priority on Education and Spirituality.'
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
      flavor: 'Maritime expertise and aggressive coastal raiding. Preferred Event Action: ATTACK. Highly active in early naval navigation.',
      trait: 'Aggressive naval expansion.'
    }
  };

  const difficultyDetails = {
    Easy: 'IBO action counts scale gently. (Age 1-3: 1 action, Age 4-5: 2 actions, Age 6: 3 actions)',
    Easier: 'Slightly more active early actions. (Age 1-2: 1 action, Age 3-5: 2 actions, Age 6: 3 actions)',
    Normal: 'Standard Solo gaming balance. (Age 1-2: 1 action, Age 3-4: 2 actions, Age 5-6: 3 actions)',
    Harder: 'Fast-paced action scaling. (Age 1: 1 action, Age 2-4: 2 actions, Age 5-6: 3 actions)',
    Hard: 'Maximum action density. (Age 1: 1 action, Age 2-3: 2 actions, Age 4-6: 3 actions)'
  };

  function handleStart() {
    iboStore.newGame(selectedLength, selectedDifficulty, selectedCiv);
  }
</script>

<div class="setup-container">
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

  <!-- Civilization Selection Section -->
  <div class="wizard-card civ-selection-card flex flex-col gap-md">
    <h3>3. Opponent Civilization</h3>
    <p class="section-desc">Select the civilization overlay that the IBO will use during the game.</p>
    
    <div class="civ-list-grid">
      {#each Object.entries(civDescriptions) as [key, civ]}
        <button 
          class="civ-btn {selectedCiv === key ? 'active' : ''}" 
          onclick={() => selectedCiv = key as CivilizationType}
        >
          <div class="civ-icon-box">{civ.icon}</div>
          <div class="civ-info">
            <span class="civ-name">{civ.name}</span>
            <span class="civ-trait">{civ.trait}</span>
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
