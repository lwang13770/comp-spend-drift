// Engineer-facing internals explainer: the three-layer pipeline and why the boundary
// between deterministic detection and probabilistic interpretation sits where it does.

function Layer({ tag, tagTone, title, children }) {
  return (
    <div className="rounded-xl border border-edge bg-panel p-4">
      <div className="mb-1 flex items-center gap-2">
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tagTone}`}>
          {tag}
        </span>
        <h4 className="text-sm font-semibold">{title}</h4>
      </div>
      <div className="text-sm leading-relaxed text-slate-300">{children}</div>
    </div>
  )
}

function Arrow({ label }) {
  return (
    <div className="flex flex-col items-center py-1 text-muted">
      <span className="text-lg leading-none">↓</span>
      {label && <span className="text-[10px] uppercase tracking-wide">{label}</span>}
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

      {/* Pipeline diagram */}
      <div>
        <Layer tag="input" tagTone="bg-edge text-muted" title="Data input">
          Plan spec + sales roster + payout records. Structured, editable in the Setup tab.
        </Layer>
        <Arrow />
        <Layer tag="traditional sw" tagTone="bg-edge text-slate-200" title="Detection engine — 10 deterministic checks">
          Pure arithmetic: designed value vs realized. Returns structured drift objects. No
          model involved — being wrong means the math is wrong, which is a testable bug.
        </Layer>
        <Arrow label="grounding boundary — only structured drift summaries cross" />
        <Layer tag="ai / probabilistic" tagTone="bg-accent/20 text-accent" title="Interpretation engine — single batched LLM call">
          Receives drift summaries + plan intent. <span className="text-slate-100">Never sees the raw roster.</span>{' '}
          Returns severity ranking, business impact, recommendations. Runs through a hosted
          key proxy (or your own key); absent a key, this layer simply doesn't render.
        </Layer>
        <Arrow />
        <Layer tag="surface" tagTone="bg-edge text-muted" title="Health-check surface">
          Executive summary (VP-level) + detailed check cards (ops-level). Visible seam:
          "detected by rules" / "explained by CompDrift". Eval gates run against every
          interpretation.
        </Layer>
      </div>

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
