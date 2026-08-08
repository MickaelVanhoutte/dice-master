import type { Condition, Effect, Skill } from '../game/types'
import { scaleSkill } from '../game/skillMath'

export interface EffectRow {
  art: string // AssetRegistry icon key
  color: string // CSS var
  text: string
  bonus?: boolean // part of a conditional bonus
}

function rowFor(e: Effect, bonus = false): EffectRow {
  switch (e.kind) {
    case 'damage':
      return e.type === 'magical'
        ? { art: 'skill-magic', color: 'var(--magic)', text: `${e.amount}`, bonus }
        : { art: 'skill-phys', color: 'var(--phys)', text: `${e.amount}`, bonus }
    case 'shield':
      return { art: 'skill-shield', color: 'var(--shield)', text: `+${e.amount}`, bonus }
    case 'heal':
      return { art: 'skill-heal', color: 'var(--heal)', text: `+${e.amount}`, bonus }
    case 'gold':
      return { art: 'skill-gold', color: 'var(--gold-fx)', text: `+${e.amount}`, bonus }
    case 'sunder':
      return { art: 'skill-debuff', color: 'var(--debuff)', text: `−${e.amount}`, bonus }
    case 'buff':
      return { art: 'skill-buff', color: 'var(--buff)', text: `${e.stat} +${e.amount}`, bonus }
    case 'debuff':
      return { art: 'skill-debuff', color: 'var(--debuff)', text: `${e.stat} ${e.amount}`, bonus }
  }
}

// Icon+value rows for a skill card at a given upgrade level.
export function effectRows(skill: Skill, level = 0): EffectRow[] {
  const s = scaleSkill(skill, level)
  const rows = s.effects.map((e) => rowFor(e))
  if (s.conditional) rows.push(...s.conditional.bonus.map((e) => rowFor(e, true)))
  return rows
}

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
