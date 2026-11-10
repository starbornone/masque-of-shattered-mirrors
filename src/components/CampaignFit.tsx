import { calculate } from '@/attributes/build'
import type { Build } from '@/attributes/build'
import { attributes } from '@/attributes/options'
import type { Attribute } from '@/attributes/options'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const checks: { name: string; attribute: Attribute; guidance: string }[] = [
  { name: 'Will', attribute: 'wis', guidance: 'Wisdom contributes to Will saves against fear and other mental effects.' },
  { name: 'Perception', attribute: 'wis', guidance: 'Seek uses Perception to look for hidden creatures or objects.' },
  {
    name: 'Diplomacy, Deception, and Intimidation',
    attribute: 'cha',
    guidance: 'Diplomacy covers Gather Information, Deception covers Lie, and Intimidation covers Coerce. Each skill has its own proficiency.',
  },
  { name: 'Society', attribute: 'int', guidance: 'Use Society to Recall Knowledge about people and institutions when relevant to an investigation.' },
  { name: 'Stealth and Thievery', attribute: 'dex', guidance: 'Stealth covers Hide and Sneak. Pick a Lock requires training in Thievery.' },
  { name: 'Athletics', attribute: 'str', guidance: 'Strength contributes to checks such as Force Open, Grapple, and Shove.' },
  { name: 'Religion (optional)', attribute: 'wis', guidance: 'Religion can help you Recall Knowledge about deities and religious practices.' },
  { name: 'Performance (optional)', attribute: 'cha', guidance: 'Charisma contributes to Performance checks when you use the Perform action.' },
]

export function CampaignFit({ build }: { build: Build }) {
  const { rows } = calculate(build)
  const modifiers = new Map(rows.map(({ id, total }) => [id, total]))

  return (
    <section aria-labelledby="campaign-fit-heading" className="mx-auto w-full max-w-2xl">
      <Card>
        <CardHeader>
          <h2 id="campaign-fit-heading" className="text-2xl">Campaign fit checklist</h2>
          <p className="text-muted-foreground">
            These are your current attribute modifiers. Full checks also use the relevant proficiency and any other bonuses or penalties.
          </p>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {checks.map(({ name, attribute, guidance }) => {
              const modifier = modifiers.get(attribute) ?? 0
              return (
                <li key={name} className="space-y-1.5 py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <h3 className="font-sans font-semibold">{name}</h3>
                    <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground tabular-nums">
                      {attributes[attribute]} {modifier > 0 ? '+' : ''}{modifier}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{guidance}</p>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>
    </section>
  )
}
