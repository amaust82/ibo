<script lang="ts">
  // GameToken.svelte - A reusable, premium, media-agnostic vector token.
  // Uses Svelte 5 runes for declaration.

  interface Props {
    name: 'gold' | 'food' | 'ideas' | 'wood' | 'ore' | 'settlement' | 'temple' | 'fortress' | 'port' | 'infantry' | 'cavalry' | 'elephant' | 'ship' | 'academy' | 'market' | 'obelisk' | 'observatory';
    size?: number;
    color?: string;
    imgSrc?: string;
    class?: string;
  }

  let {
    name,
    size = 28,
    color = undefined,
    imgSrc = undefined,
    class: className = ''
  }: Props = $props();

  // Resolve default colors based on theme accent variables
  const defaultColors: Record<string, string> = {
    gold: 'var(--accent-gold)',
    food: 'var(--accent-olive)',
    ideas: 'var(--accent-gold)',
    wood: 'var(--accent-bronze)',
    ore: 'var(--text-muted)',
    settlement: 'var(--text-primary)',
    temple: 'var(--accent-gold)',
    fortress: 'var(--accent-bronze)',
    port: 'var(--text-secondary)',
    infantry: 'var(--accent-crimson)',
    cavalry: 'var(--accent-gold)',
    elephant: 'var(--accent-bronze)',
    ship: 'var(--accent-bronze)',
    academy: 'var(--accent-olive)',
    market: 'var(--accent-gold)',
    obelisk: 'var(--accent-bronze)',
    observatory: 'var(--text-secondary)'
  };

  let tokenColor = $derived(color || defaultColors[name] || 'currentColor');
</script>

<div 
  class="game-token {className}" 
  style:width="{size}px" 
  style:height="{size}px" 
  style:color={tokenColor}
  aria-label={name}
>
  {#if imgSrc}
    <!-- Pivot to physical image if provided -->
    <img src={imgSrc} alt={name} style:width="100%" style:height="100%" class="gold-glow" />
  {:else}
    <!-- Inline SVG vector graphics -->
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      width="100%" 
      height="100%"
      class="gold-glow"
    >
      {#if name === 'gold'}
        <!-- Stack of ancient coins -->
        <path d="M12 2C6.48 2 2 4.01 2 6.5s4.48 4.5 10 4.5 10-2.01 10-4.5S17.52 2 12 2zm0 6c-3.86 0-7-1.12-7-2.5s3.14-2.5 7-2.5 7 1.12 7 2.5-3.14 2.5-7 2.5z"/>
        <path d="M22 10.5c0 2.49-4.48 4.5-10 4.5S2 12.99 2 10.5V13c0 2.49 4.48 4.5 10 4.5s10-2.01 10-4.5v-2.5z"/>
        <path d="M22 17c0 2.49-4.48 4.5-10 4.5S2 19.49 2 17v2.5c0 2.49 4.48 4.5 10 4.5s10-2.01 10-4.5V17z"/>
        <circle cx="12" cy="6.5" r="1.5"/>
      {:else}
        {#if name === 'food'}
          <!-- Sheaf of Wheat -->
          <path d="M12 1.5c-.8 1.5-1.5 3-1.5 4.5s.7 3 1.5 4.5c.8-1.5 1.5-3 1.5-4.5s-.7-3-1.5-4.5zm-3 4c-.7 1.3-1.3 2.7-1.3 4s.6 2.7 1.3 4c.7-1.3 1.3-2.7 1.3-4s-.6-2.7-1.3-4zm6 0c-.7 1.3-.6 2.7-.6 4s.6 2.7 1.3 4c.7-1.3 1.3-2.7 1.3-4s-.6-2.7-2-4zm-4.5 7.5v11h3V13h-3zm-3 2v6h2v-6h-2zm6.5 0v6h2v-6h-2z"/>
        {:else if name === 'ideas'}
          <!-- Rolled-up Parchment Scroll with ribbon -->
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 15H7v-2h3v2zm0-4H7v-2h3v2zm0-4H7V8h3v2zm6 8h-4v-2h4v2zm0-4h-4v-2h4v2zm0-4h-4V8h4v2z"/>
          <path d="M16 1.5c-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5 4.5-2 4.5-4.5-2-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        {:else if name === 'wood'}
          <!-- Stacked logs -->
          <path d="M19 10c0-1.66-3.13-3-7-3s-7 1.34-7 3 3.13 3 7 3 7-1.34 7-3zm-7 1.5c-2.76 0-5-.67-5-1.5s2.24-1.5 5-1.5 5 .67 5 1.5-2.24 1.5-5 1.5zM5 10v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6c0 1.66-3.13 3-7 3s-7-1.34-7-3zm14 10c0 1.66-3.13 3-7 3s-7-1.34-7-3v-2.5c1.8 1 4.3 1.5 7 1.5s5.2-.5 7-1.5V20z"/>
          <path d="M12 11c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
        {:else if name === 'ore'}
          <!-- Sparkling Rock Ore Chunk -->
          <path d="M12 2L2 9l3 11h14l3-11L12 2zm1 3.56l5.44 3.81L16 11l-3-5.44zm-2 0L8 11l-2.44-1.63L11 5.56zm-5.32 6l3.5 4.94H5l-.32-4.94zm6.32-1.31l2.5 4.5H9.5l2.5-4.5zm1 4.5l3.5-4.94-.32 4.94H13z"/>
        {:else if name === 'settlement'}
          <!-- Small Gabled Roman House -->
          <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm0 3.25l6 5.4v6.35h-2v-6H8v6H6v-6.35l6-5.4z"/>
        {:else if name === 'temple'}
          <!-- Classical Greek/Roman Temple Columns -->
          <path d="M12 2L2 7v2h20V7L12 2zm-8 8v9h3v-9H4zm5 0v9h3v-9H9zm5 0v9h3v-9h-3zm5 0v9h3v-9h-3zM2 20v2h20v-2H2z"/>
        {:else if name === 'fortress'}
          <!-- Crenellated Stone Fortress Tower -->
          <path d="M3 2v4h2v14H3v2h18v-2h-2V6h2V2h-3v2h-2V2h-3v2H9V2H6v2H4V2H3zm4 6h2v2H7V8zm8 0h2v2h-2V8zm-4 3h2v2h-2v-2zm-4 3h2v2H7v-2zm8 0h2v2h-2v-2z"/>
        {:else if name === 'port'}
          <!-- Ship Anchor -->
          <path d="M12 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm1 5h-2v4H6c0 4.42 3.58 8 8 8h1v-2h-1c-3.31 0-6-2.69-6-6h4v-2h-4V7zM18 11c0 4.42-3.58 8-8 8H9v2h1c5.52 0 10-4.48 10-10h-2z"/>
          <path d="M3 13l2-2 2 2-4 0zM21 13l-2-2-2 2 4 0z"/>
        {:else if name === 'infantry'}
          <!-- Sword + Shield combo (Legionary theme) -->
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
          <path d="M11 6h2v9h-2zM9.5 15h5v1.5h-5zM12 17c.55 0 1 .45 1 1v2h-2v-2c0-.55.45-1 1-1z"/>
          <path d="M18.5 7.5l-2-2-7 7 2 2z"/>
        {:else if name === 'cavalry'}
          <!-- Charge Horse Head Silhouette -->
          <path d="M21 9c-.5-1.5-1.5-2.5-3-3-1.5 0-3-.5-4.5-.5S10 6 9.5 7C9 8 9 9 9.5 10c-1.5 0-3 1-3.5 2.5s0 3 1.5 4c-.5.5-1 1.5-1 2.5 0 1.5 1 2.5 2.5 3h6c2.5 0 5-1.5 5.5-4 .5-2.5-.5-5-2.5-6.5.5-1 1-2.5 0-3.5zM15 11c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
        {:else if name === 'elephant'}
          <!-- War Elephant -->
          <path d="M22 10c-.5-1-1.5-1.5-2.5-1.5H16c-.5 0-1-.5-1-1v-.5c0-.83-.67-1.5-1.5-1.5h-4C8.67 5.5 8 6.17 8 7v.5C8 8.33 7.33 9 6.5 9h-2C3.12 9 2 10.12 2 11.5V16c0 1.1.9 2 2 2h1.5v3h3.5v-3H13v3h3.5v-3h2c1.1 0 2-.9 2-2v-4.5c0-.83-.67-1.5-1.5-1.5h-1c-.55 0-1-.45-1-1s.45-1 1-1c1.38 0 2.5 1.12 2.5 2.5V10zM6.5 12c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm8.5 2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
        {:else if name === 'ship'}
          <!-- Trireme Greek/Roman Galley -->
          <path d="M21.9 11.1c-.2-.5-.7-.9-1.3-.9H16L13.5 5h-3L8 10.2H3.4c-.6 0-1.1.4-1.3.9-.2.5-.1 1.1.3 1.5l2.5 2.5C5.3 15.6 6 16 6.8 16h10.4c.8 0 1.5-.4 1.9-.9l2.5-2.5c.4-.4.5-1 .3-1.5zM12 6.5l1.5 3.7h-3L12 6.5zm-5 8.7H5.5l-.8-.8h1.5l.8.8zm3.5 0H9l-.8-.8h1.5l.8.8zm3.5 0h-1.5l-.8-.8h1.5l.8.8zm3.5 0H16l-.8-.8h1.5l.8.8z"/>
        {:else if name === 'academy'}
          <!-- Rolled Hat of Wisdom / Academy building -->
          <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
          <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
        {:else if name === 'market'}
          <!-- Scale balance for Economy -->
          <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm1 14.5h-2v-1h2zm1.07-4.75a2.5 2.5 0 00-.77-1.68c-.68-.61-1.3-1-1.3-1.63 0-.49.33-.8.8-.8a.85.85 0 01.8.6l1.7-.5A2.43 2.43 0 0011.8 9V8h-1.5v1A2.52 2.52 0 009.5 12.1a2.38 2.38 0 00.75 1.63c.69.61 1.25 1 1.25 1.57 0 .58-.45.85-.92.85A1 1 0 019.62 15l-1.8.46a2.82 2.82 0 002.48 2v1h1.5v-1a2.6 2.6 0 002.27-2.71z"/>
        {:else if name === 'obelisk'}
          <!-- Tall Monumental Obelisk Pillar -->
          <path d="M12 2L9 8h6l-3-6zm-2.5 7l-1 13h7l-1-13h-5z"/>
        {:else if name === 'observatory'}
          <!-- Stars Dome / Observatory telescope -->
          <path d="M12 2a10 10 0 00-9.9 8.5L5.7 13h12.6l3.6-2.5A10 10 0 0012 2zm-1.5 5.5a1.5 1.5 0 111.5 1.5 1.5 1.5 0 01-1.5-1.5zm8.5 10.5H3v2a2 2 0 002 2h14a2 2 0 002-2v-2z"/>
        {/if}
      {/if}
    </svg>
  {/if}
</div>

<style>
  .game-token {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: color var(--transition-fast), transform var(--transition-fast);
  }
  
  img {
    object-fit: contain;
  }
</style>
