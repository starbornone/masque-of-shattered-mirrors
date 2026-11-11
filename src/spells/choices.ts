import labels from '../content/spell-labels.json' with { type: 'json' }
import type { CharacterDraft } from '../character/draft.ts'

export const traditions = ['arcane', 'divine', 'occult', 'primal'] as const
export type Tradition = typeof traditions[number]
export const extraSpellKinds = ['innate', 'focus', 'learned', 'prepared', 'repertoire', 'access'] as const
export type SpellKind = typeof extraSpellKinds[number] | 'cantrip'
export type SpellChoice = { id: string; notes: string; signature: boolean; grantedAccess: boolean }
export type ExtraSpell = { id: string; kind: typeof extraSpellKinds[number]; rank: number; level: number; source: string; frequency: string }
export type SpellChoices = {
  traditions: { witch: Tradition | ''; sorcerer: Tradition | '' }
  wizardSchool: '' | 'curriculum' | 'unified'
  font: '' | 'heal' | 'harm'
  notes: string
  choices: Record<string, SpellChoice>
  extra: ExtraSpell[]
}
export type SpellSlot = {
  id: string; kind: SpellKind; rank: number; label: string; source: string
  tradition: Tradition | ''; granted?: boolean; fixed?: string; frequency?: string
}
export const emptySpellChoices: SpellChoices = { traditions: { witch: '', sorcerer: '' }, wizardSchool: '', font: '', notes: '', choices: {}, extra: [] }
const spellLabels = labels as unknown as Record<string, [string, number, boolean, boolean]>
export function spellName(id: string) { return spellLabels[id]?.[0] ?? 'Custom spell' }
export function spellInfo(id: string) { return spellLabels[id] }
export function rankLabel(rank: number) { return rank === 0 ? 'Cantrip' : `Rank ${rank}` }
export function newSpellChoice(id: string): SpellChoice { return { id, notes: '', signature: false, grantedAccess: false } }

export const castingProfiles: Record<string, { mode: 'prepared' | 'repertoire'; tradition: Tradition | ''; slots: 3 | 4; rulesId: number }> = {
  bard: { mode: 'repertoire', tradition: 'occult', slots: 3, rulesId: 32 },
  cleric: { mode: 'prepared', tradition: 'divine', slots: 3, rulesId: 33 },
  druid: { mode: 'prepared', tradition: 'primal', slots: 3, rulesId: 34 },
  witch: { mode: 'prepared', tradition: '', slots: 3, rulesId: 38 },
  wizard: { mode: 'prepared', tradition: 'arcane', slots: 3, rulesId: 39 },
  oracle: { mode: 'repertoire', tradition: 'divine', slots: 4, rulesId: 61 },
  sorcerer: { mode: 'repertoire', tradition: '', slots: 4, rulesId: 62 },
}
export function spellTradition(character: CharacterDraft, plan = character.spellChoices ?? emptySpellChoices): Tradition | '' {
  const id = character.buildDraft.build.characterClass
  return id === 'witch' || id === 'sorcerer' ? plan.traditions[id] : castingProfiles[id]?.tradition ?? ''
}
export function dailySlots(classId: string, level: number, rank: number) {
  const profile = castingProfiles[classId]
  if (!profile || rank < 1 || rank > 10 || rank * 2 - 1 > level) return 0
  if (rank === 10) return 1
  return profile.slots - (level === rank * 2 - 1 ? 1 : 0)
}

export function spellSlots(character: CharacterDraft, plan = character.spellChoices ?? emptySpellChoices): SpellSlot[] {
  const { characterClass: id, level } = character.buildDraft.build
  const profile = castingProfiles[id]
  const tradition = spellTradition(character, plan)
  const slots: SpellSlot[] = []
  function add(key: string, kind: SpellKind, rank: number, count: number, source: string, granted = false, fixed?: string) {
    for (let i = 0; i < count; i++) slots.push({ id: `${id}:${key}:${rank}:${i}`, kind, rank,
      label: `${source} · ${rankLabel(rank).toLowerCase()} ${i + 1}`, source, tradition, granted, fixed })
  }
  if (profile) {
    add('cantrip', 'cantrip', 0, 5, profile.mode === 'prepared' ? 'Daily cantrip' : 'Repertoire cantrip')
    if (id === 'sorcerer') { slots[0].granted = true; slots[0].source = 'Bloodline cantrip (included in your five)'; slots[0].label = 'Bloodline cantrip' }
    for (let rank = 1; rank <= 10; rank++) {
      const count = dailySlots(id, level, rank)
      if (!count) continue
      add(profile.mode, profile.mode, rank, rank === 10 && profile.mode === 'repertoire' ? 2 : count, profile.mode === 'prepared' ? 'Daily preparation' : 'Repertoire')
      if (id === 'sorcerer' && rank < 10) {
        const gift = slots[slots.length - count]
        gift.granted = true; gift.source = 'Bloodline spell (included in your repertoire)'; gift.label = `Bloodline spell · rank ${rank}`
      }
    }
    if (id === 'wizard' || id === 'witch') {
      const source = id === 'wizard' ? 'Spellbook' : 'Familiar'
      add('learned-cantrip', 'learned', 0, 10, `${source} starting cantrip`)
      add('learned-start', 'learned', 1, 5, `${source} starting spell`)
      for (let gained = 2; gained <= level; gained++) add(`learned-level-${gained}`, 'learned', Math.ceil(gained / 2), 2, `${source} · gained at level ${gained}`)
      if (id === 'witch') add('patron-spell', 'learned', 1, 1, 'Patron initial lesson', true)
      if (id === 'wizard' && plan.wizardSchool === 'curriculum') {
        add('school-cantrip', 'cantrip', 0, 1, 'Curriculum cantrip', true)
        add('school-start', 'learned', 1, 2, 'Starting curriculum spell', true)
        for (let rank = 1; rank <= Math.min(9, Math.ceil(level / 2)); rank++) {
          add('school-prepared', 'prepared', rank, 1, 'Curriculum-only preparation', true)
          if (rank > 1) add('school-learned', 'learned', rank, 1, 'New-rank curriculum spell', true)
        }
      }
    }
    if (id === 'cleric' && plan.font) add('font', 'prepared', Math.ceil(level / 2), level >= 15 ? 6 : level >= 5 ? 5 : 4, 'Divine font', true, plan.font)
    if (id === 'bard') {
      add('muse', 'repertoire', 1, 1, 'Muse granted spell', true)
      add('composition', 'focus', 0, 1, 'Composition cantrip', true, 'courageous-anthem')
      add('focus', 'focus', Math.ceil(level / 2), 1, 'Counter Performance', true, 'counter-performance')
    }
    if (id === 'witch') {
      add('hex', 'focus', 0, 1, 'Patron hex cantrip', true)
      add('focus', 'focus', Math.ceil(level / 2), 1, 'Phase Familiar', true, 'phase-familiar')
    }
    if (id === 'oracle') {
      add('mystery-cantrip', 'cantrip', 0, 1, 'Mystery granted cantrip', true)
      add('mystery-spell', 'repertoire', 1, 1, 'Mystery granted rank 1 spell', true)
    }
    if (['druid', 'oracle', 'sorcerer'].includes(id)) add('focus', 'focus', Math.ceil(level / 2), 1, `${id === 'druid' ? 'Order' : id === 'oracle' ? 'Mystery' : 'Bloodline'} focus spell`, true)
  }
  if (id === 'champion') add('devotion', 'focus', Math.ceil(level / 2), 1, 'Devotion spell', true)
  for (const extra of plan.extra.filter((row) => row.level <= level)) slots.push({
    id: extra.id, kind: extra.kind, rank: extra.kind === 'focus' && extra.rank > 0 ? Math.ceil(level / 2) : extra.rank,
    label: extra.source || 'Additional spell', source: extra.source || 'Recorded grant', tradition: '', granted: true, frequency: extra.frequency,
  })
  return slots
}
export function effectiveSpell(slot: SpellSlot, plan: SpellChoices): SpellChoice | undefined {
  return plan.choices[slot.id] ?? (slot.fixed ? newSpellChoice(slot.fixed) : undefined)
}
export function selectedSpellRows(character: CharacterDraft) {
  const plan = character.spellChoices ?? emptySpellChoices
  return spellSlots(character, plan).flatMap((slot) => {
    const choice = effectiveSpell(slot, plan)
    return choice ? [{ slot, choice, name: spellName(choice.id) }] : []
  })
}

export function parseSpellChoices(value: unknown): SpellChoices | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const row = value as Record<string, unknown>
  if (Object.keys(row).length !== 6 || !['', 'curriculum', 'unified'].includes(String(row.wizardSchool)) || !['', 'heal', 'harm'].includes(String(row.font)) || typeof row.notes !== 'string') return null
  if (!row.traditions || typeof row.traditions !== 'object' || Array.isArray(row.traditions)) return null
  const t = row.traditions as Record<string, unknown>
  if (Object.keys(t).length !== 2 || !['', ...traditions].includes(t.witch as Tradition) || !['', ...traditions].includes(t.sorcerer as Tradition)) return null
  if (!row.choices || typeof row.choices !== 'object' || Array.isArray(row.choices) || Object.keys(row.choices).length > 500 || !Array.isArray(row.extra) || row.extra.length > 100) return null
  const choices: SpellChoices['choices'] = {}
  for (const [key, raw] of Object.entries(row.choices)) {
    if (!/^[a-z][a-z0-9-]*(?::[a-zA-Z0-9_-]+)+$/.test(key) || key.length > 200 || !raw || typeof raw !== 'object' || Array.isArray(raw)) return null
    const c = raw as Record<string, unknown>
    if (Object.keys(c).length !== 4 || typeof c.id !== 'string' || (c.id !== 'custom' && !Object.hasOwn(spellLabels, c.id)) || typeof c.notes !== 'string' || typeof c.signature !== 'boolean' || typeof c.grantedAccess !== 'boolean') return null
    choices[key] = { id: c.id, notes: c.notes, signature: c.signature, grantedAccess: c.grantedAccess }
  }
  const extra: ExtraSpell[] = []
  for (const raw of row.extra) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
    const e = raw as Record<string, unknown>
    if (Object.keys(e).length !== 6 || typeof e.id !== 'string' || !/^extra:[a-zA-Z0-9-]{1,80}$/.test(e.id) || extra.some((s) => s.id === e.id) || !extraSpellKinds.includes(e.kind as ExtraSpell['kind']) || !Number.isInteger(e.rank) || Number(e.rank) < 0 || Number(e.rank) > 10 || !Number.isInteger(e.level) || Number(e.level) < 1 || Number(e.level) > 20 || typeof e.source !== 'string' || typeof e.frequency !== 'string') return null
    extra.push({ id: e.id, kind: e.kind as ExtraSpell['kind'], rank: Number(e.rank), level: Number(e.level), source: e.source, frequency: e.frequency })
  }
  return { traditions: t as SpellChoices['traditions'], wizardSchool: row.wizardSchool as SpellChoices['wizardSchool'], font: row.font as SpellChoices['font'], notes: row.notes, choices, extra }
}
