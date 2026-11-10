import { selectedFeatRows } from '@/feats/choices'
import type { CharacterDraft } from '@/character/draft'

export function FeatChoicesSummary({ character }: { character: CharacterDraft }) {
  const rows = selectedFeatRows(character)
  if (!rows.length) return null
  return (
    <section className="space-y-2">
      <h3 className="text-xl">Class, general, and skill feats</h3>
      <dl className="space-y-2">
        {rows.map(({ slot, choice, name }) => (
          <div key={slot.id}>
            <dt className="font-medium text-primary">{slot.label}</dt>
            <dd>{name}{choice.notes ? <p className="whitespace-pre-wrap wrap-anywhere text-muted-foreground">{choice.notes}</p> : null}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
