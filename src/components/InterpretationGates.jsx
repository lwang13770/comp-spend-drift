// Compact readout of the interpretation eval gates. Grounding + scope are hard
// (blocking); number-fidelity is shown as a warning when it trips.

function Pill({ label, pass, warn }) {
  const tone = pass
    ? 'border-ontrack/30 bg-ontrack/10 text-ontrack'
    : warn
      ? 'border-drift/30 bg-drift/10 text-drift'
      : 'border-off/30 bg-off/10 text-off'
  return (
    <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${tone}`}>
      {label} {pass ? '✓' : warn ? '⚠' : '✕'}
    </span>
  )
}

export default function InterpretationGates({ gates }) {
  if (!gates) return null
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[10px] uppercase tracking-wide text-muted">eval gates</span>
      <Pill label="grounding" pass={gates.grounding.pass} />
      <Pill
        label="number fidelity"
        pass={gates.numberFidelity.pass}
        warn={!gates.numberFidelity.pass}
      />
      <Pill label="scope" pass={gates.scope.pass} />
    </div>
  )
}
