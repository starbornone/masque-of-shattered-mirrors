import { calculate } from '../attributes/build.ts'
import { emptySkillPlan, evaluateSkillPlan } from '../skills/plan.ts'
import type { CoreSkillId } from '../skills/plan.ts'
import { rankLabel, selectedSpellRows } from '../spells/choices.ts'
import type { CharacterDraft } from './draft.ts'

const actions = {
  diplomacy: 'Gather Information',
  deception: 'Lie',
  intimidation: 'Coerce',
  society: 'Recall Knowledge about people or institutions',
  thievery: 'Pick a Lock (trained)',
  stealth: 'Hide or Sneak',
  athletics: 'Force Open',
  religion: 'Recall Knowledge about faith or rites',
  performance: 'Perform',
} satisfies Partial<Record<CoreSkillId, string>>

const spellUse = {
  cantrip: 'Cantrip', focus: 'Focus', innate: 'Innate',
  prepared: 'Prepared', repertoire: 'Repertoire',
} as const
const previewLimit = 5

export function tableReference(character: CharacterDraft) {
  const { build, skills } = character.buildDraft
  const ledger = calculate(build)
  const { rows } = evaluateSkillPlan(build, skills ?? emptySkillPlan)
  const checks = Object.entries(actions).map(([id, action]) => {
    const row = rows.find((skill) => skill.id === id)!
    return {
      id, action, name: row.name,
      rank: skills ? row.rank : null,
      base: skills && ledger.remaining === 0 ? row.modifier : null,
    }
  })
  const gear = character.equipmentPlan?.items.filter(({ carried }) => carried) ?? []
  const spells = new Map<string, { id: string; name: string; use: string; frequency: string | undefined }>()
  for (const { slot, choice, name } of selectedSpellRows(character)) {
    if (slot.kind === 'learned' || slot.kind === 'access') continue
    const id = choice.id === 'custom' ? slot.id : `${choice.id}:${slot.kind}:${slot.rank}:${slot.frequency ?? ''}`
    spells.set(id, {
      id, name: choice.id === 'custom' ? choice.notes.trim().split(/\r?\n/, 1)[0] || name : name,
      use: slot.kind === 'cantrip' ? spellUse.cantrip : `${spellUse[slot.kind]} · ${rankLabel(slot.rank)}`,
      frequency: slot.frequency,
    })
  }

  return {
    level: build.level,
    boostsRemaining: ledger.remaining,
    hasSkillPlan: Boolean(skills),
    wisdom: ledger.rows.find(({ id }) => id === 'wis')!.total,
    checks,
    gear: gear.slice(0, previewLimit).map(({ id, name, quantity }) => ({ id, name, quantity })),
    spells: [...spells.values()].slice(0, previewLimit),
    moreGear: Math.max(0, gear.length - previewLimit),
    moreSpells: Math.max(0, spells.size - previewLimit),
  }
}
