import { AnimatePresence, motion } from 'framer-motion'
import { DieFace } from '../../assets/AssetRegistry'
import { analyzeCombo } from '../../game/dice'

export function DiceBoard({
  dice,
  rerolls,
  canReroll,
  onReroll,
}: {
  dice: number[] | null
  rerolls: number
  canReroll: boolean
  onReroll: (index: number) => void
}) {
  const combo = dice ? analyzeCombo(dice) : null

  // Values that form the winning combo group (highlight the dice showing them).
  const comboValues = new Set<number>()
  if (dice && combo && combo.maxSame >= 2) {
    const counts = new Map<number, number>()
    for (const d of dice) counts.set(d, (counts.get(d) ?? 0) + 1)
    for (const [v, c] of counts) if (c === combo.maxSame) comboValues.add(v)
  }

  return (
    <div className="diceboard">
      {combo && combo.multiplier > 1 && (
        <div className="combo-badge">
          {combo.hasTriple ? 'TRIPLE' : combo.maxSame >= 4 ? 'QUAD+' : 'DOUBLE'} ×
          {combo.multiplier.toFixed(1)}
        </div>
      )}
      <div className="dice-row">
        {(dice ?? [null, null, null]).map((v, i) => (
          <button
            key={i}
            className={`die ${v == null ? 'die-empty' : ''} ${canReroll && v != null ? 'die-roll' : ''} ${v != null && comboValues.has(v) ? 'die-combo' : ''}`}
            disabled={!canReroll || v == null}
            onClick={() => onReroll(i)}
          >
            {v == null ? (
              <span className="die-q">?</span>
            ) : (
              // Keyed by value so ONLY the die whose value changed re-animates.
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={v}
                  className="die-inner"
                  initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.4 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 16 }}
                >
                  <DieFace value={v} className="die-face" />
                </motion.span>
              </AnimatePresence>
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
