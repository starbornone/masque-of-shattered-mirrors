import { useState } from 'react'
import { draftNameError, maxDraftNameLength } from '@/character/library'
import type { DraftLibrary, NamedDraft } from '@/character/library'
import { Button } from '@/components/ui/button'

const field = 'min-h-11 w-full rounded-md border border-input bg-background px-3 text-foreground focus-visible:outline-2 focus-visible:outline-ring'

export function DraftPicker({ library, active, onSwitch, onCreate, onRename, onDelete }: {
  library: DraftLibrary
  active: NamedDraft
  onSwitch: (id: string) => boolean
  onCreate: (name: string) => boolean
  onRename: (name: string) => boolean
  onDelete: () => boolean
}) {
  const [action, setAction] = useState<'create' | 'rename' | 'delete' | null>(null)
  const [name, setName] = useState('')
  const nameError = draftNameError(library, name, action === 'rename' ? active.id : undefined)

  function begin(next: typeof action) {
    setName(next === 'rename' ? active.name : '')
    setAction(next)
  }

  return (
    <section aria-label="Character drafts" className="masque-panel mx-auto w-full max-w-2xl space-y-3 rounded-xl border border-border bg-card p-4 print:hidden">
      <div className="flex flex-wrap items-end gap-2">
        <label className="min-w-36 flex-1 space-y-1">
          <span className="block text-sm font-medium">Active character draft</span>
          <select className={field} value={active.id} onChange={(event) => { if (onSwitch(event.currentTarget.value)) begin(null) }}>
            {library.drafts.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
          </select>
        </label>
        <Button type="button" variant="outline" className="min-h-11" onClick={() => begin('create')}>New draft</Button>
        <Button type="button" variant="ghost" className="min-h-11" onClick={() => begin('rename')}>Rename</Button>
        {library.drafts.length > 1 ? (
          <Button type="button" variant="ghost" className="min-h-11" onClick={() => begin('delete')}>Delete</Button>
        ) : null}
      </div>
      {action === 'create' || action === 'rename' ? (
        <form className="space-y-2" onSubmit={(event) => {
          event.preventDefault()
          if (nameError) return
          const saved = action === 'create' ? onCreate(name) : onRename(name)
          if (saved) begin(null)
        }}>
          <label className="block space-y-1">
            <span className="text-sm font-medium">{action === 'create' ? 'New draft name' : 'Draft name'}</span>
            <input className={field} maxLength={maxDraftNameLength} value={name} onChange={(event) => setName(event.currentTarget.value)} />
          </label>
          {name.trim() && nameError ? <p className="text-sm text-destructive">{nameError}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" className="min-h-11" disabled={Boolean(nameError)}>{action === 'create' ? 'Create draft' : 'Save name'}</Button>
            <Button type="button" variant="ghost" className="min-h-11" onClick={() => begin(null)}>Cancel</Button>
          </div>
        </form>
      ) : null}
      {action === 'delete' ? (
        <div className="space-y-2">
          <p className="wrap-anywhere text-sm">Delete <strong>{active.name}</strong> from this browser?</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="destructive" className="min-h-11" onClick={() => { if (onDelete()) begin(null) }}>Delete draft</Button>
            <Button type="button" variant="outline" className="min-h-11" onClick={() => begin(null)}>Cancel</Button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
