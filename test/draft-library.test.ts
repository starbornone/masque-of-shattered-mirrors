import assert from 'node:assert/strict'
import test from 'node:test'
import type { TestContext } from 'node:test'
import { normalizeBuild } from '../src/attributes/build.ts'
import { buildDraftStorageKey, serializeBuildDraft } from '../src/attributes/draft.ts'
import { characterStorageKey, parseCharacter, serializeCharacter } from '../src/character/draft.ts'
import type { CharacterDraft } from '../src/character/draft.ts'
import { draftLibraryKey, draftNameError, loadDraftLibrary, newCharacterDraft, parseDraftLibrary, serializeDraftLibrary, storeDraftLibrary } from '../src/character/library.ts'
import { serializeSessionZero, sessionZeroStorageKey } from '../src/session-zero/draft.ts'
import { emptySessionZero } from '../src/session-zero/types.ts'

const original: CharacterDraft = {
  sessionZero: { answers: { ...emptySessionZero, art: 'Glass engraving' }, step: 'mask' },
  buildDraft: { build: normalizeBuild({ characterClass: 'wizard', level: 5 }), step: 'spells', skills: undefined },
  startingLanguageNotes: 'Elven',
}

function mockStorage(t: TestContext, values = new Map<string, string>()) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    },
  })
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor)
    else Reflect.deleteProperty(globalThis, 'localStorage')
  })
  return values
}

test('migrates the current save, keeps the original key, and reopens the active draft', (t) => {
  const legacy = serializeCharacter(original)
  const storage = mockStorage(t, new Map([[characterStorageKey, legacy]]))
  const initial = loadDraftLibrary(2)
  assert.deepEqual(initial.library.drafts[0].character, original)
  assert.equal(initial.saved, null)
  assert.equal(storage.has(draftLibraryKey), false)

  const second = { id: 'second', name: 'Rogue', character: newCharacterDraft(2) }
  const library = { activeId: second.id, drafts: [...initial.library.drafts, second] }
  assert.equal(storeDraftLibrary(library, initial.saved).problem, null)
  const reloaded = loadDraftLibrary(1).library
  assert.equal(reloaded.activeId, second.id)
  assert.equal(reloaded.drafts[1].character.buildDraft.build.level, 2)
  assert.deepEqual(reloaded.drafts[0].character, original)
  assert.equal(storage.get(characterStorageKey), legacy)
  assert.equal(draftNameError(reloaded, ' rogue '), 'A draft with that name already exists.')
  assert.equal(draftNameError(reloaded, 'Rogue', second.id), '')
})

test('preserves earlier separate concept and build saves without using them for a new draft', (t) => {
  mockStorage(t, new Map([
    [sessionZeroStorageKey, serializeSessionZero(original.sessionZero.answers, original.sessionZero.step)],
    [buildDraftStorageKey, serializeBuildDraft(original.buildDraft)],
  ]))
  const { character } = loadDraftLibrary(2).library.drafts[0]
  assert.deepEqual(character.sessionZero, original.sessionZero)
  assert.equal(character.buildDraft.build.level, 5)
  assert.equal(character.buildDraft.step, 'spells')
  assert.equal(newCharacterDraft(2).buildDraft.step, null)
  assert.equal(newCharacterDraft(2).sessionZero.answers.art, '')
})

test('rejects stale writes and preserves an unreadable library alongside the older save', (t) => {
  const storage = mockStorage(t, new Map([[characterStorageKey, serializeCharacter(original)]]))
  const initial = loadDraftLibrary()
  const changed = { ...initial.library, drafts: initial.library.drafts.map((draft) => ({ ...draft, name: 'Other tab' })) }
  assert.equal(storeDraftLibrary(changed, null).problem, null)
  assert.equal(storeDraftLibrary(initial.library, null).problem, 'changed')
  assert.equal(loadDraftLibrary().library.drafts[0].name, 'Other tab')

  storage.set(draftLibraryKey, '{')
  const unreadable = loadDraftLibrary()
  assert.equal(unreadable.problem, 'unreadable')
  assert.deepEqual(unreadable.library.drafts[0].character, original)
  assert.equal(storage.get(draftLibraryKey), '{')
})

test('accepts only valid player character files inside the library', () => {
  const raw = serializeDraftLibrary({ activeId: 'wizard', drafts: [{ id: 'wizard', name: 'Wizard', character: original }] })
  assert.deepEqual(parseDraftLibrary(raw)?.drafts[0].character, original)
  assert.equal(parseCharacter(raw), null)
  const library = JSON.parse(raw)
  assert.equal(parseDraftLibrary(JSON.stringify({ ...library, activeId: 'missing' })), null)
  const packageFile = { format: 'masque-gm-package', version: 1, character: library.drafts[0].character, sessionNotes: 'Private notes' }
  assert.equal(parseDraftLibrary(JSON.stringify({ ...library, drafts: [{ ...library.drafts[0], character: packageFile }] })), null)
})
