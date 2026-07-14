import { sum, result, CATEGORY } from '../util.js'
import { pct, pp } from '../../lib/format.js'

// Blended Cost per Revenue Dollar — total variable paid / total revenue generated.
// Aggregate cost-of-sale. Threshold: >2.5pp from designed = drifting, >5pp = off.
export function blendedCost(plan, roster) {
  const totalVar = sum(roster.map((r) => r.variablePaid))
  const totalRev = sum(roster.map((r) => r.revenue))
  const actual = totalRev ? totalVar / totalRev : 0
  const designed = plan.variableTarget / plan.designedQuota
  const diffPP = (actual - designed) * 100

  const abs = Math.abs(diffPP)
  const status = abs > 5 ? 'off' : abs > 2.5 ? 'drifting' : 'clean'

  return result({
    id: 'blendedCost',
    category: CATEGORY.EFFICIENCY,
    label: 'Blended Cost per Revenue Dollar',
    status,
    designed: { value: designed * 100, unit: '%' },
    actual: { value: actual * 100, unit: '%' },
    delta: { value: diffPP, unit: 'pp' },
    summary: `${pct(actual)} actual vs ${pct(designed)} designed (${
      diffPP >= 0 ? '+' : ''
    }${pp(diffPP)}).`,
    details: { totalVar, totalRev, actual, designed },
  })
}
