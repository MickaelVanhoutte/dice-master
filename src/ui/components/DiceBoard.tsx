import { AnimatePresence, motion } from 'framer-motion'
import { analyzeCombo } from '../../game/dice'
import { RollingDie } from './Die3D'

export function DiceBoard({
  dice,
  rerolls,
  canReroll,
  onReroll,
  turn,
  goldGained,
  activeIndex = -1,
  nonce = 0,
}: {
  dice: number[] | null
  rerolls: number
  canReroll: boolean
  onReroll: (index: number) => void
  turn: number
  goldGained: number
  activeIndex?: number
  nonce?: number
}) {
  const combo = dice ? analyzeCombo(dice) : null

  const comboValues = new Set<number>()
  if (dice && combo && combo.maxSame >= 2) {
    const counts = new Map<number, number>()
    for (const d of dice) counts.set(d, (counts.get(d) ?? 0) + 1)
    for (const [v, c] of counts) if (c === combo.maxSame) comboValues.add(v)
  }

  const comboKind = combo?.hasTriple ? 'triple' : combo && combo.maxSame >= 4 ? 'quad' : 'double'

  return (
    <div className="board">
      <div className="board-topbar">
        <span className="turn-tag">Turn {turn}</span>
        {goldGained > 0 && <span className="gold-tag">+{goldGained}g</span>}
      </div>

      <AnimatePresence>
        {combo && combo.multiplier > 1 && (
          <motion.div
            key={`${comboKind}-${nonce}`}
            className={`combo-badge combo-${comboKind}`}
            initial={{ scale: 0.4, opacity: 0, y: 6 }}
            animate={{ scale: [0.4, 1.25, 1], opacity: 1, y: 0 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.45, ease: 'backOut' }}
          >
            {comboKind === 'triple' ? 'TRIPLE' : comboKind === 'quad' ? 'QUAD+' : 'DOUBLE'} ×
            {combo.multiplier.toFixed(1)}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="dice-row">
        {(dice ?? [null, null, null]).map((v, i) => (
          <button
            key={i}
            className={`die ${v == null ? 'die-empty' : ''} ${
              canReroll && v != null ? 'die-rerollable' : ''
            } ${v != null && comboValues.has(v) ? 'die-combo' : ''} ${
              activeIndex === i ? 'die-active' : activeIndex >= 0 && i < activeIndex ? 'die-done' : ''
            }`}
            disabled={!canReroll || v == null}
            onClick={() => onReroll(i)}
          >
            {v == null ? (
              <span className="die-q">?</span>
            ) : (
              <RollingDie key={`${i}-${nonce}-${v}`} value={v} spin={nonce + i} combo={comboValues.has(v)} />
            )}
          </button>
        ))}
      </div>

      {canReroll && (
        <div className="reroll-hint">
          {rerolls > 0 ? `Tap a die to reroll · ${rerolls} left` : 'No rerolls left'}
        </div>
      )}
    </div>
  )
}
