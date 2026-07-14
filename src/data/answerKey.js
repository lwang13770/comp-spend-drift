// Answer key for the Harborline demo scenario.
//
// IMPORTANT: This is DEV/EVAL-ONLY test infrastructure. It must be imported ONLY by
// src/eval/**. The detection engine (src/engine/**) and UI (src/components/**) must
// never import it — a guardrail test enforces that boundary. The engine computes
// results; it does not look up answers.
//
// Each entry is the *expected* determination of running the genuine check arithmetic
// on demoRoster + demoPlanSpec. It is derived truth (verified by calibration), not a
// hard-coded outcome. Change the roster and this key would need to change too.

/** @typedef {'clean'|'drifting'|'off'} Status */

/** @type {{ id: string, expectedStatus: Status }[]} */
export const answerKey = [
  { id: 'payMix', expectedStatus: 'drifting' },
  { id: 'variableSpend', expectedStatus: 'clean' },
  { id: 'earningsConcentration', expectedStatus: 'clean' },
  { id: 'quotaToOte', expectedStatus: 'off' },
  { id: 'blendedCost', expectedStatus: 'clean' },
  { id: 'quotaDispersion', expectedStatus: 'clean' },
  { id: 'coverageGap', expectedStatus: 'off' },
  { id: 'attainmentShape', expectedStatus: 'clean' },
  { id: 'revenueConcentration', expectedStatus: 'drifting' },
  { id: 'tierCost', expectedStatus: 'clean' },
]

/** A check "fires" when its status is anything other than clean. */
export const expectedFired = (status) => status !== 'clean'
