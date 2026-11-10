import { calculate } from './build.ts'
import type { Build } from './build.ts'
import type { Attribute } from './options.ts'

export function assessCampaignFit(build: Build) {
  const { rows, remaining } = calculate(build)
  const modifiers = Object.fromEntries(rows.map(({ id, total }) => [id, total])) as Record<Attribute, number>
  const { str, dex, con, int, wis, cha } = modifiers
  const attackAttribute = Math.max(str, dex)
  const supportingPhysical = Math.max(Math.min(str, dex), con)
  const mentalAttribute = Math.max(int, wis, cha)

  return {
    modifiers,
    combatHeavy: remaining === 0
      && attackAttribute >= 3
      && supportingPhysical >= 2
      && attackAttribute - mentalAttribute >= 2,
  }
}
