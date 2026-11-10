import { parseCharacter, serializeCharacter } from '../src/character/draft.ts'
import type { CharacterDraft } from '../src/character/draft.ts'

export type GmPackage = {
  character: CharacterDraft
  sessionNotes: string
}

export function serializeGmPackage({ character, sessionNotes }: GmPackage): string {
  return JSON.stringify({
    format: 'masque-gm-package',
    version: 1,
    character: JSON.parse(serializeCharacter(character)),
    sessionNotes,
  }, null, 2) + '\n'
}

export function parseGmPackage(serialized: string): GmPackage | null {
  try {
    const data = JSON.parse(serialized)
    if (data?.format !== 'masque-gm-package' || data.version !== 1 ||
      typeof data.sessionNotes !== 'string' || Object.keys(data).length !== 4) return null
    const character = parseCharacter(JSON.stringify(data.character))
    return character ? { character, sessionNotes: data.sessionNotes } : null
  } catch {
    return null
  }
}
