import { mean, std, result, CATEGORY } from '../util.js'
import { moneyK, pct } from '../../lib/format.js'

// Quota Dispersion — coefficient of variation of assigned quotas.
// Wide variation means some reps carry a structurally different effective rate.
// Threshold: CV >15% = drifting, >25% = off.
export function quotaDispersion(plan, roster) {
  const quotas = roster.map((r) => r.quota)
  const avg = mean(quotas)
  const cv = avg ? std(quotas) / avg : 0

  const status = cv > 0.25 ? 'off' : cv > 0.15 ? 'drifting' : 'clean'

  return result({
    id: 'quotaDispersion',
    category: CATEGORY.EFFICIENCY,
    label: 'Quota Dispersion',
    status,
    designed: { value: 15, unit: '% (ceiling)' },
    actual: { value: cv * 100, unit: '% CV' },
    delta: null,
    summary: `Quotas range ${moneyK(Math.min(...quotas))}–${moneyK(
      Math.max(...quotas),
    )}, CV is ${pct(cv)}.`,
    details: { cv, min: Math.min(...quotas), max: Math.max(...quotas), avg },
  })
}
