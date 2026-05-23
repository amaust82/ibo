<script lang="ts">
  // App.svelte - Main Application Entry & Phase 1 Interactive Dashboard
  import GameToken from './lib/components/GameToken.svelte';

  // Svelte 5 Runes for Theme State
  let isDark = $state(true);

  // Svelte 5 Runes for interactive token demonstration counters
  let counters = $state({
    gold: 5,
    food: 2,
    ideas: 3,
    wood: 4,
    ore: 1,
    settlement: 2,
    temple: 1,
    fortress: 0,
    port: 1,
    infantry: 3,
    cavalry: 1,
    elephant: 0,
    ship: 1
  });

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

  // Increment utility
  function increment(key: keyof typeof counters) {
    counters[key]++;
  }

  // Decrement utility (caps at 0)
  function decrement(key: keyof typeof counters, event: MouseEvent) {
    event.stopPropagation(); // Prevent card tap triggering increment
    if (counters[key] > 0) {
      counters[key]--;
    }
  }
</script>

<header class="hero-header">
  <div class="container flex justify-between align-center">
    <div style="text-align: left;">
      <h1>Clash of Cultures</h1>
      <div class="hero-subtitle">Intelligent Barbarian Opponent</div>
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
  <!-- Informational Panel -->
  <section class="panel gap-md flex flex-col" style="margin-bottom: 2rem;">
    <h2>Phase 1: Foundations Complete</h2>
    <p>
      Welcome to the interactive preview. The global CSS styling engine is active, providing the 
      <strong>Ancient Gold Pantheon</strong> theme. Click on the toggler above to swap modes. 
      The core vector tokens are active, supporting high-fidelity SVG graphics and responsive scaling. 
      Click on any card to increment its count, or tap the minus sign to decrement.
    </p>
  </section>

  <!-- Interactive Grid Sections -->
  <section style="margin-bottom: 2.5rem;">
    <h3 style="margin-bottom: 1rem; border-left: 4px solid var(--accent-gold); padding-left: 0.75rem;">Resource Pools</h3>
    <div class="grid grid-cols-5">
      <!-- Gold -->
      <div 
        class="token-card" 
        onclick={() => increment('gold')} 
        role="button" 
        tabindex="0"
        onkeydown={(e) => e.key === 'Enter' && increment('gold')}
      >
        <GameToken name="gold" size={40} />
        <span class="token-title">Gold</span>
        <span class="token-value">{counters.gold}</span>
        <div style="margin-top: 0.5rem; display: flex; gap: 0.25rem; z-index: 2;">
          <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick={(e) => decrement('gold', e)}>-</button>
          <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick={(e) => { e.stopPropagation(); increment('gold'); }}>+</button>
        </div>
      </div>

      <!-- Food -->
      <div 
        class="token-card" 
        onclick={() => increment('food')} 
        role="button" 
        tabindex="0"
        onkeydown={(e) => e.key === 'Enter' && increment('food')}
      >
        <GameToken name="food" size={40} />
        <span class="token-title">Food</span>
        <span class="token-value">{counters.food}</span>
        <div style="margin-top: 0.5rem; display: flex; gap: 0.25rem; z-index: 2;">
          <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick={(e) => decrement('food', e)}>-</button>
          <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick={(e) => { e.stopPropagation(); increment('food'); }}>+</button>
        </div>
      </div>

      <!-- Ideas -->
      <div 
        class="token-card" 
        onclick={() => increment('ideas')} 
        role="button" 
        tabindex="0"
        onkeydown={(e) => e.key === 'Enter' && increment('ideas')}
      >
        <GameToken name="ideas" size={40} />
        <span class="token-title">Ideas</span>
        <span class="token-value">{counters.ideas}</span>
        <div style="margin-top: 0.5rem; display: flex; gap: 0.25rem; z-index: 2;">
          <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick={(e) => decrement('ideas', e)}>-</button>
          <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick={(e) => { e.stopPropagation(); increment('ideas'); }}>+</button>
        </div>
      </div>

      <!-- Wood -->
      <div 
        class="token-card" 
        onclick={() => increment('wood')} 
        role="button" 
        tabindex="0"
        onkeydown={(e) => e.key === 'Enter' && increment('wood')}
      >
        <GameToken name="wood" size={40} />
        <span class="token-title">Wood</span>
        <span class="token-value">{counters.wood}</span>
        <div style="margin-top: 0.5rem; display: flex; gap: 0.25rem; z-index: 2;">
          <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick={(e) => decrement('wood', e)}>-</button>
          <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick={(e) => { e.stopPropagation(); increment('wood'); }}>+</button>
        </div>
      </div>

      <!-- Ore -->
      <div 
        class="token-card" 
        onclick={() => increment('ore')} 
        role="button" 
        tabindex="0"
        onkeydown={(e) => e.key === 'Enter' && increment('ore')}
      >
        <GameToken name="ore" size={40} />
        <span class="token-title">Ore</span>
        <span class="token-value">{counters.ore}</span>
        <div style="margin-top: 0.5rem; display: flex; gap: 0.25rem; z-index: 2;">
          <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick={(e) => decrement('ore', e)}>-</button>
          <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick={(e) => { e.stopPropagation(); increment('ore'); }}>+</button>
        </div>
      </div>
    </div>
  </section>

  <section style="margin-bottom: 2.5rem;">
    <h3 style="margin-bottom: 1rem; border-left: 4px solid var(--accent-bronze); padding-left: 0.75rem;">Settlements & Structures</h3>
    <div class="grid grid-cols-4">
      <!-- Settlement -->
      <div 
        class="token-card" 
        onclick={() => increment('settlement')} 
        role="button" 
        tabindex="0"
        onkeydown={(e) => e.key === 'Enter' && increment('settlement')}
      >
        <GameToken name="settlement" size={40} />
        <span class="token-title">Settlement</span>
        <span class="token-value">{counters.settlement}</span>
        <div style="margin-top: 0.5rem; display: flex; gap: 0.25rem; z-index: 2;">
          <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick={(e) => decrement('settlement', e)}>-</button>
          <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick={(e) => { e.stopPropagation(); increment('settlement'); }}>+</button>
        </div>
      </div>

      <!-- Temple -->
      <div 
        class="token-card" 
        onclick={() => increment('temple')} 
        role="button" 
        tabindex="0"
        onkeydown={(e) => e.key === 'Enter' && increment('temple')}
      >
        <GameToken name="temple" size={40} />
        <span class="token-title">Temple</span>
        <span class="token-value">{counters.temple}</span>
        <div style="margin-top: 0.5rem; display: flex; gap: 0.25rem; z-index: 2;">
          <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick={(e) => decrement('temple', e)}>-</button>
          <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick={(e) => { e.stopPropagation(); increment('temple'); }}>+</button>
        </div>
      </div>

      <!-- Fortress -->
      <div 
        class="token-card" 
        onclick={() => increment('fortress')} 
        role="button" 
        tabindex="0"
        onkeydown={(e) => e.key === 'Enter' && increment('fortress')}
      >
        <GameToken name="fortress" size={40} />
        <span class="token-title">Fortress</span>
        <span class="token-value">{counters.fortress}</span>
        <div style="margin-top: 0.5rem; display: flex; gap: 0.25rem; z-index: 2;">
          <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick={(e) => decrement('fortress', e)}>-</button>
          <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick={(e) => { e.stopPropagation(); increment('fortress'); }}>+</button>
        </div>
      </div>

      <!-- Port -->
      <div 
        class="token-card" 
        onclick={() => increment('port')} 
        role="button" 
        tabindex="0"
        onkeydown={(e) => e.key === 'Enter' && increment('port')}
      >
        <GameToken name="port" size={40} />
        <span class="token-title">Port</span>
        <span class="token-value">{counters.port}</span>
        <div style="margin-top: 0.5rem; display: flex; gap: 0.25rem; z-index: 2;">
          <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick={(e) => decrement('port', e)}>-</button>
          <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick={(e) => { e.stopPropagation(); increment('port'); }}>+</button>
        </div>
      </div>
    </div>
  </section>

  <section style="margin-bottom: 2.5rem;">
    <h3 style="margin-bottom: 1rem; border-left: 4px solid var(--accent-crimson); padding-left: 0.75rem;">Military Units</h3>
    <div class="grid grid-cols-4">
      <!-- Infantry -->
      <div 
        class="token-card" 
        onclick={() => increment('infantry')} 
        role="button" 
        tabindex="0"
        onkeydown={(e) => e.key === 'Enter' && increment('infantry')}
      >
        <GameToken name="infantry" size={40} />
        <span class="token-title">Infantry</span>
        <span class="token-value">{counters.infantry}</span>
        <div style="margin-top: 0.5rem; display: flex; gap: 0.25rem; z-index: 2;">
          <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick={(e) => decrement('infantry', e)}>-</button>
          <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick={(e) => { e.stopPropagation(); increment('infantry'); }}>+</button>
        </div>
      </div>

      <!-- Cavalry -->
      <div 
        class="token-card" 
        onclick={() => increment('cavalry')} 
        role="button" 
        tabindex="0"
        onkeydown={(e) => e.key === 'Enter' && increment('cavalry')}
      >
        <GameToken name="cavalry" size={40} />
        <span class="token-title">Cavalry</span>
        <span class="token-value">{counters.cavalry}</span>
        <div style="margin-top: 0.5rem; display: flex; gap: 0.25rem; z-index: 2;">
          <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick={(e) => decrement('cavalry', e)}>-</button>
          <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick={(e) => { e.stopPropagation(); increment('cavalry'); }}>+</button>
        </div>
      </div>

      <!-- Elephant -->
      <div 
        class="token-card" 
        onclick={() => increment('elephant')} 
        role="button" 
        tabindex="0"
        onkeydown={(e) => e.key === 'Enter' && increment('elephant')}
      >
        <GameToken name="elephant" size={40} />
        <span class="token-title">Elephant</span>
        <span class="token-value">{counters.elephant}</span>
        <div style="margin-top: 0.5rem; display: flex; gap: 0.25rem; z-index: 2;">
          <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick={(e) => decrement('elephant', e)}>-</button>
          <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick={(e) => { e.stopPropagation(); increment('elephant'); }}>+</button>
        </div>
      </div>

      <!-- Ship -->
      <div 
        class="token-card" 
        onclick={() => increment('ship')} 
        role="button" 
        tabindex="0"
        onkeydown={(e) => e.key === 'Enter' && increment('ship')}
      >
        <GameToken name="ship" size={40} />
        <span class="token-title">Ship</span>
        <span class="token-value">{counters.ship}</span>
        <div style="margin-top: 0.5rem; display: flex; gap: 0.25rem; z-index: 2;">
          <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick={(e) => decrement('ship', e)}>-</button>
          <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick={(e) => { e.stopPropagation(); increment('ship'); }}>+</button>
        </div>
      </div>
    </div>
  </section>

  <!-- Navigation / Footer Information -->
  <section class="panel flex justify-between align-center" style="margin-top: 3rem;">
    <div style="text-align: left;">
      <h3 style="font-family: var(--font-heading);">IBO Companion Roadmap</h3>
      <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">
        Up Next: Writing the Decoupled TS IBO Rules Engine & Game Solvers.
      </p>
    </div>
    <div class="flex gap-md">
      <a href="https://boardgamegeek.com/boardgame/107543/clash-of-cultures" target="_blank" class="btn btn-secondary" style="font-size: 0.8rem;">BGG Rules</a>
      <a href="https://github.com" target="_blank" class="btn btn-primary" style="font-size: 0.8rem;">Source Docs</a>
    </div>
  </section>
</main>

<style>
  /* Local layout modifiers for the preview page */
  .grid-cols-5 {
    grid-template-columns: repeat(5, 1fr);
  }
  
  @media (max-width: 900px) {
    .grid-cols-5 {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  @media (max-width: 600px) {
    .grid-cols-5 {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .token-card {
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-md);
    background-color: var(--card-bg-elevated);
    padding: 1.25rem 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-normal);
    cursor: pointer;
    box-shadow: var(--shadow-sm);
    user-select: none;
  }
  
  .token-card:hover {
    border-color: var(--accent-gold);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px var(--accent-gold-glow);
  }

  .token-card:active {
    transform: translateY(1px);
  }
</style>
