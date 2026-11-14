import assert from 'node:assert/strict'
import test from 'node:test'
import { previewCharacterUpdate } from '../gm/character-update.ts'
import { normalizeBuild } from '../src/attributes/build.ts'
import { newCharacterDraft } from '../src/character/library.ts'

test('character update previews removed and added training, concept changes, and revised build', () => {
  const current = newCharacterDraft()
  current.buildDraft.skills = { lore: [], trained: ['society'], choices: {} }
  current.sessionZero.answers.mask = 'A loyal guest'
  const revised = structuredClone(current)
  revised.buildDraft.build = normalizeBuild({ level: 2, characterClass: 'bard' })
  revised.buildDraft.skills = { lore: [], trained: ['deception'], choices: {} }
  revised.sessionZero.answers.mask = 'A stranger'
  revised.startingLanguageNotes = 'Elven'
  const preview = previewCharacterUpdate(current, revised)
  assert.deepEqual(preview.concept, [{ label: 'Mask', before: 'A loyal guest', after: 'A stranger' }])
  assert.deepEqual(preview.build.find(({ label }) => label === 'Level'), { label: 'Level', before: '1', after: '2' })
  assert.deepEqual(preview.training, [
    { label: 'Society', before: 'Trained (provisional)', after: '—' },
    { label: 'Deception', before: '—', after: 'Trained (provisional)' },
  ])
  assert.deepEqual(preview.other, ['Languages'])
  assert.ok(preview.suggestions.some(({ title }) => title.startsWith('Mask')))
  assert.deepEqual(previewCharacterUpdate(revised, structuredClone(revised)), {
    concept: [], build: [], training: [], other: [], suggestions: [],
  })
})
