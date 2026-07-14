// Detection-layer eval. Grades the engine's output against the frozen demo answer key.
// This is the ONLY place allowed to import the answer key.
//
// Reused by both the Vitest suite and the (later) Eval tab, so the same numbers the
// tests assert are the numbers shown in the UI.

import { runBattery } from '../engine/checks/index.js'
import { answerKey, expectedFired } from '../data/answerKey.js'

const REQUIRED_FIELDS = [
  'id',
  'category',
  'label',
  'detected',
  'status',
  'severity',
  'summary',
  'details',
]

/**
 * Precision/recall of fired checks vs the answer key.
 * @param {import('../engine/types.js').DriftResult[]} results
 */
export function precisionRecall(results) {
  const byId = Object.fromEntries(results.map((r) => [r.id, r]))
  let tp = 0
  let fp = 0
  let fn = 0
  for (const { id, expectedStatus } of answerKey) {
    const fired = byId[id]?.detected ?? false
    const shouldFire = expectedFired(expectedStatus)
    if (fired && shouldFire) tp++
    else if (fired && !shouldFire) fp++
    else if (!fired && shouldFire) fn++
  }
  return {
    tp,
    fp,
    fn,
    precision: tp + fp === 0 ? 1 : tp / (tp + fp),
    recall: tp + fn === 0 ? 1 : tp / (tp + fn),
  }
}

/** Every check ran and returned a result. */
export function batteryExecution(results) {
  return { ran: results.length, expected: answerKey.length }
}

/** Every result has the required output-schema fields. */
export function schemaComplete(results) {
  const missing = results
    .map((r) => ({
      id: r.id,
      missing: REQUIRED_FIELDS.filter((f) => !(f in r)),
    }))
    .filter((x) => x.missing.length)
  return { ok: missing.length === 0, missing }
}

/** Per-check comparison of actual status vs expected (for the Eval tab table). */
export function statusComparison(results) {
  const byId = Object.fromEntries(results.map((r) => [r.id, r]))
  return answerKey.map(({ id, expectedStatus }) => {
    const r = byId[id]
    return {
      id,
      label: r?.label ?? id,
      expected: expectedStatus,
      actual: r?.status ?? 'missing',
      match: r?.status === expectedStatus,
    }
  })
}

/** Run everything against the demo scenario. */
export function runDetectionEval(plan, roster) {
  const results = runBattery(plan, roster)
  return {
    results,
    pr: precisionRecall(results),
    battery: batteryExecution(results),
    schema: schemaComplete(results),
    comparison: statusComparison(results),
  }
}
