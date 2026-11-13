import { useId, useState } from 'react'
import {
  ancestryChoiceWarnings, ancestryFeatLevels, ancestryOption,
  featsFor, heritagesFor,
} from '@/ancestry/choices'
import type { AncestryChoice, AncestryChoices as Choices, AncestryFeat, Heritage } from '@/ancestry/choices'
import descriptions from '@/content/ancestry-descriptions.json'

const ruleText: { heritages: Record<string, string>; feats: Record<string, string> } = descriptions

const fieldClass = 'min-h-11 w-full rounded-md border border-input bg-background px-3 text-foreground focus-visible:outline-2 focus-visible:outline-ring'

function RulePicker({ label, kind, options, choice, onChange }: {
  label: string
  kind: 'heritage' | 'feat'
  options: (Heritage | AncestryFeat)[]
  choice: AncestryChoice | null
  onChange: (choice: AncestryChoice | null) => void
}) {
  const [query, setQuery] = useState('')
  const descriptionId = useId()
  const selected = choice ? ancestryOption(choice.id, kind) : undefined
  const textFor = (id: string) => ruleText[kind === 'heritage' ? 'heritages' : 'feats'][id]
  const matches = options.filter((option) => `${option.name} ${textFor(option.id)} ${option.rarity}`.toLowerCase().includes(query.trim().toLowerCase()))
  const visible = selected && !matches.some((option) => option.id === selected.id) ? [selected, ...matches] : matches

  return (
    <section className="space-y-3 rounded-lg border border-border p-3 sm:p-4" aria-label={label}>
      <label className="block space-y-1">
        <span className="font-medium">Search {label.toLowerCase()}</span>
        <input type="search" className={fieldClass} value={query} placeholder="Name or ability, such as darkvision"
          onChange={(event) => setQuery(event.currentTarget.value)}
          onKeyDown={(event) => { if (event.key === 'Enter') event.preventDefault() }} />
      </label>
      <label className="block space-y-1">
        <span className="font-medium">{label}</span>
        <select className={fieldClass} value={choice?.id ?? ''} aria-describedby={selected ? descriptionId : undefined}
          onChange={(event) => {
            const id = event.currentTarget.value
            onChange(id ? { id, notes: '' } : null)
          }}>
          <option value="">Decide later</option>
          {visible.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}{'level' in option ? ` · level ${option.level}` : ''}{option.rarity !== 'common' ? ` · ${option.rarity}` : ''}
            </option>
          ))}
          <option value="custom">Custom / another rules source</option>
        </select>
      </label>
      {matches.length === 0 ? <p role="status" className="text-sm text-muted-foreground">No matching options. Clear the search or record a custom choice.</p> : null}
      {selected ? (
        <div id={descriptionId} className="space-y-2">
          <p className="text-sm font-medium text-primary">
            {selected.source} · {selected.rarity}{'action' in selected && selected.action !== 'passive' ? ` · ${selected.action}` : ''}
          </p>
          {'prerequisites' in selected && selected.prerequisites ? <p className="text-sm"><strong>Prerequisites</strong> — {selected.prerequisites}</p> : null}
          <p className="text-muted-foreground">{textFor(selected.id).split('\n\n')[0]}</p>
          {textFor(selected.id).includes('\n\n') ? (
            <details>
              <summary className="font-medium">More rules for {selected.name}</summary>
              <p className="whitespace-pre-line text-muted-foreground">{textFor(selected.id).split('\n\n').slice(1).join('\n\n')}</p>
            </details>
          ) : null}
          <a className="inline-block text-sm font-medium text-primary underline underline-offset-2"
            href={`https://2e.aonprd.com/Search.aspx?q=${encodeURIComponent(selected.name)}`}
            target="_blank" rel="noreferrer">Find {selected.name} on Archives of Nethys</a>
        </div>
      ) : null}
      {choice ? (
        <label className="block space-y-1">
          <span className="font-medium">{label} {choice.id === 'custom' ? 'name and details' : 'choice notes (optional)'}</span>
          <textarea className={`${fieldClass} py-2`} rows={2} value={choice.notes}
            placeholder={choice.id === 'custom' ? 'Name, source, and any choices it grants' : 'Record any skill, spell, or other option this choice grants'}
            onChange={(event) => onChange({ ...choice, notes: event.currentTarget.value })} />
        </label>
      ) : null}
    </section>
  )
}

export default function AncestryChoices({ ancestry, level, choices, onChange }: {
  ancestry: string
  level: number
  choices: Choices
  onChange: (choices: Choices) => void
}) {
  const warnings = ancestryChoiceWarnings(choices, ancestry, level)
  const future = ancestryFeatLevels.filter((slot) => slot > level && choices.feats[slot])
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">A heritage adds inborn abilities to your ancestry. Choose one from your ancestry or a versatile heritage that can suit many ancestries. Uncommon and rare options need your GM’s approval.</p>
      <RulePicker label="Heritage" kind="heritage" options={heritagesFor(ancestry)} choice={choices.heritage}
        onChange={(heritage) => onChange({ ...choices, heritage })} />
      <div className="space-y-2">
        <h3 className="text-xl">Ancestry feats</h3>
        <p className="text-muted-foreground">A feat is a specific ability you choose. You gain an ancestry feat at levels 1, 5, 9, 13, and 17. For each slot, choose a feat of that level or lower. A lineage feat can only be chosen at level 1.</p>
        <p className="text-sm text-muted-foreground">These lists check ancestry, heritage, and feat level. Check each feat’s prerequisites too; some need a class feature or training you will choose later. Record any extra choices below the feat, and include granted training when planning skills. You can continue with undecided choices.</p>
      </div>
      {ancestryFeatLevels.filter((slot) => slot <= level).map((slot) => (
        <RulePicker key={slot} label={`Level ${slot} ancestry feat`} kind="feat"
          options={featsFor(ancestry, choices.heritage?.id, slot)} choice={choices.feats[slot] ?? null}
          onChange={(choice) => {
            const feats = { ...choices.feats }
            if (choice) feats[slot] = choice
            else delete feats[slot]
            onChange({ ...choices, feats })
          }} />
      ))}
      {warnings.length ? <div role="status" className="space-y-1 rounded-md border border-border p-3 text-sm">{warnings.map((warning) => <p key={warning}>{warning}</p>)}<p>Your choices are kept while you review them.</p></div> : null}
      {future.length ? <p className="text-sm text-muted-foreground">Your choices for levels {future.join(', ')} are saved for when you raise the character’s level again.</p> : null}
      <a className="inline-block text-sm text-primary underline underline-offset-2" href={`${import.meta.env.BASE_URL}rules-notice.txt`} target="_blank" rel="noreferrer">Rules sources and ORC notice</a>
    </div>
  )
}
