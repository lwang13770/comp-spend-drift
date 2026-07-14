import ComparisonBar from './ComparisonBar.jsx'
import SourceTag from './SourceTag.jsx'

const STATUS = {
  off: { label: 'off', dot: 'bg-off', badge: 'bg-off/15 text-off border-off/30' },
  drifting: {
    label: 'drifting',
    dot: 'bg-drift',
    badge: 'bg-drift/15 text-drift border-drift/30',
  },
  clean: {
    label: 'on-track',
    dot: 'bg-ontrack',
    badge: 'bg-ontrack/15 text-ontrack border-ontrack/30',
  },
}

export default function CheckCard({ result, interp }) {
  const s = STATUS[result.status] ?? STATUS.clean
  const fired = result.detected

  return (
    <div
      className={`rounded-lg border bg-panel p-4 ${
        fired ? 'border-edge' : 'border-edge/60'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${s.dot}`} />
          <h4 className="text-sm font-semibold">{result.label}</h4>
        </div>
        <span
          className={`rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${s.badge}`}
        >
          {s.label}
        </span>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-slate-300">{result.summary}</p>

      {fired && result.designed && result.actual && (
        <div className="mt-3 space-y-2 rounded-md bg-ink/60 p-3">
          <ComparisonBar designed={result.designed} actual={result.actual} />
          <div className="pt-1">
            <SourceTag kind="rules" />
          </div>
        </div>
      )}

      {fired && interp && (
        <div className="mt-2 space-y-2 rounded-md border border-accent/20 bg-accent/5 p-3">
          <p className="text-sm text-slate-300">
            <span className="font-medium text-slate-100">Business impact.</span>{' '}
            {interp.businessImpact}
          </p>
          <p className="text-sm text-slate-300">
            <span className="font-medium text-slate-100">Recommendation.</span>{' '}
            {interp.recommendation}
          </p>
          <div className="pt-1">
            <SourceTag kind="llm" />
          </div>
        </div>
      )}
    </div>
  )
}
