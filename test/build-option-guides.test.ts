import assert from 'node:assert/strict'
import test from 'node:test'
import { ancestries, backgrounds, classes } from '../src/attributes/options.ts'
import { buildOptionGuides } from '../src/content/build-options.ts'

test('every selectable preset has a summary and a distinct rules entry within its category', () => {
  const catalogs = { ancestry: ancestries, background: backgrounds, class: classes } as const
  for (const kind of ['ancestry', 'background', 'class'] as const) {
    const guides = buildOptionGuides[kind]
    assert.deepEqual(Object.keys(guides).sort(), Object.keys(catalogs[kind]).sort(), kind)
    const rulesIds = new Set<number>()
    for (const [id, { summary, rulesId }] of Object.entries(guides)) {
      assert.ok(summary.trim(), `${kind}: ${id} needs a summary`)
      assert.ok(Number.isInteger(rulesId) && rulesId > 0 && !rulesIds.has(rulesId), `${kind}: ${id} needs a unique rules ID`)
      rulesIds.add(rulesId)
    }
  }
})
