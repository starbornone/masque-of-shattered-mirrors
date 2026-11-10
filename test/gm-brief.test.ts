import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeBuild } from '../src/attributes/build.ts'
import type { CharacterDraft } from '../src/character/draft.ts'
import { serializeCharacter } from '../src/character/draft.ts'
import { emptySessionZero } from '../src/session-zero/types.ts'
import { tailoringBrief } from '../gm/brief.ts'

const character: CharacterDraft = {
  sessionZero: {
    answers: {
      invitationReason: 'See my portraits on display.',
      stake: { kind: 'person', name: 'Eliane' },
      art: 'Paper silhouettes',
      faith: 'pharasma',
      mask: 'A smiling silver fox',
    },
  },
  buildDraft: {
    build: normalizeBuild({
      ancestryBoosts: ['int', 'dex'],
      background: 'custom',
      backgroundBoosts: ['int', 'wis'],
      characterClass: 'investigator',
      boosts: { 1: ['int', 'dex', 'wis', 'cha'] },
    }),
    step: 'review',
    skills: { lore: [], trained: ['society', 'religion'], choices: {} },
  },
}

test('tailors campaign beats to the imported answers and actual trained skills', () => {
  const before = serializeCharacter(character)
  const brief = tailoringBrief(character)
  for (const detail of ['Eliane', 'Paper silhouettes', 'A smiling silver fox', 'The Witness', 'Society', 'Silver Gallery']) {
    assert.ok(brief.includes(detail), detail)
  }
  assert.doesNotMatch(brief, /Thievery ·|Stealth ·/)
  assert.equal(serializeCharacter(character), before)
  assert.doesNotMatch(before, /Closing of the Mouth|Midnight Mask|Kantharos/)
})

test('changes victim and deity hooks without assigning unanswered choices', () => {
  const self = { ...character, sessionZero: { answers: { ...character.sessionZero.answers, stake: { kind: 'self' as const } } } }
  assert.match(tailoringBrief(self), /Use the character as the intended victim/)
  for (const [faith, expected] of [
    ['nocticula', 'transformation as an alternative'],
    ['black-butterfly', 'feather’s darkness'],
    ['none', 'testimony, the mirror shard'],
  ] as const) {
    const brief = tailoringBrief({ ...self, sessionZero: { answers: { ...self.sessionZero.answers, faith } } })
    assert.ok(brief.includes(expected), faith)
    assert.doesNotMatch(brief, /Prepare The Witness/)
  }
  const blank = tailoringBrief({
    sessionZero: { answers: emptySessionZero },
    buildDraft: { build: normalizeBuild(), step: null },
  })
  for (const detail of ['intended victim is undecided', 'No deity preference', 'art or craft is open', 'mask is undescribed', 'unfinished']) {
    assert.ok(blank.includes(detail), detail)
  }
})

test('quotes player text literally and suppresses skill claims for unfinished attributes', () => {
  const brief = tailoringBrief({
    ...character,
    sessionZero: { answers: { ...character.sessionZero.answers, art: '## New heading\n[link](https://example.test)' } },
    buildDraft: { ...character.buildDraft, build: normalizeBuild(), step: null },
  })
  assert.ok(brief.includes('> \\#\\# New heading'))
  assert.ok(brief.includes('> \\[link\\]\\(https://example\\.test\\)'))
  assert.doesNotMatch(brief, /Society ·/)
})
