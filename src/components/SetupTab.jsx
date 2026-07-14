import { useApp } from '../state/AppContext.jsx'
import { MODELS } from '../interpretation/client.js'

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
  const {
    planSpec,
    roster,
    model,
    apiKey,
    hasKey,
    setPlanSpec,
    setRoster,
    setModel,
    setApiKey,
    clearApiKey,
    resetToDemo,
    hasProxy,
  } = useApp()

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
        <div className="mb-3">
          <h2 className="text-lg font-semibold">Interpretation (optional)</h2>
          <p className="text-sm text-muted">
            {hasProxy
              ? 'Interpretation is enabled via a hosted proxy — no key needed. You can optionally paste your own key to use it instead (held in memory only, sent only to api.anthropic.com).'
              : 'Detection and eval run without a key. Add an Anthropic API key to unlock the LLM interpretation layer. The key is held in memory only — never saved, never sent anywhere except api.anthropic.com.'}
          </p>
        </div>
        <div className="grid gap-3 rounded-lg border border-edge bg-panel p-4 sm:grid-cols-[1fr_auto]">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">Anthropic API key</span>
            <div className="flex gap-2">
              <input
                type="password"
                autoComplete="off"
                placeholder="sk-ant-…"
                className="flex-1 rounded-md border border-edge bg-ink px-2 py-1.5 text-sm outline-none focus:border-accent"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              {hasKey && (
                <button
                  onClick={clearApiKey}
                  className="rounded-md border border-edge px-3 py-1.5 text-sm text-muted hover:border-off hover:text-off"
                >
                  Clear
                </button>
              )}
            </div>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">Model</span>
            <select
              className="rounded-md border border-edge bg-ink px-2 py-1.5 text-sm outline-none focus:border-accent"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

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
              {roster.length} reps. Revenue is derived (quota × attainment).
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
                  <td className="px-3 py-1 text-muted">
                    ${Math.round((r.quota * r.attainment) / 1000).toLocaleString()}K
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
