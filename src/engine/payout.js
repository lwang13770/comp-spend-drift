// Payout model + roster derivation.
//
// The payout model is what GENERATED the demo `variablePaid` values and documents the
// plan's intended mechanics. Note: no check calls payoutFactor at runtime — the checks
// operate on the stored `variablePaid` (an actual) and derived `revenue`. The model is
// kept here for reference and for regenerating seed data.
//
// Realized demo payouts are linear above the decelerator threshold (the accelerator is
// inert on the demo data), which is exactly why the tier-cost check reads clean.

/**
 * Payout as a multiple of variableTarget for a given attainment.
 * Below the decelerator threshold the rate is halved; above it, linear.
 * @param {number} attainment
 * @param {import('./types.js').PlanSpec} plan
 */
export const payoutFactor = (attainment, plan) =>
  attainment * (attainment < plan.decelerator.threshold ? plan.decelerator.multiplier : 1)

/**
 * Add derived `revenue` (quota * attainment) to each rep. Revenue is never stored.
 * @param {import('./types.js').Rep[]} roster
 * @returns {import('./types.js').DerivedRep[]}
 */
export const deriveRoster = (roster) =>
  roster.map((r) => ({ ...r, revenue: r.quota * r.attainment }))
