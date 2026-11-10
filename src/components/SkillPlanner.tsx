import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { Build } from '@/attributes/build'
import { attributes } from '@/attributes/options'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { evaluateSkillPlan, loreId, loreTopic } from '@/skills/plan'
import type { SkillPlan } from '@/skills/plan'

type SkillPlannerProps = {
  build: Build
  plan: SkillPlan
  onChange: (plan: SkillPlan) => void
  onBack: () => void
}

const fieldClass = 'min-h-11 w-full rounded-md border border-input bg-background px-3 text-foreground focus-visible:outline-2 focus-visible:outline-ring'

export function SkillPlanner({ build, plan, onChange, onBack }: SkillPlannerProps) {
  const [loreInput, setLoreInput] = useState('')
  const heading = useRef<HTMLHeadingElement>(null)
  const { rows, slots } = evaluateSkillPlan(build, plan)
  const topic = loreTopic(loreInput)
  const canAddLore = Boolean(topic) && !plan.lore.some((name) => loreId(name) === loreId(topic))

  useEffect(() => {
    heading.current?.focus()
  }, [])

  function addLore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canAddLore) return
    onChange({ ...plan, lore: [...plan.lore, topic] })
    setLoreInput('')
  }

  return (
    <section aria-labelledby="skill-planner-heading" className="mx-auto w-full max-w-2xl space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Level {build.level} · Character build</p>
        <h2 id="skill-planner-heading" ref={heading} tabIndex={-1} className="text-3xl">Skill proficiency planner</h2>
        <p className="text-muted-foreground">
          Mark your level-1 training, then assign any later increases. The base modifier adds the linked attribute and proficiency.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-xl">Starting training and current ranks</h3>
          <p className="text-muted-foreground">Enter the skills you gained or chose at level 1 from your character options.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={addLore} className="flex flex-wrap items-end gap-2">
            <label className="min-w-0 flex-1 basis-40 space-y-1">
              <span className="block font-medium">Optional Lore topic</span>
              <input className={fieldClass} value={loreInput} maxLength={80} placeholder="Heraldry" onChange={(event) => setLoreInput(event.currentTarget.value)} />
            </label>
            <Button type="submit" variant="outline" className="min-h-11" disabled={!canAddLore}>Add Lore</Button>
          </form>
          {plan.lore.length ? (
            <div className="flex flex-wrap gap-2">
              {plan.lore.map((name) => (
                <Button
                  key={loreId(name)}
                  type="button"
                  variant="ghost"
                  className="min-h-11"
                  onClick={() => onChange({ ...plan, lore: plan.lore.filter((entry) => entry !== name) })}
                >
                  Remove {name} Lore
                </Button>
              ))}
            </div>
          ) : null}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">Skills, starting training, and current modifiers</caption>
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="py-2 pr-2">Skill</th>
                  <th scope="col" className="px-2 text-center">Trained at level 1</th>
                  <th scope="col" className="px-2">Rank</th>
                  <th scope="col" className="pl-2 text-right">Base modifier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map(({ id, name, attribute, rank, modifier }) => (
                  <tr key={id}>
                    <th scope="row" className="py-2 pr-2 font-medium">
                      {name}<span className="block text-xs text-muted-foreground">{attributes[attribute]}</span>
                    </th>
                    <td className="px-2 text-center">
                      <label className="inline-flex min-h-11 min-w-11 items-center justify-center">
                        <input
                          type="checkbox"
                          className="accent-primary"
                          aria-label={`Trained at level 1 in ${name}`}
                          checked={plan.trained.includes(id)}
                          onChange={(event) => onChange({
                            ...plan,
                            trained: event.currentTarget.checked ? [...plan.trained, id] : plan.trained.filter((skill) => skill !== id),
                          })}
                        />
                      </label>
                    </td>
                    <td className="px-2">{rank}</td>
                    <td className="pl-2 text-right tabular-nums">{modifier > 0 ? '+' : ''}{modifier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-xl">Training and increases by level</h3>
          <p className="text-muted-foreground">
            Each increase raises a skill one rank. Master opens at level 7 and Legendary at level 15. A higher Intelligence modifier adds training in one new skill.
          </p>
          {build.characterClass === 'custom' ? (
            <p className="text-muted-foreground">Custom classes use the standard increase schedule.</p>
          ) : null}
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {slots.length ? slots.map(({ id, level, kind, options, selected }) => (
            <label key={id} className="block space-y-1">
              <span className="block font-medium">Level {level} · {kind === 'intelligence' ? 'Intelligence training' : 'Skill increase'}</span>
              <select
                className={fieldClass}
                value={selected}
                onChange={(event) => {
                  const choice = options.find((option) => option.id === event.currentTarget.value)
                  const choices = { ...plan.choices }
                  if (choice) choices[id] = choice.id
                  else delete choices[id]
                  onChange({ ...plan, choices })
                }}
              >
                <option value="">Decide later</option>
                {options.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
              </select>
              {!selected && plan.choices[id] ? <span className="block text-xs text-muted-foreground">The saved choice needs a different earlier rank.</span> : null}
            </label>
          )) : <p className="text-muted-foreground sm:col-span-2">No later skill increases at this level.</p>}
        </CardContent>
      </Card>

      <Button type="button" variant="outline" className="min-h-11" onClick={onBack}>Back to build review</Button>
    </section>
  )
}
