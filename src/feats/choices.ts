import labels from '../content/feat-labels.json' with { type: 'json' }
import progression from '../content/feat-progression.json' with { type: 'json' }
import { ancestryFeatLevels, ancestryOption, featsFor, heritagesFor } from '../ancestry/choices.ts'
import { backgrounds, classes } from '../attributes/options.ts'
import type { CharacterDraft } from '../character/draft.ts'

export const featKinds = ['class', 'general', 'skill', 'ancestry', 'dedication'] as const
export type FeatKind = typeof featKinds[number]
export type FeatChoice = { id: string; notes: string }
export type ExtraFeatSlot = { id: string; kind: FeatKind; level: number; maxLevel: number; source: string }
export type FeatChoices = { choices: Record<string, FeatChoice>; extra: ExtraFeatSlot[] }
export const emptyFeatChoices: FeatChoices = { choices: {}, extra: [] }
export type FeatSlot = {
  id: string
  kind: FeatKind
  level: number
  maxLevel: number
  label: string
  source: string
  fixed?: string
  fixedName?: string
  classOnly?: boolean
  excludeLineage?: boolean
  guidance?: string
  depth?: number
}

const featLabels: Record<string, string> = labels
type Progression = { class: number[]; general: number[]; skill: number[]; fixed: { level: number; feat: string }[] }
const classProgressions: Record<string, Progression> = progression.classes
const backgroundGrants: Record<string, string[]> = progression.backgrounds
const backgroundReferences: Record<string, string[]> = progression.backgroundReferences
const fixedGrants: Record<string, string[]> = progression.fixedGrants

export function featName(id: string): string {
  return id.startsWith('ancestry:') ? ancestryOption(id.slice(9), 'feat')?.name ?? 'Custom feat' : featLabels[id] ?? 'Custom feat'
}

function knownFeat(id: string) {
  return id === 'custom' || Object.hasOwn(featLabels, id) || (id.startsWith('ancestry:') && Boolean(ancestryOption(id.slice(9), 'feat')))
}

export function parseFeatChoices(value: unknown): FeatChoices | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const row = value as Record<string, unknown>
  if (Object.keys(row).length !== 2 || !row.choices || typeof row.choices !== 'object' || Array.isArray(row.choices) || !Array.isArray(row.extra) || row.extra.length > 50) return null
  const choices: FeatChoices['choices'] = {}
  for (const [id, raw] of Object.entries(row.choices)) {
    if (id.length > 400 || !/^[a-z][a-z0-9-]*(?::[a-zA-Z0-9_-]+)+$/.test(id) || !raw || typeof raw !== 'object' || Array.isArray(raw)) return null
    const choice = raw as Record<string, unknown>
    if (Object.keys(choice).length !== 2 || typeof choice.id !== 'string' || !knownFeat(choice.id) || typeof choice.notes !== 'string') return null
    choices[id] = { id: choice.id, notes: choice.notes }
  }
  const extra: ExtraFeatSlot[] = []
  for (const raw of row.extra) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
    const slot = raw as Record<string, unknown>
    if (Object.keys(slot).length !== 5 || typeof slot.id !== 'string' || !/^extra:[a-zA-Z0-9-]{1,80}$/.test(slot.id) || extra.some((other) => other.id === slot.id)) return null
    if (!featKinds.includes(slot.kind as FeatKind) || !Number.isInteger(slot.level) || Number(slot.level) < 1 || Number(slot.level) > 20 || !Number.isInteger(slot.maxLevel) || Number(slot.maxLevel) < 1 || Number(slot.maxLevel) > 20 || typeof slot.source !== 'string') return null
    extra.push({ id: slot.id, kind: slot.kind as FeatKind, level: Number(slot.level), maxLevel: Number(slot.maxLevel), source: slot.source })
  }
  return { choices, extra }
}

export function effectiveFeat(slot: FeatSlot, plan: FeatChoices): FeatChoice | null {
  return plan.choices[slot.id] ?? (slot.fixed ? { id: slot.fixed, notes: '' } : null)
}

export function featSlots(character: CharacterDraft, plan: FeatChoices = character.featChoices ?? emptyFeatChoices): FeatSlot[] {
  const build = character.buildDraft.build
  const profile = classProgressions[build.characterClass]
  const className = classes[build.characterClass]?.name ?? 'Class'
  const slots: FeatSlot[] = []
  for (const kind of ['class', 'general', 'skill'] as const) {
    const levels = profile?.[kind] ?? (kind === 'general' ? [3, 7, 11, 15, 19] : kind === 'skill' ? [2, 4, 6, 8, 10, 12, 14, 16, 18, 20] : [])
    for (const level of levels.filter((level) => level <= build.level)) {
      const lesson = kind === 'skill' && build.characterClass === 'investigator' && level % 2 === 1
      slots.push({ id: `${kind}:${level}`, kind, level, maxLevel: level,
        label: `Level ${level} ${kind} feat`, source: lesson ? 'Skillful Lessons' : kind === 'class' ? className : 'Level advancement',
        ...(lesson ? { guidance: 'Choose a feat for an Intelligence-, Wisdom-, or Charisma-based skill, or the skill granted by your methodology.' } : {}),
      })
    }
  }
  for (const feat of backgroundGrants[build.background] ?? []) {
    slots.push({ id: `background:${build.background}:${feat}`, kind: 'skill', level: 1, maxLevel: 1,
      label: `${backgrounds[build.background]?.name ?? 'Background'} granted feat`, source: 'Background', fixed: feat })
  }
  for (const [index, name] of (backgroundReferences[build.background] ?? []).entries()) {
    slots.push({ id: `background-reference:${build.background}:${index}`, kind: 'skill', level: 1, maxLevel: 1,
      label: `${backgrounds[build.background]?.name ?? 'Background'} granted feat`, source: 'Background', fixed: 'custom', fixedName: name })
  }
  for (const { level, feat } of profile?.fixed ?? []) {
    if (level <= build.level) slots.push({ id: `class-grant:${build.characterClass}:${feat}:${level}`, kind: 'general', level, maxLevel: level,
      label: `${className} granted feat`, source: 'Class feature', fixed: feat })
  }
  if (build.characterClass === 'fighter') {
    if (build.level >= 9) slots.push({ id: 'flexibility:9', kind: 'class', level: 9, maxLevel: 8, label: 'Combat Flexibility', source: 'Fighter daily preparation', classOnly: true, guidance: 'Choose a fighter feat you do not already have. You can change this during daily preparations.' })
    if (build.level >= 15) slots.push({ id: 'flexibility:15', kind: 'class', level: 15, maxLevel: 14, label: 'Improved Flexibility', source: 'Fighter daily preparation', classOnly: true, guidance: 'This second daily feat can use your first flexibility feat as a prerequisite.' })
  }

  function grant(parent: string, id: string, level: number, source: string, depth = 0) {
    if (depth > 5) return
    const grants: Record<string, { kind: FeatKind; maxLevel: number; classOnly?: boolean; excludeLineage?: boolean }> = {
      'natural-ambition': { kind: 'class', maxLevel: 1, classOnly: true },
      'general-training': { kind: 'general', maxLevel: 1 },
      'advanced-general-training': { kind: 'general', maxLevel: 7 },
      multitalented: { kind: 'dedication', maxLevel: 2 },
      'ancestral-paragon': { kind: 'ancestry', maxLevel: 1, excludeLineage: true },
      'versatile-human': { kind: 'general', maxLevel: 1 },
      'ancient-elf': { kind: 'dedication', maxLevel: 2 },
    }
    const choice = grants[id]
    if (choice) slots.push({ id: `grant:${parent}:${id}`, ...choice, level, label: `${source} bonus feat (level ${level})`, source, depth: depth + 1 })
    for (const feat of fixedGrants[id] ?? []) {
      slots.push({ id: `grant:${parent}:${id}:${feat}`, kind: 'general', level, maxLevel: level,
        label: `${source} granted feat (level ${level})`, source, fixed: feat, depth: depth + 1 })
    }
  }
  const ancestry = character.ancestryChoices
  const heritage = ancestry?.heritage
  if (heritage && heritagesFor(build.ancestry).some((row) => row.id === heritage.id)) {
    grant('heritage', heritage.id, 1, ancestryOption(heritage.id, 'heritage')!.name)
  }
  for (const level of ancestryFeatLevels.filter((level) => level <= build.level)) {
    const feat = ancestry?.feats[level]
    if (feat && featsFor(build.ancestry, heritage?.id, level).some((row) => row.id === feat.id)) {
      grant(`ancestry:${level}`, feat.id, level, ancestryOption(feat.id, 'feat')!.name)
    }
  }
  for (const extra of plan.extra.filter((slot) => slot.level <= build.level)) {
    slots.push({ ...extra, label: extra.source || 'Additional feat', source: 'Recorded extra choice' })
  }
  for (let index = 0; index < slots.length && index < 250; index++) {
    const slot = slots[index]
    const selected = effectiveFeat(slot, plan)
    if (selected && selected.id !== 'custom') {
      const id = selected.id.startsWith('ancestry:') ? selected.id.slice(9) : selected.id
      grant(slot.id, id, slot.level, featName(selected.id), slot.depth ?? 0)
    }
  }
  return slots
}

export function selectedFeatRows(character: CharacterDraft) {
  const plan = character.featChoices ?? emptyFeatChoices
  return featSlots(character, plan).flatMap((slot) => {
    const choice = effectiveFeat(slot, plan)
    return choice ? [{ slot, choice, name: slot.fixedName ?? featName(choice.id) }] : []
  })
}
