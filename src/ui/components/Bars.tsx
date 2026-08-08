import { HeartIcon, ShieldIcon } from '../../assets/AssetRegistry'

export function StatBar({
  value,
  max,
  color,
  height = 16,
}: {
  value: number
  max: number
  color: string
  height?: number
}) {
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) * 100 : 0
  return (
    <div className="statbar" style={{ height }}>
      <div className="statbar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

export function HpRow({ hp, maxHp }: { hp: number; maxHp: number }) {
  return (
    <div className="statrow">
      <HeartIcon className="stat-ic hp-ic" />
      <StatBar value={hp} max={maxHp} color="var(--heal)" />
      <span className="stat-num">
        {Math.max(0, hp)}/{maxHp}
      </span>
    </div>
  )
}

export function ShieldRow({ shield }: { shield: number }) {
  if (shield <= 0) return null
  return (
    <div className="statrow">
      <ShieldIcon className="stat-ic shield-ic" />
      <span className="stat-num shield-num">{shield}</span>
    </div>
  )
}
