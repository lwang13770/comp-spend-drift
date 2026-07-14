// Display formatters. Kept UI-agnostic so checks can build summary strings too.

export const money = (n) =>
  '$' + Math.round(n).toLocaleString('en-US')

/** Compact thousands, e.g. $1,084K. */
export const moneyK = (n) =>
  '$' + Math.round(n / 1000).toLocaleString('en-US') + 'K'

/** x as a percent string; x is a fraction (0.259 -> "25.9%"). */
export const pct = (x, digits = 1) => (x * 100).toFixed(digits) + '%'

/** Attainment / ratio, e.g. 0.96 -> "0.96x", 4 -> "4.0x". */
export const ratio = (x, digits = 1) => x.toFixed(digits) + 'x'

export const pp = (x, digits = 1) => x.toFixed(digits) + 'pp'
