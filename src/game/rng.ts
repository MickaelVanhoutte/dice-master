// Seedable PRNG (mulberry32) — deterministic, testable.
export interface RNG {
  next: () => number // [0,1)
  int: (minInclusive: number, maxInclusive: number) => number
  pick: <T>(arr: readonly T[]) => T
  seed: number
}

export function makeRng(seed: number): RNG {
  let a = seed >>> 0
  const next = () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1))
  const pick = <T>(arr: readonly T[]): T => arr[Math.floor(next() * arr.length)]
  return { next, int, pick, seed }
}

// Deterministic-ish seed for a real playthrough when none supplied.
export function randomSeed(): number {
  return Math.floor(Math.random() * 0xffffffff) >>> 0
}
