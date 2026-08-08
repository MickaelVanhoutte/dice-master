import { describe, expect, it } from 'vitest'
import { confirmPlayerTurn, initCombat, resolveMonsterTurn } from './combat'
import type { CombatSetup, CombatState, MonsterCombat, Skill } from './types'
import { aggregatePerks } from '../data/perks'
import { CHARACTERS_BY_ID } from '../data/characters'
import { SKILLS_BY_ID } from '../data/skills'

const ZERO_PERKS = aggregatePerks({})

function setup(slots: Record<number, string>): CombatSetup {
  const loadout: (Skill | null)[] = [null, null, null, null, null, null, null]
  for (const [k, id] of Object.entries(slots)) loadout[Number(k)] = SKILLS_BY_ID[id]
  return { loadout, character: CHARACTERS_BY_ID.wanderer, perks: ZERO_PERKS }
}

function monster(over: Partial<MonsterCombat> = {}): MonsterCombat {
  return {
    id: 'test',
    name: 'Dummy',
    art: 'mon-slime',
    bossIndex: 1,
    hp: 100,
    maxHp: 100,
    shield: 0,
    attack: { physical: 10, magical: 0 },
    passive: { kind: 'none', value: 0, label: '' },
    passiveMemory: 0,
    debuffs: [],
    ...over,
  }
}

// Build a state already in the 'rolled' phase with fixed dice.
function rolled(s: CombatSetup, m: MonsterCombat, dice: number[], hp = 100): CombatState {
  const st = initCombat(s, m, hp, 100)
  st.dice = dice
  st.phase = 'rolled'
  return st
}

describe('damage vs shield', () => {
  it('physical is absorbed by monster shield, magical ignores it', () => {
    const s = setup({ 1: 'slash', 2: 'spark' }) // phys 12, mag 10
    const st = rolled(s, monster({ shield: 10 }), [1, 2])
    const out = confirmPlayerTurn(st)
    // physical 12 vs shield 10 -> 2 to hp; magical 10 -> 10 to hp
    expect(out.monster.shield).toBe(0)
    expect(out.monster.hp).toBe(100 - 2 - 10)
  })
})

describe('combo multiplier', () => {
  it('a double boosts effect amounts by 10%', () => {
    const s = setup({ 3: 'spark' }) // magical 10
    // dice [3,3] -> both fire slot 3, double => x1.1 each => round(11)*2
    const st = rolled(s, monster(), [3, 3])
    const out = confirmPlayerTurn(st)
    expect(out.monster.hp).toBe(100 - 11 - 11)
  })
})

describe('conditional effects', () => {
  it('riposte only shields when enemy has no shield', () => {
    const s = setup({ 1: 'riposte' })
    const out = confirmPlayerTurn(rolled(s, monster({ shield: 0 }), [1]))
    expect(out.player.shield).toBe(8)
    expect(out.monster.hp).toBe(100)
  })
  it('riposte also strikes when enemy has shield', () => {
    const s = setup({ 1: 'riposte' })
    const out = confirmPlayerTurn(rolled(s, monster({ shield: 10 }), [1]))
    expect(out.player.shield).toBe(8)
    // physical 14 vs shield 10 -> 4 to hp
    expect(out.monster.hp).toBe(100 - 4)
    expect(out.monster.shield).toBe(0)
  })
})

describe('monster passives', () => {
  it('shieldReflect adds shield as magical that ignores player shield', () => {
    const s = setup({})
    const m = monster({ shield: 20, attack: { physical: 8, magical: 0 }, passive: { kind: 'shieldReflect', value: 0, label: '' } })
    const st = initCombat(s, m, 100, 100)
    st.phase = 'monster'
    st.player.shield = 0
    const out = resolveMonsterTurn(st)
    expect(out.player.hp).toBe(100 - 8 - 20)
    expect(out.phase).toBe('player')
  })
  it('regen heals the monster on its turn', () => {
    const s = setup({})
    const m = monster({ hp: 50, passive: { kind: 'regen', value: 8, label: '' }, attack: { physical: 0, magical: 0 } })
    const st = initCombat(s, m, 100, 100)
    st.phase = 'monster'
    const out = resolveMonsterTurn(st)
    expect(out.monster.hp).toBe(58)
  })
})

describe('debuffs', () => {
  it('poison ticks true damage on the monster turn', () => {
    const s = setup({ 1: 'poisondagger' }) // phys 6 + poison 4/3
    const afterPlayer = confirmPlayerTurn(rolled(s, monster({ hp: 100 }), [1]))
    expect(afterPlayer.monster.hp).toBe(100 - 6)
    afterPlayer.phase = 'monster'
    const afterMonster = resolveMonsterTurn(afterPlayer)
    // poison 4 true damage
    expect(afterMonster.monster.hp).toBe(100 - 6 - 4)
  })
  it('weaken reduces monster physical attack', () => {
    const s = setup({ 1: 'hexbolt' }) // mag 9 + weaken 4/2
    const afterPlayer = confirmPlayerTurn(rolled(s, monster({ attack: { physical: 10, magical: 0 } }), [1]))
    afterPlayer.phase = 'monster'
    afterPlayer.player.shield = 0
    const afterMonster = resolveMonsterTurn(afterPlayer)
    // attack 10 - weaken 4 = 6 to hp
    expect(afterMonster.player.hp).toBe(100 - 6)
  })
})

describe('win/lose transitions', () => {
  it('marks won when monster hp hits 0', () => {
    const s = setup({ 1: 'overload' }) // mag 22
    const out = confirmPlayerTurn(rolled(s, monster({ hp: 20 }), [1]))
    expect(out.phase).toBe('won')
  })
})
