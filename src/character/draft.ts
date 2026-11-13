import { parseBuild, serializeBuild } from '../attributes/build.ts'
import { buildSteps, loadBuildDraft } from '../attributes/draft.ts'
import type { BuildDraft } from '../attributes/draft.ts'
import { loadSessionZero, parseSessionZero, serializeSessionZero } from '../session-zero/draft.ts'
import type { SessionZeroDraft } from '../session-zero/types.ts'
import { parseSkillPlan } from '../skills/plan.ts'
import { parseAncestryChoices } from '../ancestry/choices.ts'
import type { AncestryChoices } from '../ancestry/choices.ts'
import { parseFeatChoices } from '../feats/choices.ts'
import type { FeatChoices } from '../feats/choices.ts'
import { parseSpellChoices } from '../spells/choices.ts'
import type { SpellChoices } from '../spells/choices.ts'
import { parseEquipmentPlan } from '../equipment/plan.ts'
import type { EquipmentPlan } from '../equipment/plan.ts'

export const characterStorageKey = 'masque-character'

export function characterFilename(draftName: string): string {
  // Windows filenames also exclude ASCII control characters.
  // oxlint-disable-next-line eslint/no-control-regex
  const stem = draftName.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-').trim().replace(/[. ]+$/, '')
  const reserved = /^(?:con|prn|aux|nul|com[1-9¹²³]|lpt[1-9¹²³])(?:\.|$)/i
  return `${reserved.test(stem) ? `_${stem}` : stem || 'masque-character'}.json`
}

export type CharacterDraft = {
  sessionZero: SessionZeroDraft
  buildDraft: BuildDraft
  startingLanguageNotes?: string
  ancestryChoices?: AncestryChoices
  featChoices?: FeatChoices
  spellChoices?: SpellChoices
  equipmentPlan?: EquipmentPlan
}

export function serializeCharacter({ sessionZero, buildDraft, startingLanguageNotes, ancestryChoices, featChoices, spellChoices, equipmentPlan }: CharacterDraft): string {
  return JSON.stringify({
    format: characterStorageKey,
    version: 1,
    sessionZero: JSON.parse(serializeSessionZero(sessionZero.answers, sessionZero.step)),
    build: JSON.parse(serializeBuild(buildDraft.build)),
    buildStep: buildDraft.step,
    skills: parseSkillPlan(buildDraft.skills) ?? null,
    startingLanguageNotes: startingLanguageNotes || undefined,
    ancestryChoices,
    featChoices,
    spellChoices,
    equipmentPlan,
  }, null, 2) + '\n'
}

function orderedFields(_key: string, value: unknown) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return value
  const fields = value as Record<string, unknown>
  return Object.fromEntries(Object.keys(fields).sort().map((key) => [key, fields[key]]))
}

export function parseCharacter(serialized: string): CharacterDraft | null {
  try {
    const data = JSON.parse(serialized)
    if (data?.format !== characterStorageKey || data.version !== 1) return null
    const sessionZero = parseSessionZero(JSON.stringify(data.sessionZero))
    const build = parseBuild(JSON.stringify(data.build))
    if (!sessionZero || !build) return null
    const step: BuildDraft['step'] = data.buildStep === 'skills' ? 'skills' : buildSteps.find((id) => id === data.buildStep) ?? null
    const skills = parseSkillPlan(data.skills)
    const draft: CharacterDraft = { sessionZero, buildDraft: { build, step, skills } }
    if (typeof data.startingLanguageNotes === 'string') draft.startingLanguageNotes = data.startingLanguageNotes
    if (Object.hasOwn(data, 'ancestryChoices')) {
      const choices = parseAncestryChoices(data.ancestryChoices)
      if (!choices) return null
      draft.ancestryChoices = choices
    }
    if (Object.hasOwn(data, 'featChoices')) {
      const choices = parseFeatChoices(data.featChoices)
      if (!choices) return null
      draft.featChoices = choices
    }
    if (Object.hasOwn(data, 'spellChoices')) {
      const choices = parseSpellChoices(data.spellChoices)
      if (!choices) return null
      draft.spellChoices = choices
    }
    if (Object.hasOwn(data, 'equipmentPlan')) {
      const plan = parseEquipmentPlan(data.equipmentPlan)
      if (!plan) return null
      draft.equipmentPlan = plan
    }

    // Reject files that would silently lose or change values during normalization.
    const canonical = JSON.parse(serializeCharacter(draft))
    return JSON.stringify(data, orderedFields) === JSON.stringify(canonical, orderedFields) ? draft : null
  } catch {
    return null
  }
}

export function loadCharacterDraft(startLevel?: number): CharacterDraft {
  try {
    const saved = parseCharacter(localStorage.getItem(characterStorageKey) ?? '')
    if (saved) return saved
  } catch {
    // Fall back to the older saves or an empty draft.
  }
  return { sessionZero: loadSessionZero(), buildDraft: loadBuildDraft(startLevel) }
}
