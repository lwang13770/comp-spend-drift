// Harborline demo roster — 12 reps, deliberately seeded with four drifts.
// Default seed loaded into editable Setup-tab state; the user can change any cell.
//
// `variablePaid` is the actual variable comp paid (an input, like a payroll export).
// `revenue` is NOT stored here — it is derived (quota * attainment) in the engine.
//
// These values were calibrated so that running the genuine 10-check battery produces
// exactly 4 fired / 6 clean (pay mix, quota-to-OTE, coverage gap, revenue concentration
// fire). The expected results live in ../data/answerKey.js and are used ONLY by the eval
// layer to grade the engine — never imported by the engine or UI.

/** @typedef {import('../engine/types.js').Rep} Rep */

/** @type {Rep[]} */
export const demoRoster = [
  { name: 'R. Alvarez', quota: 810000, attainment: 0.38, variablePaid: 19000 },
  { name: 'D. Boyd', quota: 850000, attainment: 0.55, variablePaid: 27500 },
  { name: 'S. Ito', quota: 795000, attainment: 0.62, variablePaid: 31000 },
  { name: 'P. Nomura', quota: 830000, attainment: 0.71, variablePaid: 35500 },
  { name: 'K. Osei', quota: 760000, attainment: 0.79, variablePaid: 39500 },
  { name: 'J. Reyes', quota: 785000, attainment: 0.86, variablePaid: 86000 },
  { name: 'L. Novak', quota: 805000, attainment: 0.9, variablePaid: 90000 },
  { name: 'T. Bianchi', quota: 800000, attainment: 0.99, variablePaid: 99000 },
  { name: 'A. Fields', quota: 815000, attainment: 1.02, variablePaid: 102000 },
  { name: 'M. Cho', quota: 750000, attainment: 1.05, variablePaid: 105000 },
  { name: 'G. Haddad', quota: 780000, attainment: 1.37, variablePaid: 137000 },
  { name: 'M. Chen', quota: 820000, attainment: 3.12, variablePaid: 312000 },
]
