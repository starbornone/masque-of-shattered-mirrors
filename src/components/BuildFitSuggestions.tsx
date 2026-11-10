import { backgroundSlots, classKeys } from '@/attributes/build'
import { attributes, backgrounds, classes } from '@/attributes/options'
import { Button } from '@/components/ui/button'

const backgroundSuggestions = [
  { id: 'artist', note: 'Crafting and Art Lore for appraising or identifying works of art.' },
  { id: 'entertainer', note: 'Performance and Theater Lore for staged performances.' },
  { id: 'noble', note: 'Society training and Courtly Graces for dealing with nobles.' },
  { id: 'acolyte', note: 'Religion training for Recall Knowledge about faiths and divine subjects.' },
  { id: 'detective', note: 'Society and Underworld Lore for Recall Knowledge during investigations.' },
]

const classSuggestions = [
  { id: 'bard', note: 'Starts trained in Performance and Occultism.' },
  { id: 'rogue', note: 'Starts trained in Stealth. Your racket determines which key attributes are available.' },
  { id: 'investigator', note: 'Expert Perception and trained Society help find and interpret clues.' },
  { id: 'oracle', note: 'Charisma supports social checks. Cursebound abilities come with a curse that grows as you use them.' },
  { id: 'witch', note: 'Intelligence supports skills such as Society and Occultism. Your patron determines your spell tradition.' },
  { id: 'cleric', note: 'Wisdom helps Will and Perception. You start trained in Religion.' },
  { id: 'swashbuckler', note: 'Starts expert in Perception and gains skill training from your chosen style.' },
]

type BuildFitSuggestionsProps = {
  kind: 'background' | 'class'
  selected: string
  onSelect: (id: string) => void
}

export function BuildFitSuggestions({ kind, selected, onSelect }: BuildFitSuggestionsProps) {
  const isBackground = kind === 'background'
  const suggestions = isBackground ? backgroundSuggestions : classSuggestions
  const catalog = isBackground ? backgrounds : classes

  return (
    <details className="rounded-md border border-border p-3">
      <summary className="cursor-pointer font-medium">Campaign-fit {kind} suggestions</summary>
      <ul className="mt-2 divide-y divide-border">
        {suggestions.map(({ id, note }) => {
          const name = catalog[id].name
          const options = isBackground ? backgroundSlots(id)[0] : classKeys(id)
          return (
            <li key={id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3 last:pb-0">
              <div className="min-w-0 flex-1 basis-60 space-y-0.5">
                <h3 className="font-sans font-semibold">{name}</h3>
                <p className="text-xs font-medium text-primary">
                  {isBackground ? 'One boost to' : 'Key attribute'} {options.map((id) => attributes[id]).join(' or ')}
                  {isBackground ? ' plus one free boost' : ''}
                </p>
                <p className="text-muted-foreground">{note}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                aria-label={`Choose ${name}`}
                aria-pressed={selected === id}
                onClick={() => onSelect(id)}
              >
                {selected === id ? 'Selected' : 'Choose'}
              </Button>
            </li>
          )
        })}
      </ul>
    </details>
  )
}
