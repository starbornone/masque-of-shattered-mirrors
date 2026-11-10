import { useRef, useState } from 'react'
import veratheMirror from '@/assets/verathe-mirror.svg'
import { parseBuild } from '@/attributes/build'
import type { BuildDraft } from '@/attributes/draft'
import { characterStorageKey, loadCharacterDraft, serializeCharacter } from '@/character/draft'
import type { CharacterDraft } from '@/character/draft'
import { BuildActions } from '@/components/BuildActions'
import { BuildGuide, BuildSummary } from '@/components/BuildGuide'
import { CampaignFit } from '@/components/CampaignFit'
import { CharacterFileActions } from '@/components/CharacterFileActions'
import { Navbar } from '@/components/Navbar'
import { PrintableAttributeLedger } from '@/components/PrintableAttributeLedger'
import { SessionZeroGuide } from '@/components/SessionZeroGuide'
import { SkillPlanner } from '@/components/SkillPlanner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { SessionZeroDraft } from '@/session-zero/types'
import { canAssignSkills, emptySkillPlan, parseSkillPlan } from '@/skills/plan'

function App() {
  const [character, setCharacter] = useState(() => (
    loadCharacterDraft(Number(import.meta.env.VITE_CAMPAIGN_START_LEVEL))
  ))
  const [shared, setShared] = useState(() => {
    const requested = new URLSearchParams(window.location.search).get('build')
    return requested === null ? null : { build: parseBuild(requested) }
  })
  const [storageError, setStorageError] = useState(false)
  const [restoreCount, setRestoreCount] = useState(0)
  const concept = useRef<HTMLDivElement>(null)
  const { sessionZero: draft, buildDraft } = character
  const { build, step: savedStep, skills } = buildDraft
  const skillsAvailable = (savedStep === 'review' || savedStep === 'skills') && canAssignSkills(build)
  const step = savedStep === 'skills' && !skillsAvailable ? 'review' : savedStep
  const sharedBuild = shared?.build
  const reviewBuild = sharedBuild ?? (step === 'review' ? build : null)

  function persistCharacter(next: CharacterDraft) {
    try {
      localStorage.setItem(characterStorageKey, serializeCharacter(next))
      setStorageError(false)
      return true
    } catch {
      return false
    }
  }

  function saveCharacter(next: CharacterDraft) {
    setCharacter(next)
    if (!persistCharacter(next)) setStorageError(true)
  }

  function saveDraft(next: SessionZeroDraft) {
    saveCharacter({ ...character, sessionZero: next })
  }

  function saveBuild(next: BuildDraft) {
    saveCharacter({ ...character, buildDraft: next })
  }

  function restoreCharacter(next: CharacterDraft) {
    if (!persistCharacter(next)) return false
    setCharacter(next)
    setRestoreCount((count) => count + 1)
    if (shared) closeSharedBuild()
    return true
  }

  function closeSharedBuild() {
    const url = new URL(window.location.href)
    url.searchParams.delete('build')
    window.history.replaceState(window.history.state, '', url)
    setShared(null)
  }

  function returnToConcept() {
    saveBuild({ ...buildDraft, step: null })
    requestAnimationFrame(() => concept.current?.querySelector('h2')?.focus())
  }

  return (
    <div
      className="relative flex min-h-svh flex-col overflow-hidden text-foreground"
      data-print-ledger={reviewBuild ? '' : undefined}
    >
      <img
        src={veratheMirror}
        alt=""
        width={600}
        height={620}
        className="verathe-backdrop pointer-events-none absolute print:hidden"
      />

      <header className="masque-masthead relative z-10">
        <div className="mx-auto max-w-[45rem] px-4 py-6 sm:px-6 sm:py-7">
          <div className="veil-in flex items-center gap-3.5 sm:gap-4">
            <img
              src={`${import.meta.env.BASE_URL}favicon.svg`}
              alt=""
              width={56}
              height={56}
              className="size-11 shrink-0 sm:size-14"
            />
            <div>
              <p className="masque-masthead-kicker mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] sm:text-xs">
                The Masque of Shattered Mirrors
              </p>
              <h1 className="masque-title">
                Masque Character Creator
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-[45rem] flex-1 flex-col gap-7 px-4 py-7 sm:px-6 sm:py-10">
        {storageError ? (
          <p role="alert" className="mx-auto w-full max-w-2xl text-destructive">
            This browser couldn’t save your draft. Use Export character to keep a copy.
          </p>
        ) : null}
        {shared && !sharedBuild ? (
          <p role="alert" className="mx-auto w-full max-w-2xl text-destructive">
            This build link couldn’t be opened.
          </p>
        ) : null}
        <div hidden={Boolean(sharedBuild) || step !== null} ref={concept} className="mx-auto w-full max-w-2xl">
          <SessionZeroGuide
            key={restoreCount}
            answers={draft.answers}
            initialStep={draft.step}
            onChange={(answers) => saveDraft({ ...draft, answers })}
            onProgress={(step) => saveDraft({ ...draft, step })}
            onStartBuild={() => saveBuild({ ...buildDraft, step: 'ancestry' })}
          />
        </div>
        {!sharedBuild && step && step !== 'skills' ? (
          <div className="mx-auto w-full max-w-2xl">
            <BuildGuide
              build={build}
              currentStep={step}
              onChange={(next) => saveBuild({ ...buildDraft, build: next, step })}
              onProgress={(next) => saveBuild({ ...buildDraft, step: next })}
              onBackToConcept={returnToConcept}
              onPlanSkills={skillsAvailable ? () => saveBuild({ ...buildDraft, step: 'skills' }) : undefined}
            />
          </div>
        ) : null}

        {!sharedBuild && step === 'skills' ? (
          <SkillPlanner
            key={restoreCount}
            build={build}
            plan={skills ?? emptySkillPlan}
            onChange={(next) => saveBuild({ ...buildDraft, skills: parseSkillPlan(next) })}
            onBack={() => saveBuild({ ...buildDraft, step: 'review' })}
          />
        ) : null}

        {sharedBuild ? (
          <section aria-labelledby="shared-build-heading" className="mx-auto w-full max-w-2xl">
            <Card>
              <CardHeader>
                <h2 id="shared-build-heading" className="text-3xl">Shared build</h2>
                <p className="text-muted-foreground">
                  You can review or print this build. Using it replaces the build saved in this browser.
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                <BuildSummary build={sharedBuild} />
                <BuildActions build={sharedBuild} />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    className="min-h-11"
                    onClick={() => {
                      saveBuild({ build: sharedBuild, step: 'review' })
                      closeSharedBuild()
                    }}
                  >
                    Use shared build
                  </Button>
                  <Button type="button" variant="outline" className="min-h-11" onClick={closeSharedBuild}>
                    Back to my draft
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        ) : null}

        {reviewBuild ? <CampaignFit build={reviewBuild} skillPlan={!sharedBuild && skillsAvailable ? skills : undefined} /> : null}
        {!sharedBuild ? <CharacterFileActions draft={character} onRestore={restoreCharacter} /> : null}
      </main>

      <div className="relative z-10">
        <Navbar />
      </div>
      {reviewBuild ? <PrintableAttributeLedger build={reviewBuild} /> : null}
    </div>
  )
}

export default App
