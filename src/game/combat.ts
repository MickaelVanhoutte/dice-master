import type { CombatSetup, CombatState, MonsterCombat } from './types'
import type { RNG } from './rng'
import { analyzeCombo, rollDice } from './dice'
import { applyEffect, evalCondition, pushEvent, sumMod, takenMult, tickMods } from './effects'
import { attackEscalation } from './scaling'

export function diceCount(setup: CombatSetup): number {
  return 3 + setup.perks.extraDice
}

export function rerollCount(setup: CombatSetup): number {
  return setup.perks.extraRerolls + (setup.character.bonusRerolls ?? 0)
}

export function initCombat(
  setup: CombatSetup,
  monster: MonsterCombat,
  hp: number,
  maxHp: number,
): CombatState {
  const rerolls = rerollCount(setup)
  const startShield = setup.perks.startShield + (setup.character.startShield ?? 0)
  return {
    setup,
    player: { hp, maxHp, shield: startShield, buffs: [], rerolls, maxRerolls: rerolls },
    monster,
    dice: null,
    goldGained: 0,
    turn: 1,
    lastComboDouble: false,
    phase: 'player',
    events: [],
    log: [`A ${monster.name} appears!`],
    eventSeq: 0,
  }
}

const clone = (s: CombatState): CombatState => structuredClone(s)

// Fresh roll — resets rerolls, applies character roll-fix.
export function rollPlayer(state: CombatState, rng: RNG): CombatState {
  if (state.phase !== 'player') return state
  const s = clone(state)
  s.events = []
  const dice = rollDice(diceCount(s.setup), rng)
  // Character: twin dice 2 & 3 (0-based 1 & 2) while hurt.
  if (s.setup.character.rollFix === 'twinWhenHurt' && s.player.hp / s.player.maxHp < 0.5) {
    if (dice.length >= 3) dice[2] = dice[1]
  }
  s.dice = dice
  s.player.rerolls = s.player.maxRerolls
  s.phase = 'rolled'
  return s
}

export function rerollDie(state: CombatState, index: number, rng: RNG): CombatState {
  if (state.phase !== 'rolled' || !state.dice) return state
  if (state.player.rerolls <= 0) return state
  if (index < 0 || index >= state.dice.length) return state
  const s = clone(state)
  s.dice![index] = rng.int(1, 6)
  s.player.rerolls -= 1
  return s
}

// Resolve the player's dice into skill effects.
export function confirmPlayerTurn(state: CombatState): CombatState {
  if (state.phase !== 'rolled' || !state.dice) return state
  const s = clone(state)
  s.events = []
  const dice = s.dice as number[]
  const combo = analyzeCombo(dice)
  s.lastComboDouble = combo.hasDouble
  const { loadout, character } = s.setup

  // Character per-turn effect (e.g. Blood Pact).
  if (character.perTurn) {
    if (character.perTurn.loseHp) {
      s.player.hp = Math.max(1, s.player.hp - character.perTurn.loseHp)
      pushEvent(s, 'player', `-${character.perTurn.loseHp}`, 'damage')
    }
    if (character.perTurn.gainGold) {
      const g = Math.round(character.perTurn.gainGold * (1 + s.setup.perks.goldPct))
      s.goldGained += g
      pushEvent(s, 'player', `+${g}g`, 'gold')
    }
  }

  let dealtAnyDamage = false
  for (const value of dice) {
    const skill = loadout[value]
    if (!skill) continue
    for (const eff of skill.effects) {
      if (eff.kind === 'damage') dealtAnyDamage = true
      applyEffect(s, eff, { combo })
    }
    if (skill.conditional && evalCondition(skill.conditional.when, s, combo)) {
      for (const eff of skill.conditional.bonus) {
        if (eff.kind === 'damage') dealtAnyDamage = true
        applyEffect(s, eff, { combo })
      }
    }
  }

  // Monster thorns aura: player takes damage for attacking.
  if (s.monster.passive.kind === 'thornsAura' && dealtAnyDamage) {
    s.player.hp = Math.max(0, s.player.hp - s.monster.passive.value)
    pushEvent(s, 'player', `-${s.monster.passive.value}`, 'magic')
  }

  s.dice = null
  if (s.monster.hp <= 0) {
    s.phase = 'won'
    s.log.push(`${s.monster.name} defeated!`)
  } else if (s.player.hp <= 0) {
    s.phase = 'lost'
  } else {
    s.phase = 'monster'
  }
  return s
}

// Monster acts, then hands turn back to the player.
export function resolveMonsterTurn(state: CombatState): CombatState {
  if (state.phase !== 'monster') return state
  const s = clone(state)
  s.events = []
  const m = s.monster
  const p = s.player
  const { character, perks } = s.setup

  // Poison ticks (true damage, ignores shield).
  const poison = sumMod(m, 'poison')
  if (poison > 0) {
    m.hp = Math.max(0, m.hp - poison)
    pushEvent(s, 'monster', `-${poison}`, 'debuff')
    if (m.hp <= 0) {
      m.debuffs = tickMods(m.debuffs)
      s.phase = 'won'
      s.log.push(`${m.name} succumbs to poison!`)
      return s
    }
  }

  // Passive (start of monster action).
  let reflectMagical = 0
  switch (m.passive.kind) {
    case 'regen': {
      const before = m.hp
      m.hp = Math.min(m.maxHp, m.hp + m.passive.value)
      if (m.hp > before) pushEvent(s, 'monster', `+${m.hp - before}`, 'heal')
      break
    }
    case 'shieldGain':
      m.shield += m.passive.value
      pushEvent(s, 'monster', `+${m.passive.value}`, 'shield')
      break
    case 'ramp':
      m.attack.physical += m.passive.value
      break
    case 'shieldReflect':
      reflectMagical = m.shield
      break
    default:
      break
  }

  // Compute attack, applying per-turn escalation, weaken, resists, mitigation.
  const esc = attackEscalation(s.turn)
  const weaken = sumMod(m, 'weaken')
  let phys = Math.max(0, m.attack.physical * esc - weaken)
  let mag = (m.attack.magical + reflectMagical) * esc
  const tMult = takenMult(character, p, s.lastComboDouble)
  phys = Math.round(phys * (1 - perks.physResistPct) * tMult)
  mag = Math.round(mag * (1 - perks.magResistPct) * tMult)

  // Physical hits shield first; magical ignores shield.
  const absorbed = Math.min(p.shield, phys)
  p.shield -= absorbed
  const physToHp = phys - absorbed
  const totalToHp = physToHp + mag
  if (totalToHp > 0) {
    p.hp = Math.max(0, p.hp - totalToHp)
    if (physToHp > 0) pushEvent(s, 'player', `-${physToHp}`, 'damage')
    if (mag > 0) pushEvent(s, 'player', `-${mag}`, 'magic')
  }

  // Lifesteal passive.
  if (m.passive.kind === 'lifesteal' && totalToHp > 0) {
    const heal = Math.round((totalToHp * m.passive.value) / 100)
    if (heal > 0) {
      m.hp = Math.min(m.maxHp, m.hp + heal)
      pushEvent(s, 'monster', `+${heal}`, 'heal')
    }
  }

  // Player thorns buff reflects onto monster (true magical).
  const thorns = sumMod(p, 'thorns')
  if (thorns > 0) {
    m.hp = Math.max(0, m.hp - thorns)
    pushEvent(s, 'monster', `-${thorns}`, 'magic')
  }

  // Start-of-next-player-turn upkeep.
  if (perks.hpRegenPerTurn > 0 && p.hp > 0) {
    const before = p.hp
    p.hp = Math.min(p.maxHp, p.hp + perks.hpRegenPerTurn)
    if (p.hp > before) pushEvent(s, 'player', `+${p.hp - before}`, 'heal')
  }

  p.buffs = tickMods(p.buffs)
  m.debuffs = tickMods(m.debuffs)
  p.rerolls = p.maxRerolls
  s.turn += 1

  if (m.hp <= 0) s.phase = 'won'
  else if (p.hp <= 0) s.phase = 'lost'
  else s.phase = 'player'
  return s
}

// Preview: which slots will fire given current dice (for UI highlight).
export function firingSlots(dice: number[] | null): Set<number> {
  return new Set(dice ?? [])
}
