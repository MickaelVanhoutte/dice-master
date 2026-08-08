// Swappable art. Inline SVG by default (no emoji, no bundled raster); optional painted
// raster drops into /public/art/ and replaces the SVG with zero code change.
import { useState } from 'react'
import { heroArtUrl, monsterArtUrl } from './artManifest'

function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function palette(seed: number): { body: string; dark: string; glow: string } {
  const hue = seed % 360
  return {
    body: `hsl(${hue} 45% 48%)`,
    dark: `hsl(${hue} 48% 30%)`,
    glow: `hsl(${(hue + 40) % 360} 75% 66%)`,
  }
}

// ── raster-or-svg ──────────────────────────────────────────────────────────
function RasterOrSvg({
  src,
  alt,
  className,
  children,
}: {
  src: string
  alt: string
  className?: string
  children: React.ReactNode
}) {
  const [failed, setFailed] = useState(false)
  if (failed) return <>{children}</>
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      draggable={false}
      onError={() => setFailed(true)}
    />
  )
}

// ── monster (procedural creature; raster if present) ───────────────────────
function MonsterSvg({ id, className }: { id: string; className?: string }) {
  const s = hash(id)
  const p = palette(s)
  const variant = s % 4
  const eyeY = 44
  const eyes = variant % 2 === 0 ? [38, 62] : [34, 50, 66]
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={id}>
      {variant === 1 && (
        <g fill={p.dark}>
          <polygon points="30,26 36,6 42,26" />
          <polygon points="58,26 64,6 70,26" />
        </g>
      )}
      {variant === 3 && (
        <g fill={p.dark}>
          {[24, 40, 56, 72].map((x) => (
            <polygon key={x} points={`${x},22 ${x + 6},4 ${x + 12},22`} />
          ))}
        </g>
      )}
      <path
        d="M50 22 C74 22 84 40 84 58 C84 80 68 90 50 90 C32 90 16 80 16 58 C16 40 26 22 50 22 Z"
        fill={p.body}
        stroke={p.dark}
        strokeWidth="3"
      />
      <ellipse cx="50" cy="66" rx="20" ry="16" fill={p.dark} opacity="0.35" />
      {eyes.map((x) => (
        <g key={x}>
          <circle cx={x} cy={eyeY} r="7" fill="#fff" />
          <circle cx={x} cy={eyeY + 1} r="3.2" fill="#161022" />
        </g>
      ))}
      {variant === 2 ? (
        <path d="M36 74 Q50 84 64 74" stroke="#161022" strokeWidth="3" fill="none" />
      ) : (
        <g fill="#161022">
          <polygon points="40,72 45,80 50,72" />
          <polygon points="52,72 57,80 62,72" />
        </g>
      )}
    </svg>
  )
}

export function MonsterArt({ id, className }: { id: string; className?: string }) {
  return (
    <RasterOrSvg src={monsterArtUrl(id)} alt={id} className={className}>
      <MonsterSvg id={id} className={className} />
    </RasterOrSvg>
  )
}

// ── character (procedural humanoid; raster if present) ─────────────────────
function HeroSvg({ id, className }: { id: string; className?: string }) {
  const s = hash(id + 'c')
  const p = palette(s)
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={id}>
      <path
        d="M50 16 C70 16 78 34 78 54 L78 88 L22 88 L22 54 C22 34 30 16 50 16 Z"
        fill={p.body}
        stroke={p.dark}
        strokeWidth="3"
      />
      <ellipse cx="50" cy="46" rx="16" ry="18" fill="#f2e6d8" />
      <circle cx="44" cy="45" r="2.6" fill="#161022" />
      <circle cx="56" cy="45" r="2.6" fill="#161022" />
      <circle cx="50" cy="72" r="8" fill={p.glow} opacity="0.9" />
      <circle cx="50" cy="72" r="3.5" fill={p.dark} />
    </svg>
  )
}

export function CharacterArt({ id, className }: { id: string; className?: string }) {
  return (
    <RasterOrSvg src={heroArtUrl(id)} alt={id} className={className}>
      <HeroSvg id={id} className={className} />
    </RasterOrSvg>
  )
}

// ── ornaments ──────────────────────────────────────────────────────────────
// A filigree corner piece (top-left orientation); rotate via CSS for others.
export function CornerOrnament({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <g fill="none" stroke="url(#brassStroke)" strokeWidth="2.4" strokeLinecap="round">
        <path d="M4 22 C4 10 10 4 22 4" />
        <path d="M4 30 C4 14 14 4 30 4" opacity="0.6" />
        <path d="M10 20 C10 14 14 10 20 10" />
      </g>
      <circle cx="20" cy="20" r="2.6" fill="var(--brass-lit)" />
      <defs>
        <linearGradient id="brassStroke" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0" stopColor="var(--brass-lit)" />
          <stop offset="1" stopColor="var(--brass-dark)" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Compass-rose watermark for the parchment board.
export function CompassRose({ className }: { className?: string }) {
  const pts = (r: number, a: number) => {
    const rad = (a * Math.PI) / 180
    return `${50 + r * Math.cos(rad)},${50 + r * Math.sin(rad)}`
  }
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <g stroke="currentColor" fill="none" strokeWidth="0.8" opacity="0.9">
        <circle cx="50" cy="50" r="42" />
        <circle cx="50" cy="50" r="34" strokeDasharray="1 3" />
        {[0, 45, 90, 135].map((a) => (
          <line key={a} x1={pts(42, a).split(',')[0]} y1={pts(42, a).split(',')[1]} x2={pts(42, a + 180).split(',')[0]} y2={pts(42, a + 180).split(',')[1]} />
        ))}
      </g>
      <g fill="currentColor" opacity="0.85">
        {[0, 90, 180, 270].map((a) => (
          <polygon key={a} points={`${pts(40, a)} ${pts(7, a + 90)} ${pts(7, a - 90)}`} />
        ))}
        {[45, 135, 225, 315].map((a) => (
          <polygon key={a} points={`${pts(24, a)} ${pts(5, a + 90)} ${pts(5, a - 90)}`} opacity="0.5" />
        ))}
      </g>
      <circle cx="50" cy="50" r="4" fill="currentColor" />
    </svg>
  )
}

// ── skill icons by role ───────────────────────────────────────────────────
type IconProps = { className?: string }

function Magic({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 2 L14 9 L21 11 L14 13 L12 20 L10 13 L3 11 L10 9 Z" fill="currentColor" />
    </svg>
  )
}
function Phys({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M3 21 L5 19 L14 10 L17 13 L8 22 Z" fill="currentColor" />
      <path d="M13 9 L19 3 L21 5 L15 11 Z" fill="currentColor" />
    </svg>
  )
}
function Shield({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 2 L20 5 V11 C20 16 16 20 12 22 C8 20 4 16 4 11 V5 Z" fill="currentColor" />
    </svg>
  )
}
function Heal({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M10 3 H14 V10 H21 V14 H14 V21 H10 V14 H3 V10 H10 Z" fill="currentColor" />
    </svg>
  )
}
function Gold({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" fill="currentColor" />
      <circle cx="12" cy="12" r="6" fill="none" stroke="#7a5c12" strokeWidth="1.5" />
    </svg>
  )
}
function Mix({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="9" cy="9" r="6" fill="currentColor" opacity="0.9" />
      <circle cx="15" cy="15" r="6" fill="currentColor" opacity="0.55" />
    </svg>
  )
}
function Debuff({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 3 C8 8 5 11 5 15 A7 7 0 0 0 19 15 C19 11 16 8 12 3 Z" fill="currentColor" />
    </svg>
  )
}
function Buff({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 3 L20 12 H15 V21 H9 V12 H4 Z" fill="currentColor" />
    </svg>
  )
}

const ICONS: Record<string, (p: IconProps) => JSX.Element> = {
  'skill-magic': Magic,
  'skill-phys': Phys,
  'skill-shield': Shield,
  'skill-heal': Heal,
  'skill-gold': Gold,
  'skill-mix': Mix,
  'skill-debuff': Debuff,
  'skill-buff': Buff,
}

export function SkillIcon({ art, className }: { art: string; className?: string }) {
  const Comp = ICONS[art] ?? Mix
  return <Comp className={className} />
}

export function HeartIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 21 C6 16 3 12 3 8.5 A4.5 4.5 0 0 1 12 6 A4.5 4.5 0 0 1 21 8.5 C21 12 18 16 12 21 Z"
        fill="currentColor"
      />
    </svg>
  )
}
export function ShieldIcon({ className }: IconProps) {
  return <Shield className={className} />
}
export function GoldIcon({ className }: IconProps) {
  return <Gold className={className} />
}

// Dice pip face (1..6). Pips use currentColor; the cube styling lives in CSS.
export function DieFace({ value, className }: { value: number; className?: string }) {
  const spots: Record<number, [number, number][]> = {
    1: [[50, 50]],
    2: [[30, 30], [70, 70]],
    3: [[30, 30], [50, 50], [70, 70]],
    4: [[30, 30], [70, 30], [30, 70], [70, 70]],
    5: [[30, 30], [70, 30], [50, 50], [30, 70], [70, 70]],
    6: [[30, 28], [70, 28], [30, 50], [70, 50], [30, 72], [70, 72]],
  }
  return (
    <svg viewBox="0 0 100 100" className={className} aria-label={`die ${value}`}>
      {(spots[value] ?? spots[1]).map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="9" fill="currentColor" />
      ))}
    </svg>
  )
}
