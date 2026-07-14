import { sum, result, CATEGORY } from '../util.js'
import { moneyK, pct } from '../../lib/format.js'

// Total Variable Spend vs Budget — is total variable comp within the planned budget?
// Threshold: >15% variance = drifting, >25% = off.
export function variableSpend(plan, roster) {
  const totalVar = sum(roster.map((r) => r.variablePaid))
  const variance = (totalVar - plan.variableBudget) / plan.variableBudget
  const abs = Math.abs(variance)

  const status = abs > 0.25 ? 'off' : abs > 0.15 ? 'drifting' : 'clean'

  return result({
    id: 'variableSpend',
    category: CATEGORY.PLANNED_SPEND,
    label: 'Total Variable Spend vs Budget',
    status,
    designed: { value: plan.variableBudget, unit: '$' },
    actual: { value: totalVar, unit: '$' },
    delta: { value: variance * 100, unit: '%' },
    summary: `${moneyK(totalVar)} spent vs ${moneyK(plan.variableBudget)} budget (${
      variance >= 0 ? '+' : ''
    }${pct(variance)}).`,
    details: { totalVar, budget: plan.variableBudget, variance },
  })
}
