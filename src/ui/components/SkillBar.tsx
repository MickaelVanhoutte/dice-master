import type { Skill } from '../../game/types'
import { SkillIcon } from '../../assets/AssetRegistry'

export function roleColor(art: string): string {
  switch (art) {
    case 'skill-magic':
      return 'var(--magic)'
    case 'skill-phys':
      return 'var(--phys)'
    case 'skill-shield':
      return 'var(--shield)'
    case 'skill-heal':
      return 'var(--heal)'
    case 'skill-gold':
      return 'var(--gold)'
    case 'skill-debuff':
      return 'var(--debuff)'
    case 'skill-buff':
      return 'var(--buff)'
    default:
      return 'var(--accent-2)'
  }
}

export function SkillBar({
  loadout,
  firing,
  onTap,
}: {
  loadout: (Skill | null)[]
  firing?: Set<number>
  onTap?: (slot: number) => void
}) {
  return (
    <div className="skillbar">
      {[1, 2, 3, 4, 5, 6].map((slot) => {
        const s = loadout[slot]
        const isFiring = firing?.has(slot)
        return (
          <button
            key={slot}
            className={`skillslot ${isFiring ? 'firing' : ''} ${s ? '' : 'empty'}`}
            style={s ? { color: roleColor(s.art) } : undefined}
            onClick={() => onTap?.(slot)}
            disabled={!onTap}
          >
            <span className="slot-num">{slot}</span>
            {s ? (
              <>
                <SkillIcon art={s.art} className="slot-ic" />
                <span className="slot-name">{s.name}</span>
              </>
            ) : (
              <span className="slot-name dim">—</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
