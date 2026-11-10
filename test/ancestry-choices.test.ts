import assert from 'node:assert/strict'
import test from 'node:test'
import { ancestries } from '../src/attributes/options.ts'
import { normalizeBuild } from '../src/attributes/build.ts'
import { parseCharacter, serializeCharacter } from '../src/character/draft.ts'
import type { CharacterDraft } from '../src/character/draft.ts'
import { emptySessionZero } from '../src/session-zero/types.ts'
import {
  ancestryChoiceWarnings, ancestryFeats, ancestryFeatLevels, featsFor, heritages,
  heritagesFor, parseAncestryChoices,
} from '../src/ancestry/choices.ts'
import type { AncestryChoices } from '../src/ancestry/choices.ts'
import { parseGmPackage, serializeGmPackage } from '../gm/package.ts'
import { tailoringBrief } from '../gm/brief.ts'
import descriptions from '../src/content/ancestry-descriptions.json' with { type: 'json' }

test('the Remaster catalog covers every preset ancestry without markup or campaign spoilers', () => {
  assert.equal(heritages.length, 106)
  assert.equal(ancestryFeats.length, 403)
  for (const ancestry of Object.keys(ancestries)) {
    assert.ok(heritagesFor(ancestry).some((option) => option.ancestry === ancestry), ancestry)
    assert.ok(featsFor(ancestry, undefined, 1).length > 0, ancestry)
  }
  for (const options of [heritages, ancestryFeats]) {
    assert.equal(new Set(options.map((row) => row.id)).size, options.length)
    for (const row of options) {
      assert.ok(['Player Core', 'Player Core 2'].includes(row.source), row.name)
    }
  }
  for (const rows of Object.values(descriptions)) {
    for (const [id, text] of Object.entries(rows)) {
      assert.ok(text.length > 0, id)
      assert.doesNotMatch(text, /@(?:UUID|Check|Damage|Template|actor)|<[^>]+>|\[\[/, id)
    }
  }
  assert.doesNotMatch(JSON.stringify({ heritages, ancestryFeats }), /Closing of the Mouth|Kantharos of Silence|House Verathe/)
})

test('feat lists respect slot level and the extra ancestry access from versatile heritages', () => {
  const ids = (ancestry: string, heritage?: string, level = 1) => featsFor(ancestry, heritage, level).map((row) => row.id)
  assert.ok(ids('human').includes('natural-ambition'))
  assert.ok(!ids('human').includes('nimble-elf'))
  assert.ok(ids('human', 'aiuvarin').includes('nimble-elf'))
  assert.ok(ids('human', 'dromaar').includes('orc-ferocity'))
  assert.ok(!ids('human', 'skilled-human').includes('orc-ferocity'))
  assert.ok(!ids('human').includes('multitalented'))
  assert.ok(ids('human', undefined, 9).includes('multitalented'))
  const lineage = ancestryFeats.find((row) => row.traits.includes('lineage') && row.traits.includes('nephilim'))!
  assert.ok(ids('human', 'nephilim').includes(lineage.id))
  assert.ok(!ids('human', 'nephilim', 5).includes(lineage.id))
  assert.ok(!ids('human').includes(lineage.id))
  assert.deepEqual(ancestryFeatLevels, [1, 5, 9, 13, 17])
})

test('changed ancestry and duplicate feats get advisory warnings while choices remain intact', () => {
  const choices: AncestryChoices = {
    heritage: { id: 'skilled-human', notes: 'Society' },
    feats: { 1: { id: 'natural-ambition', notes: 'Choose after class.' }, 5: { id: 'natural-ambition', notes: '' } },
  }
  const before = JSON.stringify(choices)
  assert.match(ancestryChoiceWarnings(choices, 'human', 5).join(' '), /more than once/)
  assert.match(ancestryChoiceWarnings(choices, 'dwarf', 5).join(' '), /Review Skilled Human|Review Natural Ambition/)
  assert.equal(JSON.stringify(choices), before)
  const repeatable: AncestryChoices = {
    heritage: null,
    feats: { 1: { id: 'general-training', notes: 'Toughness' }, 5: { id: 'general-training', notes: 'Fleet' } },
  }
  assert.deepEqual(ancestryChoiceWarnings(repeatable, 'human', 5), [])
})

test('partial choices, extra-choice notes, and future slots survive player and GM files', () => {
  const choices: AncestryChoices = {
    heritage: { id: 'custom', notes: 'A mixed heritage from another source.\nConfirm with GM.' },
    feats: { 1: { id: 'natural-ambition', notes: '## Extra feat\n[record literally]' }, 17: { id: 'custom', notes: '' } },
  }
  const character: CharacterDraft = {
    sessionZero: { answers: emptySessionZero, step: undefined },
    buildDraft: { build: normalizeBuild({ level: 3 }), step: 'heritage', skills: undefined },
    ancestryChoices: choices,
  }
  assert.deepEqual(parseAncestryChoices(choices), choices)
  assert.deepEqual(parseCharacter(serializeCharacter(character)), character)
  const lower = { ...character, buildDraft: { ...character.buildDraft, build: normalizeBuild({ level: 1 }) } }
  assert.deepEqual(parseCharacter(serializeCharacter(lower))?.ancestryChoices, choices)
  const backup = { character, sessionNotes: 'Keep edited GM notes.' }
  assert.deepEqual(parseGmPackage(serializeGmPackage(backup)), backup)
  assert.match(tailoringBrief(character), /Natural Ambition/)
  assert.ok(tailoringBrief(character).includes('\\#\\# Extra feat'))
  assert.doesNotMatch(serializeCharacter(character), /Closing of the Mouth|sessionNotes/)
})

test('bad choices are rejected without changing valid older character files', () => {
  for (const invalid of [
    null, [], { heritage: null, feats: {}, extra: true },
    { heritage: { id: 'unknown', notes: '' }, feats: {} },
    { heritage: null, feats: { 2: { id: 'custom', notes: '' } } },
    { heritage: null, feats: { 1: { id: 'natural-ambition', notes: [] } } },
    { heritage: null, feats: { 1: { id: 'skilled-human', notes: '' } } },
  ]) assert.equal(parseAncestryChoices(invalid), null)
  const old: CharacterDraft = { sessionZero: { answers: emptySessionZero }, buildDraft: { build: normalizeBuild(), step: null } }
  assert.deepEqual(parseCharacter(serializeCharacter(old))?.buildDraft.build, old.buildDraft.build)
  assert.equal(JSON.parse(serializeCharacter(old)).ancestryChoices, undefined)
  assert.equal(parseCharacter(JSON.stringify({ ...JSON.parse(serializeCharacter(old)), ancestryChoices: {} })), null)
})
