import { describe, expect, it } from 'vitest'
import { analyzeCombo, rollDice } from './dice'
import { makeRng } from './rng'

describe('dice combo', () => {
  it('no combo → x1.0', () => {
    const c = analyzeCombo([1, 2, 3])
    expect(c.hasDouble).toBe(false)
    expect(c.hasTriple).toBe(false)
    expect(c.multiplier).toBeCloseTo(1.0)
  })
  it('double → x1.1', () => {
    const c = analyzeCombo([3, 3, 5])
    expect(c.hasDouble).toBe(true)
    expect(c.hasTriple).toBe(false)
    expect(c.multiplier).toBeCloseTo(1.1)
  })
  it('triple → x1.2', () => {
    const c = analyzeCombo([4, 4, 4])
    expect(c.hasTriple).toBe(true)
    expect(c.multiplier).toBeCloseTo(1.2)
  })
  it('quad → x1.3', () => {
    const c = analyzeCombo([2, 2, 2, 2])
    expect(c.maxSame).toBe(4)
    expect(c.multiplier).toBeCloseTo(1.3)
  })
})

describe('rng', () => {
  it('is deterministic for a seed', () => {
    expect(rollDice(3, makeRng(42))).toEqual(rollDice(3, makeRng(42)))
  })
  it('stays within 1..6', () => {
    const r = makeRng(7)
    for (const v of rollDice(50, r)) {
      expect(v).toBeGreaterThanOrEqual(1)
      expect(v).toBeLessThanOrEqual(6)
    }
  })
})
