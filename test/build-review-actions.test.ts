import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeBuild } from '../src/attributes/build.ts'
import { newCharacterDraft } from '../src/character/library.ts'
import { buildReviewActions } from '../src/character/review-actions.ts'
import { effectiveSpell, emptySpellChoices, newSpellChoice, spellSlots } from '../src/spells/choices.ts'

const baseBuild = {
  ancestry: 'dwarf',
  ancestryBoosts: ['dex'],
  background: 'nomad',
  backgroundBoosts: ['wis', 'con'],
  characterClass: 'druid',
  boosts: { 1: ['wis', 'str', 'dex', 'con'] },
}

function draftWithBuild(input: unknown) {
  return { ...newCharacterDraft(), buildDraft: { build: normalizeBuild(input), step: 'review' as const } }
}

test('build review leads with unfinished foundations and shows at most three actions', () => {
  assert.deepEqual(buildReviewActions(newCharacterDraft()).map(({ step, kind }) => [step, kind]), [
    ['background', 'Unfinished'], ['class', 'Unfinished'], ['boosts', 'Unfinished'],
  ])
  const draft = draftWithBuild({ ...baseBuild, boosts: { 1: ['wis', 'str', 'dex'] } })
  const actions = buildReviewActions(draft)
  assert.deepEqual(actions[0], { step: 'boosts', label: 'Assign 1 attribute boost', kind: 'Unfinished' })
  assert.ok(!actions.some(({ step }) => step === 'skills'))
})

test('build review prioritizes training, then advisory checks, then optional choices', () => {
  const draft = {
    ...draftWithBuild(baseBuild),
    ancestryChoices: { heritage: { id: 'skilled-human', notes: '' }, feats: {} },
    equipmentPlan: { startingWealthCp: 0, items: [{ id: 'gear', name: 'Gear', priceCp: 5, bulkLight: 0, quantity: 1, carried: true }] },
  }
  assert.deepEqual(buildReviewActions(draft).map(({ step, kind }) => [step, kind]), [
    ['skills', 'Unfinished'], ['heritage', 'Check'], ['equipment', 'Check'],
  ])
  const withTraining = { ...draft, buildDraft: { ...draft.buildDraft, skills: { lore: [], trained: ['society' as const], choices: {} } } }
  assert.deepEqual(buildReviewActions(withTraining).map(({ step, kind }) => [step, kind]), [
    ['heritage', 'Check'], ['equipment', 'Check'], ['spells', 'Optional'],
  ])
})

test('build review omits recorded choices and fixed grants', () => {
  const draft = draftWithBuild(baseBuild)
  const spellChoices = {
    ...emptySpellChoices,
    choices: Object.fromEntries(spellSlots(draft).filter((slot) => !effectiveSpell(slot, emptySpellChoices))
      .map(({ id }) => [id, newSpellChoice('custom')])),
  }
  const filled = {
    ...draft,
    buildDraft: { ...draft.buildDraft, skills: { lore: [], trained: ['society' as const], choices: {} } },
    ancestryChoices: { heritage: { id: 'custom', notes: '' }, feats: { 1: { id: 'custom', notes: '' } } },
    spellChoices,
    equipmentPlan: { startingWealthCp: null, items: [{ id: 'gear', name: 'Gear', priceCp: 5, bulkLight: 0, quantity: 1, carried: true }] },
  }
  assert.deepEqual(buildReviewActions(filled), [])
})
