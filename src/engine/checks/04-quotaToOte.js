import { mean, result, CATEGORY } from '../util.js'
import { moneyK, ratio } from '../../lib/format.js'

// Quota-to-OTE Ratio — average assigned quota / OTE vs the designed ratio.
// Lower-than-designed quotas make each revenue dollar cost more in variable comp.
// Threshold: >0.3x drift = drifting, >0.8x = off.
export function quotaToOte(plan, roster) {
  const avgQuota = mean(roster.map((r) => r.quota))
  const actualRatio = avgQuota / plan.ote
  const designedRatio = plan.designedQuota / plan.ote
  const drift = Math.abs(designedRatio - actualRatio)

  const status = drift > 0.8 ? 'off' : drift > 0.3 ? 'drifting' : 'clean'

  return result({
    id: 'quotaToOte',
    category: CATEGORY.EFFICIENCY,
    label: 'Quota-to-OTE Ratio',
    status,
    designed: { value: designedRatio, unit: 'x' },
    actual: { value: actualRatio, unit: 'x' },
    delta: { value: drift, unit: 'x' },
    summary: `Average assigned quota ${moneyK(avgQuota)} vs designed ${moneyK(
      plan.designedQuota,
    )}; ratio ${ratio(actualRatio)} vs designed ${ratio(designedRatio)}.`,
    details: { avgQuota, actualRatio, designedRatio, drift },
  })
}
