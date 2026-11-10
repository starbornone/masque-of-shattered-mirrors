import assert from 'node:assert/strict'
import test from 'node:test'
import { parseSessionZero, serializeSessionZero, sessionZeroMarkdown } from '../src/session-zero/draft.ts'
import { emptySessionZero } from '../src/session-zero/types.ts'

test('versioned drafts preserve player answers and omit extra fields', () => {
  const draft = {
    ...emptySessionZero,
    invitationReason: 'Learn why I was invited.',
    stake: { kind: 'person' as const, name: 'Mira', secret: 'private' },
    art: 'Paper silhouettes',
    gmNotes: 'private',
  }
  const serialized = serializeSessionZero(draft)
  assert.doesNotMatch(serialized, /private/)
  assert.deepEqual(parseSessionZero(serialized)?.answers, {
    ...emptySessionZero,
    invitationReason: draft.invitationReason,
    stake: { kind: 'person', name: 'Mira' },
    art: draft.art,
  })
})

test('damaged and unfamiliar saves cannot supply invalid choices', () => {
  assert.equal(parseSessionZero('{'), null)
  assert.equal(parseSessionZero('{"format":"masque-session-zero","version":2}'), null)
  const saved = parseSessionZero('{"format":"masque-session-zero","version":1,"step":"constructor","answers":{"faith":"constructor","art":3}}')
  assert.deepEqual(saved?.answers, emptySessionZero)
  assert.equal(saved?.step, undefined)
})

test('local saves remember progress even when questions were skipped', () => {
  const saved = parseSessionZero(serializeSessionZero(emptySessionZero, 'review'))
  assert.equal(saved?.step, 'review')
  assert.deepEqual(saved?.answers, emptySessionZero)
  assert.equal(Object.hasOwn(JSON.parse(serializeSessionZero(emptySessionZero)), 'step'), false)
})

test('Markdown preserves answer lines as literal quoted text', () => {
  const markdown = sessionZeroMarkdown({
    ...emptySessionZero,
    mask: 'A fox\r\n# [silver](mirror)',
  })
  assert.ok(markdown.includes('## What the mask says\n\n> A fox\n> \\# \\[silver\\]\\(mirror\\)'))
})
