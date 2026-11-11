import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeBuild } from '../src/attributes/build.ts'
import { parseCharacter, serializeCharacter } from '../src/character/draft.ts'
import type { CharacterDraft } from '../src/character/draft.ts'
import { equipmentTotals, parseEquipmentAmount } from '../src/equipment/plan.ts'
import type { EquipmentPlan } from '../src/equipment/plan.ts'
import { emptySessionZero } from '../src/session-zero/types.ts'
import { parseGmPackage, serializeGmPackage } from '../gm/package.ts'

const build = normalizeBuild({ characterClass: 'fighter', key: 'str' })
const plan: EquipmentPlan = {
  startingWealthCp: null,
  items: [
    { id: 'armor', name: 'Full Plate', priceCp: 3000, bulkLight: 40, quantity: 1, carried: true },
    { id: 'toolkit', name: 'Repair Toolkit', priceCp: 200, bulkLight: 10, quantity: 2, carried: true },
    { id: 'torches', name: 'Torch', priceCp: 1, bulkLight: 1, quantity: 9, carried: true },
    { id: 'spare', name: 'Spare Gear', priceCp: 105, bulkLight: 90, quantity: 1, carried: false },
  ],
}

test('Bulk uses current Strength, rounds light items after summing, and excludes gear left behind', () => {
  const totals = equipmentTotals(plan, build)
  assert.equal(totals.costCp, 3514)
  assert.equal(totals.bulk, 6)
  assert.equal(totals.leftoverLight, 9)
  assert.equal(totals.encumbranceLimit, 6)
  assert.equal(totals.carryingLimit, 11)
  assert.equal(totals.encumbered, false)
  assert.equal(totals.provisional, true)

  const packMore = { ...plan, items: plan.items.map((item) => item.id === 'torches' ? { ...item, quantity: 10 } : item) }
  assert.equal(equipmentTotals(packMore, build).bulk, 7)
  assert.equal(equipmentTotals(packMore, build).encumbered, true)
  const carryEverything = { ...plan, items: plan.items.map((item) => ({ ...item, carried: true })) }
  assert.equal(equipmentTotals(carryEverything, build).overCapacity, true)
})

test('starting wealth distinguishes an unset amount from zero and accounts in exact copper', () => {
  assert.equal(equipmentTotals(plan, build).balanceCp, null)
  assert.equal(equipmentTotals({ ...plan, startingWealthCp: 0 }, build).balanceCp, -3514)
  assert.equal(equipmentTotals({ ...plan, startingWealthCp: 3515 }, build).balanceCp, 1)
  assert.equal(parseEquipmentAmount('.05', 2, 1000), 5)
  assert.equal(parseEquipmentAmount('3.14', 2, 1000), 314)
  assert.equal(parseEquipmentAmount('0.015', 2, 1000), null)
  assert.equal(parseEquipmentAmount('1.2', 0, 1000), null)
})

test('player and GM files preserve the equipment plan and accept older exports', () => {
  const previous: CharacterDraft = {
    sessionZero: { answers: emptySessionZero, step: undefined },
    buildDraft: { build, step: 'spells', skills: undefined },
  }
  const draft: CharacterDraft = { ...previous, buildDraft: { ...previous.buildDraft, step: 'equipment' }, equipmentPlan: { ...plan, startingWealthCp: 4000 } }
  const exported = serializeCharacter(draft)
  assert.deepEqual(parseCharacter(exported), draft)
  assert.deepEqual(parseCharacter(serializeCharacter(previous)), previous)
  assert.deepEqual(parseGmPackage(serializeGmPackage({ character: draft, sessionNotes: 'GM notes' }))?.character, draft)
  const invalid = JSON.parse(exported)
  invalid.equipmentPlan.items[0].quantity = -1
  assert.equal(parseCharacter(JSON.stringify(invalid)), null)
})
