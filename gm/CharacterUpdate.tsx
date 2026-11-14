import { useLayoutEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { previewCharacterUpdate } from './character-update.ts'

type Preview = ReturnType<typeof previewCharacterUpdate>

export function CharacterUpdate({ filename, preview, onApply, onCancel }: {
  filename: string
  preview: Preview
  onApply: () => void
  onCancel: () => void
}) {
  const heading = useRef<HTMLHeadingElement>(null)
  const groups = [
    { label: 'Concept', rows: preview.concept },
    { label: 'Build', rows: preview.build },
    { label: 'Training', rows: preview.training },
  ].filter(({ rows }) => rows.length)

  useLayoutEffect(() => {
    heading.current?.focus()
  }, [])

  return (
    <Card>
      <CardContent className="space-y-4">
        <h2 ref={heading} tabIndex={-1} className="text-2xl">Review character update</h2>
        <p className="wrap-anywhere font-medium">{filename}</p>
        <p className="text-muted-foreground">Apply this player file to the open package. Your session notes will be kept as written.</p>
        {groups.map(({ label, rows }) => (
          <section key={label} className="space-y-2">
            <h3 className="text-xl">{label}</h3>
            <ul className="divide-y divide-border rounded-md border border-border px-3">
              {rows.map(({ label, before, after }) => (
                <li key={label} className="space-y-1 py-2">
                  <p className="font-semibold">{label}</p>
                  <dl className="grid gap-2 sm:grid-cols-2">
                    <div><dt className="text-muted-foreground">Current</dt><dd className="whitespace-pre-wrap wrap-anywhere">{before}</dd></div>
                    <div><dt className="text-muted-foreground">Revised</dt><dd className="whitespace-pre-wrap wrap-anywhere">{after}</dd></div>
                  </dl>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {preview.other.length ? (
          <p className="text-muted-foreground">Also changed · {preview.other.join(', ')}</p>
        ) : null}
        {groups.length || preview.other.length ? null : <p>No character changes found.</p>}
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={onApply} disabled={!groups.length && !preview.other.length}>Apply character update</Button>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel update</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function UpdatedSuggestions({ suggestions }: { suggestions: Preview['suggestions'] }) {
  const [status, setStatus] = useState('')
  if (!suggestions.length) return null

  async function copySuggestion(title: string, text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setStatus(`Copied a suggestion for ${title}.`)
    } catch {
      setStatus('Clipboard unavailable. Select the suggestion text to copy it.')
    }
  }

  return (
    <Card>
      <CardContent className="space-y-3">
        <h2 className="text-2xl">Updated prep suggestions</h2>
        <ul className="space-y-3">
          {suggestions.map(({ id, title, text }) => (
            <li key={id} className="space-y-1 rounded-md border border-border p-3">
              <p className="font-semibold">{title}</p>
              <p className="wrap-anywhere">{text}</p>
              <Button type="button" variant="outline" onClick={() => void copySuggestion(title, text)}>Copy suggestion</Button>
            </li>
          ))}
        </ul>
        <p role="status" className="text-muted-foreground">{status}</p>
      </CardContent>
    </Card>
  )
}
