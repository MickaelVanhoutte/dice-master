// XP thresholds & level math. Level 1 = 0 XP; each level costs a growing amount.
export const XP = {
  discoverSkill: 15, // first time a skill is seen
  discoverMonster: 25, // first time a monster is defeated
  perBossReached: 20, // XP per boss reached in a run (on death)
  winBonus: 10, // XP per boss defeated during the run
}

// Total XP required to have reached a given level.
export function xpForLevel(level: number): number {
  if (level <= 1) return 0
  // cumulative: 100, 240, 420, ... roughly quadratic
  let total = 0
  for (let l = 2; l <= level; l++) total += 60 + (l - 1) * 40
  return total
}

export interface LevelInfo {
  level: number
  intoLevel: number // xp accrued into current level
  span: number // xp needed to reach next level
  toNext: number // remaining to next level
}

export function levelFromXp(xp: number): LevelInfo {
  let level = 1
  while (xp >= xpForLevel(level + 1)) level++
  const cur = xpForLevel(level)
  const next = xpForLevel(level + 1)
  return {
    level,
    intoLevel: xp - cur,
    span: next - cur,
    toNext: next - xp,
  }
}

// Perk points are granted 1 per level. Total points earned at a level:
export function perkPointsForLevel(level: number): number {
  return Math.max(0, level - 1)
}
