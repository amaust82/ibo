# IBO Companion - State Tracker

This file serves as our context booster. On fresh session starts or context clears, read this file first to instantly synchronize context.

---

## 🎯 Current Status

*   **Active Phase:** Phase 2: Decoupled TS IBO Rules Engine (Pure Library)
*   **Active Sub-Step:** Designing strict TypeScript type interfaces (`src/lib/ibo-engine/types.ts`) for resources, boards, scales, and events.

## 🚀 Completed Milestones
- [x] Core project scope defined ([project-start.md](file:///d:/Projects/ibo/.ai/project-start.md))
- [x] Svelte 5 + TypeScript + Vite project scaffolded at root
- [x] Dev dependencies (`vite-plugin-pwa`) installed
- [x] Local Master Plan established ([master-plan.md](file:///d:/Projects/ibo/.ai/master-plan.md))
- [x] **Phase 1: Styling Foundation & Dual-Theme Toggler Completed** (Ancient Gold Pantheon dual-themes, custom typography, responsive grid resets, and inline vector `<GameToken />` components implemented)

## ➡️ Next Immediate Actions
1.  **Strict Typing:** Create [src/lib/ibo-engine/types.ts](file:///d:/Projects/ibo/src/lib/ibo-engine/types.ts) with typed structures for the IBO engine's internal states.
2.  **Dice Rollers:** Build high-fidelity 3-dice rolling simulators conforming to completed category priority flowchart algorithms.
3.  **Engine Core:** Implement the standard `IboEngine` logic managing turn actions and phases.
4.  **Civilization Rules:** Implement specialized rule overlays for starter civs: Rome, Greece, China, and Vikings.

## ⚠️ Core Architectural Constraints
*   **Decoupled Brain:** All IBO rules, flowcharts, states, and roll calculations MUST stay inside `src/lib/ibo-engine/` with **zero imports** to Svelte or UI libraries.
*   **Svelte 5 Runes:** Use `$state()` and `$derived()` for UI reactive bindings in Svelte components.
*   **Token Abstraction:** All game icons, structures, and resource representations MUST route through `GameToken.svelte` to allow for easy image-swapping later.
