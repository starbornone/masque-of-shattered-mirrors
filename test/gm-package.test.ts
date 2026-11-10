import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeBuild } from '../src/attributes/build.ts'
import { parseCharacter, serializeCharacter } from '../src/character/draft.ts'
import type { CharacterDraft } from '../src/character/draft.ts'
import { emptySessionZero } from '../src/session-zero/types.ts'
import { parseGmPackage, serializeGmPackage } from '../gm/package.ts'

const character: CharacterDraft = {
  sessionZero: { answers: { ...emptySessionZero, art: 'Élodie’s silhouettes', faith: 'pharasma' }, step: 'mask' },
  buildDraft: {
    build: normalizeBuild({ level: 3, characterClass: 'investigator' }),
    step: 'boosts',
    skills: { lore: ['Heraldry'], trained: ['society', 'lore:heraldry'], choices: {} },
  },
  startingLanguageNotes: 'Common, Elven\nConfirm bonus languages.',
}

test('GM packages restore the whole character and exact edited notes without regenerating them', () => {
  const before = serializeCharacter(character)
  for (const sessionNotes of [
    '# My session notes\r\n\r\nThe Witness — revised cost.\n  Keep this spacing.  \n',
    '', '   \n', '<script>alert("test")</script>\n[link](https://example.test)',
  ]) {
    const workspace = { character, sessionNotes }
    const exported = serializeGmPackage(workspace)
    assert.deepEqual(parseGmPackage(exported), workspace)
    assert.equal(serializeCharacter(character), before)
    assert.deepEqual(JSON.parse(exported).character, JSON.parse(before))
  }
})

test('damaged, incomplete, and incompatible GM packages fail validation', () => {
  const file = JSON.parse(serializeGmPackage({ character, sessionNotes: 'Keep these edits.' }))
  for (const invalid of [
    '{', 'null', '[]', '{}',
    JSON.stringify({ ...file, format: 'another-app' }),
    JSON.stringify({ ...file, version: 2 }),
    JSON.stringify({ ...file, sessionNotes: undefined }),
    JSON.stringify({ ...file, sessionNotes: null }),
    JSON.stringify({ ...file, sessionNotes: ['notes'] }),
    JSON.stringify({ ...file, character: undefined }),
    JSON.stringify({ ...file, character: { ...file.character, version: 2 } }),
    JSON.stringify({ ...file, character: { ...file.character, buildStep: 'unknown' } }),
    JSON.stringify({ ...file, extra: 'would be lost' }),
  ]) assert.equal(parseGmPackage(invalid), null, invalid)
})

test('player and GM files stay distinct and player exports do not carry GM notes', () => {
  const playerFile = serializeCharacter(character)
  const gmFile = serializeGmPackage({ character, sessionNotes: 'Closing of the Mouth — GM edits.' })
  assert.equal(parseGmPackage(playerFile), null)
  assert.equal(parseCharacter(gmFile), null)
  assert.doesNotMatch(playerFile, /sessionNotes|Closing of the Mouth|masque-gm-package/)
  assert.deepEqual(parseCharacter(JSON.stringify(JSON.parse(gmFile).character)), character)
})
