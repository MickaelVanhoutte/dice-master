import { useRun } from '../../state/runStore'
import { CHARACTERS } from '../../data/characters'

export function GameOverScreen() {
  const summary = useRun((s) => s.gameOver)
  const goTo = useRun((s) => s.goTo)
  const newRun = useRun((s) => s.newRun)
  const abandonRun = useRun((s) => s.abandonRun)
  if (!summary) return null

  const reset = () => abandonRun()

  return (
    <div className="screen gameover">
      <h2 className="center defeat">Defeated</h2>
      <p className="center dim">You fell at Boss {summary.bossReached}.</p>

      <div className="panel go-stats">
        <div className="row spread">
          <span>Bosses defeated</span>
          <strong>{summary.bossesDefeated}</strong>
        </div>
        <div className="row spread">
          <span>XP gained</span>
          <strong className="xp-num">+{summary.xpGained}</strong>
        </div>
        {summary.leveledUp && (
          <div className="levelup">Level up! You are now level {summary.newLevel}. Spend perk points.</div>
        )}
      </div>

      <div className="go-actions">
        {summary.leveledUp && (
          <button
            className="btn big wide"
            onClick={() => {
              reset()
              goTo('perks')
            }}
          >
            Spend Perk Points
          </button>
        )}
        <button
          className="btn big wide"
          onClick={() => {
            reset()
            newRun(CHARACTERS[0])
          }}
        >
          New Run
        </button>
        <button
          className="btn secondary wide"
          onClick={() => {
            reset()
            goTo('menu')
          }}
        >
          Main Menu
        </button>
      </div>
    </div>
  )
}
