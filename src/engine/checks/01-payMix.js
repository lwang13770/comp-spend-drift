import { median, result, CATEGORY } from '../util.js'
import { pp } from '../../lib/format.js'

// Pay Mix Drift — is the typical rep's base/variable split what the plan designed?
// Uses the MEDIAN per-rep variable share (robust to the 312% outlier that would skew
// a dollar-weighted blend). Compares to the designed base share.
//
// Threshold: >2pp from designed = drifting, >7pp = off.
export function payMix(plan, roster) {
  const shares = roster.map(
    (r) => r.variablePaid / (plan.baseSalary + r.variablePaid),
  )
  const medianVariableShare = median(shares)
  const realizedBase = 1 - medianVariableShare
  const designedBase = plan.baseSalary / (plan.baseSalary + plan.variableTarget)
  const driftPP = Math.abs(realizedBase - designedBase) * 100

  const status = driftPP > 7 ? 'off' : driftPP > 2 ? 'drifting' : 'clean'

  return result({
    id: 'payMix',
    category: CATEGORY.PLANNED_SPEND,
    label: 'Pay Mix Drift',
    status,
    designed: { value: designedBase * 100, unit: '% base' },
    actual: { value: realizedBase * 100, unit: '% base' },
    delta: { value: driftPP, unit: 'pp' },
    summary: `Median rep's realized mix is ${(realizedBase * 100).toFixed(1)}/${(
      medianVariableShare * 100
    ).toFixed(1)} base-to-variable vs designed ${(designedBase * 100).toFixed(0)}/${(
      (1 - designedBase) *
      100
    ).toFixed(0)} (${pp(driftPP)}).`,
    details: {
      designedBaseShare: designedBase,
      realizedBaseShare: realizedBase,
      medianVariableShare,
    },
  })
}
