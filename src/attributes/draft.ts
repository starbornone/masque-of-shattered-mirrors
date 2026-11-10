import { normalizeBuild, parseBuild, serializeBuild } from './build.ts'
import type { Build } from './build.ts'

export const buildDraftStorageKey = 'masque-build-draft'
export const buildSteps = ['ancestry', 'background', 'class', 'boosts', 'review'] as const
export type BuildStep = typeof buildSteps[number]

export type BuildDraft = {
  build: Build
  step: BuildStep | null
}

export function serializeBuildDraft({ build, step }: BuildDraft): string {
  return JSON.stringify({ build: serializeBuild(build), step })
}

export function parseBuildDraft(serialized: string): BuildDraft | null {
  try {
    const data = JSON.parse(serialized)
    if (typeof data?.build !== 'string') return null
    const build = parseBuild(data.build)
    if (!build) return null
    const step = buildSteps.find((id) => id === data.step) ?? null
    return { build, step }
  } catch {
    return null
  }
}

export function loadBuildDraft(): BuildDraft {
  try {
    const saved = parseBuildDraft(localStorage.getItem(buildDraftStorageKey) ?? '')
    if (saved) return saved
  } catch {
    // The guide also works when browser storage is unavailable.
  }
  return { build: normalizeBuild(), step: null }
}

export function buildShareUrl(build: Build, pageUrl: string): string {
  const url = new URL(pageUrl)
  url.search = ''
  url.hash = ''
  url.searchParams.set('build', serializeBuild(build))
  return url.href
}
