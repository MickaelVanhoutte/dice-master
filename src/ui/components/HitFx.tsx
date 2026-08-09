import { AnimatePresence, motion } from 'framer-motion'
import type { CombatEvent } from '../../game/types'

// The most recent damaging event on a target (drives shake + flash).
export function lastHit(
  events: CombatEvent[],
  target: 'player' | 'monster',
): { id: number; tone: 'damage' | 'magic' } | null {
  let hit: { id: number; tone: 'damage' | 'magic' } | null = null
  for (const e of events) {
    if (e.target === target && (e.tone === 'damage' || e.tone === 'magic')) {
      hit = { id: e.id, tone: e.tone }
    }
  }
  return hit
}

// Keyframes for a quick hit shake — replayed by remounting via a `key`.
export const shakeKeyframes = {
  x: [0, -7, 7, -4, 4, 0],
  rotate: [0, -1.6, 1.6, -1, 0],
}

export function HitFlash({ hit }: { hit: { id: number; tone: 'damage' | 'magic' } | null }) {
  return (
    <AnimatePresence>
      {hit && (
        <motion.div
          key={hit.id}
          className={`hit-flash ${hit.tone}`}
          initial={{ opacity: 0.55 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      )}
    </AnimatePresence>
  )
}
