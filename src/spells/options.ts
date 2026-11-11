import data from '../content/spell-options.json' with { type: 'json' }
import { emptySpellChoices, selectedSpellRows, spellInfo, spellName, spellSlots } from './choices.ts'
import type { SpellChoice, SpellSlot } from './choices.ts'
import type { CharacterDraft } from '../character/draft.ts'

export type SpellOption = typeof data[number]
export const spellOptions = data
export function spellOption(id: string) { return spellOptions.find((s) => s.id === id) }
export function availableSpells(slot: SpellSlot, choice?: SpellChoice) {
  return spellOptions.filter((s) => {
    if (s.cantrip !== (slot.rank === 0) || (!s.cantrip && s.rank > slot.rank)) return false
    if (slot.kind === 'focus') return s.granted
    if (s.granted) return false
    return slot.granted || choice?.grantedAccess || (Boolean(slot.tradition) && s.traditions.includes(slot.tradition))
  })
}
export function spellWarnings(character: CharacterDraft): string[] {
  const plan = character.spellChoices ?? emptySpellChoices
  const rows = selectedSpellRows(character)
  const warnings: string[] = []
  for (const { slot, choice, name } of rows) {
    if (slot.fixed && choice.id !== slot.fixed) warnings.push(`${slot.label}: use the spell granted by this feature.`)
    if (choice.id === 'custom') continue
    if (!availableSpells(slot, choice).some((s) => s.id === choice.id)) warnings.push(`${slot.label}: check ${name} against the spell type, rank, and tradition available here.`)
    if (choice.signature && (slot.kind !== 'repertoire' || slot.rank === 0 || slot.rank === 10 || character.buildDraft.build.level < 3)) warnings.push(`${name}: signature spells apply to ranked repertoire spells from level 3; 10th-rank slots have separate restrictions.`)
  }
  const signatures = rows.filter((r) => r.choice.signature && r.slot.kind === 'repertoire')
  for (const rank of new Set(signatures.map((r) => r.slot.rank))) {
    if (signatures.filter((r) => r.slot.rank === rank).length > 1) warnings.push(`Rank ${rank}: normally choose one signature spell. Check any feature granting more.`)
  }
  const seen = new Set<string>()
  for (const { slot, choice, name } of rows.filter((r) => ['cantrip', 'learned', 'repertoire'].includes(r.slot.kind))) {
    const key = `${slot.kind}:${slot.rank}:${choice.id}`
    if (choice.id !== 'custom' && seen.has(key)) warnings.push(`${name} is recorded more than once in the same ${slot.kind} rank. Daily ranked preparations may repeat; known spells normally should not.`)
    seen.add(key)
  }
  if (['wizard', 'witch'].includes(character.buildDraft.build.characterClass)) {
    const learned = new Set(rows.filter((r) => r.slot.kind === 'learned').map((r) => r.choice.id))
    for (const { choice, name } of rows.filter((r) => r.slot.kind === 'prepared' || r.slot.kind === 'cantrip')) {
      if (choice.id !== 'custom' && !learned.has(choice.id)) warnings.push(`${name}: record it in your spellbook or familiar’s learned spells, or confirm another feature lets you prepare it.`)
      // A lower-rank spell can be prepared in a higher-rank slot without learning it again.
    }
  }
  const active = new Set(spellSlots(character).map((s) => s.id))
  if (Object.keys(plan.choices).some((id) => !active.has(id))) warnings.push('Earlier spell selections are saved below; they do not count toward this class and level’s current choices.')
  if (rows.some((r) => r.choice.grantedAccess || (spellInfo(r.choice.id) && spellOption(r.choice.id)?.rarity !== 'common'))) warnings.push('Confirm access to uncommon, rare, or off-list spells with the granting rule and your GM.')
  return [...new Set(warnings)]
}
export function inactiveSpellRows(character: CharacterDraft) {
  const plan = character.spellChoices ?? emptySpellChoices
  const active = new Set(spellSlots(character).map((s) => s.id))
  return Object.entries(plan.choices).filter(([id]) => !active.has(id)).map(([id, choice]) => ({ id, choice, name: spellName(choice.id) }))
}
