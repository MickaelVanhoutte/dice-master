import { useEffect } from 'react'
import { useRun } from '../../state/runStore'
import { firingSlots } from '../../game/combat'
import { BossPanel } from '../components/BossPanel'
import { PlayerPanel } from '../components/PlayerPanel'
import { DiceBoard } from '../components/DiceBoard'
import { GoldIcon } from '../../assets/AssetRegistry'

export function CombatScreen() {
  const combat = useRun((s) => s.combat)
  const roll = useRun((s) => s.roll)
  const reroll = useRun((s) => s.reroll)
  const confirm = useRun((s) => s.confirm)
  const monsterStep = useRun((s) => s.monsterStep)

  // Auto-run the monster's turn (with a beat for animation).
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
    label = 'Enemy turn…'
    action = null
  } else if (phase === 'won' || phase === 'lost') {
    label = '…'
    action = null
  }

  return (
    <div className="combat">
      <BossPanel combat={combat} />

      <div className="board-mid">
        <div className="turn-tag">Turn {combat.turn}</div>
        {combat.goldGained > 0 && (
          <div className="gold-tag row">
            <GoldIcon className="mini-ic" /> +{combat.goldGained}
          </div>
        )}
        <DiceBoard
          dice={combat.dice}
          rerolls={combat.player.rerolls}
          canReroll={phase === 'rolled' && combat.player.rerolls > 0}
          onReroll={reroll}
        />
      </div>

      <div className="combat-bottom">
        <PlayerPanel combat={combat} loadout={combat.setup.loadout} firing={firing} />
        <button className="btn big wide roll-btn" disabled={!action} onClick={() => action?.()}>
          {label}
        </button>
      </div>
    </div>
  )
}
