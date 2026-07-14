import { useApp } from '../state/AppContext.jsx'

const SPEC_FIELDS = [
  ['baseSalary', 'Base salary', '$'],
  ['variableTarget', 'Variable target', '$'],
  ['ote', 'OTE', '$'],
  ['designedQuota', 'Designed quota', '$'],
  ['revenueTarget', 'Revenue target', '$'],
  ['variableBudget', 'Variable budget', '$'],
  ['designedCoverage', 'Designed coverage', 'x'],
]

function NumberField({ label, unit, value, onChange }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-muted">
        {label} {unit && <span className="opacity-60">({unit})</span>}
      </span>
      <input
        type="number"
        className="tnum rounded-md border border-edge bg-ink px-2 py-1.5 text-sm outline-none focus:border-accent"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  )
}

export default function SetupTab() {
  const { planSpec, roster, setPlanSpec, setRoster, resetToDemo } = useApp()

  const updateRep = (i, key, val) => {
    const next = roster.map((r, idx) => (idx === i ? { ...r, [key]: val } : r))
    setRoster(next)
  }
  const addRep = () =>
    setRoster([...roster, { name: 'New rep', quota: 800000, attainment: 1, variablePaid: 100000 }])
  const removeRep = (i) => setRoster(roster.filter((_, idx) => idx !== i))

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Plan spec</h2>
            <p className="text-sm text-muted">The design intent checks compare against.</p>
          </div>
          <button
            onClick={resetToDemo}
            className="rounded-md border border-edge px-3 py-1.5 text-sm text-muted hover:border-accent hover:text-slate-100"
          >
            Reset to demo
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-edge bg-panel p-4 sm:grid-cols-3">
          {SPEC_FIELDS.map(([key, label, unit]) => (
            <NumberField
              key={key}
              label={label}
              unit={unit}
              value={planSpec[key]}
              onChange={(v) => setPlanSpec({ [key]: v })}
            />
          ))}
          <NumberField
            label="Accelerator threshold"
            unit="x"
            value={planSpec.accelerator.threshold}
            onChange={(v) =>
              setPlanSpec({ accelerator: { ...planSpec.accelerator, threshold: v } })
            }
          />
          <NumberField
            label="Accelerator multiplier"
            unit="x"
            value={planSpec.accelerator.multiplier}
            onChange={(v) =>
              setPlanSpec({ accelerator: { ...planSpec.accelerator, multiplier: v } })
            }
          />
          <NumberField
            label="Decelerator threshold"
            unit="x"
            value={planSpec.decelerator.threshold}
            onChange={(v) =>
              setPlanSpec({ decelerator: { ...planSpec.decelerator, threshold: v } })
            }
          />
          <NumberField
            label="Decelerator multiplier"
            unit="x"
            value={planSpec.decelerator.multiplier}
            onChange={(v) =>
              setPlanSpec({ decelerator: { ...planSpec.decelerator, multiplier: v } })
            }
          />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Sales roster</h2>
            <p className="text-sm text-muted">
              {roster.length} reps. Revenue = quota × attainment; editing revenue adjusts
              attainment to match.
            </p>
          </div>
          <button
            onClick={addRep}
            className="rounded-md border border-edge px-3 py-1.5 text-sm text-muted hover:border-accent hover:text-slate-100"
          >
            + Add rep
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-edge">
          <table className="w-full text-sm">
            <thead className="bg-panel text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Quota ($)</th>
                <th className="px-3 py-2 font-medium">Attainment (×)</th>
                <th className="px-3 py-2 font-medium">Variable paid ($)</th>
                <th className="px-3 py-2 font-medium">Revenue</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="tnum divide-y divide-edge">
              {roster.map((r, i) => (
                <tr key={i} className="bg-ink/40">
                  <td className="px-2 py-1">
                    <input
                      className="w-28 rounded bg-transparent px-1 py-1 outline-none focus:bg-panel"
                      value={r.name}
                      onChange={(e) => updateRep(i, 'name', e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      type="number"
                      className="w-24 rounded bg-transparent px-1 py-1 outline-none focus:bg-panel"
                      value={r.quota}
                      onChange={(e) => updateRep(i, 'quota', Number(e.target.value))}
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      type="number"
                      step="0.01"
                      className="w-20 rounded bg-transparent px-1 py-1 outline-none focus:bg-panel"
                      value={r.attainment}
                      onChange={(e) => updateRep(i, 'attainment', Number(e.target.value))}
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      type="number"
                      className="w-24 rounded bg-transparent px-1 py-1 outline-none focus:bg-panel"
                      value={r.variablePaid}
                      onChange={(e) => updateRep(i, 'variablePaid', Number(e.target.value))}
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      type="number"
                      className="w-28 rounded bg-transparent px-1 py-1 outline-none focus:bg-panel"
                      value={Math.round(r.quota * r.attainment)}
                      onChange={(e) => {
                        // Revenue is derived (quota × attainment); editing it back-solves
                        // attainment so the invariant holds and the engine stays consistent.
                        const rev = Number(e.target.value)
                        updateRep(i, 'attainment', r.quota ? rev / r.quota : 0)
                      }}
                    />
                  </td>
                  <td className="px-2 py-1 text-right">
                    <button
                      onClick={() => removeRep(i)}
                      className="text-muted hover:text-off"
                      title="Remove rep"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
