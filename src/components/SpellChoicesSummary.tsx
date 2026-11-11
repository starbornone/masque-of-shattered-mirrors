import { emptySpellChoices, rankLabel, selectedSpellRows } from '@/spells/choices'
import type { CharacterDraft } from '@/character/draft'

export function SpellChoicesSummary({ character }: { character: CharacterDraft }) {
  const plan = character.spellChoices ?? emptySpellChoices
  const rows = selectedSpellRows(character)
  if (!rows.length && !plan.notes) return null
  return <section className="space-y-2">
    <h3 className="text-xl">Spells and cantrips</h3>
    {plan.notes ? <p className="whitespace-pre-wrap wrap-anywhere text-muted-foreground">{plan.notes}</p> : null}
    <dl className="space-y-2">{rows.map(({ slot, choice, name }) => <div key={slot.id}>
      <dt className="font-medium text-primary">{slot.label} · {rankLabel(slot.rank)} · {slot.kind === 'repertoire' ? 'known' : slot.kind}</dt>
      <dd>{name}{choice.signature ? ' · signature' : ''}{slot.frequency ? ` · ${slot.frequency}` : ''}
        {choice.notes ? <p className="whitespace-pre-wrap wrap-anywhere text-muted-foreground">{choice.notes}</p> : null}
      </dd>
    </div>)}</dl>
  </section>
}
