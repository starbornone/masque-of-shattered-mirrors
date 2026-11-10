import { useRef, useState } from 'react'
import type { CharacterDraft } from '@/character/draft'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { downloadFile } from '@/lib/download'
import { tailoringBrief } from './brief.ts'
import { serializeGmPackage } from './package.ts'

export function TailoringBrief({ draft, initialNotes }: { draft: CharacterDraft; initialNotes: string }) {
  const [notes, setNotes] = useState(initialNotes)
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

  function exportPackage() {
    try {
      downloadFile('masque-gm-package.json', serializeGmPackage({ character: draft, sessionNotes: notes }), 'application/json')
      setMessage('GM package download started.')
    } catch {
      setMessage('The package couldn’t be downloaded. Copy your notes and try again.')
    }
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl">GM tailoring brief</h2>
        <p id="brief-guidance" className="text-muted-foreground">
          Edit these preparation suggestions, then copy them or export a GM package to save the character and notes together.
          Open the package above to resume. GM packages contain campaign spoilers.
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
          <Button type="button" variant="outline" className="min-h-11" onClick={exportPackage}>Export GM package</Button>
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
