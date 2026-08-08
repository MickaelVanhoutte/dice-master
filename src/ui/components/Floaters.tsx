import { AnimatePresence, motion } from 'framer-motion'
import type { CombatEvent } from '../../game/types'

const toneColor: Record<CombatEvent['tone'], string> = {
  damage: 'var(--phys)',
  magic: 'var(--magic)',
  heal: 'var(--heal)',
  shield: 'var(--shield)',
  gold: 'var(--gold)',
  debuff: 'var(--debuff)',
  buff: 'var(--buff)',
}

export function Floaters({
  events,
  target,
}: {
  events: CombatEvent[]
  target: 'player' | 'monster'
}) {
  const shown = events.filter((e) => e.target === target)
  return (
    <div className="floaters">
      <AnimatePresence>
        {shown.map((e, i) => (
          <motion.div
            key={e.id}
            className="floater"
            style={{ color: toneColor[e.tone], left: `${20 + ((i * 27) % 60)}%` }}
            initial={{ opacity: 0, y: 10, scale: 0.6 }}
            animate={{ opacity: 1, y: -34, scale: 1 }}
            exit={{ opacity: 0, y: -54 }}
            transition={{ duration: 0.9 }}
          >
            {e.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
