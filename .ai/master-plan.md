# IBO Companion - Master Plan

This is our local master plan for the Clash of Cultures IBO companion app. We will check off steps as we complete them. If a session is interrupted, we can consult `.ai/state-tracker.md` to restore absolute context instantly.

---

## 📋 High-Level Roadmap

- `[ ]` Planned
- `[/]` In Progress
- `[x]` Completed

## Helpful Resources
- [Clash of Cultures Rulebook PDF](d:\Projects\ibo\.ai\resources\Clash-of-Cultures---Rulebook---WEB---2021-02-26-compressed.pdf)
- [IBO Opponent Rulebook](d:\Projects\ibo\.ai\resources\CoC_ME_Solo_Instructions_v1_6.pdf)

### Phase 1: Styling Foundation & Dual-Theme Toggler
- [x] Setup `src/app.css` with HSL variables for both themes (Obsidian Dark & Imperial Parchment Light)
- [x] Add modern touch-friendly CSS reset
- [x] Implement global theme toggle store/runes
- [x] Build the decoupled, media-agnostic `<GameToken />` vector component (supports both vectors and image pivots)

### Phase 2: Decoupled TS IBO Rules Engine (Pure Library)
- [x] Write strict TypeScript type interfaces (`src/lib/ibo-engine/types.ts`)
- [x] Build core `IboEngine` class managing standard board game rules and action phases (`src/lib/ibo-engine/engine.ts`)
- [x] Implement simulated 3-dice advance rollers with completed category priority logic
- [x] Code custom rule overlays for first 4 civilizations: **Rome, Greece, China, and Vikings**
- [x] Write unit tests (`engine.spec.ts`) to verify engine ruleset accuracy

### Phase 3: Reactive Store & Session Autosave
- [ ] Build Svelte Store wrapper (`src/stores/iboStore.ts`)
- [ ] Integrate lightweight JSON serialization for `localStorage` active state autosaving

### Phase 4: Setup Wizard & Responsive Layouts
- [ ] Build introductory Setup Wizard component (civ, length, and difficulty selectors)
- [ ] Implement primary dashboard shell optimized for landscape tablet/phone screens
- [ ] Code touch-friendly resource counters and scale visualizers

### Phase 5: Action Solver Engine & UI
- [ ] Build manual event card icon inputs
- [ ] Implement detailed action description log and cascade bypass buttons
- [ ] Create automated Status Phase resolver

### Phase 6: PWA Registration & Deployment
- [ ] Configure Vite PWA offline pre-caching
- [ ] Generate mobile manifests and launcher icon definitions
- [ ] Deploy to Netlify / Vercel
- [ ] Verify 100% offline standalone operation on mobile devices
