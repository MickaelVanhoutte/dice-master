import { motion } from 'framer-motion'
import { DieFace } from '../../assets/AssetRegistry'

const prefersReduced =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// A die that is "thrown": flies in from above with a spin, bounces on the desk
// a couple of times, then settles showing its value. `spin` varies per die/roll.
export function RollingDie({ value, spin, combo }: { value: number; spin: number; combo: boolean }) {
  const dir = spin % 2 === 0 ? 1 : -1
  const startX = dir * (30 + (spin % 3) * 14)
  const turns = 2 + (spin % 3)
  const startRot = -dir * turns * 360 - (spin % 90)

  if (prefersReduced) {
    return (
      <div className={`die2d ${combo ? 'die2d-combo' : ''}`}>
        <DieFace value={value} className="die2d-pips" />
      </div>
    )
  }

  return (
    <motion.div
      className={`die2d ${combo ? 'die2d-combo' : ''}`}
      initial={{ x: startX, y: -64, rotate: startRot, scale: 0.55, opacity: 0 }}
      animate={{
        x: 0,
        y: [-64, 0, -26, 0, -9, 0],
        rotate: 0,
        scale: [0.55, 1.08, 0.98, 1.04, 1],
        opacity: 1,
      }}
      transition={{
        duration: 0.85,
        ease: 'easeOut',
        y: { times: [0, 0.5, 0.66, 0.8, 0.92, 1], ease: ['easeIn', 'easeOut', 'easeIn', 'easeOut', 'easeOut'] },
        scale: { times: [0, 0.5, 0.66, 0.85, 1] },
        rotate: { ease: 'easeOut' },
      }}
    >
      <DieFace value={value} className="die2d-pips" />
    </motion.div>
  )
}
