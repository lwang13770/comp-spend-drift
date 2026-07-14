// Small numeric helpers shared across checks. Pure functions, no rounding surprises.

export const sum = (xs) => xs.reduce((s, x) => s + x, 0)

export const mean = (xs) => (xs.length ? sum(xs) / xs.length : 0)

/** Population standard deviation. */
export const std = (xs) => {
  if (!xs.length) return 0
  const m = mean(xs)
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)))
}

/** Median of a numeric array (does not mutate the input). */
export const median = (xs) => {
  if (!xs.length) return 0
  const s = [...xs].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

/** Category keys map to the three CFO-level questions. */
export const CATEGORY = {
  PLANNED_SPEND: 'Are we spending what we planned?',
  EFFICIENCY: 'Are we spending efficiently?',
  HIT_NUMBER: 'Can we hit the number?',
}

/** Map a status to its detection-assigned severity. */
export const severityOf = (status) =>
  status === 'off' ? 3 : status === 'drifting' ? 2 : 0

/**
 * Build a DriftResult with the shared shape.
 * @param {Partial<import('./types.js').DriftResult> & { id: string, category: string, label: string, status: import('./types.js').Status }} r
 * @returns {import('./types.js').DriftResult}
 */
export const result = (r) => ({
  designed: null,
  actual: null,
  delta: null,
  details: {},
  summary: '',
  ...r,
  detected: r.status !== 'clean',
  severity: severityOf(r.status),
})
