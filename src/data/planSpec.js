// Harborline plan spec — the design intent the detection engine compares against.
// This is the default seed loaded into editable Setup-tab state; a user overwrites
// it freely. It is NOT privileged — every check runs the same arithmetic on whatever
// values are present here.

/** @typedef {import('../engine/types.js').PlanSpec} PlanSpec */

/** @type {PlanSpec} */
export const demoPlanSpec = {
  baseSalary: 100000,
  variableTarget: 100000,
  ote: 200000,
  designedQuota: 1000000,
  revenueTarget: 10000000,
  variableBudget: 1200000,
  designedCoverage: 1.2,
  accelerator: { threshold: 1.2, multiplier: 1.5 },
  decelerator: { threshold: 0.8, multiplier: 0.5 },
}
