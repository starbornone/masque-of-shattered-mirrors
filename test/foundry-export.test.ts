import assert from 'node:assert/strict'
import test from 'node:test'
import { calculate, normalizeBuild } from '../src/attributes/build.ts'
import { parseCharacter } from '../src/character/draft.ts'
import type { CharacterDraft } from '../src/character/draft.ts'
import { createFoundryActor, serializeFoundryActor } from '../src/character/foundry.ts'
import { emptySessionZero } from '../src/session-zero/types.ts'
import { emptySpellChoices, newSpellChoice } from '../src/spells/choices.ts'

const build = normalizeBuild({
  ancestry: 'human', background: 'charlatan', characterClass: 'wizard', level: 3,
  key: 'int', ancestryBoosts: ['dex', 'int'], backgroundBoosts: ['cha', 'int'],
  boosts: { 1: ['dex', 'con', 'int', 'wis'] },
})
const draft: CharacterDraft = {
  sessionZero: { answers: { ...emptySessionZero, invitationReason: 'PRIVATE_CAMPAIGN_ANSWER', mask: 'PRIVATE_MASK' } },
  buildDraft: { build, step: 'review', skills: { lore: ['Art'], trained: ['arcana', 'lore:art'], choices: { 'increase:3': 'arcana' } } },
  ancestryChoices: { heritage: { id: 'versatile-human', notes: '' }, feats: { 1: { id: 'natural-ambition', notes: '' } } },
  spellChoices: {
    ...emptySpellChoices,
    choices: { 'wizard:cantrip:0:0': { ...newSpellChoice('detect-magic'), notes: '<script>bad</script> @UUID[Macro.bad] [[/r 1d20]]' } },
  },
  equipmentPlan: {
    startingWealthCp: 1005,
    items: [
      { id: 'dagger', name: 'Dagger', priceCp: 20, bulkLight: 1, quantity: 1, carried: true },
      { id: 'arrows', name: 'Arrows (10)', priceCp: 10, bulkLight: 1, quantity: 2, carried: false },
      { id: 'kit', name: "Adventurer's Pack", priceCp: 150, bulkLight: 10, quantity: 1, carried: true },
      { id: 'custom', name: 'Silver Mask', priceCp: 10, bulkLight: 1, quantity: 1, carried: true },
    ],
  },
}

test('exports PF2e character source fields and real skill and Lore ranks', () => {
  const actor = createFoundryActor(draft, '  Selene  ')
  assert.equal(actor.name, 'Selene')
  assert.equal(actor.type, 'character')
  assert.equal(actor.system.details.level.value, 3)
  assert.equal(actor.system.details.keyability?.value, 'int')
  assert.equal(actor.system._migration.version, 0.961)
  assert.equal(actor._stats.systemId, 'pf2e')
  assert.equal(actor._stats.systemVersion, '8.7.0')
  for (const { id, total } of calculate(build).rows) assert.equal(actor.system.abilities[id].mod, total)
  assert.equal(actor.system.skills.arcana.rank, 2)
  assert.equal(actor.system.skills['lore:art'], undefined)
  const lore = actor.items.find(({ type }) => type === 'lore')
  assert.equal(lore?.name, 'Art Lore')
  assert.deepEqual(lore?.system.proficient, { value: 1 })
})

test('exports native gear, ammunition units, custom equipment, and only unspent coins', () => {
  const { items } = createFoundryActor(draft, '')
  const find = (name: string) => items.find((item) => item.name === name)
  assert.equal(find('Dagger')?.type, 'weapon')
  assert.match(find('Dagger')?._stats?.compendiumSource ?? '', /^Compendium\.pf2e\.equipment-srd\.Item\.[\da-zA-Z]{16}$/)
  assert.equal(find('Arrows')?.type, 'ammo')
  assert.equal(find('Arrows')?.system.quantity, 20)
  assert.deepEqual(find('Arrows')?.system.equipped, { carryType: 'dropped', inSlot: false, handsHeld: 0 })
  assert.equal(find("Adventurer's Pack")?.type, 'equipment')
  assert.equal(find('Silver Mask')?.type, 'equipment')
  assert.equal(find('Gold Pieces')?.type, 'treasure')
  assert.equal(find('Gold Pieces')?.system.quantity, 8)
  assert.equal(find('Copper Pieces')?.system.quantity, 5)
  assert.equal(find('Silver Pieces'), undefined)
  assert.ok(items.every(({ _id }) => /^[a-zA-Z0-9]{16}$/.test(_id)))
  assert.equal(new Set(items.map(({ _id }) => _id)).size, items.length)
  for (const startingWealthCp of [null, 0]) {
    const lowBudget = createFoundryActor({ ...draft, equipmentPlan: { ...draft.equipmentPlan!, startingWealthCp } }, '')
    assert.ok(!lowBudget.items.some(({ type }) => type === 'treasure'))
  }
})

test('exports compendium links and inert notes without leaking private fields', () => {
  const serialized = serializeFoundryActor({
    ...draft,
    sessionNotes: 'SECRET_GM_NOTES',
    tailoringBrief: 'SECRET_TAILORING',
  } as CharacterDraft, '')
  const actor = JSON.parse(serialized)
  const notes = actor.system.details.biography.campaignNotes as string
  assert.match(notes, /@UUID\[Compendium\.pf2e\.ancestries\.Item\.[a-zA-Z0-9]{16}\]\{Human\}/)
  assert.match(notes, /@UUID\[Compendium\.pf2e\.classes\.Item\.[a-zA-Z0-9]{16}\]\{Wizard\}/)
  assert.match(notes, /@UUID\[Compendium\.pf2e\.spells-srd\.Item\.[a-zA-Z0-9]{16}\]\{Detect Magic\}/)
  assert.match(notes, /Natural Ambition/)
  assert.match(notes, /&lt;script&gt;/)
  assert.doesNotMatch(notes, /<script>|@UUID\[Macro\.|\[\[\/r/)
  assert.doesNotMatch(serialized, /PRIVATE_CAMPAIGN_ANSWER|PRIVATE_MASK|SECRET_GM_NOTES|SECRET_TAILORING|masque-gm-package/)
  assert.equal(parseCharacter(serialized), null)
})

test('exports a usable draft file before optional planning steps are complete', () => {
  const actor = createFoundryActor({ sessionZero: { answers: emptySessionZero }, buildDraft: { build: normalizeBuild({}), step: null } }, '')
  assert.equal(actor.name, 'Masque Character')
  assert.deepEqual(actor.items, [])
  assert.deepEqual(actor.system.skills, {})
  assert.match(actor.system.details.biography.campaignNotes, /attribute boosts remain/)
})
