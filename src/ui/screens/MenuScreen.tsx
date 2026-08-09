import { useMeta } from '../../state/metaStore'
import { useRun } from '../../state/runStore'
import { levelFromXp } from '../../game/xp'
import { StatBar } from '../components/Bars'
import { CHARACTERS } from '../../data/characters'

export function MenuScreen() {
  const meta = useMeta()
  const run = useRun((s) => s.run)
  const combat = useRun((s) => s.combat)
  const goTo = useRun((s) => s.goTo)
  const newRun = useRun((s) => s.newRun)
  const abandonRun = useRun((s) => s.abandonRun)
  const info = levelFromXp(meta.xp)
  const hasRun = !!run

  return (
    <div className="screen menu">
      <div className="menu-inner">
      <div className="title-wrap">
        <h1 className="game-title">DICE MASTERS</h1>
        <p className="dim center">A dice-driven roguelike</p>
      </div>

      <div className="panel level-card">
        <div className="row spread">
          <span>Level {info.level}</span>
          <span className="dim">
            {meta.perkPoints} perk point{meta.perkPoints === 1 ? '' : 's'}
          </span>
        </div>
        <StatBar value={info.intoLevel} max={info.span} color="var(--teal-lit)" />
        <div className="dim small">
          {info.intoLevel}/{info.span} XP to next level
        </div>
      </div>

      <div className="menu-buttons">
        {hasRun && (
          <button className="btn big wide" onClick={() => goTo(combat ? 'combat' : 'prep')}>
            Continue Run
          </button>
        )}
        <button
          className="btn big wide"
          onClick={() => {
            if (hasRun) abandonRun()
            newRun(CHARACTERS[0])
          }}
        >
          {hasRun ? 'New Run (abandon current)' : 'New Run'}
        </button>
        <button className="btn secondary wide" onClick={() => goTo('perks')}>
          Character Perks
        </button>
        <button className="btn secondary wide" onClick={() => goTo('bestiary')}>
          Bestiary
        </button>
      </div>

      <div className="menu-footer">
        <button
          className="btn secondary"
          onClick={() => {
            if (confirm('Reset ALL progress (perks, XP, bestiary)? This cannot be undone.')) {
              useMeta.getState().resetAll()
              useRun.getState().abandonRun()
            }
          }}
        >
          Reset Save
        </button>
        <button className="btn secondary" onClick={() => meta.toggleMute()}>
          Sound: {meta.muted ? 'Off' : 'On'}
        </button>
      </div>
      </div>
    </div>
  )
}
