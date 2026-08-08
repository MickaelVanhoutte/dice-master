import type { Condition, Effect, Skill } from '../game/types'
import { scaleSkill } from '../game/skillMath'

function effectText(e: Effect): string {
  switch (e.kind) {
    case 'damage':
      return `${e.amount} ${e.type === 'magical' ? 'magical' : 'physical'}`
    case 'shield':
      return `+${e.amount} shield`
    case 'heal':
      return `heal ${e.amount}`
    case 'gold':
      return `+${e.amount} gold`
    case 'sunder':
      return `strip ${e.amount} shield`
    case 'buff':
      return `+${e.amount} ${e.stat} (${e.turns}t)`
    case 'debuff':
      return e.stat === 'curse'
        ? `curse +${e.amount}% (${e.turns}t)`
        : `${e.stat} ${e.amount} (${e.turns}t)`
  }
}

function condText(c: Condition): string {
  switch (c.kind) {
    case 'hasDouble':
      return 'on double+'
    case 'hasTriple':
      return 'on triple'
    case 'hpBelow':
      return `if HP < ${c.pct}%`
    case 'shieldAbove':
      return `if shield > ${c.value}`
    case 'monsterHasShield':
      return 'if enemy shielded'
  }
}

// Full effect line for a skill at a given upgrade level.
export function describeSkill(skill: Skill, level = 0): string {
  const s = scaleSkill(skill, level)
  const base = s.effects.map(effectText).join(', ')
  if (!s.conditional) return base
  const bonus = s.conditional.bonus.map(effectText).join(', ')
  return `${base} · ${condText(s.conditional.when)}: ${bonus}`
}
