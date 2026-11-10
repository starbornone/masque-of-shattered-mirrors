import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { InvitationLetter } from '@/components/InvitationLetter'
import { SessionZeroExports } from '@/components/SessionZeroExports'
import { SessionZeroSummary } from '@/components/SessionZeroSummary'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { faithChoices } from '@/session-zero/types'
import type { FaithChoice, SessionZero, SessionZeroStep } from '@/session-zero/types'

const steps = [
  {
    id: 'invitation',
    title: 'An invitation to the masquerade',
  },
  {
    id: 'invitationReason',
    title: 'Why did you accept?',
    description: 'Give your character one reason to walk through the doors of House Verathe.',
    example: 'I want to find out why the Verathes invited someone who has never met them.',
  },
  {
    id: 'stake',
    title: 'Who matters to you tonight?',
    description: 'Choose a person your character would risk something for, or make your character the one drawing attention.',
  },
  {
    id: 'art',
    title: 'What do you make or perform?',
    description: 'Choose an art, craft, or performance your character brings to the masquerade. This can be something they enjoy or practice in secret.',
    example: 'I cut silhouettes from paper and leave them as gifts.',
  },
  {
    id: 'faith',
    title: 'Does a deity interest you?',
    description: 'Choose a deity if you have a preference, or skip this step.',
  },
  {
    id: 'mask',
    title: 'What lie does your mask tell?',
    description: 'Describe your mask and what you want the other guests to believe about the person wearing it.',
    example: 'A smiling porcelain fox. I want everyone to think I’m enjoying myself.',
  },
  {
    id: 'review',
    title: 'Review your character concept',
    description: 'Read your choices together and edit any answer you want to change.',
  },
] as const

const reviewIndex = steps.length - 1
const answerClass = 'w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus-visible:outline-2 focus-visible:outline-ring'
const faithOptions = [
  { id: 'pharasma', description: 'Pharasma judges the souls of the dead and watches over birth, death, and fate.' },
  { id: 'nocticula', description: 'The Redeemer Queen left her life as a demon lord behind. She champions artists and exiles, and midnight is sacred to her.' },
  { id: 'black-butterfly', description: 'Known as the Silence Between, she watches over the quiet spaces between the stars. Her followers value stillness and kindness done without recognition.' },
  { id: 'none' },
  { id: null },
] as const satisfies readonly { id: FaithChoice | null; description?: string }[]

type SessionZeroGuideProps = {
  answers: SessionZero
  initialStep?: SessionZeroStep
  onChange: (answers: SessionZero) => void
  onProgress: (step: SessionZeroStep) => void
  onStartBuild: () => void
}

export function SessionZeroGuide({ answers, initialStep, onChange, onProgress, onStartBuild }: SessionZeroGuideProps) {
  const [stepIndex, setStepIndex] = useState(() => {
    if (initialStep) return steps.findIndex(({ id }) => id === initialStep)
    if (answers.mask.trim()) return reviewIndex
    if (answers.faith !== null) return 5
    if (answers.art.trim()) return 4
    if (answers.stake) return 3
    return answers.invitationReason.trim() ? 2 : 0
  })
  const [editing, setEditing] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const focusHeading = useRef(false)
  const step = steps[stepIndex]

  useEffect(() => {
    if (focusHeading.current) {
      heading.current?.focus()
      focusHeading.current = false
    }
  }, [stepIndex])

  function goToStep(index: number, edit = false) {
    focusHeading.current = true
    setStepIndex(index)
    setEditing(edit)
    onProgress(edit ? 'review' : steps[index].id)
  }

  function updateAnswer<Field extends keyof SessionZero>(field: Field, value: SessionZero[Field]) {
    onChange({ ...answers, [field]: value })
  }

  function advance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (step.id === 'review') return

    goToStep(editing ? reviewIndex : stepIndex + 1)
  }

  const nextLabel = editing ? 'Return to review' :
    step.id === 'invitation' ? 'Accept the invitation' :
    step.id === 'mask' ? 'Review concept' : 'Continue'

  return (
    <section aria-labelledby="guide-heading" className="flex flex-col gap-4">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
          Character concept · Step {stepIndex + 1} of {steps.length}
        </p>
        <progress
          aria-label="Character concept progress"
          value={stepIndex + 1}
          max={steps.length}
          className="block h-1.5 w-full accent-primary"
        />
        <h2 ref={heading} id="guide-heading" tabIndex={-1} className="text-3xl">
          {step.title}
        </h2>
        {'description' in step ? <p className="max-w-prose text-muted-foreground">{step.description}</p> : null}
      </div>

      {step.id === 'invitation' ? <InvitationLetter /> : null}

      <form onSubmit={advance} className="space-y-4">
        {'example' in step ? (
          <Card>
            <CardContent className="space-y-2">
              <label className="block font-medium" htmlFor="concept-answer">Your answer</label>
              <p id="concept-example" className="text-muted-foreground">
                For example, “{step.example}”
              </p>
              <textarea
                key={step.id}
                id="concept-answer"
                rows={3}
                aria-describedby="concept-example"
                className={answerClass}
                value={answers[step.id]}
                onChange={(event) => updateAnswer(step.id, event.currentTarget.value)}
              />
            </CardContent>
          </Card>
        ) : null}

        {step.id === 'stake' ? (
          <Card>
            <CardContent>
              <fieldset className="space-y-2">
                <legend className="mb-2 font-medium">Choose who is at stake</legend>
                <label className="flex min-h-11 items-center gap-2">
                  <input
                    type="radio"
                    name="stake"
                    className="accent-primary"
                    checked={answers.stake?.kind === 'person'}
                    onChange={() => updateAnswer('stake', { kind: 'person', name: '' })}
                  />
                  Someone my character cares about
                </label>
                {answers.stake?.kind === 'person' ? (
                  <div className="space-y-2">
                    <label htmlFor="stake-name" className="block font-medium">Their name</label>
                    <input
                      id="stake-name"
                      type="text"
                      className={answerClass}
                      value={answers.stake.name}
                      onChange={(event) => updateAnswer('stake', { kind: 'person', name: event.currentTarget.value })}
                    />
                  </div>
                ) : null}
                <label className="flex min-h-11 items-center gap-2">
                  <input
                    type="radio"
                    name="stake"
                    className="accent-primary"
                    checked={answers.stake?.kind === 'self'}
                    onChange={() => updateAnswer('stake', { kind: 'self' })}
                  />
                  I am the one they are watching
                </label>
                <label className="flex min-h-11 items-center gap-2">
                  <input
                    type="radio"
                    name="stake"
                    className="accent-primary"
                    checked={answers.stake === null}
                    onChange={() => updateAnswer('stake', null)}
                  />
                  Skip for now
                </label>
              </fieldset>
            </CardContent>
          </Card>
        ) : null}

        {step.id === 'faith' ? (
          <Card>
            <CardContent>
              <fieldset className="space-y-2">
                <legend className="mb-2 font-medium">Faith (optional)</legend>
                {faithOptions.map((option) => {
                  const { id } = option
                  const labelId = `faith-${id ?? 'skip'}`
                  const description = 'description' in option ? option.description : undefined
                  return (
                    <label key={labelId} className="flex min-h-11 items-start gap-2 py-2">
                      <input
                        type="radio"
                        name="faith"
                        className="mt-1 accent-primary"
                        aria-labelledby={labelId}
                        aria-describedby={description ? `${labelId}-description` : undefined}
                        checked={answers.faith === id}
                        onChange={() => updateAnswer('faith', id)}
                      />
                      <span>
                        <span id={labelId} className="block font-medium">{id ? faithChoices[id] : 'Skip for now'}</span>
                        {description ? (
                          <span id={`${labelId}-description`} className="block text-muted-foreground">{description}</span>
                        ) : null}
                      </span>
                    </label>
                  )
                })}
              </fieldset>
            </CardContent>
          </Card>
        ) : null}

        {step.id === 'review' ? (
          <Card>
            <CardContent className="space-y-4">
              <SessionZeroSummary
                answers={answers}
                onEdit={(field) => goToStep(steps.findIndex(({ id }) => id === field), true)}
              />
              <p className="text-muted-foreground">
                Next, turn this concept into a Pathfinder character. You’ll choose an ancestry, background, and class, then use those choices to set your attributes.
              </p>
              <SessionZeroExports answers={answers} />
            </CardContent>
          </Card>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {stepIndex > 0 && !editing ? (
            <Button type="button" variant="outline" className="min-h-11" onClick={() => goToStep(stepIndex - 1)}>
              Back
            </Button>
          ) : null}
          {step.id === 'review' ? (
            <Button type="button" className="min-h-11" onClick={onStartBuild}>Continue to character build</Button>
          ) : (
            <Button type="submit" className="min-h-11">{nextLabel}</Button>
          )}
          {step.id === 'invitation' ? (
            <Button type="button" variant="outline" className="min-h-11" onClick={onStartBuild}>Open build</Button>
          ) : null}
        </div>
      </form>
    </section>
  )
}
