# CLAUDE.md

Guidance for working in this repo.

## What this is

**Dice Masters** — a mobile-first browser roguelike. No backend; progress persists to
`localStorage`. Roll 3 dice each turn, each die value fires the skill in the matching
slot (1–6). Doubles/triples boost all effects. Beat bosses for gold + new skills, die
to earn XP → permanent character perks.

Stack: **React 18 + TypeScript + Vite**, **Zustand** (`persist`), **Framer Motion**,
**vite-plugin-pwa** (installable/offline).

## Commands

```bash
npm run dev              # dev server (use a portrait/mobile viewport)
npm run build            # tsc -b && vite build → dist/
npm run test             # Vitest engine unit tests
npm run test:watch
npm run sim              # balance sim: base run, no upgrades
npm run sim -- upgrade   # balance sim: greedy upgrades
```

Always run `npm run test` and `npm run build` (which typechecks via `tsc -b`) before
committing engine or data changes.

## Architecture

Pure game logic (no React, deterministic, unit-tested) is separated from UI. Keep it
that way — do not import React or stores into `src/game/`.

- `src/game/` — engine
  - `types.ts` — all shared types
  - `rng.ts` — seedable mulberry32 PRNG (deterministic → testable)
  - `dice.ts` — roll + combo analysis (`multiplier = 1 + 0.1*(maxSame-1)`)
  - `effects.ts` — effect resolver + condition eval + buff/debuff mod helpers
  - `combat.ts` — turn engine: `initCombat`, `rollPlayer`, `rerollDie`,
    `confirmPlayerTurn`, `resolveMonsterTurn`. Pure functions over immutable
    `CombatState` (each `clone`s via `structuredClone`).
  - `scaling.ts` — difficulty curve (all knobs here), gold + skill-drop rates
  - `xp.ts` — XP thresholds / level math
  - `skillMath.ts` — `scaleSkill` (upgrade scaling ×1.25/level), `upgradeCost`
- `src/data/` — all content & balance (data-driven; extend here, not in the engine)
  - `skills.ts` (35), `monsters.ts` (10 + passives), `characters.ts` (6),
    `perks.ts` (meta tree + `aggregatePerks`)
- `src/state/` — Zustand stores
  - `metaStore.ts` — persistent: XP, level, perk points/levels, bestiary, mute
  - `runStore.ts` — active run + combat + `screen` state machine; wraps the engine
- `src/assets/AssetRegistry.tsx` — **all art is inline SVG** (procedural monsters/
  heroes, role icons, dice faces). Swappable: real art replaces these components
  without touching game code.
- `src/ui/` — `screens/` (Menu, Prep, Combat, Reward, GameOver, Perks, Bestiary),
  `components/` (BossPanel, DiceBoard, SkillBar, PlayerPanel, Bars, Floaters),
  `describe.ts` (skill → text). Styles: `styles/tokens.css`, `styles/global.css`,
  `ui/ui.css` (plain CSS with class names, not CSS modules).

## Conventions

- **No vertical scroll on gameplay screens.** Menu, Prep, Combat, Reward, GameOver must
  fit within `100dvh` — no page scroll. The only things allowed to scroll are modals/drawers
  and bounded catalog lists (Perks, Bestiary) whose header stays fixed while an inner
  `.scroll-area` scrolls. It is a mobile game: it must fit the screen. When adding content
  to a gameplay screen, make it fit (grids, drawers, compaction) — do not let the page grow.
- **No emoji, ever. No raster images baked in.** All visuals are SVG via `AssetRegistry`
  or optional swappable raster in `public/art/`.
- Engine stays pure + covered by tests in `src/game/*.test.ts`. Add a test when you
  add/alter a combat rule.
- New content = data only. A new skill is an entry in `skills.ts`; a new monster
  passive needs a `MonsterPassiveKind` + a case in `combat.ts`'s `resolveMonsterTurn`.
- Combat rules: physical is absorbed by shield first; magical ignores shield. A triple
  fires the same slot 3× (each with the combo bonus).
- Mobile portrait: `100dvh`, safe-area insets, ≥44px tap targets.

## Balance

Target: a first run (base hero, no perks/upgrades) stalls around **boss 3–4**; perks +
collected/upgraded skills push further. `npm run sim` confirms median ≈ boss 4 base,
~6 with upgrades. Full heal between battles — per-fight lethality is the threat. Tune
in `src/game/scaling.ts` and `src/data/*`, then re-run the sim.

## Deploy

Pushes to `main` build and publish to GitHub Pages via
`.github/workflows/deploy.yml` (test → build → upload `dist` → deploy). Live at
`https://mickaelvanhoutte.github.io/dice-master/`. Vite `base` is `'./'` (relative),
so the project subpath works without extra config.
