export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 border-b border-edge">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            active === t.id
              ? 'border-accent text-slate-100'
              : 'border-transparent text-muted hover:text-slate-300'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
