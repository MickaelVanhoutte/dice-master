// Auto-play balance harness. Runs many playthroughs with a greedy-ish policy
// to sanity-check the difficulty curve. Not shipped in the app.
//   npm run sim            → base character, no perks, no upgrades (floor)
//   npm run sim -- upgrade → also spends gold upgrading equipped skills

import { makeRng } from '../src/game/rng'
import {
  confirmPlayerTurn,
  initCombat,
  resolveMonsterTurn,
  rollPlayer,
} from '../src/game/combat'
import { scaleMonster, goldReward } from '../src/game/scaling'
import { scaleSkill, upgradeCost } from '../src/game/skillMath'
import { monsterForBoss } from '../src/data/monsters'
import { DEFAULT_SLOTS, SKILLS_BY_ID } from '../src/data/skills'
import { aggregatePerks, baseMaxHp } from '../src/data/perks'
import { CHARACTERS_BY_ID } from '../src/data/characters'
import type { CombatSetup, Skill } from '../src/game/types'

const withUpgrades = process.argv.includes('upgrade')
const RUNS = 500
const TURN_CAP = 60

const character = CHARACTERS_BY_ID.wanderer
const perks = aggregatePerks({})

function loadout(levels: Record<string, number>): (Skill | null)[] {
  const out: (Skill | null)[] = [null, null, null, null, null, null, null]
  for (let slot = 1; slot <= 6; slot++) {
    const id = DEFAULT_SLOTS[slot]
    if (id) out[slot] = scaleSkill(SKILLS_BY_ID[id], levels[id] ?? 0)
  }
  return out
}

function playRun(seed: number): number {
  const r = makeRng(seed)
  const maxHp = baseMaxHp() + perks.bonusMaxHp + (character.bonusMaxHp ?? 0)
  let gold = perks.startGold
  const levels: Record<string, number> = {}
  let bossIndex = 1

  while (bossIndex < 40) {
    // Greedy upgrades: pour gold into the highest-damage equipped skill.
    if (withUpgrades) {
      let spent = true
      while (spent) {
        spent = false
        for (let slot = 1; slot <= 6; slot++) {
          const id = DEFAULT_SLOTS[slot]
          if (!id) continue
          const base = SKILLS_BY_ID[id]
          const cost = Math.round(upgradeCost(base, levels[id] ?? 0) * (1 - perks.upgradeDiscountPct))
          if (gold >= cost && (levels[id] ?? 0) < 6) {
            gold -= cost
            levels[id] = (levels[id] ?? 0) + 1
            spent = true
          }
        }
      }
    }

    const setup: CombatSetup = { loadout: loadout(levels), character, perks }
    const monster = scaleMonster(monsterForBoss(bossIndex), bossIndex)
    // Full heal between battles.
    let st = initCombat(setup, monster, maxHp, maxHp)

    while (st.phase !== 'won' && st.phase !== 'lost') {
      if (st.phase === 'player') st = rollPlayer(st, r)
      else if (st.phase === 'rolled') st = confirmPlayerTurn(st)
      else if (st.phase === 'monster') st = resolveMonsterTurn(st)
      if (st.turn > TURN_CAP) return bossIndex // stalemate = death
    }

    if (st.phase === 'lost') return bossIndex
    gold += goldReward(bossIndex)
    bossIndex++
  }
  return bossIndex
}

const results: number[] = []
for (let i = 0; i < RUNS; i++) results.push(playRun(i * 2654435761 + 1))
results.sort((a, b) => a - b)

const median = results[Math.floor(RUNS / 2)]
const mean = results.reduce((a, b) => a + b, 0) / RUNS
const p10 = results[Math.floor(RUNS * 0.1)]
const p90 = results[Math.floor(RUNS * 0.9)]

const hist = new Map<number, number>()
for (const v of results) hist.set(v, (hist.get(v) ?? 0) + 1)

console.log(`\n=== Balance sim (${withUpgrades ? 'WITH upgrades' : 'base, no upgrades'}) ===`)
console.log(`runs=${RUNS}  median boss reached=${median}  mean=${mean.toFixed(2)}  p10=${p10}  p90=${p90}`)
console.log('boss reached → count')
for (const k of [...hist.keys()].sort((a, b) => a - b)) {
  console.log(`  boss ${String(k).padStart(2)} : ${'#'.repeat(Math.round((hist.get(k)! / RUNS) * 60))} ${hist.get(k)}`)
}
