import catalog from '../content/ancestry-options.json' with { type: 'json' }
import { ancestries } from '../attributes/options.ts'

export const ancestryFeatLevels = [1, 5, 9, 13, 17] as const
export type AncestryFeatLevel = typeof ancestryFeatLevels[number]
export type AncestryChoice = { id: string; notes: string }
export type AncestryChoices = {
  heritage: AncestryChoice | null
  feats: Partial<Record<AncestryFeatLevel, AncestryChoice>>
}

type RuleOption = {
  id: string
  name: string
  source: string
  rarity: string
  traits: string[]
}
export type Heritage = RuleOption & { ancestry: string }
export type AncestryFeat = RuleOption & { level: number; prerequisites: string; action: string; repeatable: boolean }
export const heritages: Heritage[] = catalog.heritages
export const ancestryFeats: AncestryFeat[] = catalog.feats
export const emptyAncestryChoices: AncestryChoices = { heritage: null, feats: {} }
const heritageById = new Map(heritages.map((option) => [option.id, option]))
const featById = new Map(ancestryFeats.map((option) => [option.id, option]))

export function heritagesFor(ancestry: string): Heritage[] {
  return heritages.filter((option) => !option.ancestry || option.ancestry === ancestry)
}

export function featsFor(ancestry: string, heritageId: string | undefined, level: number): AncestryFeat[] {
  const traits = new Set([ancestry])
  const heritage = heritageId ? heritageById.get(heritageId) : undefined
  if (heritage && (!heritage.ancestry || heritage.ancestry === ancestry)) {
    for (const trait of heritage.traits) traits.add(trait)
    // These mixed heritages explicitly grant access to the other ancestry's feats.
    if (heritage.id === 'aiuvarin') traits.add('elf')
    if (heritage.id === 'dromaar') traits.add('orc')
  }
  return ancestryFeats.filter((option) => (
    option.level <= level && option.traits.some((trait) => traits.has(trait)) &&
    (level === 1 || !option.traits.includes('lineage'))
  ))
}

export function ancestryOption(id: string, kind: 'heritage' | 'feat') {
  return kind === 'heritage' ? heritageById.get(id) : featById.get(id)
}

function parseChoice(value: unknown, kind: 'heritage' | 'feat'): AncestryChoice | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const row = value as Record<string, unknown>
  if (Object.keys(row).length !== 2 || typeof row.id !== 'string' || typeof row.notes !== 'string') return null
  return row.id === 'custom' || ancestryOption(row.id, kind) ? { id: row.id, notes: row.notes } : null
}

export function parseAncestryChoices(value: unknown): AncestryChoices | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const row = value as Record<string, unknown>
  if (Object.keys(row).length !== 2 || !row.feats || typeof row.feats !== 'object' || Array.isArray(row.feats)) return null
  const heritage = row.heritage === null ? null : parseChoice(row.heritage, 'heritage')
  if (row.heritage !== null && !heritage) return null
  const feats: AncestryChoices['feats'] = {}
  for (const [key, raw] of Object.entries(row.feats)) {
    const level = ancestryFeatLevels.find((level) => String(level) === key)
    const choice = parseChoice(raw, 'feat')
    if (!level || !choice) return null
    feats[level] = choice
  }
  return { heritage, feats }
}

export function ancestryChoiceName(choice: AncestryChoice, kind: 'heritage' | 'feat'): string {
  return ancestryOption(choice.id, kind)?.name ?? 'Custom choice'
}

export function ancestryChoiceWarnings(choices: AncestryChoices, ancestry: string, level: number): string[] {
  const warnings: string[] = []
  const heritage = choices.heritage
  if (heritage && heritage.id !== 'custom' && !heritagesFor(ancestry).some((option) => option.id === heritage.id)) {
    warnings.push(`Review ${ancestryChoiceName(heritage, 'heritage')} for your ${ancestries[ancestry]?.name ?? 'custom'} ancestry.`)
  }
  const selected = new Set<string>()
  for (const slot of ancestryFeatLevels.filter((slot) => slot <= level)) {
    const choice = choices.feats[slot]
    if (!choice || choice.id === 'custom') continue
    const feat = featById.get(choice.id)
    if (!feat) continue
    if (!featsFor(ancestry, heritage?.id, slot).some((option) => option.id === feat.id)) {
      warnings.push(`Review ${feat.name} in the level-${slot} slot for its ancestry, heritage, level, or lineage requirement.`)
    }
    if (selected.has(feat.id) && !feat.repeatable) warnings.push(`${feat.name} is chosen more than once. Check whether its rules allow this.`)
    selected.add(feat.id)
  }
  return [...new Set(warnings)]
}
