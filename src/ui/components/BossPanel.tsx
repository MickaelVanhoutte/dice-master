import { motion } from 'framer-motion'
import type { CombatState } from '../../game/types'
import { MonsterArt } from '../../assets/AssetRegistry'
import { StatBar } from './Bars'
import { Floaters } from './Floaters'
import { sumMod } from '../../game/effects'

export function BossPanel({ combat }: { combat: CombatState }) {
  const m = combat.monster
  const phys = m.attack.physical
  const mag = m.attack.magical
  const weaken = sumMod(m, 'weaken')
  const poison = sumMod(m, 'poison')
  const curse = sumMod(m, 'curse')
  const hit = combat.events.some((e) => e.target === 'monster' && (e.tone === 'damage' || e.tone === 'magic'))

  return (
    <div className="boss panel">
      <div className="boss-top">
        <motion.div
          className="boss-art"
          animate={hit ? { x: [0, -6, 6, -3, 0] } : {}}
          transition={{ duration: 0.3 }}
        >
          <MonsterArt id={m.id} className="art-svg" />
          <Floaters events={combat.events} target="monster" />
        </motion.div>
        <div className="boss-info">
          <div className="row spread">
            <h3 className="boss-name">{m.name}</h3>
            <span className="boss-lvl">Boss {m.bossIndex}</span>
          </div>
          <div className="statrow">
            <StatBar value={m.hp} max={m.maxHp} color="var(--danger)" height={14} />
            <span className="stat-num">
              {m.hp}/{m.maxHp}
            </span>
          </div>
          {m.shield > 0 && (
            <div className="row shieldline">
              <span className="chip shield">Shield {m.shield}</span>
            </div>
          )}
          <div className="chips">
            {phys > 0 && <span className="chip phys">{phys} PHYS</span>}
            {mag > 0 && <span className="chip magic">{mag} MAG</span>}
            {weaken > 0 && <span className="chip debuff">-{weaken} weaken</span>}
            {poison > 0 && <span className="chip debuff">{poison} poison</span>}
            {curse > 0 && <span className="chip debuff">+{curse}% dmg</span>}
          </div>
        </div>
      </div>
      {m.passive.kind !== 'none' && (
        <div className="passive">
          <span className="passive-tag">Passive</span> {m.passive.label}
        </div>
      )}
    </div>
  )
}
