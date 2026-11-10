import type { Build } from '@/attributes/build'
import { assessCampaignFit } from '@/attributes/campaign-fit'
import { attributes } from '@/attributes/options'
import type { Attribute } from '@/attributes/options'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { evaluateSkillPlan } from '@/skills/plan'
import type { CoreSkillId, SkillPlan } from '@/skills/plan'

const checks: { name: string; attribute: Attribute; guidance: string; skills?: CoreSkillId[] }[] = [
  { name: 'Will', attribute: 'wis', guidance: 'Wisdom contributes to Will saves against fear and other mental effects.' },
  { name: 'Perception', attribute: 'wis', guidance: 'Seek uses Perception to look for hidden creatures or objects.' },
  {
    name: 'Diplomacy, Deception, and Intimidation',
    attribute: 'cha',
    guidance: 'Diplomacy covers Gather Information, Deception covers Lie, and Intimidation covers Coerce. Each skill has its own proficiency.',
    skills: ['diplomacy', 'deception', 'intimidation'],
  },
  { name: 'Society', attribute: 'int', guidance: 'Use Society to Recall Knowledge about people and institutions when relevant to an investigation.', skills: ['society'] },
  { name: 'Stealth and Thievery', attribute: 'dex', guidance: 'Stealth covers Hide and Sneak. Pick a Lock requires training in Thievery.', skills: ['stealth', 'thievery'] },
  { name: 'Athletics', attribute: 'str', guidance: 'Strength contributes to checks such as Force Open, Grapple, and Shove.', skills: ['athletics'] },
  { name: 'Religion (optional)', attribute: 'wis', guidance: 'Religion can help you Recall Knowledge about deities and religious practices.', skills: ['religion'] },
  { name: 'Performance (optional)', attribute: 'cha', guidance: 'Charisma contributes to Performance checks when you use the Perform action.', skills: ['performance'] },
]

export function CampaignFit({ build, skillPlan }: { build: Build; skillPlan?: SkillPlan }) {
  const { modifiers, combatHeavy } = assessCampaignFit(build)
  const plannedSkills = skillPlan ? evaluateSkillPlan(build, skillPlan).rows : []

  return (
    <section aria-labelledby="campaign-fit-heading" className="mx-auto w-full max-w-2xl">
      <Card>
        <CardHeader>
          <h2 id="campaign-fit-heading" className="text-2xl">Campaign fit checklist</h2>
          <p className="text-muted-foreground">
            These are your current attribute modifiers. {skillPlan
              ? 'Planned skills also show their rank and base modifier.'
              : 'Full checks also include proficiency and any other bonuses or penalties.'}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {combatHeavy ? (
            <p className="rounded-md border border-primary/30 bg-secondary/45 px-3 py-2">
              <strong>Combat-heavy attribute spread.</strong>{' '}
              Consider Wisdom for Will and Perception, Charisma for social skills, or Intelligence for Society.
            </p>
          ) : null}
          <ul className="divide-y divide-border">
            {checks.map(({ name, attribute, guidance, skills }) => {
              const modifier = modifiers[attribute]
              const skillRows = skills ? plannedSkills.filter(({ id }) => skills.some((skill) => skill === id)) : []
              return (
                <li key={name} className="space-y-1.5 py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <h3 className="font-sans font-semibold">{name}</h3>
                    <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground tabular-nums">
                      {attributes[attribute]} {modifier > 0 ? '+' : ''}{modifier}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{guidance}</p>
                  {skillRows.length ? (
                    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-primary">
                      {skillRows.map(({ id, name, rank, modifier }) => (
                        <li key={id}>{name} · {rank} ({modifier > 0 ? '+' : ''}{modifier})</li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>
    </section>
  )
}
