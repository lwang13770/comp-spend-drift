import { useMemo } from 'react'
import { demoPlanSpec } from '../data/planSpec.js'
import { demoRoster } from '../data/roster.js'
import { runDetectionEval } from '../eval/detectionTests.js'

// The eval always grades the engine against the FROZEN demo scenario — not the user's
// edited data — because the answer key only labels that scenario. Detection on arbitrary
// user input is trusted arithmetic with no ground truth to grade against.

const STATUS_TONE = {
  off: 'text-off',
  drifting: 'text-drift',
  clean: 'text-ontrack',
}

function Gate({ label, pass, detail }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-edge bg-panel px-4 py-3">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {detail && <div className="text-xs text-muted">{detail}</div>}
      </div>
      <span
        className={`rounded border px-2 py-0.5 text-xs font-semibold ${
          pass
            ? 'border-ontrack/30 bg-ontrack/15 text-ontrack'
            : 'border-off/30 bg-off/15 text-off'
        }`}
      >
        {pass ? 'PASS' : 'FAIL'}
      </span>
    </div>
  )
}

export default function EvalTab() {
  const evalRun = useMemo(() => runDetectionEval(demoPlanSpec, demoRoster), [])
  const { pr, battery, schema, comparison } = evalRun

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Detection eval</h2>
        <p className="text-sm text-muted">
          Deterministic tests against the frozen Harborline answer key. Target: 100%
          precision / 100% recall.
        </p>
      </div>

      <div className="space-y-2">
        <Gate
          label="Precision / Recall vs answer key"
          detail={`${(pr.precision * 100).toFixed(0)}% / ${(pr.recall * 100).toFixed(
            0,
          )}%  ·  TP ${pr.tp} · FP ${pr.fp} · FN ${pr.fn}`}
          pass={pr.precision === 1 && pr.recall === 1}
        />
        <Gate
          label="Full battery execution"
          detail={`${battery.ran} / ${battery.expected} checks returned a result`}
          pass={battery.ran === battery.expected}
        />
        <Gate
          label="Output schema complete"
          detail={
            schema.ok
              ? 'every result has all required fields'
              : `missing on: ${schema.missing.map((m) => m.id).join(', ')}`
          }
          pass={schema.ok}
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-edge">
        <table className="w-full text-sm">
          <thead className="bg-panel text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Check</th>
              <th className="px-3 py-2 font-medium">Expected</th>
              <th className="px-3 py-2 font-medium">Actual</th>
              <th className="px-3 py-2 font-medium">Match</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-edge">
            {comparison.map((c) => (
              <tr key={c.id} className="bg-ink/40">
                <td className="px-3 py-2">{c.label}</td>
                <td className={`px-3 py-2 font-medium ${STATUS_TONE[c.expected] ?? ''}`}>
                  {c.expected}
                </td>
                <td className={`px-3 py-2 font-medium ${STATUS_TONE[c.actual] ?? ''}`}>
                  {c.actual}
                </td>
                <td className="px-3 py-2">
                  {c.match ? (
                    <span className="text-ontrack">✓</span>
                  ) : (
                    <span className="text-off">✕</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
