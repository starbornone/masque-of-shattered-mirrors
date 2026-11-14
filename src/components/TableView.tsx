import { useLayoutEffect, useRef, useState } from 'react'
import type { NamedDraft } from '@/character/library'
import { tableReference } from '@/character/table-reference'
import { TableCard } from '@/components/TableCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

function signed(value: number) {
  return value >= 0 ? `+${value}` : String(value)
}

export function TableView({ draft, onBack }: { draft: NamedDraft; onBack: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null)
  const printButton = useRef<HTMLButtonElement>(null)
  const [preview, setPreview] = useState(false)
  const reference = tableReference(draft.character)
  const { level, boostsRemaining, hasSkillPlan, wisdom, checks, gear, spells, moreGear, moreSpells } = reference

  useLayoutEffect(() => {
    heading.current?.focus()
  }, [])

  return (
    <section data-table-view aria-labelledby={preview ? 'table-card-preview-heading' : 'table-view-heading'} className="mx-auto w-full max-w-2xl space-y-4">
      {preview ? <TableCard draft={draft} reference={reference} onBack={() => {
        setPreview(false)
        requestAnimationFrame(() => printButton.current?.focus())
      }} /> : null}
      <div hidden={preview} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 id="table-view-heading" ref={heading} tabIndex={-1} className="guide-title">At the table</h2>
            <p className="wrap-anywhere text-muted-foreground">{draft.name} · Level {level}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button ref={printButton} type="button" variant="outline" onClick={() => setPreview(true)}>Print table card</Button>
            <Button type="button" variant="outline" onClick={onBack}>Back to draft</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <h3 className="text-xl">Checks and training</h3>
            {boostsRemaining > 0 || !hasSkillPlan ? (
              <p className="text-muted-foreground">
                {boostsRemaining > 0 ? 'Attribute boosts are unfinished. ' : ''}
                {!hasSkillPlan ? 'Skill training is unrecorded. ' : boostsRemaining > 0 ? 'Recorded ranks may change. ' : ''}
                Base modifiers appear after boosts and skill training are recorded.
              </p>
            ) : <p className="text-muted-foreground">Base adds your attribute and recorded proficiency. Apply other bonuses or penalties at the table.</p>}
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 sm:grid-cols-2">
              {checks.map(({ id, name, action, rank, base }) => (
                <li key={id} className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2">
                  <div>
                    <h4 className="text-base leading-tight font-semibold">{name}</h4>
                    <p className="text-muted-foreground">{action}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    {base !== null ? <p className="font-semibold text-primary tabular-nums">Base {signed(base)}</p> : null}
                    <p>{rank ?? 'Unrecorded'}</p>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="mt-3 grid gap-2 sm:grid-cols-2">
              {['Will', 'Perception'].map((name) => (
                <div key={name} className="flex flex-wrap justify-between gap-x-2 rounded-md border border-border px-3 py-2">
                  <dt className="font-semibold">{name}</dt>
                  <dd className="text-muted-foreground">{boostsRemaining ? 'Provisional Wisdom' : 'Wisdom only'} {signed(wisdom)}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader><h3 className="text-xl">Carried gear</h3></CardHeader>
            <CardContent className="space-y-2">
              {gear.length ? <ul className="space-y-2">{gear.map(({ id, name, quantity }) => (
                <li key={id} className="wrap-anywhere">{quantity} × {name}</li>
              ))}</ul> : <p className="text-muted-foreground">No carried gear recorded.</p>}
              {moreGear > 0 ? <p className="text-muted-foreground">{moreGear} more in your equipment plan.</p> : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><h3 className="text-xl">Planned spells</h3></CardHeader>
            <CardContent className="space-y-2">
              {spells.length ? <ul className="space-y-2">{spells.map(({ id, name, use, frequency }) => (
                <li key={id} className="wrap-anywhere">
                  <span className="font-semibold">{name}</span>
                  <p className="text-muted-foreground">{use}{frequency ? ` · ${frequency}` : ''}</p>
                </li>
              ))}</ul> : <p className="text-muted-foreground">No planned spells recorded.</p>}
              {moreSpells > 0 ? <p className="text-muted-foreground">{moreSpells} more in your spell plan.</p> : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
