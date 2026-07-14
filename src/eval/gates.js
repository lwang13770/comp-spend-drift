// Interpretation gates — cheap, deterministic checks that run on every LLM output.
// They validate the model stayed grounded, cited only real numbers, and respected scope.
//
// Grounding and scope are HARD gates: a failure blocks the interpretation from rendering.
// Number-fidelity is enforced and surfaced, but treated as a warning rather than a block —
// string-level number matching is inherently fuzzy (e.g. "26%" for a 25.9% input), and a
// false positive shouldn't suppress an otherwise-sound interpretation.

const BANNED = [
  'bad plan',
  'poorly designed',
  'poorly-designed',
  'badly designed',
  'flawed',
  'broken',
  'terrible',
  'awful',
  'a bad ',
  'is wrong',
  'is bad',
]

// Plan/threshold constants that legitimately appear in interpretation prose even though
// they aren't in the per-finding numbers (check thresholds, percentage bases).
const THRESHOLD_WHITELIST = new Set([
  0, 1, 2, 3, 4, 5, 7, 10, 15, 20, 25, 30, 50, 65, 80, 100, 120,
  0.1, 0.3, 0.8, 1.0, 1.2, 2.5,
])

const numbersIn = (s) =>
  (String(s).match(/\d+(?:\.\d+)?/g) || []).map((n) => parseFloat(n))

/** Collect every numeric value present anywhere in the payload the model was given. */
function allowedNumbers(payload) {
  const set = new Set(THRESHOLD_WHITELIST)
  const walk = (v) => {
    if (v == null) return
    if (typeof v === 'number') {
      set.add(v)
      set.add(Math.round(v))
      set.add(parseFloat(v.toFixed(1)))
    } else if (typeof v === 'string') {
      numbersIn(v).forEach((n) => set.add(n))
    } else if (Array.isArray(v)) {
      v.forEach(walk)
    } else if (typeof v === 'object') {
      Object.values(v).forEach(walk)
    }
  }
  walk(payload)
  return set
}

const interpretationText = (interp) => {
  const parts = [interp.overall?.summary, ...(interp.overall?.sharedRootCauses || [])]
  for (const d of interp.drifts || []) parts.push(d.businessImpact, d.recommendation)
  return parts.filter(Boolean).join(' \n ')
}

/** Every drift id in the interpretation must exist in the detection output. */
function driftGrounding(interp, detectedIds) {
  const known = new Set(detectedIds)
  const offenders = (interp.drifts || []).map((d) => d.id).filter((id) => !known.has(id))
  return { pass: offenders.length === 0, offenders, blocking: true }
}

/** Every number in the interpretation text must trace to the input payload. */
function numberFidelity(interp, payload) {
  const allowed = allowedNumbers(payload)
  const matches = (n) =>
    allowed.has(n) || allowed.has(Math.round(n)) || allowed.has(parseFloat(n.toFixed(1)))
  const offenders = [...new Set(numbersIn(interpretationText(interp)).filter((n) => !matches(n)))]
  return { pass: offenders.length === 0, offenders, blocking: false }
}

/** No plan-judgment language. */
function scopeScan(interp) {
  const text = interpretationText(interp).toLowerCase()
  const offenders = BANNED.filter((w) => text.includes(w))
  return { pass: offenders.length === 0, offenders, blocking: true }
}

/**
 * Run all gates over one interpretation.
 * @returns { grounding, numberFidelity, scope, blocked } — `blocked` is true if any
 *          hard gate failed (interpretation should be withheld).
 */
export function runGates(interp, payload, detectedIds) {
  const grounding = driftGrounding(interp, detectedIds)
  const nums = numberFidelity(interp, payload)
  const scope = scopeScan(interp)
  const blocked = (grounding.blocking && !grounding.pass) || (scope.blocking && !scope.pass)
  return { grounding, numberFidelity: nums, scope, blocked }
}
