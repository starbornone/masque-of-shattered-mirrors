import data from '../content/feat-options.json' with { type: 'json' }
import { ancestryFeats, featsFor } from '../ancestry/choices.ts'
import type { CharacterDraft } from '../character/draft.ts'
import { effectiveFeat, emptyFeatChoices, featName, featSlots } from './choices.ts'
import type { FeatSlot } from './choices.ts'

export type FeatOption = {
  id: string
  name: string
  kind: string
  level: number
  traits: string[]
  source: string
  rarity: string
  prerequisites: string
  repeatable: boolean
  action: string
  rulesGroup: string
}
export const featOptions: FeatOption[] = data
const allOptions = new Map(featOptions.map((row) => [row.id, row]))
for (const option of ancestryFeats) allOptions.set(`ancestry:${option.id}`, {
  ...option, id: `ancestry:${option.id}`, kind: 'ancestry', rulesGroup: 'ancestry',
})

export function featOption(id: string) {
  return allOptions.get(id)
}

export function availableFeats(slot: FeatSlot, character: CharacterDraft, archetypes = false): FeatOption[] {
  const build = character.buildDraft.build
  if (slot.kind === 'ancestry') {
    return featsFor(build.ancestry, character.ancestryChoices?.heritage?.id, slot.maxLevel)
      .filter((row) => !row.traits.includes('lineage') || (slot.level === 1 && !slot.excludeLineage))
      .map((row) => allOptions.get(`ancestry:${row.id}`)!)
  }
  return featOptions.filter((row) => {
    if (row.level > slot.maxLevel) return false
    if (slot.kind === 'dedication') return row.traits.includes('multiclass') && row.traits.includes('dedication') && row.id !== `${build.characterClass}-dedication` && !row.traits.includes(build.characterClass)
    if (slot.kind === 'general') return row.traits.includes('general')
    if ((!archetypes || slot.classOnly) && row.traits.includes('archetype')) return false
    if (slot.kind === 'skill') return row.traits.includes('skill')
    return row.kind === 'class' && (row.traits.includes(build.characterClass) || (archetypes && !slot.classOnly && row.traits.includes('archetype')))
  })
}

export function featWarnings(character: CharacterDraft): string[] {
  const plan = character.featChoices ?? emptyFeatChoices
  const warnings: string[] = []
  const seen = new Set<string>()
  for (const [level, choice] of Object.entries(character.ancestryChoices?.feats ?? {})) {
    if (Number(level) > character.buildDraft.build.level) continue
    if (choice.id !== 'custom') seen.add(`ancestry:${choice.id}`)
  }
  for (const slot of featSlots(character)) {
    const selected = effectiveFeat(slot, plan)
    if (!selected || selected.id === 'custom') continue
    const option = featOption(selected.id)
    if (!option) continue
    if (slot.fixed ? slot.fixed !== option.id : !availableFeats(slot, character, true).some((row) => row.id === option.id)) {
      warnings.push(`Review ${option.name} for ${slot.label.toLowerCase()}. The type, class, or allowed feat level has changed.`)
    }
    if (seen.has(option.id) && !option.repeatable) warnings.push(`${featName(option.id)} is recorded more than once. Check whether another choice is needed.`)
    seen.add(option.id)
  }
  return [...new Set(warnings)]
}
