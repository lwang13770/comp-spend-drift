// Engineer-facing internals explainer: an at-a-glance pipeline diagram, then why the
// boundary between deterministic detection and probabilistic interpretation sits where
// it does.

function PipelineDiagram() {
  return (
    <div className="overflow-x-auto rounded-xl border border-edge bg-ink/40 p-3">
      <svg
        viewBox="0 0 600 378"
        width="100%"
        style={{ minWidth: 520 }}
        role="img"
        aria-label="CompDrift pipeline: data input to deterministic detection, across the grounding boundary to probabilistic interpretation, to the health-check surface."
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <marker id="arrow" markerWidth="9" markerHeight="9" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#8195b5" />
          </marker>
        </defs>

        {/* Box 1 — Data input */}
        <rect x="70" y="14" width="460" height="52" rx="10" fill="#111a2b" stroke="#1f2c44" />
        <text x="300" y="36" textAnchor="middle" fill="#e6ecf7" fontSize="13" fontWeight="600">
          Data input
        </text>
        <text x="300" y="54" textAnchor="middle" fill="#8195b5" fontSize="10.5">
          plan spec · sales roster · payout records
        </text>

        <line x1="300" y1="66" x2="300" y2="90" stroke="#8195b5" strokeWidth="1.5" markerEnd="url(#arrow)" />

        {/* Box 2 — Detection (deterministic) */}
        <rect x="70" y="92" width="460" height="66" rx="10" fill="#111a2b" stroke="#1f2c44" />
        <rect x="82" y="102" width="108" height="16" rx="8" fill="#1f2c44" />
        <text x="136" y="113.5" textAnchor="middle" fill="#8195b5" fontSize="8.5" fontWeight="600" letterSpacing="0.5">
          TRADITIONAL SW
        </text>
        <text x="300" y="135" textAnchor="middle" fill="#e6ecf7" fontSize="12.5" fontWeight="600">
          Detection engine — 10 deterministic checks
        </text>
        <text x="300" y="151" textAnchor="middle" fill="#8195b5" fontSize="10">
          pure arithmetic · designed vs realized · returns drift objects
        </text>

        {/* Grounding boundary */}
        <line x1="46" y1="177" x2="554" y2="177" stroke="#e6a13c" strokeWidth="1.5" strokeDasharray="6 4" />
        <rect x="128" y="169" width="344" height="16" fill="#0b1220" />
        <text x="300" y="181" textAnchor="middle" fill="#e6a13c" fontSize="9.5" fontWeight="600" letterSpacing="0.3">
          GROUNDING BOUNDARY · only structured drift summaries cross
        </text>

        <line x1="300" y1="158" x2="300" y2="206" stroke="#8195b5" strokeWidth="1.5" markerEnd="url(#arrow)" />

        {/* Box 3 — Interpretation (probabilistic) */}
        <rect x="70" y="206" width="460" height="80" rx="10" fill="#12203a" stroke="#5b8def" />
        <rect x="82" y="216" width="120" height="16" rx="8" fill="#1c2e52" />
        <text x="142" y="227.5" textAnchor="middle" fill="#5b8def" fontSize="8.5" fontWeight="600" letterSpacing="0.5">
          AI · PROBABILISTIC
        </text>
        <text x="300" y="249" textAnchor="middle" fill="#e6ecf7" fontSize="12.5" fontWeight="600">
          Interpretation engine — single LLM call
        </text>
        <text x="300" y="265" textAnchor="middle" fill="#8195b5" fontSize="10">
          severity ranking · business impact · recommendations
        </text>
        <text x="300" y="280" textAnchor="middle" fill="#5b8def" fontSize="9.5" fontWeight="600">
          never sees the raw roster
        </text>

        <line x1="300" y1="286" x2="300" y2="310" stroke="#8195b5" strokeWidth="1.5" markerEnd="url(#arrow)" />

        {/* Box 4 — Surface */}
        <rect x="70" y="312" width="460" height="52" rx="10" fill="#111a2b" stroke="#1f2c44" />
        <text x="300" y="334" textAnchor="middle" fill="#e6ecf7" fontSize="13" fontWeight="600">
          Health-check surface
        </text>
        <text x="300" y="352" textAnchor="middle" fill="#8195b5" fontSize="10.5">
          exec summary · check cards · eval gates
        </text>
      </svg>
    </div>
  )
}

export default function HowItWorksTab() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h2 className="text-lg font-semibold">How this works</h2>
        <p className="text-sm text-muted">
          Three layers, one boundary. Detection is deterministic arithmetic; interpretation
          is probabilistic. The grounding boundary between them makes hallucination
          structurally difficult, not just statistically unlikely.
        </p>
      </div>

      <PipelineDiagram />

      {/* Why the boundaries sit where they do */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold">Why the boundary sits where it does</h3>

        <div className="rounded-lg border border-edge bg-panel p-4">
          <div className="text-sm font-medium text-slate-100">Detection is deterministic</div>
          <p className="mt-1 text-sm leading-relaxed text-slate-300">
            Every check is a verifiable arithmetic comparison — "is the realized pay mix
            different from the designed mix?" Putting an LLM here would add latency, cost, and
            a hallucination failure mode without adding capability.
          </p>
        </div>

        <div className="rounded-lg border border-accent/25 bg-accent/5 p-4">
          <div className="text-sm font-medium text-slate-100">The grounding boundary</div>
          <p className="mt-1 text-sm leading-relaxed text-slate-300">
            The LLM receives only structured drift summaries (type, designed value, actual
            value, delta). It <span className="text-slate-100">cannot make rep-level claims</span> because it
            never sees rep-level data, and <span className="text-slate-100">cannot invent numbers</span> because
            the only numbers available are the ones detection computed. Data minimization is
            enforceable by assertion, not by prompting.
          </p>
        </div>

        <div className="rounded-lg border border-edge bg-panel p-4">
          <div className="text-sm font-medium text-slate-100">Interpretation is probabilistic</div>
          <p className="mt-1 text-sm leading-relaxed text-slate-300">
            The detection layer can tell you the quota-to-OTE ratio is 4.0x instead of 5.0x.
            It cannot tell you why that matters, how severe it is relative to other findings,
            or what to investigate first. That's a judgment call — the LLM's job.
          </p>
        </div>

        <div className="rounded-lg border border-edge bg-panel p-4">
          <div className="text-sm font-medium text-slate-100">The deterministic layer stands alone</div>
          <p className="mt-1 text-sm leading-relaxed text-slate-300">
            With no API key, detection results and eval metrics still render — the
            interpretation section simply doesn't appear. The published site works for anyone;
            the key (or the proxy) unlocks the full experience.
          </p>
        </div>
      </section>

      {/* Tested vs evaluated */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold">Tested vs evaluated</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-edge bg-panel p-4">
            <div className="text-sm font-medium text-slate-100">Detection is tested</div>
            <p className="mt-1 text-sm leading-relaxed text-slate-300">
              Deterministic arithmetic against a planted-drift answer key. Target: 100%
              precision / 100% recall. Anything below is a code bug — fix it in the code, not
              the prompt.
            </p>
          </div>
          <div className="rounded-lg border border-edge bg-panel p-4">
            <div className="text-sm font-medium text-slate-100">Interpretation is evaluated</div>
            <p className="mt-1 text-sm leading-relaxed text-slate-300">
              Probabilistic output with subtle, expensive failure modes. Hard gates
              (grounding, number fidelity, scope) run on every output; rubric-based modes are
              the production path. See the Eval tab.
            </p>
          </div>
        </div>
      </section>

      <p className="border-t border-edge pt-4 text-xs text-muted">
        Synthetic demo data (fictional "Harborline"), calibrated to published SaaS comp
        benchmarks. The synthetic data's job is a ground-truth answer key for testing
        detection — not a substitute for production validation on real plan data.
      </p>
    </div>
  )
}
