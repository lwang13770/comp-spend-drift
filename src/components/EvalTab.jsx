import { useMemo } from 'react'
import { demoPlanSpec } from '../data/planSpec.js'
import { demoRoster } from '../data/roster.js'
import { runDetectionEval } from '../eval/detectionTests.js'
import { useApp } from '../state/AppContext.jsx'
import {
  INTERPRETATION_GATES,
  NAMED_FAILURE_MODES,
  RELEASE_GATE,
  POST_DEPLOY_SIGNALS,
  REFERENCE_DATASET,
} from '../eval/framework.js'

// The eval always grades the detection engine against the FROZEN demo scenario — the
// answer key only labels that scenario. Interpretation gates run live on whatever the
// LLM most recently produced.

const STATUS_TONE = { off: 'text-off', drifting: 'text-drift', clean: 'text-ontrack' }

function Section({ title, subtitle, children }) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}

function GateRow({ label, pass, detail, warn }) {
  const tone = pass
    ? 'border-ontrack/30 bg-ontrack/15 text-ontrack'
    : warn
      ? 'border-drift/30 bg-drift/15 text-drift'
      : 'border-off/30 bg-off/15 text-off'
  return (
    <div className="flex items-center justify-between rounded-md border border-edge bg-panel px-4 py-3">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {detail && <div className="text-xs text-muted">{detail}</div>}
      </div>
      <span className={`rounded border px-2 py-0.5 text-xs font-semibold ${tone}`}>
        {pass ? 'PASS' : warn ? 'WARN' : 'FAIL'}
      </span>
    </div>
  )
}

function InterpretationGatesLive() {
  const { interpretation } = useApp()
  const done = interpretation.status === 'done' && interpretation.gates
  const g = done ? interpretation.gates : null

  return (
    <div className="space-y-2">
      {!done && (
        <p className="rounded-md border border-edge bg-panel/60 px-4 py-3 text-sm text-muted">
          Run <span className="text-slate-200">Explain with CompDrift</span> on the Health
          Check tab to grade a live interpretation. Definitions below; these run on every
          LLM output.
        </p>
      )}
      {INTERPRETATION_GATES.map((gate) => {
        const res = g?.[gate.id]
        const warn = gate.id === 'numberFidelity'
        return (
          <GateRow
            key={gate.id}
            label={`${gate.label} — ${gate.type}`}
            detail={
              res
                ? res.pass
                  ? gate.asserts
                  : `${gate.asserts} Offenders: ${(res.offenders || []).join(', ') || '—'}`
                : gate.asserts
            }
            pass={done ? res?.pass : true}
            warn={done && warn && !res?.pass}
          />
        )
      })}
      {done && g.blocked && (
        <p className="text-xs text-off">
          A hard gate failed — the interpretation is withheld from the Health Check surface.
        </p>
      )}
    </div>
  )
}

function Table({ head, rows }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-edge">
      <table className="w-full text-sm">
        <thead className="bg-panel text-left text-xs uppercase tracking-wide text-muted">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-3 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-edge">{rows}</tbody>
      </table>
    </div>
  )
}

export default function EvalTab() {
  const { results, pr, battery, schema, comparison } = useMemo(
    () => runDetectionEval(demoPlanSpec, demoRoster),
    [],
  )
  void results

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <h2 className="text-lg font-semibold">Eval framework</h2>
        <p className="text-sm text-muted">
          The detection layer is <span className="text-slate-200">tested</span> (deterministic
          arithmetic, target 100%). The interpretation layer is{' '}
          <span className="text-slate-200">evaluated</span> (probabilistic; that's where the
          eval budget goes).
        </p>
      </div>

      {/* Detection — automated tests */}
      <Section
        title="Detection layer — automated tests"
        subtitle="Run against the frozen Harborline answer key on every build. Cost ≈ 0."
      >
        <div className="space-y-2">
          <GateRow
            label="Precision / Recall vs answer key"
            detail={`${(pr.precision * 100).toFixed(0)}% / ${(pr.recall * 100).toFixed(
              0,
            )}%  ·  TP ${pr.tp} · FP ${pr.fp} · FN ${pr.fn}`}
            pass={pr.precision === 1 && pr.recall === 1}
          />
          <GateRow
            label="Full battery execution"
            detail={`${battery.ran} / ${battery.expected} checks returned a result`}
            pass={battery.ran === battery.expected}
          />
          <GateRow
            label="Output schema complete"
            detail={
              schema.ok
                ? 'every result has all required fields'
                : `missing on: ${schema.missing.map((m) => m.id).join(', ')}`
            }
            pass={schema.ok}
          />
        </div>
        <Table
          head={['Check', 'Expected', 'Actual', 'Match']}
          rows={comparison.map((c) => (
            <tr key={c.id} className="bg-ink/40">
              <td className="px-3 py-2">{c.label}</td>
              <td className={`px-3 py-2 font-medium ${STATUS_TONE[c.expected] ?? ''}`}>
                {c.expected}
              </td>
              <td className={`px-3 py-2 font-medium ${STATUS_TONE[c.actual] ?? ''}`}>
                {c.actual}
              </td>
              <td className="px-3 py-2">
                {c.match ? <span className="text-ontrack">✓</span> : <span className="text-off">✕</span>}
              </td>
            </tr>
          ))}
        />
      </Section>

      {/* Interpretation — live gates */}
      <Section
        title="Interpretation layer — automated gates"
        subtitle="String-level, no extra API call. Grounding and scope are hard gates (a failure withholds the interpretation)."
      >
        <InterpretationGatesLive />
      </Section>

      {/* Named failure modes */}
      <Section
        title="Named failure modes (not yet gated)"
        subtitle="Rubric-based, not simple assertions — the most dangerous modes, because the output is confidently wrong."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {NAMED_FAILURE_MODES.map((m) => (
            <div key={m.title} className="rounded-lg border border-edge bg-panel p-3">
              <div className="text-sm font-medium text-slate-100">{m.title}</div>
              <p className="mt-1 text-xs leading-relaxed text-muted">{m.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Reference dataset */}
      <Section title="Reference dataset">
        <div className="space-y-2 text-sm text-slate-300">
          <p>
            <span className="font-medium text-slate-100">Phase 1 (this prototype).</span>{' '}
            {REFERENCE_DATASET.phase1}
          </p>
          <p>
            <span className="font-medium text-slate-100">Phase 2 (production path).</span>{' '}
            {REFERENCE_DATASET.phase2}
          </p>
        </div>
      </Section>

      {/* Release gate */}
      <Section title="Release gate" subtitle="Formal ship / no-ship gate before any prompt or model change deploys.">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-off">
              Hard gates (zero tolerance)
            </div>
            <div className="space-y-1">
              {RELEASE_GATE.hard.map((r) => (
                <div key={r.label} className="flex justify-between rounded border border-edge bg-panel px-3 py-1.5 text-sm">
                  <span className="text-slate-300">{r.label}</span>
                  <span className="tnum font-medium">{r.target}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-drift">
              Performance gates
            </div>
            <div className="space-y-1">
              {RELEASE_GATE.performance.map((r) => (
                <div key={r.label} className="flex justify-between rounded border border-edge bg-panel px-3 py-1.5 text-sm">
                  <span className="text-slate-300">{r.label}</span>
                  <span className="tnum font-medium">{r.target}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Post-deployment signals */}
      <Section title="Post-deployment signals" subtitle="What to monitor on real traffic; each feeds back into the reference dataset.">
        <Table
          head={['Signal', 'What it indicates']}
          rows={POST_DEPLOY_SIGNALS.map(([sig, meaning]) => (
            <tr key={sig} className="bg-ink/40">
              <td className="px-3 py-2 text-slate-200">{sig}</td>
              <td className="px-3 py-2 text-muted">{meaning}</td>
            </tr>
          ))}
        />
      </Section>
    </div>
  )
}
