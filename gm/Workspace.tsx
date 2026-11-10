import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { parseCharacter } from '@/character/draft'
import type { CharacterDraft } from '@/character/draft'
import { BuildSummary } from '@/components/BuildGuide'
import { SessionZeroSummary } from '@/components/SessionZeroSummary'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { canAssignSkills, evaluateSkillPlan } from '@/skills/plan'
import { TailoringBrief } from './TailoringBrief'

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
  const [draft, setDraft] = useState<CharacterDraft | null>(null)
  const [reading, setReading] = useState(false)
  const [error, setError] = useState('')
  const [importCount, setImportCount] = useState(0)

  async function openCharacter(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return

    setReading(true)
    setError('')
    try {
      const character = parseCharacter(await file.text())
      if (character) {
        setDraft(character)
        setImportCount((count) => count + 1)
      }
      else setError('Choose a JSON file downloaded with Export character.')
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
          <CardHeader>
            <h2 className="text-2xl">Open a player character</h2>
            <p className="text-muted-foreground">Choose the player’s exported character file. The file is read in this browser tab.</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <label className="block space-y-1">
              <span className="font-medium">Character JSON file</span>
              <input
                type="file"
                accept=".json,application/json"
                disabled={reading}
                className="block w-full rounded-md border border-input bg-background p-2 file:mr-3 file:font-medium file:text-primary"
                onChange={openCharacter}
              />
            </label>
            {error ? <p role="alert" className="text-destructive">{error}</p> : null}
            {draft ? <p role="status" className="text-muted-foreground">Character loaded.</p> : null}
          </CardContent>
        </Card>
        {draft ? (
          <>
            <TailoringBrief key={importCount} draft={draft} />
            <CharacterSummary draft={draft} />
          </>
        ) : null}
      </main>
    </>
  )
}
