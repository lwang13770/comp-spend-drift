// Designed-vs-actual comparison bars for a fired check. Units vary (%, x, $), so bars
// are scaled to the larger of the two magnitudes; the labels carry the real values.

const fmtValue = (m) => {
  if (!m) return '—'
  const { value, unit } = m
  if (unit === '$') return '$' + Math.round(value / 1000).toLocaleString() + 'K'
  if (unit === 'x') return value.toFixed(value < 10 ? 2 : 1) + 'x'
  if (unit.startsWith('%')) return value.toFixed(1) + '%'
  return `${value.toFixed(1)} ${unit}`
}

function Bar({ label, m, max, tone }) {
  const width = max > 0 ? Math.max(4, (Math.abs(m?.value ?? 0) / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <div className="w-16 shrink-0 text-xs text-muted">{label}</div>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${width}%` }} />
      </div>
      <div className="tnum w-20 shrink-0 text-right text-xs font-medium">{fmtValue(m)}</div>
    </div>
  )
}

export default function ComparisonBar({ designed, actual }) {
  const max = Math.max(Math.abs(designed?.value ?? 0), Math.abs(actual?.value ?? 0))
  return (
    <div className="space-y-1.5">
      <Bar label="Designed" m={designed} max={max} tone="bg-muted/60" />
      <Bar label="Actual" m={actual} max={max} tone="bg-accent" />
    </div>
  )
}
