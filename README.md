# Dice Masters

A small mobile-first browser roguelike. Roll 3 dice each turn; each die value fires
the skill in the matching slot (1–6). Doubles/triples boost all effects. Beat bosses
for gold and new skills, die to earn XP and permanent character perks. No backend —
progress is saved to `localStorage`.

## Stack

React 18 + TypeScript + Vite · Zustand (with `persist`) · Framer Motion · PWA (installable, offline).

## Run

```bash
npm install
npm run dev      # http://localhost:5173  (use a mobile/portrait viewport)
npm run build    # production build + service worker
npm run test     # engine unit tests (Vitest)
npm run sim              # balance sim: base run, no upgrades
npm run sim -- upgrade   # balance sim: greedy upgrades
```

## Architecture

Pure, testable game logic (no React) is separated from UI:

- `src/game/` — engine: `types`, `rng` (seedable), `dice` (combo math), `effects`
  (effect resolver), `combat` (turn engine), `scaling` (difficulty curve), `xp`,
  `skillMath` (upgrade scaling).
- `src/data/` — all content & balance: `skills` (35), `monsters` (10 + passives),
  `characters` (6 fixed effects), `perks` (meta tree).
- `src/state/` — `metaStore` (persistent: XP, level, perks, bestiary), `runStore`
  (active run + combat + screen state machine).
- `src/assets/AssetRegistry.tsx` — swappable placeholder SVG art (procedural
  monsters/heroes, role icons, dice faces). Real art can replace these without
  touching game code. No emoji, no raster.
- `src/ui/` — screens (`Menu`, `Prep`, `Combat`, `Reward`, `GameOver`, `Perks`,
  `Bestiary`) and components (`BossPanel`, `DiceBoard`, `SkillBar`, `PlayerPanel`,
  bars, floaters).

## Combat rules

- Physical damage is absorbed by shield first; magical ignores shield.
- Combo multiplier: `1 + 0.1 × (maxSameCount − 1)` (double ×1.1, triple ×1.2, …).
- A triple fires the same slot three times, each with the combo bonus.
- Buffs (strength/ward/thorns), debuffs (weaken/poison/curse), sunder, heal, gold.
- Monster passives: regen, shieldGain, shieldReflect, ramp, lifesteal, thornsAura.

## Balance

All knobs live in `src/game/scaling.ts` and the `src/data/*` files. Target: a first
run (base hero, no perks/upgrades) stalls around boss 3–4; the sim confirms median ≈ 4,
rising with upgrades and meta perks.
