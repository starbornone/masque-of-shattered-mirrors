import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeBuild, parseBuild } from '../src/attributes/build.ts'
import { buildShareUrl, parseBuildDraft, serializeBuildDraft } from '../src/attributes/draft.ts'

const build = normalizeBuild({
  ancestry: 'dwarf',
  background: 'nomad',
  characterClass: 'druid',
  ancestryBoosts: ['dex'],
  boosts: { 1: ['str', 'dex'], 10: ['wis'] },
})

test('a saved draft restores partial choices, future boosts, and the current step', () => {
  const draft = { build, step: 'boosts' as const }
  assert.deepEqual(parseBuildDraft(serializeBuildDraft(draft)), draft)
  assert.equal(parseBuildDraft('{'), null)
  const saved = JSON.parse(serializeBuildDraft(draft))
  assert.deepEqual(parseBuildDraft(JSON.stringify({ ...saved, step: 'unknown' })), { build, step: null })
})

test('a build link contains only mechanics and round-trips through the existing parser', () => {
  const url = new URL(buildShareUrl(
    { ...build, ...{ sessionZero: 'private concept' } },
    'https://example.test/masque/?private=notes#local',
  ))
  assert.equal(url.pathname, '/masque/')
  assert.deepEqual([...url.searchParams.keys()], ['build'])
  assert.equal(url.hash, '')
  const payload = url.searchParams.get('build') ?? ''
  assert.doesNotMatch(payload, /private/)
  assert.deepEqual(parseBuild(payload), build)
})
