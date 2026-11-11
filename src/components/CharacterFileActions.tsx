import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Download, Upload } from 'lucide-react'
import { parseCharacter, serializeCharacter } from '@/character/draft'
import type { CharacterDraft } from '@/character/draft'
import { maxDraftNameLength } from '@/character/library'
import { Button } from '@/components/ui/button'
import { FoundryExport } from '@/components/FoundryExport'
import { downloadFile } from '@/lib/download'

type CharacterFileActionsProps = {
  draft: CharacterDraft
  draftName: string
  validateName: (name: string) => string
  onImportNew: (name: string, draft: CharacterDraft) => boolean
  onRestore: (draft: CharacterDraft) => boolean
}

export function CharacterFileActions({ draft, draftName, validateName, onImportNew, onRestore }: CharacterFileActionsProps) {
  const input = useRef<HTMLInputElement>(null)
  const importButton = useRef<HTMLButtonElement>(null)
  const [pending, setPending] = useState<{ filename: string; draft: CharacterDraft } | null>(null)
  const [importName, setImportName] = useState('')
  const [reading, setReading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const nameError = validateName(importName)

  async function readCharacter(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return
    setPending(null)
    setReading(true)
    setError('')
    setStatus('')
    try {
      const imported = parseCharacter(await file.text())
      if (imported) {
        setPending({ filename: file.name, draft: imported })
        setImportName(file.name.replace(/\.json$/i, '').trim().slice(0, maxDraftNameLength).trim() || 'Imported character')
      } else setError('Choose a valid JSON file downloaded with Export character.')
    } catch {
      setError('This file couldn’t be read.')
    } finally {
      setReading(false)
    }
  }

  function closeImport() {
    setPending(null)
    setError('')
    importButton.current?.focus()
  }

  function restoreCharacter() {
    if (!pending) return
    if (!onRestore(pending.draft)) {
      setError('This browser couldn’t save the imported character. Your current draft is still open.')
      return
    }
    closeImport()
    setStatus(`Character restored to “${draftName}”.`)
  }

  function importNewDraft() {
    if (!pending || nameError) return
    if (!onImportNew(importName, pending.draft)) {
      setError('This browser couldn’t save the new draft.')
    }
  }

  return (
    <section aria-labelledby="character-file-heading" className="masque-panel mx-auto w-full max-w-2xl rounded-xl border border-border bg-card p-4 print:hidden sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="max-w-[18rem]">
          <h2 id="character-file-heading" className="font-heading text-2xl">Character file</h2>
          <p className="text-sm text-muted-foreground">
            Export “{draftName}” or import a character file.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={() => downloadFile('masque-character.json', serializeCharacter(draft), 'application/json')}
          >
            <Download aria-hidden="true" /> Export character
          </Button>
          <Button
            ref={importButton}
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={reading}
            onClick={() => input.current?.click()}
          >
            <Upload aria-hidden="true" /> Import character
          </Button>
          <input ref={input} type="file" accept=".json,application/json" hidden onChange={readCharacter} />
        </div>
      </div>
      {pending ? (
        <div className="mt-3 space-y-3 rounded-lg border border-border bg-background p-4">
          <p className="break-all font-medium">{pending.filename}</p>
          <p className="text-sm text-muted-foreground">Save this file as a new draft or replace “{draftName}”.</p>
          <label className="block space-y-1">
            <span className="text-sm font-medium">New draft name</span>
            <input
              className="min-h-11 w-full rounded-md border border-input bg-background px-3 text-foreground focus-visible:outline-2 focus-visible:outline-ring"
              value={importName}
              maxLength={maxDraftNameLength}
              onChange={(event) => setImportName(event.currentTarget.value)}
            />
          </label>
          {nameError ? <p className="text-sm text-destructive">{nameError}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Button type="button" className="min-h-11" onClick={importNewDraft} disabled={Boolean(nameError)}>Import as new draft</Button>
            <Button type="button" variant="outline" className="min-h-11" onClick={restoreCharacter}>Replace active draft</Button>
            <Button type="button" variant="outline" className="min-h-11" onClick={closeImport}>Cancel</Button>
          </div>
        </div>
      ) : null}
      {error ? <p role="alert" className="mt-3 text-sm text-destructive">{error}</p> : null}
      <div role="status" className="text-sm text-muted-foreground [&:not(:empty)]:mt-3">
        {pending ? `Ready to import ${pending.filename}.` : status}
      </div>
      <FoundryExport draft={draft} />
    </section>
  )
}
