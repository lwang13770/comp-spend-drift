import { describe, it, expect } from 'vitest'
import { runGates } from '../src/eval/gates.js'
import { interpretationPayload } from '../src/interpretation/prompt.js'
import { demoPlanSpec } from '../src/data/planSpec.js'
import { demoRoster } from '../src/data/roster.js'
import { runBattery } from '../src/engine/checks/index.js'

const results = runBattery(demoPlanSpec, demoRoster)
const fired = results.filter((r) => r.detected)
const detectedIds = results.map((r) => r.id)
const payload = interpretationPayload(demoPlanSpec, fired)

const clean = {
  drifts: fired.map((d) => ({
    id: d.id,
    verdict: d.status,
    severity: d.status === 'off' ? 3 : 2,
    businessImpact: 'Coverage is 0.96x versus a designed 1.20x, so the team cannot reach the target.',
    recommendation: 'Raise assigned quota toward $1,000K per rep to restore coverage.',
  })),
  overall: {
    summary: 'Two structural findings (quota-to-OTE and coverage) diverge from stated intent.',
    sharedRootCauses: ['Quota compression drives both the quota-to-OTE drift and the coverage gap.'],
  },
}

describe('interpretation gates', () => {
  it('passes a grounded, in-scope, number-faithful interpretation', () => {
    const g = runGates(clean, payload, detectedIds)
    expect(g.grounding.pass).toBe(true)
    expect(g.scope.pass).toBe(true)
    expect(g.numberFidelity.pass).toBe(true)
    expect(g.blocked).toBe(false)
  })

  it('blocks on a hallucinated drift id (grounding)', () => {
    const bad = { ...clean, drifts: [...clean.drifts, { id: 'retentionRisk', verdict: 'off', severity: 3, businessImpact: 'x', recommendation: 'y' }] }
    const g = runGates(bad, payload, detectedIds)
    expect(g.grounding.pass).toBe(false)
    expect(g.grounding.offenders).toContain('retentionRisk')
    expect(g.blocked).toBe(true)
  })

  it('blocks on plan-judgment language (scope)', () => {
    const bad = { ...clean, overall: { ...clean.overall, summary: 'This is a poorly designed plan.' } }
    const g = runGates(bad, payload, detectedIds)
    expect(g.scope.pass).toBe(false)
    expect(g.blocked).toBe(true)
  })

  it('flags a fabricated number (non-blocking warning)', () => {
    const bad = {
      ...clean,
      overall: { ...clean.overall, summary: 'Attrition is running at 73.4% this quarter.' },
    }
    const g = runGates(bad, payload, detectedIds)
    expect(g.numberFidelity.pass).toBe(false)
    expect(g.numberFidelity.offenders).toContain(73.4)
    expect(g.blocked).toBe(false) // number fidelity is a warning, not a block
  })
})
