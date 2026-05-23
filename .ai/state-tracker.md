# IBO Companion - State Tracker

This file serves as our context booster. On fresh session starts or context clears, read this file first to instantly synchronize context.

---

## 🎯 Current Status

*   **Active Phase:** Phase 4: Setup Wizard & Responsive Layouts (popped & integrated)
*   **Active Sub-Step:** Launching dev server, testing Campaign Setup, resolving interactive dice rolls, and verifying PWA manifest standalone features.

## 🚀 Completed Milestones
- [x] Core project scope defined ([project-start.md](file:///d:/Projects/ibo/.ai/project-start.md))
- [x] Svelte 5 + TypeScript + Vite project scaffolded at root
- [x] Dev dependencies (`vite-plugin-pwa`) installed
- [x] Local Master Plan established ([master-plan.md](file:///d:/Projects/ibo/.ai/master-plan.md))
- [x] **Phase 1: Styling Foundation & Dual-Theme Toggler Completed** (Ancient Gold Pantheon dual-themes, custom typography, responsive grid resets, and inline vector `<GameToken />` components implemented)
- [x] **Phase 2: Decoupled TS IBO Rules Engine Completed** (Strict typing, 3-dice advance rollers with priority flowcharts, strategy civilization overlays, and core engine state machine implemented and verified via automated test suite)
- [x] **Phase 3: Reactive Store & Session Autosave Completed** (Svelte 5 reactive wrapper `src/stores/iboStore.svelte.ts` implemented with automatic `localStorage` serialization, verified and committed to repository)

## ➡️ Next Immediate Actions
1.  **Manual UI Exploration:** Run the development server and walk through the visual Setup Wizard and landscape companion dashboard.
2.  **Verify PWA Integration:** Ensure the service worker caches the layout properly and supports offline launch.

## ⚠️ Core Architectural Constraints
*   **Decoupled Brain:** All IBO rules, flowcharts, states, and roll calculations MUST stay inside `src/lib/ibo-engine/` with **zero imports** to Svelte or UI libraries.
*   **Svelte 5 Runes:** Use `$state()` and `$derived()` for UI reactive bindings in Svelte components.
*   **Token Abstraction:** All game icons, structures, and resource representations MUST route through `GameToken.svelte` to allow for easy image-swapping later.
