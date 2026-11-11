import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { parseCharacter } from '@/character/draft'
import type { CharacterDraft } from '@/character/draft'
import { BuildSummary } from '@/components/BuildSummary'
import { SessionZeroSummary } from '@/components/SessionZeroSummary'
import { Card, CardContent } from '@/components/ui/card'
import { canAssignSkills, evaluateSkillPlan } from '@/skills/plan'
import { TailoringBrief } from './TailoringBrief'
import { AncestryChoicesSummary } from '@/components/AncestryChoicesSummary'
import { FeatChoicesSummary } from '@/components/FeatChoicesSummary'
import { SpellChoicesSummary } from '@/components/SpellChoicesSummary'
import { EquipmentSummary } from '@/components/EquipmentSummary'
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
            <details ref={filePanel} open={!workspace} className="space-y-3">
              <summary className="cursor-pointer font-medium">
                {workspace ? 'Replace character or GM package' : 'Open a character or GM package'}
              </summary>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground">A character generates a brief; a GM package restores saved notes.</p>
                  {workspace ? <p className="text-sm text-muted-foreground">Export your edits before replacing this workspace.</p> : null}
                </div>
                <label className="block">
                  <span className="sr-only">Character or GM package JSON file</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    disabled={reading}
                    className="block w-full rounded-md border border-input bg-background p-2 file:mr-3 file:font-medium file:text-primary"
                    onChange={openCharacter}
                  />
                </label>
                {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
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
    </div>
  )
}
