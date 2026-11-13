import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeBuild } from '../src/attributes/build.ts'
import { parseBuildDraft, serializeBuildDraft } from '../src/attributes/draft.ts'
import { canAssignSkills, emptySkillPlan, evaluateSkillPlan, recordedPrerequisiteRanks } from '../src/skills/plan.ts'
import type { SkillPlan } from '../src/skills/plan.ts'

const boosts = ['int', 'dex', 'wis', 'cha']
const investigator = normalizeBuild({
  level: 15,
  ancestryBoosts: ['int', 'dex'],
  background: 'custom',
  backgroundBoosts: ['int', 'wis'],
  characterClass: 'investigator',
  boosts: { 1: boosts, 5: boosts, 10: boosts, 15: boosts },
})

test('only a completed attribute ledger qualifies for skill assignment', () => {
  assert.equal(canAssignSkills(investigator), true)
  assert.equal(canAssignSkills(normalizeBuild({ ...investigator, backgroundBoosts: ['int'] })), false)
})

test('skill increase schedules follow class and level', () => {
  const levels = (characterClass: string) =>
    evaluateSkillPlan(normalizeBuild({ level: 7, characterClass }), emptySkillPlan).slots.map(({ level }) => level)
  assert.deepEqual(levels('bard'), [3, 5, 7])
  assert.deepEqual(levels('rogue'), [2, 3, 4, 5, 6, 7])
  assert.deepEqual(levels('investigator'), [2, 3, 4, 5, 6, 7])
})

test('respects rank prerequisites and grants training only when Intelligence increases', () => {
  const plan: SkillPlan = {
    lore: [],
    trained: ['society'],
    choices: {
      'increase:2': 'society',
      'increase:3': 'society',
      'increase:7': 'society',
      'increase:14': 'society',
      'increase:15': 'society',
      'intelligence:10': 'stealth',
    },
  }
  const { rows, slots } = evaluateSkillPlan(investigator, plan)
  assert.deepEqual(slots.filter(({ kind }) => kind === 'intelligence').map(({ level }) => level), [10])
  assert.equal(slots.find(({ id }) => id === 'increase:3')?.selected, '')
  assert.equal(slots.find(({ id }) => id === 'increase:14')?.selected, '')
  assert.equal(rows.find(({ id }) => id === 'society')?.rank, 'Legendary')
  assert.equal(rows.find(({ id }) => id === 'society')?.modifier, 28)
  assert.equal(rows.find(({ id }) => id === 'stealth')?.rank, 'Trained')
  assert.equal(rows.find(({ id }) => id === 'athletics')?.modifier, 0)
  const changed = evaluateSkillPlan(investigator, { ...plan, trained: [] })
  assert.equal(changed.rows.find(({ id }) => id === 'society')?.rank, 'Legendary')
  assert.equal(changed.slots.find(({ id }) => id === 'increase:3')?.selected, 'society')
})

test('named Lore and skill choices survive a draft round trip', () => {
  const skills: SkillPlan = { lore: ['Heraldry'], trained: ['lore:heraldry'], choices: { 'increase:2': 'lore:heraldry' } }
  const draft = { build: investigator, step: 'skills' as const, skills }
  assert.deepEqual(parseBuildDraft(serializeBuildDraft(draft)), draft)
  const saved = JSON.parse(serializeBuildDraft(draft))
  saved.skills.lore = []
  const restored = parseBuildDraft(JSON.stringify(saved))
  assert.deepEqual(restored?.skills, emptySkillPlan)
})

test('feat guidance shows recorded ranks at the slot level without deciding eligibility', () => {
  const plan: SkillPlan = {
    lore: ['Warfare'],
    trained: ['society', 'lore:warfare'],
    choices: { 'increase:2': 'society', 'increase:7': 'society' },
  }
  const hints = (text: string, level: number) => recordedPrerequisiteRanks(text, investigator, plan, level)
    .map(({ name, rank }) => [name, rank])
  assert.deepEqual(hints('master in Society or Warfare Lore; Dedication', 2), [
    ['Society', 'Expert'], ['Warfare Lore', 'Trained'],
  ])
  assert.deepEqual(hints('trained in Society, and Thievery', 1), [
    ['Society', 'Trained'], ['Thievery', 'Untrained'],
  ])
  assert.deepEqual(hints('expert in unarmed attacks; Arcana feat', 7), [])
})
