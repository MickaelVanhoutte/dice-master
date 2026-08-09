import type { Monster, MonsterCombat } from './types'

// All difficulty knobs live here. bossIndex is 1-based.
export const SCALING = {
  hpBase: 1.0,
  hpGrowth: 1.34,
  atkBase: 1.0,
  atkGrowth: 1.24,
  shieldGrowth: 1.22,
  goldBase: 12,
  goldGrowth: 1.18,
  turnEscalation: 0.14, // boss damage grows +14% of base each turn (anti-stall)
}

// Multiplier on a boss's attack for a given turn (turn 1 = 1.0).
export function attackEscalation(turn: number): number {
  return 1 + SCALING.turnEscalation * Math.max(0, turn - 1)
}

export function scaleMonster(base: Monster, bossIndex: number): MonsterCombat {
  const hpMult = Math.pow(SCALING.hpGrowth, bossIndex - 1)
  const atkMult = Math.pow(SCALING.atkGrowth, bossIndex - 1)
  const shMult = Math.pow(SCALING.shieldGrowth, bossIndex - 1)
  const hp = Math.round(base.baseHp * hpMult)
  return {
    id: base.id,
    name: base.name,
    art: base.art,
    bossIndex,
    hp,
    maxHp: hp,
    shield: Math.round(base.baseShield * shMult),
    attack: {
      physical: Math.round(base.baseAttack.physical * atkMult),
      magical: Math.round(base.baseAttack.magical * atkMult),
    },
    passive: { ...base.passive, value: Math.round(base.passive.value * atkMult) },
    passiveMemory: 0,
    debuffs: [],
  }
}

// Gold rewarded for defeating boss n.
export function goldReward(bossIndex: number): number {
  return Math.round(SCALING.goldBase * Math.pow(SCALING.goldGrowth, bossIndex - 1))
}

// Chance to be offered a new skill after a win. Higher early to bootstrap builds.
export function skillDropChance(bossIndex: number): number {
  return Math.max(0.3, 0.7 - 0.05 * (bossIndex - 1))
}
