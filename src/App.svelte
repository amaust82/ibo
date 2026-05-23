<script lang="ts">
  import { iboStore } from './stores/iboStore.svelte';
  import GameToken from './lib/components/GameToken.svelte';
  import SetupWizard from './lib/components/SetupWizard.svelte';
  import DiceRoller from './lib/components/DiceRoller.svelte';
  import type { EventIcon, ResourceType, StructureType, CityMood } from './lib/ibo-engine/types';

  // Svelte 5 Runes for Theme State
  let isDark = $state(true);
  
  // Custom manual logging message
  let customLogMsg = $state('');

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
    
    // Skip round/age banners to get the core action before it
    if (latestLog.includes('--- Entered Round') || latestLog.includes('--- Entered Age') || latestLog.includes('Turn Completed')) {
      let index = logs.length - 1;
      while (index >= 0 && (logs[index].includes('--- Entered') || logs[index].includes('Turn Completed'))) {
        index--;
      }
      if (index >= 0) {
        latestLog = logs[index];
      }
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
  {#if iboStore.state === null}
    <!-- Initialization Setup Wizard -->
    <SetupWizard />
  {:else}
    <!-- Active Game Tactical Dashboard (Grid with row-by-row structure) -->
    <div class="dashboard-grid">
      
      <!-- ================= GAME STATUS ROW ================= -->
      <!-- Game State Status Header Card -->
      <div class="panel status-card flex flex-col gap-sm">
        <div class="flex justify-between align-start border-bottom pb-sm">
          <div>
            <span class="gold-subtitle">Active Solo Match</span>
            <h2 style="font-family: var(--font-heading); font-size: 1.35rem; margin: 0; line-height: 1.2;">
              {iboStore.state.civilization} Empire
            </h2>
          </div>
          
          <button class="btn btn-reset" onclick={() => { if(confirm('Reset match? All active state will be lost.')) iboStore.clearGame(); }}>
            Reset Match
          </button>
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

      <!-- ================= EVENT SOLVERS & ROLLER ROW (TWO COLUMNS ON DESKTOP) ================= -->
      <div class="solvers-and-roller-row">
        <!-- Event Action Card Solver Panel -->
        <div class="panel event-solver-panel flex flex-col gap-md" style="margin: 0; height: 100%;">
          <div class="flex justify-between align-start">
            <div class="panel-header-desc">
              <h3>Event Card Solvers</h3>
              <p class="flavor-desc">Click the corresponding icon to resolve drawn Event Card actions.</p>
            </div>
            <button class="btn btn-secondary btn-undo-event" onclick={() => iboStore.undo()} style="border-color: var(--accent-gold); color: var(--accent-gold); font-size: 0.85rem; padding: 0.35rem 0.6rem; white-space: nowrap; display: flex; align-items: center; gap: 0.25rem;">
              ↩️ Undo
            </button>
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
                  <button class="btn btn-primary btn-next-age" onclick={() => iboStore.nextAge()} style="width: 100%; padding: 0.75rem; font-family: var(--font-heading); font-weight: 700;">
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
        <div class="flex justify-between align-center">
          <div>
            <h3 style="font-size: 1.15rem;">Scale Tracker Queue</h3>
            <p class="flavor-desc">Slots 0 to 7. Founding/Constructing takes pieces from left to right.</p>
          </div>
          
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
      <div class="panel tech-panel flex flex-col gap-md span-full">
        <h3 style="font-size: 1.15rem;">Researched Advances Catalog</h3>
        <div class="tech-grid flex flex-wrap gap-xs">
          {#if iboStore.state.advances.length === 0}
            <span class="flavor-desc" style="font-style: italic;">No advances researched yet.</span>
          {:else}
            {#each iboStore.state.advances as adv}
              <span class="tech-badge" style="font-size: 0.7rem; padding: 0.2rem 0.5rem;">📜 {adv}</span>
            {/each}
          {/if}
        </div>
      </div>

      <!-- ================= FOURTH ROW: RESOURCES (FULL WIDTH) ================= -->
      <div class="panel resource-panel flex flex-col gap-md span-full">
        <h3 style="font-size: 1.15rem;">Tactile Resource Counters</h3>
        
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
        <div class="flex justify-between align-center">
          <div>
            <h3 style="font-size: 1.15rem;">Active Cities Tracker</h3>
            <p class="flavor-desc">Mood determines size limits (Happy +1, Angry = 1).</p>
          </div>
          
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
</style>
