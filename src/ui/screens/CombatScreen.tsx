import { useEffect } from 'react'
import { useRun } from '../../state/runStore'
import { firingSlots } from '../../game/combat'
import { BossPanel } from '../components/BossPanel'
import { PlayerPanel } from '../components/PlayerPanel'
import { DiceBoard } from '../components/DiceBoard'
import { SkillCard } from '../components/SkillCard'

export function CombatScreen() {
  const combat = useRun((s) => s.combat)
  const roll = useRun((s) => s.roll)
  const reroll = useRun((s) => s.reroll)
  const confirm = useRun((s) => s.confirm)
  const monsterStep = useRun((s) => s.monsterStep)

  useEffect(() => {
    if (combat?.phase === 'monster') {
      const t = setTimeout(monsterStep, 850)
      return () => clearTimeout(t)
    }
  }, [combat?.phase, combat?.turn, monsterStep])

  if (!combat) return null
  const { phase } = combat
  const firing = firingSlots(combat.dice)

  let label = 'Roll'
  let action: (() => void) | null = roll
  if (phase === 'rolled') {
    label = 'OK'
    action = confirm
  } else if (phase === 'monster') {
    label = '…'
    action = null
  } else if (phase === 'won' || phase === 'lost') {
    label = '…'
    action = null
  }

  return (
    <div className="combat">
      <BossPanel combat={combat} />

      <DiceBoard
        dice={combat.dice}
        rerolls={combat.player.rerolls}
        canReroll={phase === 'rolled' && combat.player.rerolls > 0}
        onReroll={reroll}
        turn={combat.turn}
        goldGained={combat.goldGained}
      />

      <PlayerPanel combat={combat} />

      <div className="skillcards">
        {[1, 2, 3, 4, 5, 6].map((slot) => (
          <SkillCard
            key={slot}
            skill={combat.setup.loadout[slot]}
            slot={slot}
            firing={firing.has(slot)}
            compact
          />
        ))}
      </div>

      <button
        className={`roll-btn ${phase === 'rolled' ? 'ready' : ''}`}
        disabled={!action}
        onClick={() => action?.()}
      >
        <span className="roll-label">{label}</span>
      </button>
    </div>
  )
}
