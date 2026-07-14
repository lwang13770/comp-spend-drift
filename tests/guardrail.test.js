import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (/\.(jsx?|tsx?)$/.test(entry)) out.push(full)
  }
  return out
}

// The engine computes results; it must never look up answers. The UI must never leak
// the answer key into the product surface. Only src/eval/** may import it.
describe('grounding boundary: answer key is eval-only', () => {
  const guarded = ['src/engine', 'src/components']

  for (const rel of guarded) {
    it(`${rel}/** does not import the answer key`, () => {
      const offenders = walk(join(root, rel)).filter((f) =>
        /answerKey/.test(readFileSync(f, 'utf8')),
      )
      expect(offenders, `files referencing answerKey: ${offenders.join(', ')}`).toEqual(
        [],
      )
    })
  }
})
