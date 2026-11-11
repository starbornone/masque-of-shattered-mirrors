import { normalizeBuild } from '../attributes/build.ts'
import { emptySessionZero } from '../session-zero/types.ts'
import { loadCharacterDraft, parseCharacter, serializeCharacter } from './draft.ts'
import type { CharacterDraft } from './draft.ts'

export const draftLibraryKey = 'masque-character-drafts'
export const maxDraftNameLength = 80

export type NamedDraft = { id: string; name: string; character: CharacterDraft }
export type DraftLibrary = { activeId: string; drafts: NamedDraft[] }
export type LibraryProblem = 'unreadable' | 'changed' | 'unavailable'

export function newCharacterDraft(startLevel?: number): CharacterDraft {
  return {
    sessionZero: { answers: { ...emptySessionZero } },
    buildDraft: { build: normalizeBuild({ level: startLevel }), step: null },
  }
}

export function draftNameError(library: DraftLibrary, name: string, exceptId?: string) {
  const trimmed = name.trim()
  if (!trimmed || trimmed.length > maxDraftNameLength) return 'Enter a draft name between 1 and 80 characters.'
  if (library.drafts.some((entry) => entry.id !== exceptId && entry.name.toLowerCase() === trimmed.toLowerCase())) {
    return 'A draft with that name already exists.'
  }
  return ''
}

export function serializeDraftLibrary(library: DraftLibrary): string {
  return JSON.stringify({
    format: draftLibraryKey,
    version: 1,
    activeId: library.activeId,
    drafts: library.drafts.map(({ id, name, character }) => ({ id, name, character: JSON.parse(serializeCharacter(character)) })),
  })
}

export function parseDraftLibrary(raw: string): DraftLibrary | null {
  try {
    const value = JSON.parse(raw)
    if (value?.format !== draftLibraryKey || value.version !== 1 || Object.keys(value).length !== 4) return null
    if (typeof value.activeId !== 'string' || !Array.isArray(value.drafts)) return null

    const ids = new Set<string>()
    const names = new Set<string>()
    const drafts: NamedDraft[] = []
    for (const entry of value.drafts) {
      if (!entry || typeof entry !== 'object' || Object.keys(entry).length !== 3) return null
      const { id, name } = entry
      if (typeof id !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(id) || ids.has(id)) return null
      if (typeof name !== 'string' || !name || name !== name.trim() || name.length > maxDraftNameLength) return null
      if (names.has(name.toLowerCase())) return null
      const character = parseCharacter(JSON.stringify(entry.character))
      if (!character) return null
      ids.add(id)
      names.add(name.toLowerCase())
      drafts.push({ id, name, character })
    }
    return ids.has(value.activeId) ? { activeId: value.activeId, drafts } : null
  } catch {
    return null
  }
}

export function loadDraftLibrary(startLevel?: number): { library: DraftLibrary; saved: string | null; problem: LibraryProblem | null } {
  const initialId = 'first-draft'
  const fromOlderSave = (): DraftLibrary => ({
    activeId: initialId,
    drafts: [{ id: initialId, name: 'Character 1', character: loadCharacterDraft(startLevel) }],
  })
  try {
    const saved = localStorage.getItem(draftLibraryKey)
    if (saved === null) return { library: fromOlderSave(), saved, problem: null }
    const library = parseDraftLibrary(saved)
    if (library) return { library, saved, problem: null }
    return { library: fromOlderSave(), saved, problem: 'unreadable' }
  } catch {
    return { library: fromOlderSave(), saved: null, problem: 'unavailable' }
  }
}

export function storeDraftLibrary(library: DraftLibrary, previous: string | null) {
  try {
    const current = localStorage.getItem(draftLibraryKey)
    if (current !== previous) return { problem: 'changed' } as const
    const saved = serializeDraftLibrary(library)
    localStorage.setItem(draftLibraryKey, saved)
    return { problem: null, saved } as const
  } catch {
    return { problem: 'unavailable' } as const
  }
}
