import { result, CATEGORY } from '../util.js'
import { pp } from '../../lib/format.js'

// Attainment Distribution Shape — is the distribution bimodal (a structural signal)?
// A gap > 30pp between adjacent reps is the bimodality heuristic, BUT only when it
// splits the roster into two groups that each hold >=20% of reps. A gap that isolates
// a single outlier (e.g. one 312% rep) is a tail, not a cluster boundary.
export function attainmentShape(plan, roster) {
  const att = roster.map((r) => r.attainment).sort((a, b) => a - b)
  const n = att.length
  const minSide = Math.ceil(0.2 * n)

  // Only consider split points that leave >=minSide reps on each side.
  let maxGap = 0
  let gapAt = null
  for (let i = minSide - 1; i <= n - 1 - minSide; i++) {
    const gap = att[i + 1] - att[i]
    if (gap > maxGap) {
      maxGap = gap
      gapAt = [att[i], att[i + 1]]
    }
  }

  const status = maxGap > 0.3 ? 'drifting' : 'clean'

  return result({
    id: 'attainmentShape',
    category: CATEGORY.HIT_NUMBER,
    label: 'Attainment Distribution Shape',
    status,
    designed: { value: 30, unit: 'pp (max gap)' },
    actual: { value: maxGap * 100, unit: 'pp' },
    delta: null,
    summary:
      status === 'drifting'
        ? `Bimodal: a ${pp(maxGap * 100, 0)} gap splits the roster into two clusters.`
        : `Distribution is not bimodal (largest qualifying gap ${pp(
            maxGap * 100,
            0,
          )}); the top rep is an outlier, not a cluster boundary.`,
    details: { maxQualifiedGap: maxGap, gapAt },
  })
}
