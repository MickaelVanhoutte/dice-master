import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MetaSave } from '../game/types'
import { XP, levelFromXp } from '../game/xp'
import { PERKS_BY_ID } from '../data/perks'

const META_VERSION = 1

interface MetaStore extends MetaSave {
  addXp: (n: number) => { gained: number; leveledUp: boolean; newLevel: number }
  discoverSkill: (id: string) => number
  discoverMonster: (id: string) => number
  discoverCharacter: (id: string) => void
  markSkillsSeen: (ids: string[]) => void
  buyPerk: (id: string) => boolean
  perkLevel: (id: string) => number
  toggleMute: () => void
  resetAll: () => void
}

const initial: MetaSave = {
  version: META_VERSION,
  xp: 0,
  level: 1,
  perkPoints: 0,
  perks: {},
  seenSkills: [],
  seenMonsters: [],
  seenCharacters: [],
  muted: false,
}

export const useMeta = create<MetaStore>()(
  persist(
    (set, get) => ({
      ...initial,

      addXp: (n) => {
        const prev = get()
        const xp = prev.xp + n
        const newLevel = levelFromXp(xp).level
        const leveledUp = newLevel > prev.level
        set({
          xp,
          level: newLevel,
          perkPoints: prev.perkPoints + (leveledUp ? newLevel - prev.level : 0),
        })
        return { gained: n, leveledUp, newLevel }
      },

      discoverSkill: (id) => {
        if (get().seenSkills.includes(id)) return 0
        set((s) => ({ seenSkills: [...s.seenSkills, id] }))
        get().addXp(XP.discoverSkill)
        return XP.discoverSkill
      },

      discoverMonster: (id) => {
        if (get().seenMonsters.includes(id)) return 0
        set((s) => ({ seenMonsters: [...s.seenMonsters, id] }))
        get().addXp(XP.discoverMonster)
        return XP.discoverMonster
      },

      discoverCharacter: (id) => {
        if (get().seenCharacters.includes(id)) return
        set((s) => ({ seenCharacters: [...s.seenCharacters, id] }))
      },

      markSkillsSeen: (ids) =>
        set((s) => ({ seenSkills: [...new Set([...s.seenSkills, ...ids])] })),

      perkLevel: (id) => get().perks[id] ?? 0,

      buyPerk: (id) => {
        const def = PERKS_BY_ID[id]
        if (!def) return false
        const cur = get().perks[id] ?? 0
        if (cur >= def.maxLevel) return false
        const cost = def.costPerLevel[cur]
        if (get().perkPoints < cost) return false
        set((s) => ({
          perkPoints: s.perkPoints - cost,
          perks: { ...s.perks, [id]: cur + 1 },
        }))
        return true
      },

      toggleMute: () => set((s) => ({ muted: !s.muted })),

      resetAll: () => set({ ...initial }),
    }),
    {
      name: 'dm-meta',
      version: META_VERSION,
    },
  ),
)
