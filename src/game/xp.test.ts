import { describe, expect, it } from 'vitest'
import { levelFromXp, perkPointsForLevel, xpForLevel } from './xp'

describe('xp/levels', () => {
  it('level 1 at 0 xp', () => {
    expect(levelFromXp(0).level).toBe(1)
  })
  it('thresholds are monotonic', () => {
    for (let l = 1; l < 20; l++) {
      expect(xpForLevel(l + 1)).toBeGreaterThan(xpForLevel(l))
    }
  })
  it('crossing a threshold levels up', () => {
    const need = xpForLevel(2)
    expect(levelFromXp(need - 1).level).toBe(1)
    expect(levelFromXp(need).level).toBe(2)
  })
  it('grants one perk point per level after 1', () => {
    expect(perkPointsForLevel(1)).toBe(0)
    expect(perkPointsForLevel(5)).toBe(4)
  })
})
