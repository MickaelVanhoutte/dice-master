import type { Effect, Skill } from './types'

const LEVEL_MULT = 1.25

function scaleEffect(eff: Effect, factor: number): Effect {
  switch (eff.kind) {
    case 'damage':
    case 'shield':
    case 'heal':
    case 'gold':
    case 'sunder':
      return { ...eff, amount: Math.round(eff.amount * factor) }
    case 'buff':
    case 'debuff':
      // duration stays; magnitude scales.
      return { ...eff, amount: Math.round(eff.amount * factor) }
  }
}

// Returns a copy of the skill with amounts scaled for its upgrade level.
export function scaleSkill(skill: Skill, level: number): Skill {
  if (level <= 0) return skill
  const factor = Math.pow(LEVEL_MULT, level)
  return {
    ...skill,
    effects: skill.effects.map((e) => scaleEffect(e, factor)),
    conditional: skill.conditional
      ? { when: skill.conditional.when, bonus: skill.conditional.bonus.map((e) => scaleEffect(e, factor)) }
      : undefined,
  }
}

// Gold cost to upgrade from `level` to `level + 1`, before perk discount.
export function upgradeCost(skill: Skill, level: number): number {
  return Math.round(skill.costBase * Math.pow(1.6, level))
}
