import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { parseCharacter } from '@/character/draft'
import type { CharacterDraft } from '@/character/draft'
import { BuildSummary } from '@/components/BuildSummary'
import { SessionZeroSummary } from '@/components/SessionZeroSummary'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { downloadFile } from '@/lib/download'
import { canAssignSkills, evaluateSkillPlan } from '@/skills/plan'
import { TailoringBrief } from './TailoringBrief'
import { CharacterUpdate, UpdatedSuggestions } from './CharacterUpdate'
import { previewCharacterUpdate } from './character-update.ts'
import { AncestryChoicesSummary } from '@/components/AncestryChoicesSummary'
import { FeatChoicesSummary } from '@/components/FeatChoicesSummary'
import { SpellChoicesSummary } from '@/components/SpellChoicesSummary'
import { EquipmentSummary } from '@/components/EquipmentSummary'
import { tailoringBrief } from './brief.ts'
import { parseGmPackage, serializeGmPackage } from './package.ts'
import type { GmPackage } from './package.ts'

type BriefChange =
  | { kind: 'replace'; workspace: GmPackage; message: string }
  | { kind: 'regenerate' }

type Session = {
  workspace: GmPackage
  cleanNotes: string
  characterUpdated?: boolean
  suggestions?: ReturnType<typeof previewCharacterUpdate>['suggestions']
  importCount: number
  pending: BriefChange | null
  message: string
}

function applyChange(session: Session | null, change: BriefChange): Session | null {
  if (change.kind === 'replace') {
    return {
      workspace: change.workspace,
      cleanNotes: change.workspace.sessionNotes,
      importCount: (session?.importCount ?? 0) + 1,
      pending: null,
      message: change.message,
    }
  }
  if (!session) return null
  const sessionNotes = tailoringBrief(session.workspace.character)
  return {
    ...session,
    workspace: { ...session.workspace, sessionNotes },
    pending: null,
    message: 'Tailoring brief regenerated.',
  }
}

function CharacterSummary({ draft }: { draft: CharacterDraft }) {
  const { build, skills } = draft.buildDraft
  const trainedSkills = skills && canAssignSkills(build)
    ? evaluateSkillPlan(build, skills).rows.filter(({ rank }) => rank !== 'Untrained')
    : []

  return (
    <>
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-2xl">Character concept</h2>
          <SessionZeroSummary answers={draft.sessionZero.answers} />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-5">
          <h2 className="text-2xl">Character build</h2>
          <BuildSummary build={build} />
          <AncestryChoicesSummary choices={draft.ancestryChoices} ancestry={build.ancestry} level={build.level} />
          <FeatChoicesSummary character={draft} />
          <SpellChoicesSummary character={draft} />
          <EquipmentSummary plan={draft.equipmentPlan} build={build} />
          {trainedSkills.length ? (
            <section className="space-y-2">
              <h3 className="text-xl">Planned skills</h3>
              <ul className="grid gap-2 sm:grid-cols-2">
                {trainedSkills.map(({ id, name, rank, modifier }) => (
                  <li key={id}>
                    {name} · {rank} ({modifier >= 0 ? '+' : ''}{modifier})
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {draft.startingLanguageNotes?.trim() ? (
            <section className="space-y-2">
              <h3 className="text-xl">Starting language notes</h3>
              <p className="whitespace-pre-wrap wrap-anywhere">{draft.startingLanguageNotes}</p>
            </section>
          ) : null}
        </CardContent>
      </Card>
    </>
  )
}

export function Workspace() {
  const [session, setSession] = useState<Session | null>(null)
  const [update, setUpdate] = useState<{ filename: string; character: CharacterDraft } | null>(null)
  const [reading, setReading] = useState(false)
  const [error, setError] = useState('')
  const [exportError, setExportError] = useState('')
  const fileSummary = useRef<HTMLElement>(null)
  const updateButton = useRef<HTMLButtonElement>(null)
  const updateFile = useRef<HTMLInputElement>(null)
  const regenerateButton = useRef<HTMLButtonElement>(null)
  const confirmation = useRef<HTMLDialogElement>(null)
  const cancelButton = useRef<HTMLButtonElement>(null)
  const dialogReturn = useRef<'replace' | 'regenerate'>('replace')
  const pending = session?.pending
  const confirming = Boolean(pending)
  const dirty = Boolean(session && session.workspace.sessionNotes !== session.cleanNotes)
  const packageDirty = dirty || Boolean(session?.characterUpdated)
  const currentCharacter = session?.workspace.character
  const updatePreview = useMemo(
    () => currentCharacter && update ? previewCharacterUpdate(currentCharacter, update.character) : null,
    [currentCharacter, update],
  )

  useLayoutEffect(() => {
    const dialog = confirmation.current
    if (!dialog) return
    if (confirming) {
      dialog.showModal()
      cancelButton.current?.focus()
    } else if (dialog.open) {
      dialog.close()
      const target = dialogReturn.current === 'replace' ? fileSummary : regenerateButton
      target.current?.focus()
    }
  }, [confirming])

  useEffect(() => {
    if (!packageDirty) return
    function warnBeforeLeaving(event: BeforeUnloadEvent) {
      event.preventDefault()
      event.returnValue = true
    }
    window.addEventListener('beforeunload', warnBeforeLeaving)
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving)
  }, [packageDirty])

  function requestChange(change: BriefChange) {
    setExportError('')
    dialogReturn.current = change.kind
    setSession((current) => {
      if (current && (current.workspace.sessionNotes !== current.cleanNotes || (change.kind === 'replace' && current.characterUpdated))) {
        return { ...current, pending: change }
      }
      return applyChange(current, change)
    })
  }

  function cancelChange() {
    setExportError('')
    setSession((current) => current && { ...current, pending: null })
  }

  function finishChange() {
    if (pending) setSession(applyChange(session, pending))
  }

  function exportPackage(change?: BriefChange) {
    if (!session) return
    try {
      downloadFile('masque-gm-package.json', serializeGmPackage(session.workspace), 'application/json')
    } catch {
      const message = 'The package couldn’t be downloaded. Try again or copy your notes.'
      if (change) setExportError(message)
      else setSession({ ...session, message })
      return
    }

    const exported = { ...session, cleanNotes: session.workspace.sessionNotes, characterUpdated: false }
    const next = change ? applyChange(exported, change) : exported
    if (next) setSession({
      ...next,
      message: change ? `GM package download started. ${next.message}` : 'GM package download started.',
    })
  }

  function closeUpdate() {
    setUpdate(null)
    updateButton.current?.focus()
  }

  function applyUpdate() {
    if (!update || !updatePreview) return
    setSession((current) => current && {
      ...current,
      workspace: { ...current.workspace, character: update.character },
      characterUpdated: true,
      suggestions: updatePreview.suggestions,
      message: 'Character updated. Export the GM package to save this revision.',
    })
    closeUpdate()
  }

  async function openCharacter(event: ChangeEvent<HTMLInputElement>, updating = false) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return

    setReading(true)
    setError('')
    try {
      const text = await file.text()
      if (updating) {
        const character = parseCharacter(text)
        if (character) setUpdate({ filename: file.name, character })
        else setError('Choose a revised player character JSON from Download for GM or Download backup.')
        return
      }
      const gmPackage = parseGmPackage(text)
      const character = gmPackage ? null : parseCharacter(text)
      const nextWorkspace = gmPackage ?? (character ? { character, sessionNotes: tailoringBrief(character) } : null)
      if (nextWorkspace) {
        requestChange({
          kind: 'replace',
          workspace: nextWorkspace,
          message: gmPackage ? 'GM package restored.' : 'Character loaded. Tailoring brief generated.',
        })
      }
      else setError('Choose a character JSON file from Download for GM or Download backup, or open an exported GM package. The current character and notes have been kept.')
    } catch {
      setError('This file couldn’t be read.')
    } finally {
      setReading(false)
    }
  }

  return (
    <div className="relative flex min-h-svh flex-col text-foreground">
      <header className="masque-masthead relative z-10">
        <div className="mx-auto max-w-[45rem] px-4 py-6 sm:px-6 sm:py-7">
          <p className="masque-masthead-kicker mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] sm:text-xs">
            The Masque of Shattered Mirrors
          </p>
          <h1 className="masque-title">GM workspace</h1>
        </div>
      </header>
      <main className="relative z-10 mx-auto flex w-full max-w-[45rem] flex-1 flex-col gap-7 px-4 py-7 sm:px-6 sm:py-10">
        <Card>
          <CardContent className="space-y-3">
            {session ? (
              <div className="space-y-2">
                <Button ref={updateButton} type="button" disabled={reading} onClick={() => updateFile.current?.click()}>Update player character</Button>
                <input ref={updateFile} type="file" accept=".json,application/json" hidden onChange={(event) => void openCharacter(event, true)} />
                <p className="text-sm text-muted-foreground">Preview a revised player file and keep the current session notes.</p>
              </div>
            ) : null}
            <details key={session?.importCount ?? 0} open={!session} className="space-y-3">
              <summary ref={fileSummary} className="font-medium">
                {session ? 'Replace character or GM package' : 'Open a character or GM package'}
              </summary>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground">A character generates a brief; a GM package restores saved notes.</p>
                </div>
                <label className="block">
                  <span className="sr-only">Character or GM package JSON file</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    disabled={reading || Boolean(update)}
                    className="block min-h-11 w-full cursor-pointer rounded-md border border-input bg-background px-2 file:mr-3 file:min-h-11 file:cursor-pointer file:border-0 file:bg-transparent file:font-medium file:text-primary"
                    onChange={openCharacter}
                  />
                </label>
              </div>
            </details>
            {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
          </CardContent>
        </Card>
        {update && updatePreview ? (
          <CharacterUpdate filename={update.filename} preview={updatePreview} onApply={applyUpdate} onCancel={closeUpdate} />
        ) : null}
        {session ? (
          <>
            <TailoringBrief
              key={session.importCount}
              notes={session.workspace.sessionNotes}
              dirty={dirty}
              characterUpdated={Boolean(session.characterUpdated)}
              message={session.message}
              regenerateButton={regenerateButton}
              reading={reading || Boolean(update)}
              onNotesChange={(sessionNotes) => setSession((current) => current && ({
                ...current,
                workspace: { ...current.workspace, sessionNotes },
                message: '',
              }))}
              onExport={() => exportPackage()}
              onRegenerate={() => requestChange({ kind: 'regenerate' })}
            />
            {session.suggestions ? <UpdatedSuggestions key={session.importCount + ':' + JSON.stringify(session.suggestions)} suggestions={session.suggestions} /> : null}
            <CharacterSummary draft={session.workspace.character} />
          </>
        ) : null}
      </main>
      <dialog
        ref={confirmation}
        role="alertdialog"
        aria-labelledby="unsaved-notes-title"
        aria-describedby="unsaved-notes-description"
        className="fixed top-1/2 left-1/2 m-0 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-1/2 space-y-4 overflow-y-auto rounded-xl border border-border bg-card p-5 text-card-foreground shadow-xl backdrop:bg-black/60"
        onCancel={(event) => {
          event.preventDefault()
          cancelChange()
        }}
      >
        <h2 id="unsaved-notes-title" className="text-2xl">{pending?.kind === 'replace' && session?.characterUpdated ? 'Unsaved GM package' : 'Unsaved GM notes'}</h2>
        <p id="unsaved-notes-description" className="text-sm text-muted-foreground">
          {pending?.kind === 'replace' ? 'Opening this file will replace the current character and notes.' : 'Regenerating the brief will replace your notes.'}
          {' Export a GM package to keep a copy before continuing.'}
        </p>
        {exportError ? <p role="alert" className="text-sm text-destructive">{exportError}</p> : null}
        <div className="flex flex-wrap gap-2">
          <Button ref={cancelButton} type="button" variant="outline" className="min-h-11" onClick={cancelChange}>Cancel</Button>
          <Button type="button" className="min-h-11" onClick={() => { if (pending) exportPackage(pending) }}>Export package</Button>
          <Button type="button" variant="destructive" className="min-h-11" onClick={finishChange}>Discard edits</Button>
        </div>
      </dialog>
    </div>
  )
}
