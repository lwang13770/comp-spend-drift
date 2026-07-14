import { useState } from 'react'
import { AppProvider } from './state/AppContext.jsx'
import Tabs from './components/Tabs.jsx'
import SetupTab from './components/SetupTab.jsx'
import HealthCheckTab from './components/HealthCheckTab.jsx'
import EvalTab from './components/EvalTab.jsx'
import HowItWorksTab from './components/HowItWorksTab.jsx'

const TABS = [
  { id: 'setup', label: 'Setup' },
  { id: 'health', label: 'Health Check' },
  { id: 'eval', label: 'Eval' },
  { id: 'howitworks', label: 'How This Works' },
]

export default function App() {
  const [active, setActive] = useState('health')

  return (
    <AppProvider>
      <div className="min-h-full">
        <header className="border-b border-edge bg-panel/60">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Comp<span className="text-accent">Drift</span>
              </h1>
              <p className="text-xs text-muted">
                Sales-comp plan health check — does the plan run true to its design intent?
              </p>
            </div>
            <span className="rounded-full border border-edge px-3 py-1 text-xs text-muted">
              prototype
            </span>
          </div>
          <div className="mx-auto max-w-5xl px-6">
            <Tabs tabs={TABS} active={active} onChange={setActive} />
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-8">
          {active === 'setup' && <SetupTab />}
          {active === 'health' && <HealthCheckTab />}
          {active === 'eval' && <EvalTab />}
          {active === 'howitworks' && <HowItWorksTab />}
        </main>
      </div>
    </AppProvider>
  )
}
