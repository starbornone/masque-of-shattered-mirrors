import { calculate } from '../src/attributes/build.ts'
import { buildSelections } from '../src/attributes/ledger.ts'
import { attributes } from '../src/attributes/options.ts'
import type { CharacterDraft } from '../src/character/draft.ts'
import { faithChoices } from '../src/session-zero/types.ts'
import { evaluateSkillPlan } from '../src/skills/plan.ts'
import { tailoringSections } from './brief.ts'

function orderedJson(value: unknown) {
  return JSON.stringify(value, (_key, entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return entry
    return Object.fromEntries(Object.entries(entry).sort(([a], [b]) => a.localeCompare(b)))
  })
}

const signed = (modifier: number) => modifier >= 0 ? `+${modifier}` : String(modifier)

function previewFields(draft: CharacterDraft) {
  const { answers } = draft.sessionZero
  const { build, skills } = draft.buildDraft
  const ledger = calculate(build)
  const rows = skills ? evaluateSkillPlan(build, skills).rows : []
  return {
    concept: {
      'Invitation reason': answers.invitationReason,
      'Personal stake': answers.stake?.kind === 'self' ? 'The player character' : answers.stake?.name ?? '',
      'Art or craft': answers.art,
      Faith: answers.faith ? faithChoices[answers.faith] : '',
      Mask: answers.mask,
    },
    build: {
      Level: String(build.level),
      ...Object.fromEntries(buildSelections(build).map(({ label, name }) => [label, name])),
      'Unassigned boosts': String(ledger.remaining),
      ...Object.fromEntries(ledger.rows.map(({ id, total, partial }) => [attributes[id], signed(total) + (partial ? ' (partial)' : '')])),
    },
    training: Object.fromEntries(rows.filter(({ rank }) => rank !== 'Untrained').map(({ name, rank, modifier }) => [
      name, ledger.remaining ? `${rank} (provisional)` : `${rank} (${signed(modifier)} base)`,
    ])),
  }
}

export function previewCharacterUpdate(current: CharacterDraft, revised: CharacterDraft) {
  const before = previewFields(current)
  const after = previewFields(revised)
  function changes(previous: Record<string, string>, next: Record<string, string>) {
    return [...new Set([...Object.keys(previous), ...Object.keys(next)])]
      .filter((label) => previous[label] !== next[label])
      .map((label) => ({ label, before: previous[label] || '—', after: next[label] || '—' }))
  }

  const concept = changes(before.concept, after.concept)
  const build = changes(before.build, after.build)
  const training = changes(before.training, after.training)
  const other = [
    ['Heritage and ancestry feats', current.ancestryChoices, revised.ancestryChoices],
    ['Class, general, and skill feats', current.featChoices, revised.featChoices],
    ['Spells and cantrips', current.spellChoices, revised.spellChoices],
    ['Equipment', current.equipmentPlan, revised.equipmentPlan],
    ['Languages', current.startingLanguageNotes, revised.startingLanguageNotes],
    ['Guide progress', [current.sessionZero.step, current.buildDraft.step], [revised.sessionZero.step, revised.buildDraft.step]],
  ].filter(([, previous, next]) => orderedJson(previous) !== orderedJson(next)).map(([label]) => String(label))
  if (!concept.length && orderedJson(current.sessionZero.answers) !== orderedJson(revised.sessionZero.answers)) other.push('Concept details')
  if (!build.length && orderedJson(current.buildDraft.build) !== orderedJson(revised.buildDraft.build)) other.push('Attribute allocations')
  if (!training.length && orderedJson(current.buildDraft.skills) !== orderedJson(revised.buildDraft.skills)) other.push('Skill plan details')

  const previousSections = new Map(tailoringSections(current).map((section) => [section.title, section]))
  const suggestions = tailoringSections(revised)
    .filter((section) => orderedJson(section) !== orderedJson(previousSections.get(section.title)))
    .flatMap(({ title, notes }) => notes.map((text, index) => ({ id: `${title}:${index}`, title, text })))

  return { concept, build, training, other, suggestions }
}
