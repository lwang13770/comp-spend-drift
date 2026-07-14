# CompDrift — Implementation Plan

Companion to `drift-check-system-design.md`. This plan pins down file structure,
exact check formulas, the payout model, the reconstructed demo roster, the LLM
prompt/JSON contract, and the eval harness — everything needed to start coding.

Status: **awaiting review before any code is written.**

---

## 1. Scope

Build **CompDrift** (the drift-check tool described in the design doc) exactly as
specified:

- Deterministic 10-check detection engine (pure arithmetic, no model).
- Grounding boundary — only structured drift summaries cross to the LLM.
- Claude (Sonnet 5) interpretation layer: severity ranking, business impact,
  recommendations, overall summary.
- Three reader surfaces: executive summary (VP), detailed cards (ops), eval tab
  (engineers), plus a "How This Works" view.
- Eval framework: detection tests (P/R vs answer key) + interpretation gates.
- Degraded mode: no API key → detection + eval still render, interpretation hidden.
- Static build, publishable to GitHub Pages.

No cash-flow forecasting surface — that framing was set aside; this is the
point-in-time health check from the doc.

---

## 2. Stack & project structure

- **React 18 + Vite + Tailwind.** Static export, `base: './'` so it works from a
  GitHub Pages subpath.
- **Vitest** for the detection/gate tests ("run on every build").
- **Direct browser Anthropic call** using `anthropic-dangerous-direct-browser-access: true`
  and a user-pasted key held in memory + optional localStorage. No backend.
- State: a single React context (`planSpec`, `roster`, `apiKey`, `model`,
  derived detection results, interpretation result). Detection recomputes
  synchronously on every data edit; interpretation runs on demand.

```
comp-spend-drift/
  index.html
  package.json  vite.config.js  tailwind.config.js  postcss.config.js
  .gitignore  README.md  IMPLEMENTATION_PLAN.md
  src/
    main.jsx  App.jsx
    styles/index.css
    state/AppContext.jsx           # global state + localStorage persistence
    data/
      planSpec.js                  # Harborline plan spec (design intent)
      roster.js                    # 12-rep synthetic roster
      answerKey.js                 # planted drifts + expected status/values
    engine/
      payout.js                    # payoutFactor + per-rep derived metrics
      types.js                     # JSDoc typedefs (DriftResult)
      checks/
        index.js                   # runBattery(planSpec, roster) -> DriftResult[]
        01-payMix.js               08-attainmentShape.js
        02-variableSpend.js        09-revenueConcentration.js
        03-earningsConcentration.js 10-tierCost.js
        04-quotaToOte.js
        05-blendedCost.js
        06-quotaDispersion.js
        07-coverageGap.js
    interpretation/
      prompt.js                    # buildPrompt(planIntent, drifts)
      client.js                    # callClaude(payload, apiKey, model)
      schema.js                    # validate/parse structured JSON reply
    eval/
      detectionTests.js            # P/R, schema, full-battery (also surfaced in UI)
      gates.js                     # grounding, number-fidelity, scope-scan
      goldenSet.js                 # expected severity ordering + scope compliance
    components/
      Tabs.jsx  SetupTab.jsx  HealthCheckTab.jsx
      ExecutiveSummary.jsx  CheckCard.jsx  ComparisonBar.jsx
      SourceTag.jsx  EvalTab.jsx  HowItWorksTab.jsx
    lib/format.js                  # currency / percent / ratio formatters
  tests/
    checks.test.js  gates.test.js
```

---

## 3. Data model

### Plan spec (design intent)
```js
{
  baseSalary: 100000, variableTarget: 100000, ote: 200000,
  designedQuota: 1000000, revenueTarget: 10000000, variableBudget: 1200000,
  designedCoverage: 1.2,
  accelerator: { threshold: 1.2, multiplier: 1.5 },
  decelerator: { threshold: 0.8, multiplier: 0.5 },
}
```

### Roster (per rep)
```js
{ name: "M. Chen", quota: 820000, attainment: 3.12, variablePaid: 312000 }
```
`revenue = quota * attainment` is **derived, never stored** (per the doc).

---

## 4. Payout model (for demo data + Check 1)

The realized demo payouts are **linear above the decelerator threshold** — the
accelerator is defined in the spec but does not bite in the demo data. This is
what makes the doc's numbers reconcile (Chen's $312K = $100K × 3.12, i.e. no
acceleration) and is exactly why Check 10 comes back clean ("linear rates between
thresholds").

```
payoutFactor(a) = a * (a < decel.threshold ? decel.multiplier : 1)
variablePaid    = variableTarget * payoutFactor(a)
```

> **Design decision to confirm (D1):** the accelerator is carried in the spec but
> is inert in the demo realized data. That's faithful to the doc, but it means the
> demo never exercises the accel branch. Alternative: apply the accelerator and
> re-derive Chen's payout (~$408K) — but then several doc figures (total spend,
> concentration, tier costs) no longer match. **Recommend: keep linear as written.**

---

## 5. The 10 checks — exact formulas, thresholds, status

Status ladder is always `on-track` / `drifting` / `off`. All figures below are the
targets each check must reproduce against the reconstructed roster (§6).

**Cat 1 — Are we spending what we planned?**

1. **Pay Mix Drift.** Per-rep variable share = `variablePaid/(baseSalary+variablePaid)`;
   take the **median share** across reps. Compare its base complement to designed
   `baseSalary/(baseSalary+variableTarget)` = 50%.
   `>2pp` drifting, `>7pp` off. → **drifting**, 53.2/46.8 vs 50/50 (3.2pp).
   *(Median-of-shares reproduces 46.8% exactly, and needs no payout model.)*

2. **Total Variable Spend vs Budget.** `Σ variablePaid` vs `variableBudget`.
   `>15%` drifting, `>25%` off. → **clean**, $1,083K vs $1,200K (−9.7%).

3. **Earnings Concentration.** Top 20% of earners (12 reps → top 2) share of
   `Σ variablePaid`. `>50%` drifting, `>65%` off. → **clean**, top 2 = 41.5%.

**Cat 2 — Are we spending efficiently?**

4. **Quota-to-OTE Ratio.** `mean(quota)/ote` vs `designedQuota/ote` (5.0).
   `>0.3x` drifting, `>0.8x` off. → **off**, 4.0x vs 5.0x (Δ1.0x).

5. **Blended Cost per Revenue Dollar.** `Σ variablePaid / Σ revenue` vs
   `variableTarget/designedQuota` (10%). `>2.5pp` drifting, `>5pp` off.
   → **clean**, 11.0% vs 10.0% (1.0pp).

6. **Quota Dispersion.** `CV = std(quota)/mean(quota)`. `>15%` drifting, `>25%` off.
   → **clean**, CV 3.8% (quotas $750K–$850K).

**Cat 3 — Can we hit the number?**

7. **Quota Coverage Gap.** `Σ quota / revenueTarget` vs `designedCoverage` (1.2).
   `>0.1x` below designed = drifting; `<1.0x` = off. → **off**, 0.96x vs 1.2x.

8. **Attainment Distribution Shape.** Sort attainments; find the largest adjacent
   gap that splits the roster into two groups **each ≥20% of reps**; if that gap
   `>30pp` → drifting (bimodal). A gap that isolates a **single** top rep (Chen) is
   an outlier, not a cluster boundary → ignored. → **clean**.
   > **Design decision to confirm (D2):** the doc's stated heuristic ("gap >30pp")
   > alone would flag the 138%→312% gap, yet the demo result is clean. The "both
   > sides ≥20% of reps" refinement is my reconciliation. **Recommend adopting it.**

9. **Revenue Concentration.** `maxRepRevenue / Σ revenue`. `>20%` drifting, `>30%` off.
   → **drifting**, Chen $2.56M / $9.85M = 26%.

10. **Cost per Dollar by Performance Tier.** Partition by attainment: top `>accel.threshold`,
    mid between thresholds, bottom `<decel.threshold`. Tier cost = `Σ variablePaid / Σ revenue`
    within tier. Fires if bottom ≥ mid (decelerator not working) or top < bottom
    (ordering inverted). → **clean**, top 12.4% / mid 12.4% / bottom 6.3%.
    > **Design decision to confirm (D3):** top≈mid (both linear) is treated as
    > consistent-with-design, not a drift. Only inversion or a non-biting
    > decelerator fires this check.

---

## 6. Harborline demo data + answer key (as code, no markdown)

No markdown reference files. Everything lives as code, with a clean admin-vs-user boundary:

| Artifact | Lives in | Owner | User-editable? |
|---|---|---|---|
| Plan spec + roster seed | `src/data/planSpec.js`, `src/data/roster.js` | User | **Yes** — loaded into editable Setup-tab state; edits recompute checks live |
| Answer key | `src/data/answerKey.js` | Dev | No — imported **only** by `src/eval/` |

The seed is the default the app boots with; a user overwrites it freely in the Setup tab.
The answer key grades the engine against the **frozen** demo scenario only — arbitrary
user input has no answer key (detection is trusted arithmetic; the interpretation gates,
§9, are what run live on any input).

The roster was calibrated (verified via the check formulas in §5, not hand-fitted). Computed
aggregates: Σ variablePaid **$1,084K** · mean quota **$800K** · Σ quota **$9.6M** · Σ revenue
**$9.90M** · Chen revenue **25.9%** · median share **46.8%** · top-2 earners **41.4%** · quota
CV **3.4%** · coverage **0.96x**. Result: **4 fire** (pay mix, quota-to-OTE, coverage gap,
revenue concentration), **6 clean** — matching the doc's scenario. Final per-rep values are
committed straight into `src/data/roster.js` in Phase 1.

Guardrail test: `src/engine/**` and `src/components/**` must not import `src/data/answerKey.js`.

---

## 7. Detection output schema

Each check returns:
```js
{
  id: "quotaToOte", category: "efficiency", label: "Quota-to-OTE Ratio",
  detected: true, status: "off", severity: 3,            // 0 clean, 1..3 fired
  designed: { value: 5.0, unit: "x" },
  actual:   { value: 4.0, unit: "x" },
  delta:    { value: 1.0, unit: "x" },
  summary: "Average assigned quota $800K vs designed $1M; ratio 4.0x vs 5.0x.",
  details: { /* the numbers behind the summary, for the ops card */ }
}
```
This object is the **only** thing that crosses the grounding boundary.

---

## 8. Interpretation layer (Claude Sonnet 5)

**Input to the model:** plan intent (design goals) + the array of fired drift
summaries above. **Never** the roster.

**Returned JSON (validated by `schema.js`):**
```js
{
  drifts: [ { id, verdict: "off", severity: 1..3,
              businessImpact: "…", recommendation: "…" } ],
  overall: { summary: "…", sharedRootCauses: ["…"] }
}
```

**Hard constraints (prompt-enforced, gate-verified):**
1. Only discuss drifts present in the input.
2. Every number cited must appear in the input payload.
3. No plan-design judgment ("bad/wrong/flawed/broken/poorly designed").
4. Decelerators reduce rates for **underperformance** — never framed as caps on
   top performers.

`client.js` posts to `api.anthropic.com/v1/messages` with the direct-browser
header; on missing key or error it returns `null` and the UI hides interpretation.

Budget check from the doc: ~1200 in / ~500 out tokens, one call, `<$0.05`, `<3s`.

---

## 9. Eval framework

**Detection tests (Vitest, no API):**
| Test | Target |
|---|---|
| P/R vs answer key | 100% / 100% |
| Full battery executes | 10/10 return a result |
| Output schema complete | 100% of required fields present |

**Interpretation gates (string-level, no extra API call), run on every LLM output:**
| Gate | Type |
|---|---|
| Drift-type grounding (every id exists in detection output) | hard |
| Number fidelity (every number traces to the payload) | hard |
| Scope-violation scan (no plan-judgment language) | hard |

Golden set carries expected severity ordering (off before drifting) and scope
compliance for the one Phase-1 scenario. Named-but-not-gated failure modes
(hallucinated relationships, severity misranking, mechanic misexplanation, subtle
scope violation) are documented in the eval tab as the production path, per the doc.

---

## 10. UI surfaces

- **Setup tab:** editable plan spec + roster (structured forms), API-key field,
  model selector (default Sonnet 5), "load demo data" / "reset" actions.
- **Health Check tab:** executive summary first (X/10 passing, ≤4 severity-ranked
  critical findings, shared root causes from the LLM, confidence note), then cards
  grouped by CFO question. Cards show status badge, one-line summary, designed-vs-
  actual `ComparisonBar` tagged *detected by rules*, and impact/recommendation
  tagged *explained by CompDrift* when interpretation is present.
- **Eval tab:** live gate pass/fail, detection-vs-answer-key table, full battery
  view, framework notes.
- **How This Works tab:** the three-layer diagram, the grounding boundary, the
  deterministic/probabilistic split.

---

## 11. Phase milestones

1. **Detection + data input** — scaffold, data model, 10 checks, Setup forms,
   card rendering, Vitest P/R=100%. *No API.* ← ship gate: answer key passes.
2. **Exec summary + interpretation** — Claude call, fallback, source tags, gates.
3. **Eval tab** — live gates, answer-key table, battery view.
4. **How This Works + polish** — diagram, comparison bars, confidence note, QA.

---

## 12. Resolved decisions

**Core principle: no hard-coded results.** Every check is pure arithmetic on the
input roster. The demo scenario's 4-fire/6-clean outcome is *emergent* from running
real logic on that data — never baked in. Editing the roster recomputes everything.
A clean result is a genuine "no drift on this metric"; a fired result is a genuine
divergence. The **answer key exists only in `eval/` as grading labels** for the demo
input; `engine/` and `components/` never import it. Enforced by a test asserting the
detection path has no dependency on `data/answerKey.js`.

- **D1 — resolved: linear demo payouts.** The seeded input has an inert accelerator,
  so Check 10 legitimately computes clean. The check is real logic; on data where the
  accelerator bites and inverts the gradient, it would fire.
- **D2 — resolved: adopt the "both sides ≥20% of reps" rule** for Check 8. Genuine
  bimodality detection; a lone outlier (Chen) correctly computes as not-bimodal.
- **D3 — resolved: Check 10** treats a correctly-ordered gradient (bottom cheapest,
  top ≥ mid) as clean; fires on inversion or a non-biting decelerator.
- **Branding — resolved: product is "CompDrift"** ("Atlas" removed); demo company
  stays "Harborline" (fictional). Seam tag: "detected by rules" / "explained by CompDrift".

## 13. Demo data is user input, not canon

The 12-rep roster is treated as **an example a user could paste into the Setup tab**,
seeded with 4 drifts. It is input + (in eval only) grading labels — fully separate from
the detection code. Swapping in different data needs a different answer key but no
engine changes.
