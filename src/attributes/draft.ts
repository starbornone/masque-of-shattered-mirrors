import { normalizeBuild, parseBuild, serializeBuild } from './build.ts'
import type { Build } from './build.ts'
import { parseSkillPlan } from '../skills/plan.ts'
import type { SkillPlan } from '../skills/plan.ts'

export const buildDraftStorageKey = 'masque-build-draft'
export const buildSteps = ['ancestry', 'background', 'class', 'boosts', 'review'] as const
export type BuildGuideStep = typeof buildSteps[number]
export type BuildStep = BuildGuideStep | 'skills'

export type BuildDraft = {
  build: Build
  step: BuildStep | null
  skills?: SkillPlan
}

export function serializeBuildDraft({ build, step, skills }: BuildDraft): string {
  return JSON.stringify({ build: serializeBuild(build), step, skills })
}

export function parseBuildDraft(serialized: string): BuildDraft | null {
  try {
    const data = JSON.parse(serialized)
    if (typeof data?.build !== 'string') return null
    const build = parseBuild(data.build)
    if (!build) return null
    const step = data.step === 'skills' ? 'skills' : buildSteps.find((id) => id === data.step) ?? null
    const skills = parseSkillPlan(data.skills)
    return skills ? { build, step, skills } : { build, step }
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
