import { useRef, useState } from 'react'
import type { RefObject } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

type TailoringBriefProps = {
  notes: string
  dirty: boolean
  characterUpdated: boolean
  message: string
  regenerateButton: RefObject<HTMLButtonElement | null>
  reading: boolean
  onNotesChange: (notes: string) => void
  onExport: () => void
  onRegenerate: () => void
}

export function TailoringBrief({
  notes, dirty, characterUpdated, message, regenerateButton, reading, onNotesChange, onExport, onRegenerate,
}: TailoringBriefProps) {
  const editor = useRef<HTMLTextAreaElement>(null)
  const [copyMessage, setCopyMessage] = useState('')

  async function copyNotes() {
    try {
      await navigator.clipboard.writeText(notes)
      setCopyMessage('Session notes copied.')
    } catch {
      editor.current?.focus()
      editor.current?.select()
      setCopyMessage('Clipboard unavailable. Copy the selected notes manually.')
    }
  }

  return (
    <Card>
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-2xl">GM tailoring brief</h2>
          <Button type="button" variant="outline" className="min-h-11" onClick={() => {
            setCopyMessage('')
            onExport()
          }}>Export GM package</Button>
        </div>
        <p id="brief-guidance" className="text-muted-foreground">
          Export a GM package to keep the character and notes together. Open it here to resume.
          GM packages contain campaign spoilers.
        </p>
        <p role="status" className="font-medium text-primary">{dirty ? 'Unsaved edits' : ''}</p>
        {characterUpdated ? <p className="font-medium text-primary">Unsaved character update</p> : null}
        <p role="status" className="text-sm text-muted-foreground">{copyMessage || message}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="block space-y-2">
          <span className="font-medium">Session notes (GM only)</span>
          <textarea
            ref={editor}
            rows={20}
            className="w-full rounded-md border border-input bg-background px-3 py-2 leading-relaxed text-foreground focus-visible:outline-2 focus-visible:outline-ring"
            aria-describedby="brief-guidance"
            value={notes}
            onChange={(event) => {
              setCopyMessage('')
              onNotesChange(event.currentTarget.value)
            }}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button type="button" className="min-h-11" onClick={copyNotes}>Copy session notes</Button>
          <Button ref={regenerateButton} type="button" variant="outline" className="min-h-11" disabled={reading} onClick={() => {
            setCopyMessage('')
            onRegenerate()
          }}>
            Regenerate from character
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
