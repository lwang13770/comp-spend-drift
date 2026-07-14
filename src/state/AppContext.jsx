import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { demoPlanSpec } from '../data/planSpec.js'
import { demoRoster } from '../data/roster.js'
import { runBattery } from '../engine/checks/index.js'
import { interpret, MODELS, hasProxy } from '../interpretation/client.js'
import { runGates } from '../eval/gates.js'

const AppContext = createContext(null)
const STORAGE_KEY = 'compdrift.state.v1'

const clone = (x) => JSON.parse(JSON.stringify(x))

function loadInitial() {
  // NB: the API key is intentionally NOT part of persisted state — it lives in memory only.
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.planSpec && parsed.roster) {
        return {
          planSpec: parsed.planSpec,
          roster: parsed.roster,
          model: parsed.model || MODELS[0].id,
        }
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  return { planSpec: clone(demoPlanSpec), roster: clone(demoRoster), model: MODELS[0].id }
}

const IDLE = { status: 'idle' }

export function AppProvider({ children }) {
  const [{ planSpec, roster, model }, setState] = useState(loadInitial)
  const [apiKey, setApiKey] = useState('') // memory only, never persisted
  const [interpretation, setInterpretation] = useState(IDLE)

  // Persist only non-sensitive fields. The key is never written to disk.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ planSpec, roster, model }))
    } catch {
      /* storage may be unavailable */
    }
  }, [planSpec, roster, model])

  // Detection is deterministic and cheap — recompute on every data edit.
  const results = useMemo(() => runBattery(planSpec, roster), [planSpec, roster])

  // Interpretation is tied to a specific detection result; invalidate it when data changes.
  const resultsKey = useMemo(() => JSON.stringify(results.map((r) => [r.id, r.status])), [results])
  const lastKey = useRef(resultsKey)
  useEffect(() => {
    if (lastKey.current !== resultsKey) {
      lastKey.current = resultsKey
      setInterpretation(IDLE)
    }
  }, [resultsKey])

  const runInterpretation = async () => {
    const firedDrifts = results.filter((r) => r.detected)
    if (!firedDrifts.length) {
      setInterpretation({ status: 'done', data: null, gates: null, empty: true })
      return
    }
    setInterpretation({ status: 'loading' })
    try {
      const { interpretation: data, payload } = await interpret({
        planSpec,
        firedDrifts,
        apiKey,
        model,
      })
      const gates = runGates(data, payload, results.map((r) => r.id))
      setInterpretation({ status: 'done', data, gates })
    } catch (err) {
      setInterpretation({ status: 'error', error: err.message || String(err) })
    }
  }

  const value = useMemo(
    () => ({
      planSpec,
      roster,
      model,
      apiKey,
      results,
      interpretation,
      hasKey: apiKey.trim().length > 0,
      hasProxy,
      // Interpretation is available if the visitor pasted a key OR a proxy is configured.
      canInterpret: apiKey.trim().length > 0 || hasProxy,
      setPlanSpec: (patch) =>
        setState((s) => ({ ...s, planSpec: { ...s.planSpec, ...patch } })),
      setRoster: (next) => setState((s) => ({ ...s, roster: next })),
      setModel: (m) => setState((s) => ({ ...s, model: m })),
      setApiKey,
      clearApiKey: () => setApiKey(''),
      resetToDemo: () =>
        setState((s) => ({ ...s, planSpec: clone(demoPlanSpec), roster: clone(demoRoster) })),
      runInterpretation,
    }),
    [planSpec, roster, model, apiKey, results, interpretation],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
