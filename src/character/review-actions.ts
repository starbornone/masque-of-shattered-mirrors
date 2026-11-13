import { ancestryChoiceWarnings, ancestryFeatLevels, emptyAncestryChoices } from '../ancestry/choices.ts'
import { calculate } from '../attributes/build.ts'
import type { BuildStep } from '../attributes/draft.ts'
import { equipmentTotals } from '../equipment/plan.ts'
import { effectiveFeat, emptyFeatChoices, featSlots } from '../feats/choices.ts'
import { evaluateSkillPlan } from '../skills/plan.ts'
import { effectiveSpell, emptySpellChoices, spellSlots } from '../spells/choices.ts'
import type { CharacterDraft } from './draft.ts'

export type ReviewAction = {
  step: Exclude<BuildStep, 'review'>
  label: string
  kind: 'Unfinished' | 'Check' | 'Optional'
}

export function buildReviewActions(character: CharacterDraft): ReviewAction[] {
  const { build, skills } = character.buildDraft
  const { remaining } = calculate(build)
  const unfinished: ReviewAction[] = []
  const checks: ReviewAction[] = []
  const optional: ReviewAction[] = []

  if (!build.background) unfinished.push({ step: 'background', label: 'Choose a background', kind: 'Unfinished' })
  if (!build.key) unfinished.push({
    step: 'class',
    label: build.characterClass ? 'Choose a class key attribute' : 'Choose a class',
    kind: 'Unfinished',
  })
  if (remaining > 0) {
    unfinished.push({
      step: 'boosts',
      label: build.background && build.key ? `Assign ${remaining} attribute ${remaining === 1 ? 'boost' : 'boosts'}` : 'Assign attribute boosts',
      kind: 'Unfinished',
    })
  } else {
    const slots = skills ? evaluateSkillPlan(build, skills).slots : []
    if (slots.some(({ id, selected }) => !selected && skills?.choices[id])) {
      checks.push({ step: 'skills', label: 'Review saved skill increases', kind: 'Check' })
    } else if (!skills?.trained.length || slots.some(({ selected }) => !selected)) {
      unfinished.push({
        step: 'skills',
        label: skills?.trained.length ? 'Assign remaining skill increases' : 'Plan starting skill training',
        kind: 'Unfinished',
      })
    }
  }

  const ancestry = character.ancestryChoices ?? emptyAncestryChoices
  if (ancestryChoiceWarnings(ancestry, build.ancestry, build.level).length) {
    checks.push({ step: 'heritage', label: 'Review heritage and ancestry feat choices', kind: 'Check' })
  } else if (!ancestry.heritage || ancestryFeatLevels.some((level) => level <= build.level && !ancestry.feats[level])) {
    optional.push({ step: 'heritage', label: 'Fill in heritage or ancestry feats', kind: 'Optional' })
  }

  const equipment = character.equipmentPlan
  if (equipment) {
    const { balanceCp, encumbered, overCapacity, provisional } = equipmentTotals(equipment, build)
    if (balanceCp !== null && balanceCp < 0) {
      checks.push({ step: 'equipment', label: 'Review gear that exceeds starting wealth', kind: 'Check' })
    } else if (!provisional && (overCapacity || encumbered)) {
      checks.push({
        step: 'equipment',
        label: overCapacity ? 'Review gear that exceeds carrying capacity' : 'Review gear that causes encumbrance',
        kind: 'Check',
      })
    }
  }

  const featPlan = character.featChoices ?? emptyFeatChoices
  if (build.characterClass && featSlots(character).some((slot) => !effectiveFeat(slot, featPlan))) {
    optional.push({ step: 'feats', label: 'Fill in undecided feats', kind: 'Optional' })
  }
  const spellPlan = character.spellChoices ?? emptySpellChoices
  if (spellSlots(character).some((slot) => !effectiveSpell(slot, spellPlan))) {
    optional.push({ step: 'spells', label: 'Fill in undecided spells', kind: 'Optional' })
  }
  if (!equipment?.items.length && !checks.some(({ step }) => step === 'equipment')) {
    optional.push({ step: 'equipment', label: 'Plan starting equipment', kind: 'Optional' })
  }

  return [...unfinished, ...checks, ...optional].slice(0, 3)
}
