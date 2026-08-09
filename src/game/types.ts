// ── Core enums ────────────────────────────────────────────────────────────
export type DamageType = 'physical' | 'magical'
export type Rarity = 'common' | 'rare' | 'epic'

export type BuffStat = 'strength' | 'ward' | 'thorns'
export type DebuffStat = 'weaken' | 'poison' | 'curse'

// ── Effects (what a skill / monster does) ─────────────────────────────────
export type Effect =
  | { kind: 'damage'; type: DamageType; amount: number }
  | { kind: 'shield'; amount: number } // player gains shield
  | { kind: 'heal'; amount: number }
  | { kind: 'gold'; amount: number }
  | { kind: 'sunder'; amount: number } // reduce monster shield now
  | { kind: 'buff'; stat: BuffStat; amount: number; turns: number } // on self
  | { kind: 'debuff'; stat: DebuffStat; amount: number; turns: number } // on monster

// ── Conditions (gate bonus effects) ───────────────────────────────────────
export type Condition =
  | { kind: 'hasDouble' }
  | { kind: 'hasTriple' }
  | { kind: 'hpBelow'; pct: number }
  | { kind: 'shieldAbove'; value: number }
  | { kind: 'monsterHasShield' }

// ── Skill definition (data) ───────────────────────────────────────────────
export interface Skill {
  id: string
  name: string
  desc: string
  rarity: Rarity
  art: string // AssetRegistry key
  effects: Effect[]
  conditional?: { when: Condition; bonus: Effect[] }
  costBase: number // gold cost baseline for upgrades
  starter?: boolean // part of the fixed starting kit
}

// ── Monster definition (data) ─────────────────────────────────────────────
export type MonsterPassiveKind =
  | 'none'
  | 'regen' // heal `value` HP each of its turns
  | 'shieldGain' // gain `value` shield each of its turns
  | 'shieldReflect' // deals current shield as extra magical damage, then keeps it
  | 'ramp' // attack grows by `value` (flat) each of its turns
  | 'lifesteal' // heals for a portion of physical damage dealt
  | 'thornsAura' // player takes `value` magical when attacking

export interface MonsterPassive {
  kind: MonsterPassiveKind
  value: number
  label: string
}

export interface Monster {
  id: string
  name: string
  art: string
  passive: MonsterPassive
  // base stats at "level 1 appearance"; scaling.ts applies the curve by boss index
  baseHp: number
  baseAttack: { physical: number; magical: number }
  baseShield: number
}

// ── Character (chosen at run start; fixed always-on effect) ────────────────
export interface Character {
  id: string
  name: string
  desc: string
  art: string
  goldMult?: number // e.g. 1.5
  healMult?: number // e.g. 0.8
  damageDealtMult?: { whenHpBelowPct?: number; whenCombo?: boolean; mult: number }
  damageTakenMult?: { whenHpBelowPct?: number; whenCombo?: boolean; mult: number }
  perTurn?: { loseHp?: number; gainGold?: number }
  rollFix?: 'twinWhenHurt' // dice 2 & 3 land equal (pre-reroll) while HP < 50%
  bonusRerolls?: number
  bonusMaxHp?: number
  startShield?: number
}

// ── Meta perks ────────────────────────────────────────────────────────────
export type PerkId =
  | 'extraDie'
  | 'extraReroll'
  | 'regen'
  | 'physResist'
  | 'magResist'
  | 'greed'
  | 'thrift'
  | 'vitality'
  | 'startShield'
  | 'startGold'

export interface Perk {
  id: PerkId
  name: string
  desc: string
  maxLevel: number
  costPerLevel: number[] // perk points per level (index = current level)
  perLevel: number // magnitude added per level
}

// Aggregated perk effects for a run.
export interface PerkEffects {
  extraDice: number
  extraRerolls: number
  hpRegenPerTurn: number
  physResistPct: number // 0..0.9
  magResistPct: number
  goldPct: number // additive, 0.2 => x1.2
  upgradeDiscountPct: number // 0..0.9
  bonusMaxHp: number
  startShield: number
  startGold: number
}

// ── Combat state (pure, serializable) ─────────────────────────────────────
export interface Mod {
  stat: string
  amount: number
  turns: number
}

export interface PlayerCombat {
  hp: number
  maxHp: number
  shield: number
  buffs: Mod[]
  rerolls: number
  maxRerolls: number
}

export interface MonsterCombat {
  id: string
  name: string
  art: string
  bossIndex: number
  hp: number
  maxHp: number
  shield: number
  attack: { physical: number; magical: number }
  passive: MonsterPassive
  passiveMemory: number
  debuffs: Mod[]
}

export interface CombatSetup {
  loadout: (Skill | null)[] // index 1..6 used; index 0 unused
  character: Character
  perks: PerkEffects
}

export type CombatPhase = 'player' | 'rolled' | 'resolving' | 'monster' | 'won' | 'lost'

export interface CombatEvent {
  target: 'player' | 'monster'
  text: string
  tone: 'damage' | 'magic' | 'heal' | 'shield' | 'gold' | 'debuff' | 'buff'
  id: number
}

export interface CombatState {
  setup: CombatSetup
  player: PlayerCombat
  monster: MonsterCombat
  dice: number[] | null
  goldGained: number
  turn: number
  lastComboDouble: boolean // whether last resolved roll had a double+ (for characters)
  resolveIndex: number // during 'resolving', index of the die being applied
  effIndex: number // index of the next effect within the current die's queue
  pendingEffs: Effect[] // effects queued for the current die (base + met conditional)
  turnDealtDamage: boolean // whether the player dealt damage this turn (for thornsAura)
  phase: CombatPhase
  events: CombatEvent[]
  log: string[]
  eventSeq: number
}

// ── Run + meta save shapes ────────────────────────────────────────────────
export interface OwnedSkill {
  id: string
  level: number
}

export interface RunState {
  character: Character
  slots: (string | null)[] // slot 1..6 -> owned skill id
  owned: OwnedSkill[]
  gold: number
  hp: number
  maxHp: number
  bossIndex: number // next boss to fight (1-based)
  seed: number
  started: boolean
}

export interface MetaSave {
  version: number
  xp: number
  level: number
  perkPoints: number
  perks: Record<string, number> // perkId -> level
  seenSkills: string[]
  seenMonsters: string[]
  seenCharacters: string[]
  muted: boolean
}
