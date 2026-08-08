import { useState } from 'react'
import { useRun } from '../../state/runStore'
import { useMeta } from '../../state/metaStore'
import { CHARACTERS } from '../../data/characters'
import { SKILLS_BY_ID } from '../../data/skills'
import { aggregatePerks } from '../../data/perks'
import { upgradeCost } from '../../game/skillMath'
import { CharacterArt, GoldIcon, HeartIcon, SkillIcon } from '../../assets/AssetRegistry'
import { SkillBar, roleColor } from '../components/SkillBar'
import { describeSkill } from '../describe'

export function PrepScreen() {
  const run = useRun((s) => s.run)
  const combat = useRun((s) => s.combat)
  const setCharacter = useRun((s) => s.setCharacter)
  const setSlot = useRun((s) => s.setSlot)
  const upgradeSkill = useRun((s) => s.upgradeSkill)
  const startFight = useRun((s) => s.startFight)
  const goTo = useRun((s) => s.goTo)
  const perks = aggregatePerks(useMeta((s) => s.perks))
  const [sel, setSel] = useState(1)
  const [pickHero, setPickHero] = useState(false)

  if (!run) return null

  const canSwapHero = run.bossIndex === 1 && !combat
  const loadout = [
    null,
    ...[1, 2, 3, 4, 5, 6].map((i) => (run.slots[i] ? SKILLS_BY_ID[run.slots[i]!] : null)),
  ]
  const discount = perks.upgradeDiscountPct
  const assignedElsewhere = (id: string) => run.slots.indexOf(id)

  return (
    <div className="screen prep">
      <div className="row spread prep-head">
        <div>
          <h2>Prepare · Boss {run.bossIndex}</h2>
          <div className="row small dim gap">
            <span className="row">
              <HeartIcon className="mini-ic" /> {run.hp}/{run.maxHp}
            </span>
            <span className="row">
              <GoldIcon className="mini-ic" /> {run.gold}
            </span>
          </div>
        </div>
        <button className="btn secondary" onClick={() => goTo('menu')}>
          Menu
        </button>
      </div>

      {/* Hero block — tap to change (only before first fight) */}
      <button
        className={`panel char-strip ${canSwapHero ? 'tappable' : ''}`}
        onClick={() => canSwapHero && setPickHero((v) => !v)}
        disabled={!canSwapHero}
      >
        <CharacterArt id={run.character.id} className="char-strip-art" />
        <div className="char-strip-body">
          <div className="row spread">
            <strong>{run.character.name}</strong>
            {canSwapHero && <span className="swap-hint">{pickHero ? 'close' : 'tap to change'}</span>}
          </div>
          <p className="dim small">{run.character.desc}</p>
        </div>
      </button>

      {pickHero && canSwapHero && (
        <div className="hero-choices">
          {CHARACTERS.map((c) => (
            <button
              key={c.id}
              className={`panel char-card ${c.id === run.character.id ? 'assigned' : ''}`}
              onClick={() => {
                setCharacter(c)
                setPickHero(false)
              }}
            >
              <CharacterArt id={c.id} className="char-card-art" />
              <div className="char-card-body">
                <h3>{c.name}</h3>
                <p className="dim small">{c.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="prep-slots">
        <div className="label">Slots — tap to select, then pick a skill</div>
        <SkillBar loadout={loadout} firing={new Set([sel])} onTap={setSel} />
        <button
          className="btn secondary small-btn"
          onClick={() => setSlot(sel, null)}
          disabled={!run.slots[sel]}
        >
          Clear slot {sel}
        </button>
      </div>

      <div className="label">Your Skills — tap to equip in slot {sel}, or upgrade with gold</div>
      <div className="owned-list">
        {run.owned.map((o) => {
          const base = SKILLS_BY_ID[o.id]
          if (!base) return null
          const cost = Math.round(upgradeCost(base, o.level) * (1 - discount))
          const at = assignedElsewhere(o.id)
          return (
            <div key={o.id} className={`panel owned-card ${at > 0 ? 'assigned' : ''}`}>
              <button
                className="owned-main"
                onClick={() => setSlot(sel, o.id)}
                style={{ color: roleColor(base.art) }}
              >
                <SkillIcon art={base.art} className="owned-ic" />
                <div className="owned-text">
                  <div className="row spread">
                    <strong className="owned-name">{base.name}</strong>
                    <span className="lvl-tag">Lv {o.level + 1}</span>
                  </div>
                  <div className="dim small">{describeSkill(base, o.level)}</div>
                  {at > 0 && <div className="slot-hint">In slot {at}</div>}
                </div>
              </button>
              <button
                className="btn secondary upg-btn"
                disabled={run.gold < cost}
                onClick={() => upgradeSkill(o.id)}
              >
                <GoldIcon className="mini-ic" /> {cost}
              </button>
            </div>
          )
        })}
      </div>

      <button className="btn big wide enter-btn" onClick={startFight}>
        Enter Battle — Boss {run.bossIndex}
      </button>
    </div>
  )
}
