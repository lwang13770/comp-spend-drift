import { describe, it, expect } from 'vitest'
import { demoPlanSpec } from '../src/data/planSpec.js'
import { demoRoster } from '../src/data/roster.js'
import { runBattery } from '../src/engine/checks/index.js'
import {
  precisionRecall,
  batteryExecution,
  schemaComplete,
} from '../src/eval/detectionTests.js'
import { answerKey } from '../src/data/answerKey.js'

const results = runBattery(demoPlanSpec, demoRoster)

describe('detection engine — Harborline demo scenario', () => {
  it('detects every planted drift with no false positives (P/R = 100%)', () => {
    const pr = precisionRecall(results)
    expect(pr.precision).toBe(1)
    expect(pr.recall).toBe(1)
    expect(pr.fp).toBe(0)
    expect(pr.fn).toBe(0)
  })

  it('runs the full battery (10/10)', () => {
    const b = batteryExecution(results)
    expect(b.ran).toBe(10)
    expect(b.ran).toBe(b.expected)
  })

  it('returns complete output schema on every check', () => {
    expect(schemaComplete(results).ok).toBe(true)
  })

  it('matches the exact per-check status in the answer key', () => {
    const byId = Object.fromEntries(results.map((r) => [r.id, r]))
    for (const { id, expectedStatus } of answerKey) {
      expect(byId[id]?.status, `check ${id}`).toBe(expectedStatus)
    }
  })

  it('fires exactly the four expected checks', () => {
    const fired = results.filter((r) => r.detected).map((r) => r.id).sort()
    expect(fired).toEqual(
      ['coverageGap', 'payMix', 'quotaToOte', 'revenueConcentration'].sort(),
    )
  })
})

describe('determinism', () => {
  it('produces identical results on repeated runs', () => {
    const a = runBattery(demoPlanSpec, demoRoster)
    const b = runBattery(demoPlanSpec, demoRoster)
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })
})
