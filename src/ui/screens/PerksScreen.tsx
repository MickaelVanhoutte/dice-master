import { useMeta } from '../../state/metaStore'
import { useRun } from '../../state/runStore'
import { PERKS } from '../../data/perks'

function magnitudeLabel(id: string, perLevel: number, level: number): string {
  const v = perLevel * level
  switch (id) {
    case 'physResist':
    case 'magResist':
    case 'greed':
    case 'thrift':
      return `${Math.round(v * 100)}%`
    default:
      return `${v}`
  }
}

export function PerksScreen() {
  const meta = useMeta()
  const goTo = useRun((s) => s.goTo)

  return (
    <div className="screen perks">
      <div className="row spread">
        <div className="row gap">
          <h2>Character Perks</h2>
          <span className="points-inline">
            {meta.perkPoints} <span className="pts-lbl">pts</span>
          </span>
        </div>
        <button className="btn secondary small-btn" onClick={() => goTo('menu')}>
          Back
        </button>
      </div>

      <div className="perk-list scroll-area">
        {PERKS.map((p) => {
          const level = meta.perks[p.id] ?? 0
          const maxed = level >= p.maxLevel
          const cost = maxed ? 0 : p.costPerLevel[level]
          const canBuy = !maxed && meta.perkPoints >= cost
          return (
            <div key={p.id} className="panel perk-card">
              <div className="perk-info">
                <div className="row spread">
                  <strong>{p.name}</strong>
                  <span className="dim small">
                    Lv {level}/{p.maxLevel}
                  </span>
                </div>
                <p className="dim small">{p.desc}</p>
                {level > 0 && (
                  <div className="perk-current small">Current: {magnitudeLabel(p.id, p.perLevel, level)}</div>
                )}
              </div>
              <button className="btn perk-buy" disabled={!canBuy} onClick={() => meta.buyPerk(p.id)}>
                {maxed ? 'MAX' : `${cost} pt`}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
