import { useId, useRef, useState } from 'react'
import { ancestries, backgrounds, classes } from '@/attributes/options'
import { buildOptionGuides } from '@/content/build-options'
import type { BuildOptionGuide, BuildOptionKind } from '@/content/build-options'
import { Button } from '@/components/ui/button'

const books = [
  { label: 'Player Core', core2: false },
  { label: 'Player Core 2', core2: true },
]

const pickers = {
  ancestry: {
    label: 'Ancestry',
    plural: 'ancestries',
    catalog: ancestries,
    rulesPage: 'Ancestries',
    custom: 'Use your ancestry’s rules to enter its listed boosts and flaw, or take the two free boosts.',
  },
  background: {
    label: 'Background',
    plural: 'backgrounds',
    catalog: backgrounds,
    rulesPage: 'Backgrounds',
    custom: 'Use this for a background outside the list. Check its rules for training and other benefits.',
  },
  class: {
    label: 'Class',
    plural: 'classes',
    catalog: classes,
    rulesPage: 'Classes',
    custom: 'Use this for a class outside the list and select the key attribute given by its rules.',
  },
}

function OptionDescription({ name, guide, rulesPage, summaryId }: {
  name: string
  guide: BuildOptionGuide
  rulesPage: string
  summaryId?: string
}) {
  return (
    <>
      <p id={summaryId} className="text-muted-foreground">{guide.summary}</p>
      <a
        href={`https://2e.aonprd.com/${rulesPage}.aspx?ID=${guide.rulesId}`}
        target="_blank"
        rel="noreferrer"
        aria-label={`Read the ${name} rules (opens in a new tab)`}
        className="inline-block text-sm font-medium text-primary underline underline-offset-2"
      >
        Read the rules
      </a>
    </>
  )
}

type BuildOptionPickerProps = {
  kind: BuildOptionKind
  value: string
  onChange: (value: string) => void
}

export function BuildOptionPicker({ kind, value, onChange }: BuildOptionPickerProps) {
  const { label, plural, catalog, rulesPage, custom } = pickers[kind]
  const guides = buildOptionGuides[kind]
  const [search, setSearch] = useState('')
  const picker = useRef<HTMLSelectElement>(null)
  const browser = useRef<HTMLDetailsElement>(null)
  const descriptionId = useId()
  const selected = Object.hasOwn(catalog, value) ? catalog[value] : undefined
  const query = search.trim().toLowerCase()
  const options = Object.entries(catalog).sort(([, a], [, b]) => a.name.localeCompare(b.name))
  const groups = books.map((book) => ({
    ...book,
    options: options.filter(([, option]) => Boolean(option.core2) === book.core2),
  }))
  const matches = groups.map((group) => ({
    ...group,
    options: group.options.filter(([id, { name }]) => (
      `${name} ${guides[id].summary}`.toLowerCase().includes(query)
    )),
  })).filter(({ options }) => options.length > 0)

  function choose(id: string) {
    onChange(id)
    if (browser.current) browser.current.open = false
    setSearch('')
    picker.current?.focus()
  }

  return (
    <div className="space-y-3">
      <label className="block space-y-1">
        <span className="font-medium">{label}</span>
        <select
          ref={picker}
          className="min-h-11 w-full rounded-md border border-input bg-background px-3 text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          value={value}
          aria-describedby={selected || value === 'custom' ? descriptionId : undefined}
          onChange={(event) => onChange(event.currentTarget.value)}
        >
          {kind !== 'ancestry' ? <option value="">Decide later</option> : null}
          {groups.map(({ label, options }) => (
            <optgroup key={label} label={label}>
              {options.map(([id, { name }]) => <option key={id} value={id}>{name}</option>)}
            </optgroup>
          ))}
          <option value="custom">Custom</option>
        </select>
      </label>

      {selected || value === 'custom' ? (
        <div className="space-y-1 rounded-md border border-border bg-background/50 px-3 py-2.5">
          <h3 className="font-sans font-semibold">{selected?.name ?? `Custom ${kind}`}</h3>
          {selected ? (
            <OptionDescription name={selected.name} guide={guides[value]} rulesPage={rulesPage} summaryId={descriptionId} />
          ) : <p id={descriptionId} className="text-muted-foreground">{custom}</p>}
        </div>
      ) : null}

      <details ref={browser} className="rounded-md border border-border">
        <summary className="px-3 font-medium">Browse {plural}</summary>
        <div className="space-y-4 border-t border-border px-3 py-3">
          <label className="block space-y-1">
            <span className="font-medium">Search {plural}</span>
            <input
              type="search"
              className="min-h-11 w-full rounded-md border border-input bg-background px-3 focus-visible:outline-2 focus-visible:outline-ring"
              placeholder="Filter by name or description"
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') event.preventDefault()
              }}
            />
          </label>
          {matches.length === 0 ? (
            <p role="status" className="text-muted-foreground">No matching {plural}.</p>
          ) : null}
          {matches.map(({ label, options }) => (
            <div key={label} className="space-y-1">
              <h3 className="guide-kicker font-sans text-xs font-semibold uppercase tracking-[0.16em] text-primary">{label}</h3>
              <ul className="divide-y divide-border">
                {options.map(([id, { name }]) => (
                  <li key={id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3 last:pb-0">
                    <div className="min-w-0 flex-1 basis-52 space-y-1">
                      <h4 className="font-semibold">{name}</h4>
                      <OptionDescription name={name} guide={guides[id]} rulesPage={rulesPage} />
                    </div>
                    {value === id ? <span className="font-medium text-primary">Selected</span> : (
                      <Button type="button" variant="outline" className="min-h-11" aria-label={`Select ${name}`} onClick={() => choose(id)}>
                        Select
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}
