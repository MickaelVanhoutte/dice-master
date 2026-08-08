import type { RNG } from './rng'

export interface ComboInfo {
  maxSame: number // largest count of identical values (1..N)
  hasDouble: boolean
  hasTriple: boolean
  multiplier: number // 1 + 0.1 * (maxSame - 1)
}

export function rollDice(count: number, rng: RNG): number[] {
  const out: number[] = []
  for (let i = 0; i < count; i++) out.push(rng.int(1, 6))
  return out
}

export function analyzeCombo(dice: number[]): ComboInfo {
  const counts = new Map<number, number>()
  for (const d of dice) counts.set(d, (counts.get(d) ?? 0) + 1)
  let maxSame = 0
  for (const c of counts.values()) maxSame = Math.max(maxSame, c)
  return {
    maxSame,
    hasDouble: maxSame >= 2,
    hasTriple: maxSame >= 3,
    multiplier: 1 + 0.1 * Math.max(0, maxSame - 1),
  }
}
