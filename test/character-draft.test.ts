import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeBuild } from '../src/attributes/build.ts'
import { buildDraftStorageKey, serializeBuildDraft } from '../src/attributes/draft.ts'
import { characterStorageKey, loadCharacterDraft, parseCharacter, serializeCharacter } from '../src/character/draft.ts'
import type { CharacterDraft } from '../src/character/draft.ts'
import { serializeSessionZero, sessionZeroStorageKey } from '../src/session-zero/draft.ts'
import { emptySessionZero } from '../src/session-zero/types.ts'
import { canAssignSkills, parseSkillPlan } from '../src/skills/plan.ts'

const character: CharacterDraft = {
  sessionZero: {
    answers: { ...emptySessionZero, stake: { kind: 'person', name: 'Élodie' }, faith: 'pharasma' },
    step: 'mask',
  },
  buildDraft: {
    build: normalizeBuild({
      level: 5,
      background: 'custom',
      characterClass: 'rogue',
      key: 'dex',
      ancestryBoosts: ['dex', 'int'],
      boosts: { 1: ['dex', 'int', 'wis', 'cha'] },
    }),
    step: 'boosts',
    skills: {
      lore: ['Heraldry'],
      trained: ['lore:heraldry', 'society'],
      choices: { 'increase:2': 'lore:heraldry' },
    },
  },
}

test('character export restores skipped answers, unfinished attributes, planned skills, and guide progress', () => {
  assert.equal(canAssignSkills(character.buildDraft.build), false)
  const file = JSON.parse(serializeCharacter(character))
  assert.deepEqual(parseCharacter(serializeCharacter(character)), character)
  assert.deepEqual(parseCharacter(JSON.stringify({
    ...file,
    skills: { choices: file.skills.choices, trained: file.skills.trained, lore: file.skills.lore },
  })), character)
  assert.deepEqual(Object.keys(file), ['format', 'version', 'sessionZero', 'build', 'buildStep', 'skills'])
})

test('rejects broken or incompatible files instead of clearing or normalizing draft values', () => {
  const file = JSON.parse(serializeCharacter(character))
  for (const invalid of [
    '{',
    serializeSessionZero(character.sessionZero.answers),
    JSON.stringify({ ...file, version: 2 }),
    JSON.stringify({ ...file, build: { version: 1 } }),
    JSON.stringify({ ...file, sessionZero: { ...file.sessionZero, answers: {} } }),
    JSON.stringify({ ...file, skills: { ...file.skills, lore: [] } }),
    JSON.stringify({ ...file, buildStep: 'unknown' }),
  ]) {
    assert.equal(parseCharacter(invalid), null)
  }
})

test('an export with no skill plan can be restored', () => {
  const blank = {
    sessionZero: { answers: emptySessionZero },
    buildDraft: { build: normalizeBuild(), step: null },
  }
  const restored = parseCharacter(serializeCharacter(blank))
  assert.deepEqual(restored?.sessionZero.answers, blank.sessionZero.answers)
  assert.deepEqual(restored?.buildDraft.build, blank.buildDraft.build)
  assert.equal(restored?.buildDraft.step, null)
  assert.equal(restored?.buildDraft.skills, undefined)
})

test('a normalized Lore topic stays stable through export and import', () => {
  const skills = parseSkillPlan({ lore: ['Heraldry Lore Lore'], trained: ['lore:heraldry'] })
  const draft = { ...character, buildDraft: { ...character.buildDraft, skills } }
  assert.deepEqual(parseCharacter(serializeCharacter(draft)), draft)
})

test('uses the campaign start level for a new build and preserves levels in older and current saves', (t) => {
  const saved = new Map([
    [sessionZeroStorageKey, serializeSessionZero(character.sessionZero.answers, character.sessionZero.step)],
  ])
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: (key: string) => saved.get(key) },
  })
  t.after(() => {
    if (original) Object.defineProperty(globalThis, 'localStorage', original)
    else Reflect.deleteProperty(globalThis, 'localStorage')
  })

  assert.deepEqual(loadCharacterDraft(7), {
    sessionZero: character.sessionZero,
    buildDraft: { build: normalizeBuild({ level: 7 }), step: null },
  })
  for (const invalid of [undefined, Number.NaN, 0, 5.5, 21]) {
    assert.equal(loadCharacterDraft(invalid).buildDraft.build.level, 1)
  }

  saved.set(buildDraftStorageKey, serializeBuildDraft(character.buildDraft))
  assert.deepEqual(loadCharacterDraft(7), character)
  const restored = {
    ...character,
    sessionZero: { ...character.sessionZero, answers: { ...emptySessionZero, faith: 'nocticula' as const } },
  }
  saved.set(characterStorageKey, serializeCharacter(restored))
  assert.deepEqual(loadCharacterDraft(7), restored)
})
