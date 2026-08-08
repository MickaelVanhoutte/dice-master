import type { ReactNode } from 'react'
import { CornerOrnament } from '../../assets/AssetRegistry'

// Brass-framed container with filigree corners. tone sets the inner fill.
export function BrassFrame({
  children,
  className = '',
  tone = 'wood',
  corners = true,
}: {
  children: ReactNode
  className?: string
  tone?: 'wood' | 'parch' | 'dark'
  corners?: boolean
}) {
  return (
    <div className={`brass-frame tone-${tone} ${className}`}>
      {corners && (
        <>
          <CornerOrnament className="corner c-tl" />
          <CornerOrnament className="corner c-tr" />
          <CornerOrnament className="corner c-bl" />
          <CornerOrnament className="corner c-br" />
        </>
      )}
      <div className="brass-inner">{children}</div>
    </div>
  )
}

export function ParchmentPanel({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`parch-panel ${className}`}>{children}</div>
}

export function WoodPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`wood-panel ${className}`}>{children}</div>
}

// Title on a ribbon banner.
export function Banner({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`banner ${className}`}>
      <span className="banner-text">{children}</span>
    </div>
  )
}

// Framed portrait with a soft magic glow behind it.
export function OrnatePortrait({
  children,
  className = '',
  glow = 'var(--brass)',
  shape = 'round',
}: {
  children: ReactNode
  className?: string
  glow?: string
  shape?: 'round' | 'rect'
}) {
  return (
    <div className={`portrait shape-${shape} ${className}`} style={{ ['--glow' as string]: glow }}>
      <div className="portrait-glow" />
      <div className="portrait-inner">{children}</div>
      <div className="portrait-ring" />
    </div>
  )
}
