import { useState } from 'react'
import { useRun } from '../../state/runStore'
import { useMeta } from '../../state/metaStore'
import { CHARACTERS } from '../../data/characters'
import { SKILLS_BY_ID } from '../../data/skills'
import { aggregatePerks } from '../../data/perks'
import { upgradeCost } from '../../game/skillMath'
import { CharacterArt, GoldIcon, HeartIcon, SkillIcon } from '../../assets/AssetRegistry'
import { OrnatePortrait } from '../components/Frame'
import { SkillCard } from '../components/SkillCard'
import { roleColor } from '../components/SkillBar'
import { describeSkill } from '../describe'

export function PrepScreen() {
  const run = useRun((s) => s.run)
  const setCharacter = useRun((s) => s.setCharacter)
  const setSlot = useRun((s) => s.setSlot)
  const swapSlots = useRun((s) => s.swapSlots)
  const upgradeSkill = useRun((s) => s.upgradeSkill)
  const startFight = useRun((s) => s.startFight)
  const goTo = useRun((s) => s.goTo)
  const combat = useRun((s) => s.combat)
  const perks = aggregatePerks(useMeta((s) => s.perks))

  const [sel, setSel] = useState(1)
  const [focus, setFocus] = useState<string | null>(null)
  const [heroModal, setHeroModal] = useState(false)
  const [drag, setDrag] = useState<{ from: number; x: number; y: number } | null>(null)
  const [over, setOver] = useState<number | null>(null)
  const [page, setPage] = useState(0)

  if (!run) return null

  const PAGE_SIZE = 15 // 5 cols x 3 rows — fits without scrolling
  const pageCount = Math.max(1, Math.ceil(run.owned.length / PAGE_SIZE))
  const curPage = Math.min(page, pageCount - 1)
  const pageOwned = run.owned.slice(curPage * PAGE_SIZE, curPage * PAGE_SIZE + PAGE_SIZE)
  const canSwapHero = run.bossIndex === 1 && !combat

  const loadout = [
    null,
    ...[1, 2, 3, 4, 5, 6].map((i) => (run.slots[i] ? SKILLS_BY_ID[run.slots[i]!] : null)),
  ]
  const slotOf = (id: string) => run.slots.indexOf(id)
  const levelOf = (id?: string | null) => (id ? (run.owned.find((o) => o.id === id)?.level ?? 0) : 0)
  const focusOwned = focus ? run.owned.find((o) => o.id === focus) : undefined
  const focusSkill = focus ? SKILLS_BY_ID[focus] : undefined
  const focusCost = focusSkill
    ? Math.round(upgradeCost(focusSkill, focusOwned?.level ?? 0) * (1 - perks.upgradeDiscountPct))
    : 0

  // Pointer-drag a loadout slot onto another to swap (touch + mouse).
  const startDrag = (slot: number, e: React.PointerEvent) => {
    setSel(slot)
    if (run.slots[slot]) setFocus(run.slots[slot]!)
    const sx = e.clientX
    const sy = e.clientY
    let moved = false
    const slotUnder = (ev: PointerEvent): number | null => {
      const el = document.elementFromPoint(ev.clientX, ev.clientY) as HTMLElement | null
      const cell = el?.closest('[data-slot]') as HTMLElement | null
      return cell ? Number(cell.dataset.slot) : null
    }
    const move = (ev: PointerEvent) => {
      if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 8) {
        moved = true
        setDrag({ from: slot, x: ev.clientX, y: ev.clientY })
      }
      if (moved) {
        setDrag((d) => (d ? { ...d, x: ev.clientX, y: ev.clientY } : d))
        setOver(slotUnder(ev))
      }
    }
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      if (moved) {
        const to = slotUnder(ev)
        if (to && to !== slot) swapSlots(slot, to)
      }
      setDrag(null)
      setOver(null)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <div className="screen prep">
      <div className="row spread prep-head">
        <div>
          <h2>Prepare · Boss {run.bossIndex}</h2>
        </div>
        <div className="row gap">
          <span className="pip">
            <HeartIcon className="pip-ic hp-ic" /> {run.hp}
          </span>
          <span className="pip">
            <GoldIcon className="pip-ic" /> {run.gold}
          </span>
          <button className="btn secondary small-btn" onClick={() => goTo('menu')}>
            Menu
          </button>
        </div>
      </div>

      <div className="prep-cols">
        {/* LEFT: hero + loadout + description */}
        <div className="prep-left">
          <button
            className={`hero-bar ${canSwapHero ? 'tappable' : ''}`}
            onClick={() => canSwapHero && setHeroModal(true)}
            disabled={!canSwapHero}
          >
            <OrnatePortrait className="hero-bar-portrait" glow="var(--teal-lit)">
              <CharacterArt id={run.character.id} className="art-svg" />
            </OrnatePortrait>
            <div className="hero-bar-body">
              <div className="row spread">
                <strong className="hero-name">{run.character.name}</strong>
                {canSwapHero && <span className="swap-hint">tap to change</span>}
              </div>
              <p className="dim small hero-desc">{run.character.desc}</p>
            </div>
          </button>

          <div className="label slots-hint">Loadout — tap to select · drag to swap</div>
          <div className="slots-row">
            {[1, 2, 3, 4, 5, 6].map((slot) => (
              <div
                key={slot}
                className={`slot-wrap ${over === slot ? 'over' : ''} ${drag?.from === slot ? 'dragging' : ''}`}
                data-slot={slot}
                style={{ touchAction: 'none' }}
                onPointerDown={(e) => startDrag(slot, e)}
              >
                <SkillCard
                  skill={loadout[slot]}
                  level={levelOf(run.slots[slot])}
                  slot={slot}
                  selected={slot === sel}
                  compact
                />
              </div>
            ))}
          </div>

          <div className="desc-plaque">
            {focusSkill ? (
              <>
                <div className="row spread">
                  <strong className="desc-name">{focusSkill.name}</strong>
                  <span className="lvl-tag">Lv {(focusOwned?.level ?? 0) + 1}</span>
                </div>
                <div className="desc-text">{describeSkill(focusSkill, focusOwned?.level ?? 0)}</div>
                <div className="desc-actions">
                  {run.slots[sel] === focusSkill.id ? (
                    <button
                      className="btn secondary desc-btn"
                      onClick={() => setSlot(sel, null)}
                    >
                      Unequip
                    </button>
                  ) : (
                    <button className="btn desc-btn" onClick={() => setSlot(sel, focusSkill.id)}>
                      Equip → slot {sel}
                    </button>
                  )}
                  <button
                    className="btn gold desc-btn"
                    disabled={run.gold < focusCost}
                    onClick={() => upgradeSkill(focusSkill.id)}
                  >
                    <GoldIcon className="mini-ic" /> {focusCost}
                  </button>
                </div>
              </>
            ) : (
              <div className="dim small center">
                Select a slot, then tap a skill to preview — press Equip to place it.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: item pool + start */}
        <div className="prep-right">
          <div className="pool-panel">
            <div className="row spread pool-head">
              <span className="label pool-label">Skills — tap to preview</span>
              {pageCount > 1 && (
                <span className="pager">
                  <button
                    className="pager-btn"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={curPage === 0}
                  >
                    ‹
                  </button>
                  <span className="pager-num">
                    {curPage + 1}/{pageCount}
                  </span>
                  <button
                    className="pager-btn"
                    onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                    disabled={curPage >= pageCount - 1}
                  >
                    ›
                  </button>
                </span>
              )}
            </div>
            <div className="pool-grid">
              {pageOwned.map((o) => {
                const base = SKILLS_BY_ID[o.id]
                if (!base) return null
                const at = slotOf(o.id)
                return (
                  <button
                    key={o.id}
                    className={`pool-tile ${focus === o.id ? 'focused' : ''} ${at > 0 ? 'equipped' : ''}`}
                    style={{ color: roleColor(base.art) }}
                    onClick={() => setFocus(o.id)}
                  >
                    {at > 0 && <span className="pool-slot">{at}</span>}
                    <span className="pool-lv">Lv{o.level + 1}</span>
                    <SkillIcon art={base.art} className="pool-ic" />
                    <span className="pool-name">{base.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <button className="btn gold big wide" onClick={startFight}>
            Enter Battle — Boss {run.bossIndex}
          </button>
        </div>
      </div>

      {/* drag ghost */}
      {drag && (
        <div className="slot-ghost" style={{ left: drag.x, top: drag.y }}>
          <SkillCard skill={loadout[drag.from]} level={levelOf(run.slots[drag.from])} slot={drag.from} compact />
        </div>
      )}

      {/* Hero picker modal */}
      {heroModal && (
        <div className="modal-scrim" onClick={() => setHeroModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="row spread modal-head">
              <h3>Choose Hero</h3>
              <button className="btn secondary small-btn" onClick={() => setHeroModal(false)}>
                Close
              </button>
            </div>
            <div className="scroll-area modal-list">
              {CHARACTERS.map((c) => (
                <button
                  key={c.id}
                  className={`panel char-card ${c.id === run.character.id ? 'assigned' : ''}`}
                  onClick={() => {
                    setCharacter(c)
                    setHeroModal(false)
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
          </div>
        </div>
      )}
    </div>
  )
}
