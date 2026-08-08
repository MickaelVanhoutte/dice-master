import type {
  Character,
  CombatState,
  Condition,
  DamageType,
  Effect,
  Mod,
  MonsterCombat,
  PlayerCombat,
} from './types'
import type { ComboInfo } from './dice'

export interface ResolveCtx {
  combo: ComboInfo
}

// ── mod helpers ───────────────────────────────────────────────────────────
export function sumMod(holder: { buffs?: Mod[]; debuffs?: Mod[] }, stat: string): number {
  const list = [...(holder.buffs ?? []), ...(holder.debuffs ?? [])]
  return list.filter((m) => m.stat === stat).reduce((a, m) => a + m.amount, 0)
}

export function addMod(list: Mod[], stat: string, amount: number, turns: number): void {
  const existing = list.find((m) => m.stat === stat)
  if (existing) {
    existing.amount += amount
    existing.turns = Math.max(existing.turns, turns)
  } else {
    list.push({ stat, amount, turns })
  }
}

export function tickMods(list: Mod[]): Mod[] {
  return list.map((m) => ({ ...m, turns: m.turns - 1 })).filter((m) => m.turns > 0)
}

// ── event helper ──────────────────────────────────────────────────────────
export function pushEvent(
  state: CombatState,
  target: 'player' | 'monster',
  text: string,
  tone: CombatState['events'][number]['tone'],
): void {
  state.events.push({ target, text, tone, id: state.eventSeq++ })
}

// ── character multipliers ─────────────────────────────────────────────────
function hpPct(c: PlayerCombat): number {
  return (c.hp / c.maxHp) * 100
}

export function dealtMult(char: Character, player: PlayerCombat, combo: ComboInfo): number {
  const d = char.damageDealtMult
  if (!d) return 1
  if (d.whenHpBelowPct != null && !(hpPct(player) < d.whenHpBelowPct)) return 1
  if (d.whenCombo && !combo.hasDouble) return 1
  return d.mult
}

export function takenMult(char: Character, player: PlayerCombat, comboWasDouble: boolean): number {
  const d = char.damageTakenMult
  if (!d) return 1
  if (d.whenHpBelowPct != null && !(hpPct(player) < d.whenHpBelowPct)) return 1
  if (d.whenCombo && !comboWasDouble) return 1
  return d.mult
}

// ── condition evaluation ──────────────────────────────────────────────────
export function evalCondition(cond: Condition, state: CombatState, combo: ComboInfo): boolean {
  switch (cond.kind) {
    case 'hasDouble':
      return combo.hasDouble
    case 'hasTriple':
      return combo.hasTriple
    case 'hpBelow':
      return hpPct(state.player) < cond.pct
    case 'shieldAbove':
      return state.player.shield > cond.value
    case 'monsterHasShield':
      return state.monster.shield > 0
  }
}

// ── damage to monster (player-sourced) ────────────────────────────────────
export function damageMonster(
  state: CombatState,
  type: DamageType,
  rawAmount: number,
  combo: ComboInfo,
): number {
  const { character } = state.setup
  let dmg = rawAmount
  const curse = sumMod(state.monster, 'curse')
  if (curse > 0) dmg *= 1 + curse / 100
  dmg *= dealtMult(character, state.player, combo)
  dmg = Math.max(0, Math.round(dmg))

  const m: MonsterCombat = state.monster
  if (type === 'physical') {
    const absorbed = Math.min(m.shield, dmg)
    m.shield -= absorbed
    dmg -= absorbed
  }
  m.hp = Math.max(0, m.hp - dmg)
  if (dmg > 0) pushEvent(state, 'monster', `-${dmg}`, type === 'magical' ? 'magic' : 'damage')
  return dmg
}

// ── apply one effect (player-sourced) ─────────────────────────────────────
export function applyEffect(state: CombatState, eff: Effect, ctx: ResolveCtx): void {
  const m = ctx.combo.multiplier
  const p = state.player
  const { character, perks } = state.setup
  switch (eff.kind) {
    case 'damage': {
      let amt = eff.amount * m
      amt += sumMod(p, 'strength')
      damageMonster(state, eff.type, amt, ctx.combo)
      break
    }
    case 'shield': {
      const amt = Math.round(eff.amount * m)
      p.shield += amt
      pushEvent(state, 'player', `+${amt}`, 'shield')
      break
    }
    case 'heal': {
      const amt = Math.round(eff.amount * m * (character.healMult ?? 1))
      const before = p.hp
      p.hp = Math.min(p.maxHp, p.hp + amt)
      const gained = p.hp - before
      if (gained > 0) pushEvent(state, 'player', `+${gained}`, 'heal')
      break
    }
    case 'gold': {
      const amt = Math.round(eff.amount * m * (character.goldMult ?? 1) * (1 + perks.goldPct))
      state.goldGained += amt
      pushEvent(state, 'player', `+${amt}g`, 'gold')
      break
    }
    case 'sunder': {
      const amt = Math.round(eff.amount * m)
      const before = state.monster.shield
      state.monster.shield = Math.max(0, state.monster.shield - amt)
      const removed = before - state.monster.shield
      if (removed > 0) pushEvent(state, 'monster', `shield -${removed}`, 'debuff')
      break
    }
    case 'buff': {
      addMod(p.buffs, eff.stat, Math.round(eff.amount * m), eff.turns)
      pushEvent(state, 'player', `${eff.stat} +${Math.round(eff.amount * m)}`, 'buff')
      break
    }
    case 'debuff': {
      addMod(state.monster.debuffs, eff.stat, Math.round(eff.amount * m), eff.turns)
      pushEvent(state, 'monster', `${eff.stat} ${Math.round(eff.amount * m)}`, 'debuff')
      break
    }
  }
}
