import { motion } from 'framer-motion'
import { DieFace } from '../../assets/AssetRegistry'

// Cube face orientations. To bring value `v` toward the camera we apply the
// inverse of the face's own rotation.
const FACE_TRANSFORM: Record<number, string> = {
  1: 'rotateY(0deg) translateZ(var(--half))',
  6: 'rotateY(180deg) translateZ(var(--half))',
  2: 'rotateY(90deg) translateZ(var(--half))',
  5: 'rotateY(-90deg) translateZ(var(--half))',
  3: 'rotateX(90deg) translateZ(var(--half))',
  4: 'rotateX(-90deg) translateZ(var(--half))',
}
const SHOW: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  6: { x: 0, y: -180 },
  2: { x: 0, y: -90 },
  5: { x: 0, y: 90 },
  3: { x: -90, y: 0 },
  4: { x: 90, y: 0 },
}

const prefersReduced =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// `spin` seeds extra full turns so each roll tumbles differently.
export function Die3D({ value, spin, combo }: { value: number; spin: number; combo: boolean }) {
  const target = SHOW[value] ?? SHOW[1]
  const extraX = 360 * (2 + (spin % 3))
  const extraY = 360 * (2 + ((spin + 1) % 4))
  return (
    <div className="cube-wrap">
      <motion.div
        className={`cube ${combo ? 'cube-combo' : ''}`}
        initial={prefersReduced ? false : { rotateX: target.x - extraX, rotateY: target.y - extraY }}
        animate={{ rotateX: target.x, rotateY: target.y }}
        transition={
          prefersReduced
            ? { duration: 0 }
            : { duration: 0.7, ease: [0.15, 0.7, 0.25, 1] }
        }
      >
        {[1, 2, 3, 4, 5, 6].map((f) => (
          <span key={f} className="cube-face" style={{ transform: FACE_TRANSFORM[f] }}>
            <DieFace value={f} className="cube-pips" />
          </span>
        ))}
      </motion.div>
    </div>
  )
}
