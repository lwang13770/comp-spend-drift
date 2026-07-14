// VP-level headline. Phase 1 renders the deterministic top line + severity-ranked
// critical findings from detection. The LLM-authored shared-root-cause and prose land
// in Phase 2 (this is where "explained by CompDrift" content will attach).

import SourceTag from './SourceTag.jsx'

const SEV_TONE = {
  3: 'text-off',
  2: 'text-drift',
}

export default function ExecutiveSummary({ results, overall }) {
  const total = results.length
  const passing = results.filter((r) => !r.detected).length
  const fired = results
    .filter((r) => r.detected)
    .sort((a, b) => b.severity - a.severity)
  const critical = fired.filter((r) => r.status === 'off').length

  const shown = fired.slice(0, 4)
  const extra = fired.length - shown.length

  return (
    <section className="rounded-xl border border-edge bg-panel p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">Plan health</h2>
        <div className="tnum text-sm text-muted">
          <span className="font-semibold text-slate-100">
            {passing} of {total}
          </span>{' '}
          checks passing
        </div>
      </div>

      <p className="mt-1 text-sm text-slate-300">
        {fired.length === 0
          ? 'The plan is operating as designed — no drifts detected.'
          : `${fired.length} check${fired.length > 1 ? 's' : ''} fired${
              critical ? `, ${critical} critical` : ''
            }. Review the findings below.`}
      </p>

      {overall && (
        <div className="mt-4 space-y-2 rounded-lg border border-accent/20 bg-accent/5 p-3">
          <p className="text-sm text-slate-200">{overall.summary}</p>
          {overall.sharedRootCauses?.length > 0 && (
            <div className="text-sm text-slate-300">
              <span className="font-medium text-slate-100">Shared root causes:</span>
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {overall.sharedRootCauses.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
          <SourceTag kind="llm" />
        </div>
      )}

      {shown.length > 0 && (
        <ul className="mt-4 space-y-2">
          {shown.map((r) => (
            <li key={r.id} className="flex gap-2 text-sm">
              <span className={`font-semibold ${SEV_TONE[r.severity] ?? 'text-slate-300'}`}>
                {r.status === 'off' ? '●' : '◐'}
              </span>
              <span className="text-slate-300">
                <span className="font-medium text-slate-100">{r.label}:</span>{' '}
                {r.summary}
              </span>
            </li>
          ))}
          {extra > 0 && (
            <li className="text-xs text-muted">{extra} additional finding(s) below.</li>
          )}
        </ul>
      )}

      <p className="mt-4 border-t border-edge pt-3 text-xs text-muted">
        Directional. Detection is deterministic.{' '}
        {overall ? 'Interpretation is LLM-generated. ' : ''}
        {results.length} checks · current period.
      </p>
    </section>
  )
}
