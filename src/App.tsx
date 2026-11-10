import { useRef, useState } from 'react'
import veratheMirror from '@/assets/verathe-mirror.svg'
import { parseBuild } from '@/attributes/build'
import { buildDraftStorageKey, loadBuildDraft, serializeBuildDraft } from '@/attributes/draft'
import type { BuildDraft } from '@/attributes/draft'
import { BuildActions } from '@/components/BuildActions'
import { BuildGuide, BuildSummary } from '@/components/BuildGuide'
import { CampaignFit } from '@/components/CampaignFit'
import { Navbar } from '@/components/Navbar'
import { PrintableAttributeLedger } from '@/components/PrintableAttributeLedger'
import { SessionZeroGuide } from '@/components/SessionZeroGuide'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { loadSessionZero, serializeSessionZero, sessionZeroStorageKey } from '@/session-zero/draft'
import type { SessionZeroDraft } from '@/session-zero/types'

function App() {
  const [draft, setDraft] = useState(loadSessionZero)
  const [buildDraft, setBuildDraft] = useState(loadBuildDraft)
  const [shared, setShared] = useState(() => {
    const requested = new URLSearchParams(window.location.search).get('build')
    return requested === null ? null : { build: parseBuild(requested) }
  })
  const [storageError, setStorageError] = useState(false)
  const [buildStorageError, setBuildStorageError] = useState(false)
  const concept = useRef<HTMLDivElement>(null)
  const { build, step } = buildDraft
  const sharedBuild = shared?.build
  const reviewBuild = sharedBuild ?? (step === 'review' ? build : null)

  function saveDraft(next: SessionZeroDraft) {
    setDraft(next)
    try {
      localStorage.setItem(sessionZeroStorageKey, serializeSessionZero(next.answers, next.step))
      setStorageError(false)
    } catch {
      setStorageError(true)
    }
  }

  function saveBuild(next: BuildDraft) {
    setBuildDraft(next)
    try {
      localStorage.setItem(buildDraftStorageKey, serializeBuildDraft(next))
      setBuildStorageError(false)
    } catch {
      setBuildStorageError(true)
    }
  }

  function closeSharedBuild() {
    const url = new URL(window.location.href)
    url.searchParams.delete('build')
    window.history.replaceState(window.history.state, '', url)
    setShared(null)
  }

  function returnToConcept() {
    saveBuild({ build, step: null })
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

      <header className="relative z-10 border-b border-primary/20 bg-[color-mix(in_oklch,var(--card)_78%,transparent)] backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-6 py-5">
          <div className="veil-in flex items-start gap-3">
            <img
              src={`${import.meta.env.BASE_URL}favicon.svg`}
              alt=""
              width={44}
              height={44}
              className="mt-0.5 size-11 shrink-0"
            />
            <div>
              <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-primary">
                The Masque of Shattered Mirrors
              </p>
              <h1 className="font-heading text-3xl leading-none tracking-tight text-foreground md:text-4xl">
                Masque Character Creator
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
        {storageError ? (
          <p role="alert" className="mx-auto w-full max-w-2xl text-destructive">
            This browser couldn’t save your answers. You can still download them from the review.
          </p>
        ) : null}
        {buildStorageError ? (
          <p role="alert" className="mx-auto w-full max-w-2xl text-destructive">
            This browser couldn’t save your build. You can keep a share link from the review.
          </p>
        ) : null}
        {shared && !sharedBuild ? (
          <p role="alert" className="mx-auto w-full max-w-2xl text-destructive">
            This build link couldn’t be opened.
          </p>
        ) : null}
        <div hidden={Boolean(sharedBuild) || step !== null} ref={concept} className="mx-auto w-full max-w-2xl">
          <SessionZeroGuide
            answers={draft.answers}
            initialStep={draft.step}
            onChange={(answers) => saveDraft({ ...draft, answers })}
            onProgress={(step) => saveDraft({ ...draft, step })}
            onStartBuild={() => saveBuild({ build, step: 'ancestry' })}
          />
        </div>
        {!sharedBuild && step ? (
          <div className="mx-auto w-full max-w-2xl">
            <BuildGuide
              build={build}
              currentStep={step}
              onChange={(next) => saveBuild({ build: next, step })}
              onProgress={(next) => saveBuild({ build, step: next })}
              onBackToConcept={returnToConcept}
            />
          </div>
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

        {reviewBuild ? <CampaignFit build={reviewBuild} /> : null}
      </main>

      <div className="relative z-10">
        <Navbar />
      </div>
      {reviewBuild ? <PrintableAttributeLedger build={reviewBuild} /> : null}
    </div>
  )
}

export default App
