import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { parseCharacter } from '@/character/draft'
import type { CharacterDraft } from '@/character/draft'
import { BuildSummary } from '@/components/BuildSummary'
import { SessionZeroSummary } from '@/components/SessionZeroSummary'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { canAssignSkills, evaluateSkillPlan } from '@/skills/plan'
import { TailoringBrief } from './TailoringBrief'
import { AncestryChoicesSummary } from '@/components/AncestryChoicesSummary'
import { FeatChoicesSummary } from '@/components/FeatChoicesSummary'
import { tailoringBrief } from './brief.ts'
import { parseGmPackage } from './package.ts'
import type { GmPackage } from './package.ts'

function CharacterSummary({ draft }: { draft: CharacterDraft }) {
  const { build, skills } = draft.buildDraft
  const trainedSkills = skills && canAssignSkills(build)
    ? evaluateSkillPlan(build, skills).rows.filter(({ rank }) => rank !== 'Untrained')
    : []

  return (
    <>
      <Card>
        <CardHeader><h2 className="text-2xl">Character concept</h2></CardHeader>
        <CardContent><SessionZeroSummary answers={draft.sessionZero.answers} /></CardContent>
      </Card>
      <Card>
        <CardHeader><h2 className="text-2xl">Character build</h2></CardHeader>
        <CardContent className="space-y-4">
          <BuildSummary build={build} />
          <AncestryChoicesSummary choices={draft.ancestryChoices} ancestry={build.ancestry} level={build.level} />
          <FeatChoicesSummary character={draft} />
          {trainedSkills.length ? (
            <section>
              <h3 className="text-xl">Planned skills</h3>
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                {trainedSkills.map(({ id, name, rank, modifier }) => (
                  <li key={id}>
                    {name} · {rank} ({modifier >= 0 ? '+' : ''}{modifier})
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {draft.startingLanguageNotes?.trim() ? (
            <section>
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
  const [workspace, setWorkspace] = useState<GmPackage | null>(null)
  const [reading, setReading] = useState(false)
  const [error, setError] = useState('')
  const [importCount, setImportCount] = useState(0)
  const [message, setMessage] = useState('')
  const filePanel = useRef<HTMLDetailsElement>(null)

  async function openCharacter(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return

    setReading(true)
    setError('')
    setMessage('')
    try {
      const text = await file.text()
      const gmPackage = parseGmPackage(text)
      const character = gmPackage ? null : parseCharacter(text)
      const nextWorkspace = gmPackage ?? (character ? { character, sessionNotes: tailoringBrief(character) } : null)
      if (nextWorkspace) {
        setWorkspace(nextWorkspace)
        setImportCount((count) => count + 1)
        setMessage(gmPackage ? 'GM package restored.' : 'Character loaded. Tailoring brief generated.')
        if (filePanel.current) filePanel.current.open = false
      }
      else setError('Choose a valid JSON file from Export character or Export GM package. The current character and notes have been kept.')
    } catch {
      setError('This file couldn’t be read.')
    } finally {
      setReading(false)
    }
  }

  return (
    <>
      <header className="masque-masthead">
        <div className="mx-auto max-w-[45rem] px-4 py-6 sm:px-6 sm:py-7">
          <p className="masque-masthead-kicker mb-1 text-xs font-semibold uppercase tracking-[0.18em]">
            The Masque of Shattered Mirrors
          </p>
          <h1 className="masque-title">GM workspace</h1>
        </div>
      </header>
      <main className="mx-auto flex max-w-[45rem] flex-col gap-6 px-4 py-7 sm:px-6">
        <Card>
          <CardContent className="space-y-2">
            <details ref={filePanel} open={!workspace}>
              <summary className="cursor-pointer font-medium">
                {workspace ? 'Replace character or GM package' : 'Open a character or GM package'}
              </summary>
              <div className="mt-3 space-y-2">
                <p className="text-sm text-muted-foreground">A character generates a brief; a GM package restores saved notes.</p>
                {workspace ? <p className="text-sm text-muted-foreground">Export your edits before replacing this workspace.</p> : null}
                <label className="block space-y-1">
                  <span className="sr-only">Character or GM package JSON file</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    disabled={reading}
                    className="block w-full rounded-md border border-input bg-background p-2 file:mr-3 file:font-medium file:text-primary"
                    onChange={openCharacter}
                  />
                </label>
                {error ? <p role="alert" className="text-destructive">{error}</p> : null}
              </div>
            </details>
            {message ? <p role="status" className="text-sm text-muted-foreground">{message}</p> : null}
          </CardContent>
        </Card>
        {workspace ? (
          <>
            <TailoringBrief key={importCount} draft={workspace.character} initialNotes={workspace.sessionNotes} />
            <CharacterSummary draft={workspace.character} />
          </>
        ) : null}
      </main>
    </>
  )
}
