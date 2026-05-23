<script lang="ts">
  import { iboStore } from '../../stores/iboStore.svelte';
  import type { RollResult } from '../ibo-engine/types';
  import type { RollResolution } from '../ibo-engine/roller';
  import GameToken from './GameToken.svelte';

  // Local component state
  let isRolling = $state(false);
  let rollResult = $state<RollResolution | null>(null);
  let displayDice = $state<[number, number, number]>([1, 1, 1]);
  let showResult = $state(false);

  // Category descriptions and colors
  const categoryMetas: Record<string, { icon: string, color: string }> = {
    Agriculture: { icon: '🌾', color: 'var(--accent-growth)' },
    Construction: { icon: '🧱', color: 'var(--accent-bronze)' },
    Maritime: { icon: '⛵', color: 'var(--accent-crimson)' },
    Education: { icon: '📖', color: 'var(--accent-gold)' },
    Warfare: { icon: '⚔️', color: 'var(--accent-crimson)' },
    Spirituality: { icon: '🕊️', color: 'var(--accent-gold)' },
    Economy: { icon: '⚖️', color: 'var(--accent-gold)' },
    Traditions: { icon: '🏛️', color: 'var(--accent-bronze)' },
    Science: { icon: '🔭', color: 'var(--accent-growth)' }
  };

  function triggerRoll(consume: boolean = false) {
    if (isRolling) return;
    isRolling = true;
    showResult = false;
    rollResult = null;

    let iterations = 0;
    const interval = setInterval(() => {
      // Generate random faces for the animation
      displayDice = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ];
      iterations++;

      if (iterations >= 12) {
        clearInterval(interval);
        
        // Actually execute in the store
        const resolution = iboStore.executeAdvance();
        
        if (resolution) {
          rollResult = resolution;
          displayDice = resolution.dice;
        }

        if (consume) {
          iboStore.consumeAction();
        }
        
        isRolling = false;
        showResult = true;
      }
    }, 60);
  }

  // Expose function externally for visual event-trigger feedback
  export function triggerExternalRoll(consume: boolean = false) {
    triggerRoll(consume);
  }

  // Returns character map for standard six-sided die faces
  const dieFaces = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
</script>

<div class="dice-roller-panel flex flex-col gap-md">
  <div class="panel-header flex justify-between align-center">
    <h3>Advance Solver</h3>
    <button 
      class="btn btn-primary btn-roll {isRolling ? 'disabled-btn' : ''}" 
      onclick={() => triggerRoll(false)}
      disabled={isRolling}
    >
      {isRolling ? 'Rolling...' : 'Simulate IBO Roll'}
    </button>
  </div>

  <div class="dice-arena flex justify-center align-center gap-lg {isRolling ? 'rolling-glow' : ''}">
    {#each displayDice as die, index}
      <div class="die-face {isRolling ? 'rolling-animation' : ''}" style="--index: {index}">
        <span class="die-glyph">{dieFaces[die]}</span>
        <span class="die-number">{die}</span>
      </div>
    {/each}
  </div>

  {#if showResult && rollResult}
    <div class="result-details panel animation-slide-in flex flex-col gap-sm">
      <div class="result-top flex justify-between align-center">
        <span class="result-badge {rollResult.type === 'Advance' ? 'badge-advance' : 'badge-fallback'}">
          {rollResult.type} Action
        </span>
        <span class="result-sum">Sum: {rollResult.dice[0] + rollResult.dice[1] + rollResult.dice[2]}</span>
      </div>

      {#if rollResult.type === 'Advance'}
        {@const category = rollResult.category}
        {@const meta = categoryMetas[category]}
        <div class="advance-card-display flex align-center gap-md">
          <div class="adv-icon" style="background-color: {meta?.color || 'var(--accent-gold)'}">{meta?.icon || '📜'}</div>
          <div class="adv-details flex flex-col">
            <span class="adv-category" style="color: {meta?.color || 'var(--text-color)'}">{category}</span>
            <span class="adv-name">{rollResult.advance}</span>
          </div>
        </div>
        <p class="resolution-desc">{rollResult.description}</p>
        
        <!-- Quick feedback if a building was unlocked -->
        {#if ['Maritime', 'Education', 'Warfare', 'Spirituality', 'Economy', 'Traditions', 'Science'].includes(category)}
          <div class="scale-unlock-notice flex align-center gap-xs">
            <span class="unlock-icon">🔓</span>
            <span>Unlocked structure placed on Scale: <strong>{category === 'Maritime' ? 'Port' : category === 'Education' ? 'Academy' : category === 'Warfare' ? 'Fortress' : category === 'Spirituality' ? 'Temple' : category === 'Economy' ? 'Market' : category === 'Traditions' ? 'Obelisk' : 'Observatory'}</strong></span>
          </div>
        {/if}
      {:else}
        <div class="fallback-card-display flex align-center gap-md">
          <div class="fallback-icon">🔄</div>
          <div class="fallback-details flex flex-col">
            <span class="fallback-title">Recruit Fallback</span>
            <span class="fallback-desc">Priority Advance unavailable or already learned.</span>
          </div>
        </div>
        <p class="resolution-desc">{rollResult.description}</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .dice-roller-panel {
    background-color: var(--card-bg-elevated);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-lg);
    padding: 1.5rem;
    box-shadow: var(--shadow-sm);
  }

  .panel-header h3 {
    font-family: var(--font-heading);
    margin: 0;
    font-size: 1.25rem;
  }

  .btn-roll {
    padding: 0.5rem 1.25rem;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .disabled-btn {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .dice-arena {
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-md);
    padding: 2rem;
    position: relative;
    overflow: hidden;
    transition: box-shadow var(--transition-normal);
  }

  .rolling-glow {
    box-shadow: 0 0 25px var(--accent-gold-glow);
    border-color: var(--accent-gold);
  }

  .die-face {
    width: 65px;
    height: 65px;
    background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
    border: 2px solid #cbd5e1;
    border-radius: var(--border-radius-md);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.8);
    position: relative;
    user-select: none;
    color: #1e293b;
  }

  .die-glyph {
    font-size: 2.2rem;
    line-height: 1;
    margin-top: -4px;
  }

  .die-number {
    font-size: 0.75rem;
    font-weight: 700;
    color: #64748b;
    position: absolute;
    bottom: 2px;
  }

  .rolling-animation {
    animation: wobble 150ms infinite alternate ease-in-out;
    animation-delay: calc(var(--index) * 80ms);
    background: linear-gradient(135deg, #fef08a 0%, #fde047 100%);
    border-color: var(--accent-gold);
    color: var(--accent-bronze);
  }

  .result-details {
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-md);
    padding: 1rem;
  }

  .animation-slide-in {
    animation: slideIn 250ms ease-out;
  }

  .result-top {
    font-size: 0.8rem;
    font-weight: 600;
  }

  .result-badge {
    padding: 0.15rem 0.6rem;
    border-radius: 100px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  .badge-advance {
    background-color: rgba(47, 90, 62, 0.15);
    color: var(--accent-growth);
    border: 1px solid rgba(47, 90, 62, 0.3);
  }

  .badge-fallback {
    background-color: rgba(154, 42, 42, 0.15);
    color: var(--accent-crimson);
    border: 1px solid rgba(154, 42, 42, 0.3);
  }

  .result-sum {
    color: var(--text-muted);
  }

  .advance-card-display, .fallback-card-display {
    border-top: 1px solid var(--border-color);
    border-bottom: 1px solid var(--border-color);
    padding: 0.75rem 0;
    margin: 0.25rem 0;
  }

  .adv-icon, .fallback-icon {
    width: 44px;
    height: 44px;
    border-radius: var(--border-radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    box-shadow: var(--shadow-sm);
  }

  .fallback-icon {
    background-color: rgba(154, 42, 42, 0.1);
    border: 1px solid rgba(154, 42, 42, 0.2);
  }

  .adv-details, .fallback-details {
    flex-grow: 1;
  }

  .adv-category {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .adv-name, .fallback-title {
    font-family: var(--font-heading);
    font-size: 1.15rem;
    font-weight: 700;
  }

  .resolution-desc {
    font-size: 0.85rem;
    line-height: 1.4;
    color: var(--text-muted);
    margin: 0;
  }

  .scale-unlock-notice {
    background-color: rgba(214, 175, 55, 0.08);
    border: 1px solid rgba(214, 175, 55, 0.2);
    padding: 0.5rem 0.75rem;
    border-radius: var(--border-radius-sm);
    font-size: 0.8rem;
    color: var(--text-color);
  }

  .unlock-icon {
    font-size: 1rem;
  }

  @keyframes wobble {
    0% { transform: rotate(-5deg) translateY(-2px); }
    100% { transform: rotate(5deg) translateY(2px); }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
