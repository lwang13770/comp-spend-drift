// The visible seam between the deterministic and probabilistic layers.
// "detected by rules" = arithmetic. "explained by CompDrift" = LLM interpretation.
export default function SourceTag({ kind }) {
  const rules = kind === 'rules'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
        rules ? 'bg-edge text-muted' : 'bg-accent/15 text-accent'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${rules ? 'bg-muted' : 'bg-accent'}`} />
      {rules ? 'detected by rules' : 'explained by CompDrift'}
    </span>
  )
}
