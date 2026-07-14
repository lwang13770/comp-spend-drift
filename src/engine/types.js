// Shared type definitions (JSDoc) for the detection engine.

/**
 * @typedef {Object} PlanSpec
 * @property {number} baseSalary
 * @property {number} variableTarget
 * @property {number} ote
 * @property {number} designedQuota
 * @property {number} revenueTarget
 * @property {number} variableBudget
 * @property {number} designedCoverage
 * @property {{ threshold: number, multiplier: number }} accelerator
 * @property {{ threshold: number, multiplier: number }} decelerator
 */

/**
 * @typedef {Object} Rep
 * @property {string} name
 * @property {number} quota
 * @property {number} attainment   decimal, e.g. 3.12 = 312%
 * @property {number} variablePaid actual variable comp paid
 */

/**
 * @typedef {Rep & { revenue: number }} DerivedRep
 */

/**
 * @typedef {'clean'|'drifting'|'off'} Status
 */

/**
 * @typedef {Object} Magnitude
 * @property {number} value
 * @property {string} unit
 */

/**
 * The single structured object each check returns. This is the ONLY shape that
 * crosses the grounding boundary to the interpretation layer.
 *
 * @typedef {Object} DriftResult
 * @property {string} id
 * @property {string} category   one of the three CFO questions
 * @property {string} label
 * @property {boolean} detected  true when status !== 'clean'
 * @property {Status} status
 * @property {number} severity   0 clean, 2 drifting, 3 off
 * @property {Magnitude|null} designed
 * @property {Magnitude|null} actual
 * @property {Magnitude|null} delta
 * @property {string} summary
 * @property {Object} details    the numbers behind the summary (for ops cards)
 */

export {}
