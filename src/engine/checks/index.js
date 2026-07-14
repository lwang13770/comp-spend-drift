// The full 10-check battery. Runs deterministic arithmetic on a plan spec + roster and
// returns structured DriftResult objects. No model, no answer key — pure computation.

import { deriveRoster } from '../payout.js'
import { payMix } from './01-payMix.js'
import { variableSpend } from './02-variableSpend.js'
import { earningsConcentration } from './03-earningsConcentration.js'
import { quotaToOte } from './04-quotaToOte.js'
import { blendedCost } from './05-blendedCost.js'
import { quotaDispersion } from './06-quotaDispersion.js'
import { coverageGap } from './07-coverageGap.js'
import { attainmentShape } from './08-attainmentShape.js'
import { revenueConcentration } from './09-revenueConcentration.js'
import { tierCost } from './10-tierCost.js'

// Order defines display order and the canonical battery.
export const CHECKS = [
  payMix,
  variableSpend,
  earningsConcentration,
  quotaToOte,
  blendedCost,
  quotaDispersion,
  coverageGap,
  attainmentShape,
  revenueConcentration,
  tierCost,
]

/**
 * Run the full battery.
 * @param {import('../types.js').PlanSpec} plan
 * @param {import('../types.js').Rep[]} roster
 * @returns {import('../types.js').DriftResult[]}
 */
export function runBattery(plan, roster) {
  const derived = deriveRoster(roster)
  return CHECKS.map((check) => check(plan, derived))
}
