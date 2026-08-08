import type { Skill } from '../../game/types'
import { DieFace, SkillIcon } from '../../assets/AssetRegistry'
import { roleColor } from './SkillBar'
import { effectRows } from '../describe'

// A wooden skill tablet: optional die-number header, framed icon, Lv badge,
// name, and colored effect rows. Used in combat, reward, and prep.
export function SkillCard({
  skill,
  level = 0,
  slot,
  firing = false,
  selected = false,
  empty = false,
  compact = false,
  onClick,
}: {
  skill?: Skill | null
  level?: number
  slot?: number
  firing?: boolean
  selected?: boolean
  empty?: boolean
  compact?: boolean
  onClick?: () => void
}) {
  const cls = `skillcard ${firing ? 'firing' : ''} ${selected ? 'selected' : ''} ${
    empty || !skill ? 'empty' : ''
  } ${compact ? 'compact' : ''} ${onClick ? 'clickable' : ''}`

  const content = !skill ? (
    <>
      {slot != null && (
        <span className="sc-die">
          <DieFace value={slot} className="sc-die-face" />
        </span>
      )}
      <span className="sc-name dim">—</span>
    </>
  ) : (
    <>
      {slot != null && (
        <span className="sc-die">
          <DieFace value={slot} className="sc-die-face" />
        </span>
      )}
      <span className="sc-icon" style={{ color: roleColor(skill.art) }}>
        <SkillIcon art={skill.art} className="sc-icon-svg" />
      </span>
      <span className="sc-lv">Lv{level + 1}</span>
      {!compact && <span className="sc-name">{skill.name}</span>}
      <span className="sc-rows">
        {effectRows(skill, level).map((r, i) => (
          <span key={i} className={`sc-row ${r.bonus ? 'bonus' : ''}`} style={{ color: r.color }}>
            <SkillIcon art={r.art} className="sc-row-ic" />
            {r.text}
          </span>
        ))}
      </span>
    </>
  )

  if (onClick) {
    return (
      <button className={cls} onClick={onClick} style={{ ['--role' as string]: skill ? roleColor(skill.art) : 'var(--brass)' }}>
        {content}
      </button>
    )
  }
  return (
    <div className={cls} style={{ ['--role' as string]: skill ? roleColor(skill.art) : 'var(--brass)' }}>
      {content}
    </div>
  )
}
