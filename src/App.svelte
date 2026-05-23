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

  // Save slot naming state
  let newSlotName = $state('');

  // Contextual Help tooltips visible state
  let activeTooltip = $state<string | null>(null);

  function toggleTooltip(name: string) {
    if (activeTooltip === name) {
      activeTooltip = null;
    } else {
      activeTooltip = name;
    }
  }

  // Dynamic Solo Mentor Guide logic
  function getMentorAdvice(state: IboState): { title: string; desc: string; step: string } {
    const isRoundDone = state.currentAction >= state.maxActionsPerTurn;
    
    // Step 1: Initial Event Icon drawing
    if (state.currentAction === 0 && !isRoundDone) {
      return {
        title: "Draw Event Card 🎴",
        desc: "Draw a physical event card from the deck. Select the corresponding symbol in the **Event Card Solvers** panel to resolve it.",
        step: "Step 1: Draw Event"
      };
    }
    
    // Step 2: Next Actions in progress
    if (!isRoundDone) {
      const latestLog = state.actionLog.length > 0 ? state.actionLog[state.actionLog.length - 1] : "";
      
      if (latestLog.includes("[ADVANCE]")) {
        return {
          title: "Scale Shift: Building Unlocked 🏛️",
          desc: "Place the newly unlocked building piece (Temple, Fortress, Port, etc.) onto the lowest empty slot of the **Scale Tracker Queue** on your board.",
          step: "Step 2: Place Building"
        };
      }
      
      return {
        title: "Resolve Event Solver ⚡",
        desc: "Check the current event symbol on your card. Click one of the Solver buttons (Advance, Recruit, Construct, Influence, Attack) to resolve it in Svelte and update trackers.",
        step: "Step 2: Resolve Symbol"
      };
    }
    
    // Step 3: Turn Complete - Cleanups
    if (isRoundDone) {
      const maxAges = state.gameLength === 'Short' ? 4 : 6;
      if (state.currentRound < 3) {
        return {
          title: "Round Complete ✨",
          desc: "All active actions for this round are complete! Perform standard tabletop cleanup, verify all IBO pieces match the digital trackers, and then click **'Next Turn / Next Round'**.",
          step: "Step 3: End of Round"
        };
      } else {
        return {
          title: "Age Complete - Status Phase 👑",
          desc: `You have completed all 3 Rounds of Age ${state.currentAge}. Resolve the Status Phase on your board (IBO scores objectives, gains cards, researches free techs if applicable), then click **'Resolve Status Phase & Next Age'**.`,
          step: "Step 3: Status Phase"
        };
      }
    }
    
    return {
      title: "Tactical Planning 🧠",
      desc: "Observe the IBO's scale queues and counter limits to plan your strategic responses.",
      step: "Guide active"
    };
  }

  // Synchronize newSlotName with active slot name
  $effect(() => {
    const activeSlot = iboStore.slots.find(s => s.id === iboStore.activeSlotId);
    if (activeSlot) {
      newSlotName = activeSlot.name;
    } else {
      newSlotName = '';
    }
  });

  function handleSaveAs() {
    if (newSlotName.trim()) {
      iboStore.saveCurrentGameAs(newSlotName.trim());
    }
  }

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
  {#if iboStore.state === null}
    <!-- Initialization Setup Wizard -->
    <SetupWizard />
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
            
            <button class="btn btn-reset" onclick={() => { if(confirm('Exit match? Your active campaign will remain saved.')) iboStore.clearGame(); }}>
              Exit Match
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

        <!-- Save Slots Manager Card -->
        <div class="panel status-card flex flex-col gap-sm" style="margin: 0; background: linear-gradient(135deg, var(--card-bg-elevated) 0%, rgba(212, 175, 55, 0.03) 100%); border-color: rgba(212, 175, 55, 0.15);">
          <div class="flex justify-between align-start border-bottom pb-sm">
            <div>
              <span class="gold-subtitle">Campaign Save Slots</span>
              <h2 style="font-family: var(--font-heading); font-size: 1.35rem; margin: 0; line-height: 1.2;">
                Manage Sessions
              </h2>
            </div>
          </div>

          <!-- Current Slot Rename -->
          <div class="flex flex-col gap-xs" style="margin-top: 0.25rem;">
            <span class="font-sm" style="font-size: 0.75rem; font-weight: 600;">Rename / Save Current Campaign:</span>
            <div class="flex gap-xs">
              <input 
                type="text" 
                class="form-input" 
                style="font-size: 0.8rem; padding: 0.4rem 0.6rem; flex: 1; min-height: unset; margin: 0;"
                bind:value={newSlotName}
                placeholder="Campaign Name..."
              />
              <button class="btn btn-primary" style="font-size: 0.8rem; padding: 0.4rem 1rem; white-space: nowrap;" onclick={handleSaveAs}>
                Save Slot
              </button>
            </div>
          </div>

          <!-- Other Slots list -->
          {#if iboStore.slots.length > 1}
            <div class="border-top pt-xs flex flex-col gap-xxs" style="margin-top: 0.35rem; border-color: var(--border-color);">
              <span class="font-xs font-semibold text-muted" style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 0.15rem;">LOAD OTHER SAVES:</span>
              <div class="flex flex-col gap-xxs" style="max-height: 70px; overflow-y: auto;">
                {#each iboStore.slots as slot}
                  {#if slot.id !== iboStore.activeSlotId}
                    <div class="flex justify-between align-center py-xxs font-xs" style="border-bottom: 1px dashed rgba(255,255,255,0.05); padding: 0.2rem 0;">
                      <span class="text-truncate" style="max-width: 60%; font-weight: 500; font-size: 0.75rem; color: var(--accent-gold); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{slot.name}</span>
                      <div class="flex gap-xxs">
                        <button class="btn btn-secondary font-xs" style="padding: 0.15rem 0.4rem; min-height: unset; font-size: 0.7rem;" onclick={() => iboStore.loadFromSlot(slot.id)}>
                          Load
                        </button>
                        <button class="btn btn-reset font-xs" style="padding: 0.15rem 0.4rem; min-height: unset; font-size: 0.7rem; background-color: var(--accent-crimson) !important;" onclick={() => { if(confirm('Delete save slot?')) iboStore.deleteSlot(slot.id); }}>
                          Delete
                        </button>
                      </div>
                    </div>
                  {/if}
                {/each}
              </div>
            </div>
          {:else}
            <div style="font-size: 0.75rem; color: var(--text-muted); font-style: italic; margin-top: 0.5rem; text-align: center;">
              Auto-saving actively to this slot. Create multiple named slots to play different civs!
            </div>
          {/if}
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
              <span class="tech-badge" style="font-size: 0.7rem; padding: 0.2rem 0.5rem;">📜 {adv}</span>
            {/each}
          {/if}
        </div>
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

  .status-row-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    width: 100%;
  }

  @media (max-width: 800px) {
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
</style>
