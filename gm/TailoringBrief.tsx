import { useRef, useState } from 'react'
import type { CharacterDraft } from '@/character/draft'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { tailoringBrief } from './brief.ts'

export function TailoringBrief({ draft }: { draft: CharacterDraft }) {
  const [notes, setNotes] = useState(() => tailoringBrief(draft))
  const [message, setMessage] = useState('')
  const editor = useRef<HTMLTextAreaElement>(null)

  async function copyNotes() {
    try {
      await navigator.clipboard.writeText(notes)
      setMessage('Session notes copied.')
    } catch {
      editor.current?.focus()
      editor.current?.select()
      setMessage('Clipboard unavailable. Copy the selected notes manually.')
    }
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl">GM tailoring brief</h2>
        <p id="brief-guidance" className="text-muted-foreground">
          Edit these preparation suggestions, then copy them into your session notes.
          Opening another character generates a new brief.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <label className="block space-y-1">
          <span className="font-medium">Session notes (GM only)</span>
          <textarea
            ref={editor}
            rows={20}
            className="w-full rounded-md border border-input bg-background px-3 py-2 leading-relaxed text-foreground focus-visible:outline-2 focus-visible:outline-ring"
            aria-describedby="brief-guidance"
            value={notes}
            onChange={(event) => {
              setNotes(event.currentTarget.value)
              setMessage('')
            }}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button type="button" className="min-h-11" onClick={copyNotes}>Copy session notes</Button>
          <Button type="button" variant="outline" className="min-h-11" onClick={() => {
            setNotes(tailoringBrief(draft))
            setMessage('')
          }}>
            Regenerate from character
          </Button>
        </div>
        <p role="status" className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  )
}
