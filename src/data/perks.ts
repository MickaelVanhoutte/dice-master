import type { Perk, PerkEffects } from '../game/types'

export const PERKS: Perk[] = [
  {
    id: 'extraDie',
    name: 'Extra Die',
    desc: '+1 die each turn.',
    maxLevel: 2,
    costPerLevel: [3, 5],
    perLevel: 1,
  },
  {
    id: 'extraReroll',
    name: 'Reroll',
    desc: '+1 reroll each turn.',
    maxLevel: 3,
    costPerLevel: [2, 3, 4],
    perLevel: 1,
  },
  {
    id: 'regen',
    name: 'Regeneration',
    desc: 'Heal HP at the start of each turn.',
    maxLevel: 5,
    costPerLevel: [1, 2, 2, 3, 3],
    perLevel: 2,
  },
  {
    id: 'physResist',
    name: 'Iron Skin',
    desc: 'Reduce physical damage taken.',
    maxLevel: 5,
    costPerLevel: [1, 2, 2, 3, 3],
    perLevel: 0.06, // 6% per level
  },
  {
    id: 'magResist',
    name: 'Warded Mind',
    desc: 'Reduce magical damage taken.',
    maxLevel: 5,
    costPerLevel: [1, 2, 2, 3, 3],
    perLevel: 0.06,
  },
  {
    id: 'greed',
    name: 'Greed',
    desc: 'Gain more gold.',
    maxLevel: 4,
    costPerLevel: [1, 2, 2, 3],
    perLevel: 0.12, // +12% gold per level
  },
  {
    id: 'thrift',
    name: 'Thrift',
    desc: 'Cheaper skill upgrades.',
    maxLevel: 4,
    costPerLevel: [1, 2, 2, 3],
    perLevel: 0.1, // 10% discount per level
  },
  {
    id: 'vitality',
    name: 'Vitality',
    desc: '+Max HP.',
    maxLevel: 6,
    costPerLevel: [1, 1, 2, 2, 3, 3],
    perLevel: 12,
  },
  {
    id: 'startShield',
    name: 'Bulwark',
    desc: 'Start each fight with shield.',
    maxLevel: 4,
    costPerLevel: [1, 2, 2, 3],
    perLevel: 6,
  },
  {
    id: 'startGold',
    name: 'Nest Egg',
    desc: 'Start each run with gold.',
    maxLevel: 4,
    costPerLevel: [1, 1, 2, 2],
    perLevel: 20,
  },
]

export const PERKS_BY_ID = Object.fromEntries(PERKS.map((p) => [p.id, p]))

const BASE_MAX_HP = 100

export function baseMaxHp(): number {
  return BASE_MAX_HP
}

// Aggregate owned perk levels into concrete run effects.
export function aggregatePerks(levels: Record<string, number>): PerkEffects {
  const lv = (id: string) => levels[id] ?? 0
  const perkVal = (id: string) => (PERKS_BY_ID[id]?.perLevel ?? 0) * lv(id)
  return {
    extraDice: lv('extraDie'),
    extraRerolls: lv('extraReroll'),
    hpRegenPerTurn: perkVal('regen'),
    physResistPct: Math.min(0.6, perkVal('physResist')),
    magResistPct: Math.min(0.6, perkVal('magResist')),
    goldPct: perkVal('greed'),
    upgradeDiscountPct: Math.min(0.6, perkVal('thrift')),
    bonusMaxHp: perkVal('vitality'),
    startShield: perkVal('startShield'),
    startGold: perkVal('startGold'),
  }
}
