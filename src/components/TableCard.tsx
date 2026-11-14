import { useLayoutEffect, useRef, useState } from 'react'
import type { NamedDraft } from '@/character/library'
import type { tableReference } from '@/character/table-reference'
import { maskPromptQuestions } from '@/character/mask-prompt'
import { Button } from '@/components/ui/button'

type Reference = ReturnType<typeof tableReference>
type Hook = 'mask' | 'art' | 'invitationReason' | 'stake'

function excerpt(text: string, limit: number) {
  const characters = Array.from(text.trim().replace(/\s+/g, ' '))
  return characters.length > limit ? `${characters.slice(0, limit - 1).join('')}…` : characters.join('')
}

export function TableCard({ draft, reference, onBack }: {
  draft: NamedDraft
  reference: Reference
  onBack: () => void
}) {
  const [included, setIncluded] = useState<Partial<Record<Hook, boolean>>>({})
  const [printPrompt, setPrintPrompt] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const { mask, art, invitationReason, stake } = draft.character.sessionZero.answers
  const approved = draft.character.maskPrompt
  const question = approved && mask.trim() ? maskPromptQuestions[approved] : undefined
  const hooks: { id: Hook; label: string; value: string }[] = [
    { id: 'mask', label: 'Mask’s lie', value: mask },
    { id: 'art', label: 'Art or craft', value: art },
    { id: 'invitationReason', label: 'Why I accepted', value: invitationReason },
    { id: 'stake', label: 'Personal stake', value: stake?.kind === 'person' ? stake.name : stake?.kind === 'self' ? 'I’m the one they’re watching.' : '' },
  ]
  const availableHooks = hooks.filter(({ value }) => value.trim())
  const selectedHooks = availableHooks.filter(({ id }) => included[id])
  const { checks, wisdom, boostsRemaining, hasSkillPlan, gear, spells, moreGear, moreSpells, level } = reference
  const signed = (value: number) => value >= 0 ? `+${value}` : String(value)

  useLayoutEffect(() => {
    heading.current?.focus()
  }, [])

  return (
    <section className="table-card-preview space-y-4" aria-labelledby="table-card-preview-heading">
      <div className="space-y-3 print:hidden">
        <h3 id="table-card-preview-heading" ref={heading} tabIndex={-1} className="text-2xl">Table card preview</h3>
        <p className="text-muted-foreground">Print on A4 or Letter, or choose Save as PDF in your browser’s print dialog. Use portrait orientation and turn off browser headers and footers.</p>
        {availableHooks.length ? (
          <fieldset>
            <legend className="font-semibold">Include personal hooks</legend>
            <p className="text-sm text-muted-foreground">Select what you want on the card. Long entries appear as excerpts in the preview below.</p>
            <div className="flex flex-wrap gap-x-4">
              {availableHooks.map(({ id, label }) => (
                <label key={id} className="flex min-h-11 items-center gap-2">
                  <input type="checkbox" checked={Boolean(included[id])} onChange={(event) => setIncluded({ ...included, [id]: event.currentTarget.checked })} />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}
        {question ? (
          <div>
            <label className="flex min-h-11 items-center gap-2 font-medium">
              <input type="checkbox" checked={printPrompt} onChange={(event) => setPrintPrompt(event.currentTarget.checked)} />
              Print “The mask slips” on the back
            </label>
            {printPrompt ? <p className="text-sm text-muted-foreground">Use two-sided printing and flip on the long edge. In the PDF, the prompt is page 2.</p> : null}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => window.print()}>Print / Save as PDF</Button>
          <Button type="button" variant="outline" onClick={onBack}>Back to Table View</Button>
        </div>
      </div>

      <article className="table-card" aria-label="Printable table card">
        <header className="table-card-header">
          <p>The Masque of Shattered Mirrors</p>
          <h1>{draft.name}</h1>
          <p>Level {level} · Table card</p>
        </header>
        <h2>Checks and training</h2>
        <table>
          <thead>
            <tr><th scope="col">Skill</th><th scope="col">Common action</th><th scope="col">Rank</th><th scope="col">Base</th></tr>
          </thead>
          <tbody>
            {checks.map(({ id, name, action, rank, base }) => (
              <tr key={id}>
                <th scope="row">{name}</th><td>{action}</td><td>{rank ?? 'Unrecorded'}</td><td>{base === null ? '—' : signed(base)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="table-card-note">
          Will and Perception use {boostsRemaining ? 'provisional ' : ''}Wisdom {signed(wisdom)} before proficiency.
          {' '}{boostsRemaining || !hasSkillPlan ? 'Base is pending completed boosts and recorded training.' : 'Base adds the attribute and recorded proficiency.'}
        </p>

        <div className="table-card-columns">
          <section>
            <h2>Carried gear</h2>
            {gear.length ? <ul>{gear.map(({ id, name, quantity }) => (
              <li key={id}>{quantity} × {excerpt(name, 64)}</li>
            ))}</ul> : <p>No carried gear recorded.</p>}
            {moreGear > 0 ? <p className="table-card-note">+{moreGear} in the equipment plan</p> : null}
          </section>
          <section>
            <h2>Planned spells</h2>
            {spells.length ? <ul>{spells.map(({ id, name, use, frequency }) => (
              <li key={id}>{excerpt(name, 48)} · {use}{frequency ? ` · ${excerpt(frequency, 30)}` : ''}</li>
            ))}</ul> : <p>No planned spells recorded.</p>}
            {moreSpells > 0 ? <p className="table-card-note">+{moreSpells} in the spell plan</p> : null}
          </section>
        </div>

        {selectedHooks.length ? (
          <section>
            <h2>Personal hooks</h2>
            <dl className="table-card-columns">
              {selectedHooks.map(({ id, label, value }) => (
                <div key={id}><dt>{label}</dt><dd>{excerpt(value, 160)}</dd></div>
              ))}
            </dl>
          </section>
        ) : null}
      </article>
      {printPrompt && question ? (
        <article className="table-card mask-prompt-back" aria-label="Mask prompt reverse">
          <header className="table-card-header">
            <p>The Masque of Shattered Mirrors</p>
            <h1>The mask slips</h1>
            <p>{draft.name}</p>
          </header>
          <blockquote>{excerpt(mask, 900)}</blockquote>
          <p className="mask-prompt-question">{question}</p>
        </article>
      ) : null}
    </section>
  )
}
