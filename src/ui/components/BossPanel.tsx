import { motion } from 'framer-motion'
import type { CombatState } from '../../game/types'
import { MonsterArt, HeartIcon, ShieldIcon, SkillIcon } from '../../assets/AssetRegistry'
import { StatBar } from './Bars'
import { Floaters } from './Floaters'
import { OrnatePortrait, WoodPanel } from './Frame'
import { sumMod } from '../../game/effects'
import { attackEscalation } from '../../game/scaling'

export function BossPanel({ combat }: { combat: CombatState }) {
  const m = combat.monster
  const esc = attackEscalation(combat.turn)
  const phys = Math.max(0, Math.round(m.attack.physical * esc) - sumMod(m, 'weaken'))
  const mag = Math.round(m.attack.magical * esc)
  const weaken = sumMod(m, 'weaken')
  const poison = sumMod(m, 'poison')
  const curse = sumMod(m, 'curse')
  const hit = combat.events.some(
    (e) => e.target === 'monster' && (e.tone === 'damage' || e.tone === 'magic'),
  )

  return (
    <div className="boss-band">
      <span className="stage-banner">Stage {m.bossIndex}</span>
      <div className="boss-box">
        <motion.div
          className="boss-box-art"
          animate={hit ? { x: [0, -6, 6, -3, 0] } : {}}
          transition={{ duration: 0.3 }}
        >
          <OrnatePortrait className="boss-portrait" glow="var(--debuff)" shape="rect">
            <MonsterArt id={m.id} className="art-svg" />
          </OrnatePortrait>
        </motion.div>
        <Floaters events={combat.events} target="monster" />
        <div className="boss-name-cap">{m.name}</div>
      </div>

      <WoodPanel className="next-plaque">
        <div className="next-attacks">
          {phys > 0 && (
            <span className="next-atk phys">
              <SkillIcon art="skill-phys" className="next-ic" /> {phys}
            </span>
          )}
          {mag > 0 && (
            <span className="next-atk magic">
              <SkillIcon art="skill-magic" className="next-ic" /> {mag}
            </span>
          )}
          {phys === 0 && mag === 0 && <span className="dim small">—</span>}
        </div>
        <div className="next-stat">
          <HeartIcon className="next-ic hp" />
          <StatBar value={m.hp} max={m.maxHp} color="var(--danger)" height={10} />
          <span className="next-num">{m.hp}</span>
          <ShieldIcon className="next-ic shd" />
          <span className="next-num shd-num">{m.shield}</span>
        </div>
        <div className="next-tags">
          {esc > 1 && (
            <span className="tag rage">▲ +{Math.round((esc - 1) * 100)}% dmg</span>
          )}
          {weaken > 0 && <span className="tag debuff">weaken {weaken}</span>}
          {poison > 0 && <span className="tag debuff">poison {poison}</span>}
          {curse > 0 && <span className="tag debuff">+{curse}%</span>}
        </div>
        {m.passive.kind !== 'none' && <div className="next-passive">{m.passive.label}</div>}
      </WoodPanel>
    </div>
  )
}
