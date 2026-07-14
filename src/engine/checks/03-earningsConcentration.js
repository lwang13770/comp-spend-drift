import { sum, result, CATEGORY } from '../util.js'
import { pct } from '../../lib/format.js'

// Earnings Concentration — what share of the variable pool goes to the top 20% of earners?
// Threshold: top 20% earning >50% = drifting, >65% = off.
export function earningsConcentration(plan, roster) {
  const paid = roster.map((r) => r.variablePaid).sort((a, b) => b - a)
  const total = sum(paid)
  const topCount = Math.max(1, Math.floor(0.2 * roster.length))
  const topShare = total ? sum(paid.slice(0, topCount)) / total : 0

  const status = topShare > 0.65 ? 'off' : topShare > 0.5 ? 'drifting' : 'clean'

  return result({
    id: 'earningsConcentration',
    category: CATEGORY.PLANNED_SPEND,
    label: 'Earnings Concentration',
    status,
    designed: { value: 50, unit: '% (ceiling)' },
    actual: { value: topShare * 100, unit: '%' },
    delta: null,
    summary: `Top ${topCount} of ${roster.length} earners take ${pct(
      topShare,
    )} of the variable pool.`,
    details: { topCount, topShare },
  })
}
