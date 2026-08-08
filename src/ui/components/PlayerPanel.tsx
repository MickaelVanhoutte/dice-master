import { motion } from 'framer-motion'
import type { CombatState, Skill } from '../../game/types'
import { CharacterArt } from '../../assets/AssetRegistry'
import { HpRow, ShieldRow } from './Bars'
import { Floaters } from './Floaters'
import { SkillBar } from './SkillBar'

export function PlayerPanel({
  combat,
  loadout,
  firing,
}: {
  combat: CombatState
  loadout: (Skill | null)[]
  firing: Set<number>
}) {
  const p = combat.player
  const hit = combat.events.some((e) => e.target === 'player' && (e.tone === 'damage' || e.tone === 'magic'))
  return (
    <div className="player panel">
      <div className="player-top">
        <motion.div
          className="player-art"
          animate={hit ? { x: [0, -5, 5, -2, 0] } : {}}
          transition={{ duration: 0.3 }}
        >
          <CharacterArt id={combat.setup.character.id} className="art-svg" />
          <Floaters events={combat.events} target="player" />
        </motion.div>
        <div className="player-info">
          <HpRow hp={p.hp} maxHp={p.maxHp} />
          <ShieldRow shield={p.shield} />
          <div className="buffs">
            {p.buffs.map((b) => (
              <span key={b.stat} className="chip buff">
                {b.stat} {b.amount} ({b.turns})
              </span>
            ))}
          </div>
        </div>
      </div>
      <SkillBar loadout={loadout} firing={firing} />
    </div>
  )
}
