import assert from 'node:assert/strict'
import test from 'node:test'
import { calculate, normalizeBuild } from '../src/attributes/build.ts'
import { assessCampaignFit } from '../src/attributes/campaign-fit.ts'

const fighter = {
  ancestry: 'human',
  ancestryBoosts: ['str', 'dex'],
  background: 'custom',
  backgroundBoosts: ['str', 'con'],
  characterClass: 'fighter',
  key: 'str',
  boosts: { 1: ['str', 'dex', 'con', 'wis'] },
}

test('flags a completed build concentrated in physical attributes', () => {
  const { modifiers, combatHeavy } = assessCampaignFit(normalizeBuild(fighter))
  assert.equal(modifiers.str, 4)
  assert.equal(modifiers.wis, 1)
  assert.equal(combatHeavy, true)
})

test('keeps the advisory out of unfinished and socially supported builds', () => {
  const unfinished = normalizeBuild({ ...fighter, backgroundBoosts: ['str'] })
  assert.equal(assessCampaignFit(unfinished).combatHeavy, false)

  const social = normalizeBuild({
    ...fighter,
    level: 5,
    ancestryBoosts: ['str', 'cha'],
    backgroundBoosts: ['str', 'cha'],
    boosts: { 1: ['str', 'dex', 'cha', 'con'], 5: ['str', 'dex', 'cha', 'con'] },
  })
  assert.equal(calculate(social).remaining, 0)
  assert.equal(assessCampaignFit(social).combatHeavy, false)
})

test('a high Dexterity modifier alone does not trigger the advisory', () => {
  const nimble = normalizeBuild({
    ...fighter,
    key: 'dex',
    ancestryBoosts: ['dex', 'cha'],
    backgroundBoosts: ['dex', 'int'],
    boosts: { 1: ['dex', 'str', 'con', 'wis'] },
  })
  assert.equal(calculate(nimble).remaining, 0)
  const { modifiers, combatHeavy } = assessCampaignFit(nimble)
  assert.equal(modifiers.dex, 4)
  assert.equal(combatHeavy, false)
})
