import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { normalizeBuild } from '../src/attributes/build.ts'
import { parseCharacter, serializeCharacter } from '../src/character/draft.ts'
import type { CharacterDraft } from '../src/character/draft.ts'
import { emptySessionZero } from '../src/session-zero/types.ts'
import { effectiveFeat, featSlots, parseFeatChoices, selectedFeatRows } from '../src/feats/choices.ts'
import type { FeatChoices, FeatSlot } from '../src/feats/choices.ts'
import { availableFeats, featOptions, featWarnings } from '../src/feats/options.ts'
import { parseGmPackage, serializeGmPackage } from '../gm/package.ts'
import { tailoringBrief } from '../gm/brief.ts'

function character(characterClass = 'fighter', level = 5, background = ''): CharacterDraft {
  return { sessionZero: { answers: emptySessionZero, step: undefined }, buildDraft: { build: normalizeBuild({ characterClass, level, background }), step: 'feats', skills: undefined } }
}

test('feat progression follows class tables, including caster starts and extra skill feats', () => {
  const levels = (classId: string, kind: string) => featSlots(character(classId)).filter((s) => s.id.startsWith(`${kind}:`)).map((s) => s.level)
  assert.deepEqual(levels('fighter', 'class'), [1, 2, 4])
  assert.deepEqual(levels('wizard', 'class'), [2, 4])
  assert.deepEqual(levels('fighter', 'general'), [3])
  assert.deepEqual(levels('fighter', 'skill'), [2, 4])
  assert.deepEqual(levels('rogue', 'skill'), [1, 2, 3, 4, 5])
  assert.deepEqual(levels('investigator', 'skill'), [2, 3, 4, 5])
  assert.match(featSlots(character('investigator')).find((s) => s.id === 'skill:3')!.guidance!, /methodology/)
  assert.equal(featSlots(character('wizard', 1)).some((s) => s.id.startsWith('class:')), false)
})

test('background and class feats are already granted rather than spending normal slots', () => {
  const draft = character('fighter', 1, 'charlatan')
  const selected = selectedFeatRows(draft).map((row) => row.choice.id)
  assert.deepEqual(selected.sort(), ['charming-liar', 'shield-block'])
  assert.ok(selectedFeatRows(character('alchemist', 1, 'scholar')).some((r) => r.choice.id === 'assurance'))
  assert.ok(selectedFeatRows(character('alchemist', 1)).some((r) => r.choice.id === 'alchemical-crafting'))
  // Foundry uses a Pet item internally for a witch's familiar; it is not a feat grant.
  assert.ok(!selectedFeatRows(character('witch', 1)).some((r) => r.choice.id === 'pet'))
  assert.ok(selectedFeatRows(character('fighter', 1, 'bookkeeper')).some((r) => r.name === 'Eye for Numbers'))
})

test('heritages and ancestry feats add separate choices with their own level limits', () => {
  const draft = { ...character('fighter', 13), ancestryChoices: {
    heritage: { id: 'versatile-human', notes: '' },
    feats: { 1: { id: 'natural-ambition', notes: '' }, 5: { id: 'general-training', notes: '' }, 13: { id: 'advanced-general-training', notes: '' } },
  } }
  const slots = featSlots(draft)
  assert.equal(slots.find((s) => s.source === 'Versatile Human')?.maxLevel, 1)
  assert.equal(slots.find((s) => s.source === 'Natural Ambition')?.maxLevel, 1)
  assert.equal(slots.find((s) => s.source === 'General Training')?.maxLevel, 1)
  assert.equal(slots.find((s) => s.source === 'Advanced General Training')?.maxLevel, 7)
  const elf = { ...character('fighter', 1), ancestryChoices: { heritage: { id: 'ancient-elf', notes: '' }, feats: {} } }
  elf.buildDraft.build = normalizeBuild({ ...elf.buildDraft.build, ancestry: 'elf' })
  const dedication = featSlots(elf).find((s) => s.kind === 'dedication')!
  assert.equal(dedication.level, 1)
  assert.equal(dedication.maxLevel, 2)
  const options = availableFeats(dedication, elf)
  assert.ok(options.some((row) => row.id === 'wizard-dedication'))
  assert.ok(!options.some((row) => row.id === 'fighter-dedication'))
})

test('bonus ancestry choices can grant further choices without consuming standard slots', () => {
  const draft = character('fighter', 5)
  draft.featChoices = { choices: {
    'general:3': { id: 'ancestral-paragon', notes: '' },
    'grant:general:3:ancestral-paragon': { id: 'ancestry:general-training', notes: '' },
    'grant:grant:general:3:ancestral-paragon:general-training': { id: 'toughness', notes: '' },
  }, extra: [] }
  assert.ok(selectedFeatRows(draft).some((row) => row.choice.id === 'toughness'))
  assert.equal(featSlots(draft).filter((s) => s.id === 'general:3').length, 1)
  assert.deepEqual(featWarnings(draft), [])
})

test('fighter flexibility has its own daily feat slots and caps', () => {
  const slots = featSlots(character('fighter', 15))
  assert.equal(slots.find((s) => s.id === 'flexibility:9')?.maxLevel, 8)
  assert.equal(slots.find((s) => s.id === 'flexibility:15')?.maxLevel, 14)
  assert.match(slots.find((s) => s.id === 'flexibility:9')!.guidance!, /daily preparations/)
  assert.ok(!featSlots(character('fighter', 8)).some((s) => s.id.startsWith('flexibility:')))
})

test('suggestions distinguish class, skill, general, and optional archetype feats', () => {
  const draft = character('fighter', 3)
  const slot: FeatSlot = { id: 'class:2', kind: 'class', level: 2, maxLevel: 2, label: 'Class feat', source: 'Fighter' }
  assert.ok(availableFeats(slot, draft).some((row) => row.id === 'sudden-charge'))
  assert.ok(!availableFeats(slot, draft).some((row) => row.traits.includes('archetype')))
  assert.ok(availableFeats(slot, draft, true).some((row) => row.traits.includes('archetype')))
  assert.ok(availableFeats({ ...slot, kind: 'general' }, draft).some((row) => row.id === 'battle-medicine'))
  assert.ok(!availableFeats({ ...slot, kind: 'skill' }, draft).some((row) => row.id === 'fleet'))
  assert.ok(availableFeats({ ...slot, classOnly: true }, draft, true).every((row) => !row.traits.includes('archetype')))
})

test('choices and manual grants survive changes, older files, and player/GM round trips', () => {
  const draft = character('fighter', 15, 'charlatan')
  const plan: FeatChoices = { choices: {
    'class:1': { id: 'sudden-charge', notes: 'Keep literal\n## notes' },
    'general:3': { id: 'fleet', notes: '' },
    'skill:2': { id: 'assurance', notes: 'Medicine' },
    'flexibility:15': { id: 'custom', notes: 'Choose during daily preparations.' },
    'extra:test-slot': { id: 'custom', notes: 'A subclass-granted feat.' },
  }, extra: [{ id: 'extra:test-slot', kind: 'class', level: 1, maxLevel: 1, source: 'My subclass' }] }
  draft.featChoices = plan
  assert.deepEqual(parseFeatChoices(plan), plan)
  assert.deepEqual(parseCharacter(serializeCharacter(draft)), draft)
  assert.deepEqual(parseGmPackage(serializeGmPackage({ character: draft, sessionNotes: 'GM edits' })), { character: draft, sessionNotes: 'GM edits' })
  const changed = { ...draft, buildDraft: { ...draft.buildDraft, build: normalizeBuild({ characterClass: 'wizard', level: 2 }) } }
  assert.deepEqual(parseCharacter(serializeCharacter(changed))?.featChoices, plan)
  assert.ok(!featSlots(changed).some((slot) => slot.id === 'flexibility:15'))
  assert.match(tailoringBrief(draft), /Sudden Charge/)
  assert.ok(tailoringBrief(draft).includes('\\#\\# notes'))
  assert.doesNotMatch(serializeCharacter(draft), /Closing of the Mouth|sessionNotes/)
  const old = character()
  assert.equal(parseCharacter(serializeCharacter(old))?.featChoices, undefined)
  const fixed = featSlots(draft).find((slot) => slot.fixed)!
  assert.ok(effectiveFeat(fixed, plan))
})

test('incompatible selections are advisory and malformed data is rejected', () => {
  const draft = character('wizard', 3)
  draft.featChoices = { choices: { 'class:2': { id: 'sudden-charge', notes: '' }, 'general:3': { id: 'fleet', notes: '' }, 'extra:test': { id: 'fleet', notes: '' } }, extra: [{ id: 'extra:test', kind: 'general', level: 1, maxLevel: 1, source: '' }] }
  const before = serializeCharacter(draft)
  assert.match(featWarnings(draft).join(' '), /Review Sudden Charge/)
  assert.match(featWarnings(draft).join(' '), /more than once/)
  assert.equal(serializeCharacter(draft), before)
  for (const bad of [
    null, [], { choices: {}, extra: [], unknown: true },
    { choices: { 'class:2': { id: 'missing', notes: '' } }, extra: [] },
    { choices: { 'class:2': { id: 'fleet', notes: null } }, extra: [] },
    { choices: {}, extra: [{ id: 'extra:test', kind: 'class', level: 0, maxLevel: 2, source: '' }] },
    { choices: {}, extra: [{ id: 'extra:test', kind: 'class', level: 1, maxLevel: 2, source: '', extra: true }] },
  ]) assert.equal(parseFeatChoices(bad), null)
})

test('every catalog entry has plain-text rules and only the two Remaster books are included', () => {
  assert.equal(featOptions.length, 1418)
  const cache = new Map<string, Record<string, string>>()
  for (const option of featOptions) {
    if (!cache.has(option.rulesGroup)) cache.set(option.rulesGroup, JSON.parse(readFileSync(new URL(`../src/content/feat-rules/${option.rulesGroup}.json`, import.meta.url), 'utf8')))
    const text = cache.get(option.rulesGroup)![option.id]
    assert.ok(text, option.name)
    assert.ok(['Player Core', 'Player Core 2'].includes(option.source))
    assert.doesNotMatch(text, /@(?:UUID|actor|self|item|Check|Damage|Template)|\[\[|<[^>]+>|Closing of the Mouth|House Verathe/, option.name)
  }
})
