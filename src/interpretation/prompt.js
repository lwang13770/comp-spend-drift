// Builds the LLM request from plan intent + detected drifts.
//
// GROUNDING BOUNDARY: only structured drift summaries cross this line. The payload
// carries plan-level design values and per-check designed/actual/delta numbers — never
// the roster, never a rep name. Human-readable check summaries (which can name the top
// rep, e.g. in revenue concentration) are deliberately NOT forwarded; the model gets
// label + numbers only. `interpretationPayload` is the single place that constructs
// what the model sees, so data minimization is checkable in one spot.

/**
 * Reduce a fired DriftResult to the minimal, roster-free shape the model may see.
 */
export function toFinding(drift) {
  return {
    id: drift.id,
    label: drift.label,
    category: drift.category,
    status: drift.status,
    designed: drift.designed,
    actual: drift.actual,
    delta: drift.delta,
  }
}

/** The exact object handed to the model. Contains no roster fields. */
export function interpretationPayload(planSpec, firedDrifts) {
  return {
    planIntent: {
      baseSalary: planSpec.baseSalary,
      variableTarget: planSpec.variableTarget,
      ote: planSpec.ote,
      designedQuota: planSpec.designedQuota,
      revenueTarget: planSpec.revenueTarget,
      variableBudget: planSpec.variableBudget,
      designedCoverage: planSpec.designedCoverage,
      accelerator: planSpec.accelerator,
      decelerator: planSpec.decelerator,
    },
    findings: firedDrifts.map(toFinding),
  }
}

const SYSTEM = `You are CompDrift's interpretation layer for sales-compensation plan health checks.
A deterministic engine has already detected where a comp plan diverges from its stated design intent. Your job is to explain the business impact and recommend what to investigate — nothing else.

Hard rules (violating any of these fails automated release gates):
1. Only discuss drifts present in the input findings. Never invent a finding.
2. Every number you cite must appear in the input payload. Never generate a number.
3. Never judge the plan's design. You may say a metric "diverges from its stated intent"; you may NOT say the plan is bad, wrong, flawed, broken, or poorly designed.
4. Decelerators REDUCE the payout rate for underperformance (attainment below the threshold). They are NOT caps on top performers. Never describe a decelerator as capping or limiting high earners.

For each finding return: verdict (on-track/drifting/off, matching the input status), severity (1=minor, 2=moderate, 3=critical), a 1-2 sentence businessImpact, and a 1-2 sentence recommendation. Then an overall summary (2-3 sentences on plan health) and sharedRootCauses: a list of short strings naming any underlying cause that drives multiple findings (e.g. quota compression driving both the quota-to-OTE drift and the coverage gap). Rank severity by business consequence: structural "off" findings (coverage, cost efficiency) above "drifting" ones.`

/** Build the request body fields for the Messages API. */
export function buildPrompt(planSpec, firedDrifts) {
  const payload = interpretationPayload(planSpec, firedDrifts)
  const user = `Plan intent and detected drifts (JSON):\n\n${JSON.stringify(
    payload,
    null,
    2,
  )}\n\nInterpret every finding and produce the overall summary.`
  return { system: SYSTEM, user, payload }
}
