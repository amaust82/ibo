# Project Scope & Specifications Template

Use this document to define the scope, specifications, goals, and technical guidelines for the new web project. Fill out each section with as much detail as possible to align our vision and establish a clear roadmap.

---

## 1. Project Overview

### 1.1 Executive Summary
The goal of this project is to create a web app to automate managing the Intelligent Barbarian Opponent (IBO) for the game "Clash of Cultures Monumental Edition".

---

## 2. Design Aesthetics & User Experience (UX)

### 2.1 Aesthetic Theme & Vibe: "Ancient Gold Pantheon"
A dual-theme system that blends modern mobile screen comfort with classical antiquarian colors. Users can toggle between Dark and Light mode seamlessly.

* **Vibe Keywords:** Epic, historic, clean contrast, tactile, responsive.
* **Color Palettes:**
  * **Dark Mode (Default - "Sleek Obsidian Pantheon"):**
    * *Canvas Background:* Deep Obsidian Slate (`#111317` or `hsl(220, 15%, 8%)`) for table-side comfort.
    * *Cards / Content panels:* Granite Gray (`#1e2127` or `hsl(220, 13%, 13%)`).
    * *Text / Borders:* Crisp Alabaster White (`#f8fafc`).
  * **Light Mode ("Imperial Parchment"):**
    * *Canvas Background:* Smooth warm Alabaster/Parchment (`#fbfaf7` or `hsl(45, 20%, 98%)`).
    * *Cards / Content panels:* Soft Roman Marble (`#f4efe6` or `hsl(40, 25%, 93%)`).
    * *Text / Borders:* Deep Charcoal Slate (`#1e293b`).
  * **Shared Accents (Both Themes):**
    * *Primary Accent:* Roman Gold (`#D4AF37`) & Burnished Bronze (`#A87C43`) for main buttons, headers, and dice glows.
    * *Aggression / Alert:* Terracotta Crimson (`#9A2A2A`).
    * *Growth / Agriculture:* Forest Olive (`#2F5A3E`).

### 2.2 Typography & Branding
* **Heading Font:** **Cinzel** (Google Fonts) – A serif font based on classical Roman monumental inscriptions, conveying weight and history.
* **Body Font:** **Plus Jakarta Sans** (Google Fonts) – A clean, highly legible, modern geometric sans-serif, ensuring statistics, resource numbers, and flowchart steps are crisp and easy to read at a glance on mobile devices.

### 2.3 Interactive Elements & Micro-Animations
* [ ] **Tactile Toggle:** A slide switch for Light/Dark mode transitions.
* [ ] **Interactive Dice Glow:** Animated gold shadow glow behind simulated dice.
* [ ] **Scale sliding transition:** Soft slide-and-fade (250ms) animations when scale pieces shift leftward.


---

## 3. Functional Specifications (Features)

### 3.1 Phase 1: Core MVP (Minimum Viable Product)
1. **Interactive Setup Wizard:**
   * Select game length: Standard (6 Ages) vs. Shorter Game (4 Ages, includes automatic starting construct action).
   * Select difficulty level (Easy, Easier, Normal, Harder, Hard) which dynamically governs how many Action Cards the IBO plays in each Age.
   * Select IBO Civilization: Choice of Generic/Standard rules, or one of the 4 starter civilizations: **Rome, Greece, China, or Vikings**.
   * Display visual guide for starting board setup based on selections (starting scale positions, initial units, resources).
2. **Tactile Dashboard (Interactive Character Sheet):**
   * Single-page, mobile-first responsive grid.
   * *Scale Tracker:* Displays the 0 to 7 Scale, indicating which city-pieces are currently slotted (Settlements, Temples, Fortresses, etc.).
   * *Resource Pools:* Tap-friendly increments for Gold, Food, Ideas, Wood, and Ore.
   * *City-Track Order Manager:* Easily add, reorder, or mark cities as "Angry" (which prevents settler movement/recruiting).
3. **Interactive Action Engine (IBO Turn Solver):**
   * Displays how many actions the IBO gets for the current turn/Age.
   * *Manual Event Icon Input:* Clean button grid mapping the drawn physical Event Card icons (Advance, Recruit, Attack, Influence Culture, No Icon/Construct, Civ-Specific).
   * *Automated Resolution Guides:*
     * **Advance Solver:** Simulates rolling 3 dice, reads values, determines category based on completed hierarchies, handles first Government choices, and outputs exactly what the IBO learns.
     * **Recruit Solver:** Asks if a Market is built, runs simulated die rolls for special units (Cavalry/Elephants), and respects the "Mood-altered City-Size limit" (Happy +1, Angry = 1).
     * **Bypass Fallback:** If a target/action cannot physically be completed on the board, a simple "Action Blocked" button automatically guides the player to the next action down in the priority chain.

### 3.2 Phase 2: Nice-to-Haves & Future Roadmap
* **Event Card Deck Simulator Module:** Fully virtualized card draws (icon + text resolution) to eliminate the need for the physical deck entirely if preferred.
* **Full Civilization & Leader Roster:** Implement the remaining 11 Civilizations and all 40+ Leader cards.
* **Multiplayer Setup Mode:** Support for tracking multiple IBO bots at once.

### 3.3 Core User Flows
1. **Flow 1: Initialization**
   * Launch App $\rightarrow$ Click "New Solo Game" $\rightarrow$ Setup Wizard (choose Civilization, Difficulty, Length) $\rightarrow$ Tap "Begin" $\rightarrow$ Main dashboard initializes with preset starting assets (e.g., standard starting Infantry and scale positions).
2. **Flow 2: Active Gameplay Loop**
   * Draw physical Event Card $\rightarrow$ Tap matching icon button on the app dashboard.
   * *If Advance:* App shows "Rolling 3 Dice..." $\rightarrow$ Gold glow highlights result $\rightarrow$ App outputs: *"IBO researches: Priesthood (Spirituality). Place Temple on Scale space 0."*
   * *If Recruit:* App reads city-track, prompts active rolls, and outputs: *"Recruit 1 Infantry in City B (Wood). Built Port gives 1 Ship in Sea Area 2."*
   * User physically updates the tabletop board $\rightarrow$ Confirms step in app $\rightarrow$ App updates IBO stats $\rightarrow$ Action count decrements.
   * *End of Age:* App triggers "Status Phase" wizard, prompting the user through objectives check, free advances, and first player determination rolls.

---

## 4. Technical Architecture & Tech Stack

### 4.1 Frontend Architecture & Tooling
* **Build Tool / Compiler:** Vite + Svelte (TypeScript native).
  * *Why:* Svelte's compile-time approach compiles code into highly efficient, vanilla DOM manipulations, ensuring a tiny bundle size (~16KB runtime footprint) and lightning-fast loading on mobile and tablet screens.
* **State Management:** Svelte native **Stores** (Svelte's lightweight reactive observables) for robust, bulletproof tracking of nested game state variables (resource pools, active techs, scale queues).
* **Programming Language:** **TypeScript**. Full typing for all game rules, civilizations, and action flows, utilizing interface contracts to prevent runtime execution errors.

### 4.2 Styling & Responsive UI
* **Styling Strategy:** Modern Vanilla CSS using CSS Variables, organized inside Single-File Svelte components.
* **Responsive Layout:** CSS Grid/Flexbox designed with touch-targets optimized for mobile/tablet screens. 
* **Theming Engine:** Double-theme system (Sleek Obsidian Pantheon Dark Mode vs. Imperial Parchment Light Mode) with HSL values mapped to custom global utility classes.

### 4.3 Offline capabilities (PWA)
* **PWA Plugin:** `@vite-pwa/svelte` configured via Vite.
* **Offline Caching:** Service worker setup to automatically pre-cache all assets (logic, HTML, styling, fonts).
* **Manifest Config:** Full home-screen capability (custom app icons, standalone theme colors, launching in full screen without the browser URL bar on iOS/Android).

### 4.4 Hosting / Deployment
* **Hosting:** Netlify or Vercel (static deployment with instant, global CDN caching). Fully runnable offline once added to the home screen.

---

## 5. Performance, SEO & Accessibility Standards

### 5.1 SEO Best Practices
* **Metadata:** Custom metadata optimized for search queries such as "Clash of Cultures Solo Companion App" or "Intelligent Barbarian Opponent Helper".
* **Semantic HTML:** Appropriate markup (`<main>`, `<section>`, `<header>`, `<article>`) for a structured document outline.

### 5.2 Performance Benchmarks
* **Initial Page Load:** < 500ms on mobile viewports.
* **Initial Bundle Size:** < 30KB gzipped total application package.
* **Lighthouse Target:** 100/100 across Performance, SEO, and Best Practices.



---

## 7. Risks, Constraints & Notes
* **Risk 1: Dynamic Rule Complexities**
  * *Description:* Civilizations have rules that break base IBO mechanics (e.g., Rome's captived-unit conversions, Vikings' sea travel without ships).
  * *Mitigation:* Focus MVP strictly on simple custom rules for the 4 starter civilizations before tackling highly complex edge cases like Carthage or Huns.
* **Risk 2: Viewport constraints next to a massive physical board**
  * *Description:* Screen-space at a board gaming table is valuable. A bulky layout will be unusable on a phone or small tablet.
  * *Mitigation:* Design touch elements with high padding but small layouts, single-column dashboard on phones, and split-screen columns on tablets.

