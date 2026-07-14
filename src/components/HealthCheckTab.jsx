import { useApp } from '../state/AppContext.jsx'
import { CATEGORY } from '../engine/util.js'
import ExecutiveSummary from './ExecutiveSummary.jsx'
import CheckCard from './CheckCard.jsx'
import InterpretationGates from './InterpretationGates.jsx'

const GROUPS = [CATEGORY.PLANNED_SPEND, CATEGORY.EFFICIENCY, CATEGORY.HIT_NUMBER]

function InterpretBar() {
  const { canInterpret, interpretation, runInterpretation } = useApp()
  const { status, gates } = interpretation

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-edge bg-panel/60 px-4 py-2.5">
      <div className="flex items-center gap-3">
        <button
          onClick={runInterpretation}
          disabled={!canInterpret || status === 'loading'}
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === 'loading' ? 'Interpreting…' : 'Explain with CompDrift'}
        </button>
        {!canInterpret && (
          <span className="text-xs text-muted">Add an API key in Setup to enable.</span>
        )}
        {status === 'error' && (
          <span className="text-xs text-off">{interpretation.error}</span>
        )}
        {status === 'done' && interpretation.empty && (
          <span className="text-xs text-muted">No fired checks to interpret.</span>
        )}
      </div>
      {status === 'done' && gates && <InterpretationGates gates={gates} />}
    </div>
  )
}

export default function HealthCheckTab() {
  const { results, interpretation } = useApp()

  // Only surface LLM content when it passed the hard gates.
  const interp =
    interpretation.status === 'done' && interpretation.data && !interpretation.gates?.blocked
      ? interpretation.data
      : null
  const byId = interp
    ? Object.fromEntries(interp.drifts.map((d) => [d.id, d]))
    : {}
  const blocked =
    interpretation.status === 'done' && interpretation.gates?.blocked

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <InterpretBar />

      {blocked && (
        <div className="rounded-lg border border-off/40 bg-off/10 px-4 py-3 text-sm text-off">
          Interpretation was withheld: it failed a hard eval gate (grounding or scope).
          Detection results below are unaffected.
        </div>
      )}

      <ExecutiveSummary results={results} overall={interp?.overall} />

      {GROUPS.map((group) => {
        const inGroup = results.filter((r) => r.category === group)
        if (!inGroup.length) return null
        return (
          <section key={group}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              {group}
            </h3>
            <div className="space-y-3">
              {inGroup.map((r) => (
                <CheckCard key={r.id} result={r} interp={byId[r.id]} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
