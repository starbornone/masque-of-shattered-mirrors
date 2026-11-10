import type { Build } from './build.ts'
import { ancestries, backgrounds, classes } from './options.ts'

export function buildSelections(build: Build) {
  return [
    { label: 'Ancestry', name: build.ancestry === 'custom' ? 'Custom' : ancestries[build.ancestry].name },
    { label: 'Background', name: build.background === 'custom' ? 'Custom' : backgrounds[build.background]?.name ?? 'Unchosen' },
    { label: 'Class', name: build.characterClass === 'custom' ? 'Custom' : classes[build.characterClass]?.name ?? 'Unchosen' },
  ]
}
