import { useLayoutEffect, useRef, useState } from 'react'
import veratheMirror from '@/assets/verathe-mirror.svg'
import { parseBuild } from '@/attributes/build'
import type { BuildDraft, BuildStep } from '@/attributes/draft'
import type { CharacterDraft } from '@/character/draft'
import { draftNameError, loadDraftLibrary, newCharacterDraft, storeDraftLibrary } from '@/character/library'
import type { DraftLibrary } from '@/character/library'
import { BuildActions } from '@/components/BuildActions'
import { BuildGuide } from '@/components/BuildGuide'
import { BuildSummary } from '@/components/BuildSummary'
import { CampaignFit } from '@/components/CampaignFit'
import { CharacterFileActions } from '@/components/CharacterFileActions'
import { DraftPicker } from '@/components/DraftPicker'
import { Navbar } from '@/components/Navbar'
import { PrintableAttributeLedger } from '@/components/PrintableAttributeLedger'
import { SessionZeroGuide } from '@/components/SessionZeroGuide'
import { SkillPlanner } from '@/components/SkillPlanner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { SessionZeroDraft } from '@/session-zero/types'
import { canAssignSkills, emptySkillPlan, parseSkillPlan } from '@/skills/plan'

const startLevel = Number(import.meta.env.VITE_CAMPAIGN_START_LEVEL)
const storageMessages = {
  unavailable: 'This browser couldn’t save your drafts. Use Export character to keep a copy of your work.',
  changed: 'Saved drafts changed in another tab. Export any unsaved work, then reload this page.',
  unreadable: 'This browser’s draft library couldn’t be read. The older draft is open when available. Use Export character to keep a copy.',
}

type SkillReturn = { label: string; trigger: HTMLButtonElement; top: number }

function App() {
  const [stored, setStored] = useState(() => loadDraftLibrary(startLevel))
  const [shared, setShared] = useState(() => {
    const requested = new URLSearchParams(window.location.search).get('build')
    return requested === null ? null : { build: parseBuild(requested) }
  })
  const [restoreCount, setRestoreCount] = useState(0)
  const [editingFromReview, setEditingFromReview] = useState(false)
  const [skillReturn, setSkillReturn] = useState<SkillReturn | null>(null)
  const skillReturnPosition = useRef<SkillReturn | null>(null)
  const concept = useRef<HTMLDivElement>(null)
  const reviewPosition = useRef<{ triggerId: string; top: number; languagesOpen: boolean } | null>(null)
  const { library, problem } = stored
  const active = library.drafts.find(({ id }) => id === library.activeId)!
  const character = active.character
  const editorKey = `${active.id}:${restoreCount}`
  const { sessionZero: draft, buildDraft } = character
  const { build, step: savedStep, skills } = buildDraft
  const skillsAvailable = canAssignSkills(build)
  const step = savedStep === 'skills' && !skillsAvailable ? 'review' : savedStep
  const sharedBuild = shared?.build
  const reviewBuild = sharedBuild ?? (step === 'review' ? build : null)
  useLayoutEffect(() => {
    const position = reviewPosition.current
    if (!position || step !== 'review' || sharedBuild) return
    reviewPosition.current = null
    const languages = document.querySelector<HTMLDetailsElement>('#review-starting-languages')
    if (languages) languages.open = position.languagesOpen
    const anchor = document.getElementById(position.triggerId)
      ?? document.querySelector<HTMLButtonElement>('#build-review-actions + ul button')
      ?? document.getElementById('build-review-actions')
      ?? document.getElementById('build-guide-heading')
    anchor?.focus({ preventScroll: true })
    if (anchor) window.scrollBy({ top: anchor.getBoundingClientRect().top - position.top, behavior: 'instant' })
  }, [sharedBuild, step])

  useLayoutEffect(() => {
    const position = skillReturnPosition.current
    if (skillReturn || !position) return
    skillReturnPosition.current = null
    position.trigger.focus({ preventScroll: true })
    window.scrollBy({ top: position.trigger.getBoundingClientRect().top - position.top, behavior: 'instant' })
  }, [skillReturn])

  function resetEditorNavigation() {
    reviewPosition.current = null
    setEditingFromReview(false)
    skillReturnPosition.current = null
    setSkillReturn(null)
  }

  function saveLibrary(next: DraftLibrary, keepInMemory = false) {
    const result = problem === 'unreadable' ? { problem } : storeDraftLibrary(next, stored.saved)
    if (result.problem) {
      setStored({ ...stored, library: keepInMemory ? next : library, problem: result.problem })
      return false
    }
    if (next.activeId !== library.activeId) resetEditorNavigation()
    setStored({ library: next, saved: result.saved, problem: null })
    return true
  }

  function updateActive(changes: Partial<Pick<typeof active, 'name' | 'character'>>) {
    return { ...library, drafts: library.drafts.map((entry) => entry.id === active.id ? { ...entry, ...changes } : entry) }
  }

  function saveCharacter(next: CharacterDraft) {
    saveLibrary(updateActive({ character: next }), true)
  }

  function createDraft(name: string, next: CharacterDraft = newCharacterDraft(startLevel)) {
    if (draftNameError(library, name)) return false
    const entry = { id: crypto.randomUUID(), name: name.trim(), character: next }
    return saveLibrary({ activeId: entry.id, drafts: [...library.drafts, entry] })
  }

  function renameDraft(name: string) {
    if (draftNameError(library, name, active.id)) return false
    return saveLibrary(updateActive({ name: name.trim() }))
  }

  function deleteDraft() {
    if (library.drafts.length < 2) return false
    const drafts = library.drafts.filter(({ id }) => id !== active.id)
    return saveLibrary({ activeId: drafts[0].id, drafts })
  }

  function saveDraft(next: SessionZeroDraft) {
    saveCharacter({ ...character, sessionZero: next })
  }

  function saveBuild(next: BuildDraft) {
    saveCharacter({ ...character, buildDraft: next })
  }

  function editFromReview(next: BuildStep, trigger: HTMLButtonElement) {
    reviewPosition.current = {
      triggerId: trigger.id,
      top: trigger.getBoundingClientRect().top,
      languagesOpen: document.querySelector<HTMLDetailsElement>('#review-starting-languages')?.open ?? false,
    }
    setEditingFromReview(true)
    saveBuild({ ...buildDraft, step: next })
  }

  function returnToReview() {
    setEditingFromReview(false)
    saveBuild({ ...buildDraft, step: 'review' })
  }

  function openSkillPlanner(label: string, trigger: HTMLButtonElement) {
    setSkillReturn({ label, trigger, top: trigger.getBoundingClientRect().top })
  }

  function closeSkillPlanner() {
    skillReturnPosition.current = skillReturn
    setSkillReturn(null)
  }

  function restoreCharacter(next: CharacterDraft) {
    if (!saveLibrary(updateActive({ character: next }))) return false
    resetEditorNavigation()
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
        {problem ? (
          <p role="alert" className="mx-auto w-full max-w-2xl text-destructive">
            {storageMessages[problem]}
          </p>
        ) : null}
        {shared && !sharedBuild ? (
          <p role="alert" className="mx-auto w-full max-w-2xl text-destructive">
            This build link couldn’t be opened.
          </p>
        ) : null}
        {!sharedBuild ? (
          <DraftPicker
            library={library}
            active={active}
            onSwitch={(id) => saveLibrary({ ...library, activeId: id })}
            onCreate={createDraft}
            onRename={renameDraft}
            onDelete={deleteDraft}
          />
        ) : null}
        <div hidden={Boolean(sharedBuild) || step !== null} ref={concept} className="mx-auto w-full max-w-2xl">
          <SessionZeroGuide
            key={editorKey}
            answers={draft.answers}
            initialStep={draft.step}
            onChange={(answers) => saveDraft({ ...draft, answers })}
            onProgress={(step) => saveDraft({ ...draft, step })}
            onStartBuild={() => saveBuild({ ...buildDraft, step: 'ancestry' })}
          />
        </div>
        {!sharedBuild && step && step !== 'skills' ? (
          <div hidden={Boolean(skillReturn)} className="mx-auto w-full max-w-2xl">
            <BuildGuide
              key={editorKey}
              character={character}
              build={build}
              currentStep={step}
              onChange={(next) => saveBuild({ ...buildDraft, build: next, step })}
              onProgress={(next) => saveBuild({ ...buildDraft, step: next })}
              onBackToConcept={returnToConcept}
              skillsAvailable={skillsAvailable}
              onPlanSkills={openSkillPlanner}
              onEditFromReview={editFromReview}
              onReturnToReview={editingFromReview && step !== 'review' ? returnToReview : undefined}
              startingLanguageNotes={character.startingLanguageNotes ?? ''}
              onStartingLanguageNotesChange={(startingLanguageNotes) => saveCharacter({ ...character, startingLanguageNotes })}
              ancestryChoices={character.ancestryChoices}
              onAncestryChoicesChange={(ancestryChoices) => saveCharacter({ ...character, ancestryChoices })}
              onFeatChoicesChange={(featChoices) => saveCharacter({ ...character, featChoices })}
              onSpellChoicesChange={(spellChoices) => saveCharacter({ ...character, spellChoices })}
              onEquipmentPlanChange={(equipmentPlan) => saveCharacter({ ...character, equipmentPlan })}
            />
          </div>
        ) : null}

        {!sharedBuild && (step === 'skills' || skillReturn) ? (
          <SkillPlanner
            key={editorKey}
            build={build}
            plan={skills ?? emptySkillPlan}
            onChange={(next) => saveBuild({ ...buildDraft, skills: parseSkillPlan(next) })}
            returnLabel={skillReturn ? `Back to ${skillReturn.label}` : undefined}
            onBack={skillReturn ? closeSkillPlanner : returnToReview}
          />
        ) : null}

        {sharedBuild ? (
          <section aria-labelledby="shared-build-heading" className="mx-auto w-full max-w-2xl">
            <Card>
              <CardHeader>
                <h2 id="shared-build-heading" className="text-3xl">Shared build</h2>
                <p className="text-muted-foreground">
                  You can review or print this build. Using it replaces the attribute build and skill plan in “{active.name}”.
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                <BuildSummary build={sharedBuild} />
                <BuildActions build={sharedBuild} />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    className="min-h-11"
                    onClick={() => restoreCharacter({ ...character, buildDraft: { build: sharedBuild, step: 'review' } })}
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
        {!sharedBuild ? (
          <CharacterFileActions
            key={active.id}
            draft={character}
            draftName={active.name}
            validateName={(name) => draftNameError(library, name)}
            onImportNew={createDraft}
            onRestore={restoreCharacter}
          />
        ) : null}
      </main>

      <div className="relative z-10">
        <Navbar />
      </div>
      {reviewBuild ? <PrintableAttributeLedger build={reviewBuild} /> : null}
    </div>
  )
}

export default App
