import { sum, result, CATEGORY } from '../util.js'
import { ratio, moneyK } from '../../lib/format.js'

// Quota Coverage Gap — total assigned quota / revenue target vs designed coverage.
// Below 1.0x the team structurally cannot hit the number even at full attainment.
// Threshold: >0.1x below designed = drifting; below 1.0x = off.
export function coverageGap(plan, roster) {
  const totalQuota = sum(roster.map((r) => r.quota))
  const coverage = totalQuota / plan.revenueTarget
  const belowDesigned = plan.designedCoverage - coverage

  const status =
    coverage < 1.0 ? 'off' : belowDesigned > 0.1 ? 'drifting' : 'clean'

  return result({
    id: 'coverageGap',
    category: CATEGORY.HIT_NUMBER,
    label: 'Quota Coverage Gap',
    status,
    designed: { value: plan.designedCoverage, unit: 'x' },
    actual: { value: coverage, unit: 'x' },
    delta: { value: belowDesigned, unit: 'x' },
    summary: `Total assigned quota ${moneyK(totalQuota)} against a ${moneyK(
      plan.revenueTarget,
    )} target. Coverage is ${ratio(coverage, 2)} vs designed ${ratio(
      plan.designedCoverage,
      2,
    )}.`,
    details: { totalQuota, coverage, designedCoverage: plan.designedCoverage },
  })
}
