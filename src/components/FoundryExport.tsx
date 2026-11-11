import { useState } from 'react'
import type { CharacterDraft } from '@/character/draft'
import { Button } from '@/components/ui/button'
import { downloadFile } from '@/lib/download'

export function FoundryExport({ draft }: { draft: CharacterDraft }) {
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'working' | 'downloaded' | 'failed'>('idle')

  async function downloadActor() {
    setStatus('working')
    try {
      const { serializeFoundryActor } = await import('@/character/foundry')
      downloadFile('masque-foundry-actor.json', serializeFoundryActor(draft, name), 'application/json')
      setStatus('downloaded')
    } catch {
      setStatus('failed')
    }
  }

  return (
    <details className="mt-3 rounded-md border border-border p-3">
      <summary className="min-h-9 cursor-pointer font-medium">Export to Foundry VTT</summary>
      <div className="space-y-3 text-sm">
        <p className="text-muted-foreground">For Foundry 14 with the PF2e 8.7.0 system. Create a blank Character in Foundry, right-click it in Actors, and choose <strong>Import Data</strong>. Importing replaces that actor’s data.</p>
        <p className="text-muted-foreground">Level, modifiers, skills, and gear transfer to the sheet. Open Biography → Campaign Notes for the checklist of compendium choices to add in Foundry.</p>
        <label className="block space-y-1">
          <span className="font-medium">Foundry actor name (optional)</span>
          <input className="min-h-11 w-full rounded-md border border-input bg-background px-3 focus-visible:outline-2 focus-visible:outline-ring" maxLength={80} placeholder="Masque Character" value={name} onChange={(event) => setName(event.currentTarget.value)} />
        </label>
        <Button type="button" variant="outline" className="min-h-11" disabled={status === 'working'} onClick={downloadActor}>
          {status === 'working' ? 'Preparing actor…' : 'Download Foundry actor'}
        </Button>
        {status === 'downloaded' ? <p role="status" className="text-muted-foreground">Foundry actor file downloaded.</p> : null}
        {status === 'failed' ? <p role="alert" className="text-destructive">The actor file couldn’t be prepared. Try downloading again.</p> : null}
      </div>
    </details>
  )
}
