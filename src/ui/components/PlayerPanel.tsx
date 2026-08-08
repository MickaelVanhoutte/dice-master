import { motion } from 'framer-motion'
import type { CombatState } from '../../game/types'
import { CharacterArt, HeartIcon, ShieldIcon } from '../../assets/AssetRegistry'
import { StatBar } from './Bars'
import { Floaters } from './Floaters'
import { OrnatePortrait } from './Frame'

export function PlayerPanel({ combat }: { combat: CombatState }) {
  const p = combat.player
  const hit = combat.events.some(
    (e) => e.target === 'player' && (e.tone === 'damage' || e.tone === 'magic'),
  )
  return (
    <div className="player-hud">
      <div className="player-portrait-wrap">
        <motion.div animate={hit ? { x: [0, -5, 5, -2, 0] } : {}} transition={{ duration: 0.3 }}>
          <OrnatePortrait className="player-portrait" glow="var(--teal-lit)">
            <CharacterArt id={combat.setup.character.id} className="art-svg" />
          </OrnatePortrait>
        </motion.div>
        <Floaters events={combat.events} target="player" />
      </div>
      <div className="player-stats">
        <div className="statrow">
          <HeartIcon className="stat-ic hp-ic" />
          <StatBar value={p.hp} max={p.maxHp} color="var(--heal)" height={12} />
          <span className="stat-num">
            {Math.max(0, p.hp)}/{p.maxHp}
          </span>
        </div>
        <div className="player-subrow">
          {p.shield > 0 && (
            <span className="pip shield">
              <ShieldIcon className="pip-ic" /> {p.shield}
            </span>
          )}
          {p.buffs.map((b) => (
            <span key={b.stat} className="pip buff">
              {b.stat} {b.amount}·{b.turns}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
