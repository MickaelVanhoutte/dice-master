// Swappable placeholder art. Everything is inline SVG (no emoji, no raster).
// Real art can later replace these components without touching game code.

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
    body: `hsl(${hue} 55% 52%)`,
    dark: `hsl(${hue} 55% 34%)`,
    glow: `hsl(${(hue + 40) % 360} 80% 68%)`,
  }
}

// ── Monster: procedural creature seeded by id ─────────────────────────────
export function MonsterArt({ id, className }: { id: string; className?: string }) {
  const s = hash(id)
  const p = palette(s)
  const variant = s % 4
  const eyeY = 44
  const eyes = variant % 2 === 0 ? [38, 62] : [34, 50, 66]
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={id}>
      {/* spikes / horns */}
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
      {/* body */}
      <path
        d="M50 22 C74 22 84 40 84 58 C84 80 68 90 50 90 C32 90 16 80 16 58 C16 40 26 22 50 22 Z"
        fill={p.body}
        stroke={p.dark}
        strokeWidth="3"
      />
      {/* belly */}
      <ellipse cx="50" cy="66" rx="20" ry="16" fill={p.dark} opacity="0.35" />
      {/* eyes */}
      {eyes.map((x) => (
        <g key={x}>
          <circle cx={x} cy={eyeY} r="7" fill="#fff" />
          <circle cx={x} cy={eyeY + 1} r="3.2" fill="#161022" />
        </g>
      ))}
      {/* mouth */}
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

// ── Character: procedural humanoid seeded by id ───────────────────────────
export function CharacterArt({ id, className }: { id: string; className?: string }) {
  const s = hash(id + 'c')
  const p = palette(s)
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={id}>
      {/* hood / cloak */}
      <path
        d="M50 16 C70 16 78 34 78 54 L78 88 L22 88 L22 54 C22 34 30 16 50 16 Z"
        fill={p.body}
        stroke={p.dark}
        strokeWidth="3"
      />
      {/* face */}
      <ellipse cx="50" cy="46" rx="16" ry="18" fill="#f2e6d8" />
      {/* eyes */}
      <circle cx="44" cy="45" r="2.6" fill="#161022" />
      <circle cx="56" cy="45" r="2.6" fill="#161022" />
      {/* emblem */}
      <circle cx="50" cy="72" r="8" fill={p.glow} opacity="0.9" />
      <circle cx="50" cy="72" r="3.5" fill={p.dark} />
    </svg>
  )
}

// ── Skill icons by role ───────────────────────────────────────────────────
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

// ── Simple stat / misc glyphs ─────────────────────────────────────────────
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

// Dice pip face (1..6).
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
