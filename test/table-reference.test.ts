import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeBuild } from '../src/attributes/build.ts'
import { newCharacterDraft } from '../src/character/library.ts'
import { tableReference } from '../src/character/table-reference.ts'
import { emptySkillPlan } from '../src/skills/plan.ts'
import { emptySpellChoices, newSpellChoice } from '../src/spells/choices.ts'

const build = normalizeBuild({
  ancestry: 'dwarf', ancestryBoosts: ['dex'],
  background: 'nomad', backgroundBoosts: ['wis', 'con'],
  characterClass: 'druid', boosts: { 1: ['wis', 'str', 'dex', 'con'] },
})

test('table checks distinguish recorded ranks, missing plans, and unfinished boosts', () => {
  const character = newCharacterDraft()
  const completed = { ...character, buildDraft: { ...character.buildDraft, build } }
  const check = (draft: typeof character) => tableReference(draft).checks.find(({ id }) => id === 'thievery')
  assert.deepEqual(check(completed), {
    id: 'thievery', name: 'Thievery', action: 'Pick a Lock (trained)', rank: null, base: null,
  })
  const skills = { ...emptySkillPlan, trained: ['thievery' as const] }
  const planned = { ...completed, buildDraft: { ...completed.buildDraft, skills } }
  assert.equal(check(planned)?.base, 5)
  assert.equal(check(planned)?.rank, 'Trained')
  assert.equal(tableReference(planned).wisdom, 4)
  assert.equal(check({ ...planned, buildDraft: { ...planned.buildDraft, build: normalizeBuild() } })?.base, null)
})

test('table reference limits carried gear and excludes learned, inactive, and duplicate spell entries', () => {
  const character = newCharacterDraft()
  const reference = tableReference({
    ...character,
    buildDraft: { ...character.buildDraft, build: normalizeBuild({ characterClass: 'wizard' }) },
    equipmentPlan: {
      startingWealthCp: null,
      items: Array.from({ length: 7 }, (_, i) => ({ id: `gear-${i}`, name: `Gear ${i}`, quantity: 2, priceCp: 0, bulkLight: 0, carried: i > 0 })),
    },
    spellChoices: {
      ...emptySpellChoices,
      choices: {
        'wizard:cantrip:0:0': newSpellChoice('daze'),
        'wizard:cantrip:0:1': newSpellChoice('daze'),
        'wizard:learned-cantrip:0:0': newSpellChoice('light'),
        'wizard:prepared:2:0': newSpellChoice('invisibility'),
      },
    },
  })
  assert.deepEqual(reference.gear.map(({ name }) => name), ['Gear 1', 'Gear 2', 'Gear 3', 'Gear 4', 'Gear 5'])
  assert.equal(reference.moreGear, 1)
  assert.deepEqual(reference.spells.map(({ name, use }) => [name, use]), [['Daze', 'Cantrip']])
})
