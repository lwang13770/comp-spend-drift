// Static descriptions of the eval framework, surfaced in the Eval tab. These document
// what is tested vs evaluated, the named (not-yet-gated) failure modes, the release gate,
// cost/latency budgets, and post-deployment signals — the engineer-facing view.

export const INTERPRETATION_GATES = [
  {
    id: 'grounding',
    label: 'Drift-type grounding',
    asserts: 'Every drift discussed in the interpretation exists in the detection output.',
    type: 'Hard (zero tolerance)',
  },
  {
    id: 'numberFidelity',
    label: 'Number fidelity',
    asserts: 'Every number in the interpretation traces to the input payload.',
    type: 'Enforced (surfaced as warning)',
  },
  {
    id: 'scope',
    label: 'Scope-violation scan',
    asserts: 'No plan-judgment language ("bad", "flawed", "broken", "poorly designed").',
    type: 'Hard (zero tolerance)',
  },
]

export const NAMED_FAILURE_MODES = [
  {
    title: 'Hallucinated drift',
    body: 'The model "discovers" a relationship the detection layer never surfaced ("this also implies a retention risk"). Partially caught by grounding; the subtle version needs LLM-as-judge scoring.',
  },
  {
    title: 'Severity misranking',
    body: 'The model ranks a minor pay-mix skew above a critical coverage gap, misleading the executive summary. Requires expert-calibrated severity rankings in the golden set.',
  },
  {
    title: 'Mechanic misexplanation',
    body: 'The model gets a comp mechanic wrong (e.g. "the decelerator caps top earners" when it reduces rates for underperformance). The most dangerous mode — it corrupts the reader’s understanding. Needs SME review.',
  },
  {
    title: 'Scope violation (subtle)',
    body: 'Stays within literal scope but implies judgment through framing ("this plan clearly cannot achieve its goals"). Requires LLM-as-judge with calibrated examples.',
  },
]

export const RELEASE_GATE = {
  hard: [
    { label: 'Hallucinated drifts', target: '0' },
    { label: 'Fabricated numbers', target: '0' },
    { label: 'Scope violations', target: '0' },
    { label: 'Detection precision / recall', target: '100%' },
  ],
  performance: [
    { label: 'Severity ranking matches expert ordering', target: '≥ 90%' },
    { label: 'Explanation accuracy (LLM-as-judge)', target: '≥ 4.0 / 5' },
    { label: 'Grounded answer rate', target: '≥ 95%' },
    { label: 'Regression vs last approved baseline', target: '≤ 2%' },
  ],
}

export const ECONOMICS = [
  { metric: 'LLM cost per health check', budget: '< $0.05', note: 'one call, ~1200 in / ~500 out' },
  { metric: 'Detection latency', budget: '< 50ms', note: 'pure arithmetic on < 100 reps' },
  { metric: 'Interpretation latency', budget: '< 3s', note: 'single API call' },
  { metric: 'End-to-end render', budget: '< 4s', note: 'detection immediate, interpretation streams in' },
]

export const POST_DEPLOY_SIGNALS = [
  ['User overrides a severity ranking', 'Disagreement with interpretation'],
  ['User dismisses a finding', 'False positive or irrelevant check'],
  ['User re-runs after modifying data', 'Confusion or data-entry error'],
  ['Time-to-action after viewing a drift', 'Engagement and urgency'],
  ['Repeat views of the same check card', 'Comprehension difficulty'],
  ['No action taken on a critical finding', 'Finding is unhelpful or unconvincing'],
]

export const REFERENCE_DATASET = {
  phase1: '10 checks × 1 plan scenario. 4 fire, 6 clean. The answer key is exhaustive for planted drifts; the golden set carries expected severity ordering and scope compliance.',
  phase2: 'Expand to multiple plan shapes (accelerator-only, decelerator-only, tiered, draw-against-commission). Target: 50+ structured cases covering all check types and common mechanics.',
}
