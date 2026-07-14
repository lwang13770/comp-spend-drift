import { sum, result, CATEGORY } from '../util.js'
import { pct } from '../../lib/format.js'

// Cost per Dollar by Performance Tier — variable cost per revenue dollar, by attainment tier.
// Designed gradient: top (above accelerator) should cost more, bottom (below decelerator)
// should cost less. Fires if the decelerator isn't biting (bottom >= mid) or the ordering
// is inverted (top < bottom).
export function tierCost(plan, roster) {
  const costOf = (reps) => {
    const v = sum(reps.map((r) => r.variablePaid))
    const rev = sum(reps.map((r) => r.revenue))
    return rev ? v / rev : null
  }

  const top = costOf(roster.filter((r) => r.attainment > plan.accelerator.threshold))
  const bottom = costOf(roster.filter((r) => r.attainment < plan.decelerator.threshold))
  const mid = costOf(
    roster.filter(
      (r) =>
        r.attainment >= plan.decelerator.threshold &&
        r.attainment <= plan.accelerator.threshold,
    ),
  )

  // Only judge the gradient where the relevant tiers exist.
  const decelNotBiting = bottom != null && mid != null && bottom >= mid
  const inverted = top != null && bottom != null && top < bottom
  const status = decelNotBiting || inverted ? 'drifting' : 'clean'

  const fmt = (c) => (c == null ? '—' : pct(c))

  return result({
    id: 'tierCost',
    category: CATEGORY.HIT_NUMBER,
    label: 'Cost per Dollar by Performance Tier',
    status,
    designed: { value: 0, unit: 'gradient intact' },
    actual: { value: 0, unit: 'tiered' },
    delta: null,
    summary: `Top tier ${fmt(top)}, mid tier ${fmt(mid)}, bottom tier ${fmt(
      bottom,
    )}. ${
      status === 'clean'
        ? 'Bottom is cheapest — deceleration is working.'
        : 'Gradient is not behaving as designed.'
    }`,
    details: { top, mid, bottom },
  })
}
