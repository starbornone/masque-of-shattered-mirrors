import { calculate } from '../attributes/build.ts'
import type { Build } from '../attributes/build.ts'
import type { Attribute } from '../attributes/options.ts'

type Skill = { name: string; attribute: Attribute }

const coreSkills = {
  acrobatics: { name: 'Acrobatics', attribute: 'dex' },
  arcana: { name: 'Arcana', attribute: 'int' },
  athletics: { name: 'Athletics', attribute: 'str' },
  crafting: { name: 'Crafting', attribute: 'int' },
  deception: { name: 'Deception', attribute: 'cha' },
  diplomacy: { name: 'Diplomacy', attribute: 'cha' },
  intimidation: { name: 'Intimidation', attribute: 'cha' },
  medicine: { name: 'Medicine', attribute: 'wis' },
  nature: { name: 'Nature', attribute: 'wis' },
  occultism: { name: 'Occultism', attribute: 'int' },
  performance: { name: 'Performance', attribute: 'cha' },
  religion: { name: 'Religion', attribute: 'wis' },
  society: { name: 'Society', attribute: 'int' },
  stealth: { name: 'Stealth', attribute: 'dex' },
  survival: { name: 'Survival', attribute: 'wis' },
  thievery: { name: 'Thievery', attribute: 'dex' },
} satisfies Record<string, Skill>

export type CoreSkillId = keyof typeof coreSkills
export type SkillId = CoreSkillId | `lore:${string}`
type SlotKind = 'intelligence' | 'increase'
type SlotId = `${SlotKind}:${number}`

export type SkillPlan = {
  lore: string[]
  trained: SkillId[]
  choices: Partial<Record<SlotId, SkillId>>
}

export const emptySkillPlan: SkillPlan = { lore: [], trained: [], choices: {} }
const rankNames = ['Untrained', 'Trained', 'Expert', 'Master', 'Legendary'] as const

export function loreTopic(value: string) {
  return value.trim().replace(/\s+lore$/i, '').trim().slice(0, 80)
}

export function loreId(topic: string): SkillId {
  return `lore:${topic.toLowerCase()}`
}

function catalog(lore: readonly string[]) {
  const skills = new Map<SkillId, Skill>(Object.entries(coreSkills) as [CoreSkillId, Skill][])
  for (const topic of lore) skills.set(loreId(topic), { name: `${topic} Lore`, attribute: 'int' })
  return skills
}

export function parseSkillPlan(value: unknown): SkillPlan | undefined {
  if (typeof value !== 'object' || value === null) return undefined
  const data = value as Record<string, unknown>
  const topics = Array.isArray(data.lore) ? data.lore.filter((topic): topic is string => typeof topic === 'string') : []
  const lore = [...new Map(topics.map(loreTopic).filter(Boolean).map((topic) => [loreId(topic), topic])).values()]
  const skills = catalog(lore)
  const isSkill = (id: unknown): id is SkillId => typeof id === 'string' && skills.has(id as SkillId)
  const trained = Array.isArray(data.trained) ? [...new Set(data.trained.filter(isSkill))] : []
  const choices: SkillPlan['choices'] = {}
  if (typeof data.choices === 'object' && data.choices !== null) {
    for (const [slot, skill] of Object.entries(data.choices)) {
      if (/^(intelligence|increase):([2-9]|1\d|20)$/.test(slot) && isSkill(skill)) {
        choices[slot as SlotId] = skill
      }
    }
  }
  return { lore, trained, choices }
}

export function canAssignSkills(build: Build) {
  return calculate(build).remaining === 0
}

type SkillSlot = {
  id: SlotId
  level: number
  kind: SlotKind
  options: { id: SkillId; label: string }[]
  selected: SkillId | ''
}

export function evaluateSkillPlan(build: Build, plan: SkillPlan) {
  const skills = catalog(plan.lore)
  const ranks = new Map<SkillId, number>([...skills.keys()].map((id) => [id, plan.trained.includes(id) ? 1 : 0]))
  const slots: SkillSlot[] = []
  const fasterProgression = build.characterClass === 'rogue' || build.characterClass === 'investigator'
  const intelligenceAt = (level: number) => calculate({ ...build, level }).rows.find(({ id }) => id === 'int')?.total ?? 0
  let intelligence = intelligenceAt(1)

  function addSlot(kind: SlotKind, level: number, cap: number) {
    const id: SlotId = `${kind}:${level}`
    const options = [...skills].flatMap(([skillId, { name }]) => {
      const rank = ranks.get(skillId) ?? 0
      return rank < cap ? [{ id: skillId, label: `${name} → ${rankNames[rank + 1]}` }] : []
    })
    const choice = plan.choices[id]
    const selected = choice && options.some((option) => option.id === choice) ? choice : ''
    if (selected) ranks.set(selected, (ranks.get(selected) ?? 0) + 1)
    slots.push({ id, level, kind, options, selected })
  }

  for (let level = 2; level <= build.level; level++) {
    if (level % 5 === 0) {
      const nextIntelligence = intelligenceAt(level)
      if (nextIntelligence > intelligence) addSlot('intelligence', level, 1)
      intelligence = nextIntelligence
    }
    if (fasterProgression || level % 2 === 1) {
      const cap = level >= 15 ? 4 : level >= 7 ? 3 : 2
      addSlot('increase', level, cap)
    }
  }

  const modifiers = new Map(calculate(build).rows.map(({ id, total }) => [id, total]))
  const rows = [...skills].map(([id, skill]) => {
    const rank = ranks.get(id) ?? 0
    const proficiency = rank === 0 ? 0 : build.level + 2 * rank
    const modifier = (modifiers.get(skill.attribute) ?? 0) + proficiency
    return { id, ...skill, rank: rankNames[rank], modifier }
  })
  return { rows, slots }
}
