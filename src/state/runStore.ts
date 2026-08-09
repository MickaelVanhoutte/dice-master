import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Character, CombatState, RunState, Skill } from '../game/types'
import { makeRng, randomSeed, type RNG } from '../game/rng'
import {
  initCombat,
  rerollDie,
  resolveMonsterTurn,
  resolveStep,
  rollPlayer,
  startResolve,
} from '../game/combat'
import { scaleMonster, goldReward, skillDropChance } from '../game/scaling'
import { scaleSkill, upgradeCost } from '../game/skillMath'
import { monsterForBoss } from '../data/monsters'
import { DEFAULT_SLOTS, DROP_POOL, SKILLS_BY_ID, STARTER_SKILL_IDS } from '../data/skills'
import { aggregatePerks, baseMaxHp } from '../data/perks'
import { XP } from '../game/xp'
import { useMeta } from './metaStore'

export type Screen =
  | 'menu'
  | 'prep'
  | 'combat'
  | 'reward'
  | 'gameover'
  | 'bestiary'
  | 'perks'

export interface RewardOffer {
  gold: number // boss clear reward
  battleGold: number // gold earned from skills/effects during the fight
  skillId: string | null
}

export interface GameOverSummary {
  bossReached: number
  bossesDefeated: number
  xpGained: number
  leveledUp: boolean
  newLevel: number
}

interface RunStore {
  screen: Screen
  run: RunState | null
  combat: CombatState | null
  reward: RewardOffer | null
  gameOver: GameOverSummary | null
  rollNonce: number // bump to retrigger dice animation

  goTo: (s: Screen) => void
  newRun: (character: Character) => void
  setCharacter: (character: Character) => void
  setSlot: (slot: number, skillId: string | null) => void
  swapSlots: (a: number, b: number) => void
  upgradeSkill: (skillId: string) => void
  startFight: () => void
  roll: () => void
  reroll: (index: number) => void
  confirm: () => void
  resolveStep: () => void
  monsterStep: () => void
  claimReward: (takeSkill: boolean) => void
  abandonRun: () => void
  handleWin: () => void
  handleLoss: () => void
}

// ── run-scoped RNG (recreated lazily after reload) ─────────────────────────
let rng: RNG | null = null
let rngSeed = 0
function getRng(seed: number): RNG {
  if (!rng || rngSeed !== seed) {
    rng = makeRng(seed)
    rngSeed = seed
  }
  return rng
}

// Build the concrete (leveled) loadout for combat from a run's slots.
export function buildLoadout(run: RunState): (Skill | null)[] {
  const out: (Skill | null)[] = [null, null, null, null, null, null, null]
  for (let slot = 1; slot <= 6; slot++) {
    const id = run.slots[slot]
    if (!id) continue
    const owned = run.owned.find((o) => o.id === id)
    const base = SKILLS_BY_ID[id]
    if (owned && base) out[slot] = scaleSkill(base, owned.level)
  }
  return out
}

function currentPerks() {
  return aggregatePerks(useMeta.getState().perks)
}

// Weighted skill drop from the unowned pool.
function rollSkillDrop(run: RunState, r: RNG): string | null {
  const ownedIds = new Set(run.owned.map((o) => o.id))
  const pool = DROP_POOL.filter((s) => !ownedIds.has(s.id))
  if (pool.length === 0) return null
  const weight = (rarity: Skill['rarity']) => (rarity === 'common' ? 6 : rarity === 'rare' ? 3 : 1)
  const total = pool.reduce((a, s) => a + weight(s.rarity), 0)
  let x = r.next() * total
  for (const s of pool) {
    x -= weight(s.rarity)
    if (x <= 0) return s.id
  }
  return pool[pool.length - 1].id
}

export const useRun = create<RunStore>()(
  persist(
    (set, get) => ({
      screen: 'menu',
      run: null,
      combat: null,
      reward: null,
      gameOver: null,
      rollNonce: 0,

      goTo: (s) => set({ screen: s }),

      newRun: (character) => {
        const meta = useMeta.getState()
        meta.discoverCharacter(character.id)
        meta.markSkillsSeen(STARTER_SKILL_IDS)
        const perks = currentPerks()
        const maxHp = baseMaxHp() + perks.bonusMaxHp + (character.bonusMaxHp ?? 0)
        // Start with the full unlocked collection equippable (starters + everything
        // ever discovered), each at level 0.
        const unlocked = [...new Set([...STARTER_SKILL_IDS, ...meta.seenSkills])].filter(
          (id) => SKILLS_BY_ID[id],
        )
        const run: RunState = {
          character,
          slots: [...DEFAULT_SLOTS],
          owned: unlocked.map((id) => ({ id, level: 0 })),
          gold: perks.startGold,
          hp: maxHp,
          maxHp,
          bossIndex: 1,
          seed: randomSeed(),
          started: true,
        }
        rng = null
        set({ run, combat: null, reward: null, gameOver: null, screen: 'prep' })
      },

      // Swap hero — only allowed before the first fight (boss 1, not yet fighting).
      setCharacter: (character) => {
        const run = get().run
        if (!run || run.bossIndex !== 1 || get().combat) return
        const meta = useMeta.getState()
        meta.discoverCharacter(character.id)
        const perks = currentPerks()
        const maxHp = baseMaxHp() + perks.bonusMaxHp + (character.bonusMaxHp ?? 0)
        set({ run: { ...run, character, maxHp, hp: maxHp } })
      },

      setSlot: (slot, skillId) => {
        const run = get().run
        if (!run) return
        const slots = [...run.slots]
        if (!skillId) {
          slots[slot] = null
          set({ run: { ...run, slots } })
          return
        }
        // Copy cap: starter skills may be equipped twice, others once. If placing
        // would exceed the cap, drop the earliest existing copy (i.e. move it).
        const max = STARTER_SKILL_IDS.includes(skillId) ? 2 : 1
        slots[slot] = skillId
        const copies: number[] = []
        for (let i = 1; i <= 6; i++) if (slots[i] === skillId) copies.push(i)
        let idx = 0
        while (copies.length - idx > max) {
          const rm = copies[idx] === slot ? copies[idx + 1] : copies[idx]
          slots[rm] = null
          idx++
        }
        set({ run: { ...run, slots } })
      },

      swapSlots: (a, b) => {
        const run = get().run
        if (!run || a === b) return
        const slots = [...run.slots]
        ;[slots[a], slots[b]] = [slots[b], slots[a]]
        set({ run: { ...run, slots } })
      },

      upgradeSkill: (skillId) => {
        const run = get().run
        if (!run) return
        const owned = run.owned.find((o) => o.id === skillId)
        const base = SKILLS_BY_ID[skillId]
        if (!owned || !base) return
        const perks = currentPerks()
        const cost = Math.round(upgradeCost(base, owned.level) * (1 - perks.upgradeDiscountPct))
        if (run.gold < cost) return
        set({
          run: {
            ...run,
            gold: run.gold - cost,
            owned: run.owned.map((o) => (o.id === skillId ? { ...o, level: o.level + 1 } : o)),
          },
        })
      },

      startFight: () => {
        const run = get().run
        if (!run) return
        const perks = currentPerks()
        const base = monsterForBoss(run.bossIndex)
        const monster = scaleMonster(base, run.bossIndex)
        const loadout = buildLoadout(run)
        const combat = initCombat({ loadout, character: run.character, perks }, monster, run.hp, run.maxHp)
        getRng(run.seed + run.bossIndex * 1000)
        set({ combat, screen: 'combat' })
      },

      roll: () => {
        const { combat, run } = get()
        if (!combat || !run) return
        const r = getRng(run.seed + run.bossIndex * 1000)
        set({ combat: rollPlayer(combat, r), rollNonce: get().rollNonce + 1 })
      },

      reroll: (index) => {
        const { combat, run } = get()
        if (!combat || !run) return
        const r = getRng(run.seed + run.bossIndex * 1000)
        set({ combat: rerollDie(combat, index, r) })
      },

      confirm: () => {
        const { combat, run } = get()
        if (!combat || !run) return
        set({ combat: startResolve(combat) })
      },

      resolveStep: () => {
        const { combat, run } = get()
        if (!combat || !run) return
        const next = resolveStep(combat)
        set({ combat: next })
        if (next.phase === 'won') get().handleWin()
        else if (next.phase === 'lost') get().handleLoss()
      },

      monsterStep: () => {
        const { combat, run } = get()
        if (!combat || !run) return
        const next = resolveMonsterTurn(combat)
        set({ combat: next })
        if (next.phase === 'won') get().handleWin()
        else if (next.phase === 'lost') get().handleLoss()
      },

      handleWin: () => {
        const run = get().run
        if (!run) return
        const meta = useMeta.getState()
        meta.discoverMonster(monsterForBoss(run.bossIndex).id)
        const r = getRng(run.seed + run.bossIndex * 1000)
        const gold = goldReward(run.bossIndex)
        const battleGold = get().combat?.goldGained ?? 0
        const dropRoll = r.next() < skillDropChance(run.bossIndex)
        const skillId = dropRoll ? rollSkillDrop(run, r) : null
        set({ reward: { gold, battleGold, skillId }, screen: 'reward' })
      },

      handleLoss: () => {
        const run = get().run
        if (!run) return
        const meta = useMeta.getState()
        const bossesDefeated = run.bossIndex - 1
        const xp = XP.perBossReached * run.bossIndex + XP.winBonus * bossesDefeated
        const res = meta.addXp(xp)
        set({
          gameOver: {
            bossReached: run.bossIndex,
            bossesDefeated,
            xpGained: xp,
            leveledUp: res.leveledUp,
            newLevel: res.newLevel,
          },
          combat: null,
          screen: 'gameover',
        })
      },

      claimReward: (takeSkill) => {
        const { run, reward } = get()
        if (!run || !reward) return
        const meta = useMeta.getState()
        let owned = run.owned
        if (takeSkill && reward.skillId && !owned.some((o) => o.id === reward.skillId)) {
          owned = [...owned, { id: reward.skillId, level: 0 }]
          meta.discoverSkill(reward.skillId)
        }
        // Full heal between battles. Battle gold + boss reward both banked.
        set({
          run: {
            ...run,
            gold: run.gold + reward.gold + reward.battleGold,
            owned,
            hp: run.maxHp,
            bossIndex: run.bossIndex + 1,
          },
          reward: null,
          combat: null,
          screen: 'prep',
        })
      },

      abandonRun: () => {
        set({ run: null, combat: null, reward: null, gameOver: null, screen: 'menu' })
      },
    }),
    {
      name: 'dm-run',
      version: 1,
      partialize: (s) => ({
        screen: s.screen,
        run: s.run,
        combat: s.combat,
        reward: s.reward,
        gameOver: s.gameOver,
      }),
    },
  ),
)
