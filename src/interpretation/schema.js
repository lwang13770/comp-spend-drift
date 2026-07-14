// The structured-JSON contract for the interpretation layer. Passed to Claude via
// output_config.format (json_schema) so the reply is guaranteed to parse.

export const interpretationSchema = {
  type: 'object',
  properties: {
    drifts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          verdict: { type: 'string', enum: ['on-track', 'drifting', 'off'] },
          severity: { type: 'integer', enum: [1, 2, 3] },
          businessImpact: { type: 'string' },
          recommendation: { type: 'string' },
        },
        required: ['id', 'verdict', 'severity', 'businessImpact', 'recommendation'],
        additionalProperties: false,
      },
    },
    overall: {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        sharedRootCauses: { type: 'array', items: { type: 'string' } },
      },
      required: ['summary', 'sharedRootCauses'],
      additionalProperties: false,
    },
  },
  required: ['drifts', 'overall'],
  additionalProperties: false,
}

/** Best-effort parse of the model's first text block into the contract shape. */
export function parseInterpretation(text) {
  const obj = JSON.parse(text)
  if (!obj || !Array.isArray(obj.drifts) || !obj.overall) {
    throw new Error('Interpretation JSON missing required fields')
  }
  return obj
}
