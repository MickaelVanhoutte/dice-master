import type { Character } from '../game/types'

export const CHARACTERS: Character[] = [
  {
    id: 'wanderer',
    name: 'Wanderer',
    desc: '+1 reroll every turn and +10 max HP. A flexible generalist.',
    art: 'char-wanderer',
    bonusRerolls: 1,
    bonusMaxHp: 10,
  },
  {
    id: 'gambler',
    name: 'Gambler',
    desc: 'While below 50% HP, your 2nd and 3rd dice land the same value on a fresh roll (before rerolls).',
    art: 'char-gambler',
    rollFix: 'twinWhenHurt',
  },
  {
    id: 'bloodpact',
    name: 'Blood Pact',
    desc: 'Each turn, lose 3 HP to gain 6 gold.',
    art: 'char-bloodpact',
    perTurn: { loseHp: 3, gainGold: 6 },
  },
  {
    id: 'duelist',
    name: 'Duelist',
    desc: 'Take 25% less damage on turns where your last roll had a double or better.',
    art: 'char-duelist',
    damageTakenMult: { whenCombo: true, mult: 0.75 },
  },
  {
    id: 'berserker',
    name: 'Berserker',
    desc: 'Deal 20% more damage while below 40% HP.',
    art: 'char-berserker',
    damageDealtMult: { whenHpBelowPct: 40, mult: 1.2 },
    bonusMaxHp: -10,
  },
  {
    id: 'hoarder',
    name: 'Hoarder',
    desc: '+50% gold gained, but healing is 20% weaker.',
    art: 'char-hoarder',
    goldMult: 1.5,
    healMult: 0.8,
  },
]

export const CHARACTERS_BY_ID = Object.fromEntries(CHARACTERS.map((c) => [c.id, c]))
