import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { normalizeBuild } from '../src/attributes/build.ts'
import { parseCharacter, serializeCharacter } from '../src/character/draft.ts'
import type { CharacterDraft } from '../src/character/draft.ts'
import { emptySessionZero } from '../src/session-zero/types.ts'
import { dailySlots, emptySpellChoices, newSpellChoice, parseSpellChoices, selectedSpellRows, spellSlots, spellTradition } from '../src/spells/choices.ts'
import type { SpellChoices } from '../src/spells/choices.ts'
import { availableSpells, inactiveSpellRows, spellOptions, spellWarnings } from '../src/spells/options.ts'
import { parseGmPackage, serializeGmPackage } from '../gm/package.ts'
import { tailoringBrief } from '../gm/brief.ts'

function character(characterClass = 'wizard', level = 1, spellChoices?: SpellChoices): CharacterDraft {
  return { sessionZero: { answers: emptySessionZero, step: undefined }, buildDraft: { build: normalizeBuild({ characterClass, level }), step: 'spells', skills: undefined }, ...(spellChoices ? { spellChoices } : {}) }
}
function plan(patch: Partial<SpellChoices> = {}): SpellChoices { return { ...structuredClone(emptySpellChoices), ...patch } }

test('normal spell slot counts match prepared and spontaneous class tables at rank boundaries', () => {
  for (const id of ['wizard', 'witch', 'cleric', 'druid', 'bard']) {
    assert.equal(dailySlots(id, 1, 1), 2)
    assert.equal(dailySlots(id, 2, 1), 3)
    assert.equal(dailySlots(id, 3, 2), 2)
    assert.equal(dailySlots(id, 4, 2), 3)
    assert.equal(dailySlots(id, 18, 9), 3)
    assert.equal(dailySlots(id, 18, 10), 0)
    assert.equal(dailySlots(id, 19, 10), 1)
  }
  for (const id of ['sorcerer', 'oracle']) {
    assert.equal(dailySlots(id, 1, 1), 3)
    assert.equal(dailySlots(id, 2, 1), 4)
    assert.equal(dailySlots(id, 3, 2), 3)
    assert.equal(dailySlots(id, 20, 9), 4)
    assert.equal(dailySlots(id, 20, 10), 1)
  }
  assert.equal(dailySlots('fighter', 20, 1), 0)
  for (const id of ['bard', 'oracle', 'sorcerer']) assert.equal(spellSlots(character(id, 19)).filter((s) => s.kind === 'repertoire' && s.rank === 10).length, 2)
})

test('cantrips, focus spells, and subclass gifts do not spend normal ranked slots', () => {
  const bard = spellSlots(character('bard'))
  assert.equal(bard.filter((s) => s.kind === 'cantrip').length, 5)
  assert.equal(bard.filter((s) => s.kind === 'repertoire' && !s.granted).length, 2)
  assert.equal(bard.filter((s) => s.kind === 'repertoire' && s.granted).length, 1)
  assert.deepEqual(bard.filter((s) => s.fixed).map((s) => s.fixed), ['courageous-anthem', 'counter-performance'])
  const oracle = spellSlots(character('oracle'))
  assert.equal(oracle.filter((s) => s.kind === 'repertoire' && !s.granted).length, 3)
  assert.equal(oracle.filter((s) => s.kind === 'cantrip').length, 6)
  const sorcerer = spellSlots(character('sorcerer', 3))
  assert.equal(sorcerer.filter((s) => s.kind === 'repertoire').length, 7)
  assert.equal(sorcerer.filter((s) => s.kind === 'repertoire' && s.granted).length, 2)
  assert.equal(sorcerer.filter((s) => s.kind === 'cantrip').length, 5)
})

test('wizard and witch learning is distinct from preparation, including school and patron additions', () => {
  const wizard = spellSlots(character('wizard', 3, plan({ wizardSchool: 'curriculum' })))
  assert.equal(wizard.filter((s) => s.kind === 'cantrip').length, 6)
  assert.equal(wizard.filter((s) => s.kind === 'prepared').length, 7)
  assert.equal(wizard.filter((s) => s.kind === 'learned').length, 22) // 10 cantrips + 5 + 4 level gains + 2 school + 1 new rank
  assert.equal(wizard.find((s) => s.id.includes('learned-level-2'))?.rank, 1)
  assert.equal(wizard.find((s) => s.id.includes('learned-level-3'))?.rank, 2)
  const unified = spellSlots(character('wizard', 1, plan({ wizardSchool: 'unified' })))
  assert.equal(unified.filter((s) => s.kind === 'prepared').length, 2)
  const witch = spellSlots(character('witch'))
  assert.equal(witch.filter((s) => s.kind === 'learned').length, 16)
  assert.equal(witch.filter((s) => s.kind === 'focus').length, 2)
})

test('cleric font adds its own fixed preparations and follows the selected level', () => {
  for (const [level, count] of [[1, 4], [5, 5], [15, 6], [19, 6]]) {
    const font = spellSlots(character('cleric', level, plan({ font: 'heal' }))).filter((s) => s.fixed === 'heal')
    assert.equal(font.length, count)
    assert.ok(font.every((s) => s.rank === Math.ceil(level / 2)))
  }
  assert.equal(spellSlots(character('cleric')).some((s) => s.source === 'Divine font'), false)
})

test('suggestions follow tradition and rank and keep focus cantrips out of ordinary choices', () => {
  const draft = character('wizard', 3)
  const slots = spellSlots(draft)
  const cantrips = availableSpells(slots.find((s) => s.kind === 'cantrip')!)
  assert.ok(cantrips.some((s) => s.id === 'detect-magic'))
  assert.ok(!cantrips.some((s) => s.id === 'courageous-anthem'))
  const first = slots.find((s) => s.kind === 'prepared' && s.rank === 1)!
  assert.ok(!availableSpells(first).some((s) => s.id === 'heal' || s.rank > 1 || s.cantrip || s.granted))
  assert.ok(availableSpells(first, { ...newSpellChoice('heal'), grantedAccess: true }).some((s) => s.id === 'heal'))
  assert.equal(spellTradition(character('witch')), '')
  const witch = character('witch', 1, plan({ traditions: { witch: 'primal', sorcerer: '' } }))
  assert.equal(spellTradition(witch), 'primal')
  assert.ok(availableSpells(spellSlots(witch).find((s) => s.kind === 'prepared')!).some((s) => s.id === 'heal'))
})

test('prepared repeats are legal, while duplicate known spells and excess signatures are advisory', () => {
  const p = plan({ choices: {
    'wizard:prepared:1:0': newSpellChoice('charm'),
    'wizard:prepared:1:1': newSpellChoice('charm'),
    'wizard:learned-start:1:0': newSpellChoice('charm'),
  } })
  assert.deepEqual(spellWarnings(character('wizard', 1, p)), [])
  const s = plan({ choices: { 'bard:repertoire:1:0': { ...newSpellChoice('charm'), signature: true }, 'bard:repertoire:1:1': { ...newSpellChoice('charm'), signature: true } } })
  assert.ok(spellWarnings(character('bard', 3, s)).some((w) => w.includes('one signature')))
  assert.ok(spellWarnings(character('bard', 3, s)).some((w) => w.includes('more than once')))
  assert.ok(spellWarnings(character('bard', 1, s)).some((w) => w.includes('from level 3')))
})

test('innate rank and frequency stay fixed while focus spells heighten and future grants stay inactive', () => {
  const p = plan({ extra: [
    { id: 'extra:innate', kind: 'innate', rank: 1, level: 1, source: 'Ancestry', frequency: 'once per day' },
    { id: 'extra:focus', kind: 'focus', rank: 1, level: 1, source: 'Feat', frequency: '1 Focus Point' },
    { id: 'extra:cantrip', kind: 'innate', rank: 0, level: 1, source: 'Heritage', frequency: 'at will' },
    { id: 'extra:future', kind: 'repertoire', rank: 5, level: 9, source: 'Mystery', frequency: '' },
  ], choices: { 'extra:innate': newSpellChoice('charm') } })
  const slots = spellSlots(character('fighter', 5, p))
  assert.equal(slots.find((s) => s.id === 'extra:innate')?.rank, 1)
  assert.equal(slots.find((s) => s.id === 'extra:focus')?.rank, 3)
  assert.equal(slots.find((s) => s.id === 'extra:cantrip')?.rank, 0)
  assert.ok(!slots.some((s) => s.id === 'extra:future'))
  assert.equal(selectedSpellRows(character('fighter', 5, p))[0].slot.frequency, 'once per day')
})

test('class and level changes preserve inactive choices without counting them in the current plan', () => {
  const p = plan({ choices: { 'wizard:prepared:2:0': newSpellChoice('invisibility') } })
  const lowered = character('wizard', 1, p)
  assert.equal(selectedSpellRows(lowered).length, 0)
  assert.equal(inactiveSpellRows(lowered)[0].name, 'Invisibility')
  assert.equal(selectedSpellRows(character('wizard', 3, p)).length, 1)
  assert.equal(inactiveSpellRows(character('bard', 3, p)).length, 1)
})

test('spell choices round-trip through character saves and GM packages, including literal GM-note text', () => {
  const p = plan({ notes: 'School: Unified Magical Theory', choices: { 'wizard:prepared:1:0': { ...newSpellChoice('charm'), notes: '# Heading\n[link](https://example.test)' } } })
  const draft = character('wizard', 1, p)
  assert.deepEqual(parseCharacter(serializeCharacter(draft)), draft)
  const pack = serializeGmPackage({ character: draft, sessionNotes: 'Edited notes\n' })
  assert.deepEqual(parseGmPackage(pack)?.character, draft)
  assert.equal(parseGmPackage(pack)?.sessionNotes, 'Edited notes\n')
  assert.equal(parseCharacter(pack), null)
  assert.ok(tailoringBrief(draft).includes('\\# Heading'))
  assert.ok(tailoringBrief(draft).includes('> \\[link\\]\\(https://example\\.test\\)'))
  assert.ok(tailoringBrief(draft).includes('Charm'))
  assert.equal(parseCharacter(serializeCharacter(character()))?.spellChoices, undefined)
})

test('malformed spell plans are rejected rather than silently dropping data', () => {
  for (const p of [
    { ...plan(), font: 'both' }, { ...plan(), traditions: { witch: 'fire', sorcerer: '' } },
    { ...plan(), extraField: true }, { ...plan(), choices: { invalid: newSpellChoice('charm') } },
    { ...plan(), choices: { 'extra:one': newSpellChoice('unknown-spell') } },
    { ...plan(), choices: { 'extra:one': { ...newSpellChoice('charm'), signature: 'yes' } } },
    { ...plan(), extra: [{ id: 'extra:one', kind: 'innate', rank: 11, level: 1, source: '', frequency: '' }] },
  ]) {
    assert.equal(parseSpellChoices(p), null)
    const file = JSON.parse(serializeCharacter(character()))
    assert.equal(parseCharacter(JSON.stringify({ ...file, spellChoices: p })), null)
  }
})

test('the licensed catalog excludes rituals and executable annotations and covers all four traditions', () => {
  assert.equal(spellOptions.length, 626)
  assert.equal(new Set(spellOptions.map((s) => s.id)).size, 626)
  assert.ok(spellOptions.every((s) => ['Player Core', 'Player Core 2'].includes(s.source)))
  for (const tradition of ['arcane', 'divine', 'occult', 'primal']) assert.ok(spellOptions.some((s) => s.traditions.includes(tradition)))
  const groups = new Map<string, Record<string, string>>()
  for (const option of spellOptions) {
    if (!groups.has(option.rulesGroup)) groups.set(option.rulesGroup, JSON.parse(readFileSync(new URL(`../src/content/spell-rules/${option.rulesGroup}.json`, import.meta.url), 'utf8')))
    const rules = groups.get(option.rulesGroup)![option.id]
    assert.ok(rules?.length > 10, option.id)
    assert.doesNotMatch(rules, /@\w|\[\[|<[^>]+>|Closing of the Mouth|Kantharos of Silence/, option.id)
  }
  assert.ok(groups.get('rank-1')!.heal.includes('Heightened'))
})
