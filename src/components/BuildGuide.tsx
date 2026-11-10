import { useEffect, useRef } from 'react'
import type { FormEvent } from 'react'
import { classKeys, normalizeBuild } from '@/attributes/build'
import type { Build } from '@/attributes/build'
import { buildSteps } from '@/attributes/draft'
import type { BuildGuideStep } from '@/attributes/draft'
import { buildSelections } from '@/attributes/ledger'
import { attributeIds, attributes } from '@/attributes/options'
import { AttributeLedger, AttributeSelect, BoostSlots, BuildBoosts } from '@/components/BuildBoosts'
import { BuildActions } from '@/components/BuildActions'
import { BuildFitSuggestions } from '@/components/BuildFitSuggestions'
import { BuildOptionPicker } from '@/components/BuildOptionPicker'
import { GuideHeading } from '@/components/GuideHeading'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { buildOptionGuides } from '@/content/build-options'

const steps = [
  { title: 'Choose an ancestry', description: 'Ancestry describes your character’s people. It gives your character some starting traits and helps determine their attribute boosts.' },
  { title: 'Choose a background', description: 'Your background describes your life before adventuring. It determines which attributes you can boost at the background step.' },
  { title: 'Choose a class', description: 'Your class describes how you adventure. Its key attribute is central to how the class works, and your class gives that attribute a boost.' },
  { title: 'Assign attribute boosts', description: 'Attributes are modifiers you use on rolls, such as +2. A boost usually raises the modifier by 1. Choose different attributes within each group. The same attribute can receive boosts from different groups.' },
  { title: 'Review your build', description: 'Check your current modifiers. You can revisit any step to change a choice or fill in a gap.' },
] as const

const reviewIndex = steps.length - 1
const boostsIndex = reviewIndex - 1

export function BuildSummary({ build }: { build: Build }) {
  return (
    <div className="space-y-4">
      <dl className="grid gap-3 sm:grid-cols-3">
        {buildSelections(build).map(({ label, name }) => (
          <div key={label}><dt className="font-medium text-primary">{label}</dt><dd>{name}</dd></div>
        ))}
      </dl>
      <AttributeLedger build={build} />
    </div>
  )
}

type BuildGuideProps = {
  build: Build
  currentStep: BuildGuideStep
  onChange: (build: Build) => void
  onProgress: (step: BuildGuideStep) => void
  onBackToConcept: () => void
  onPlanSkills?: () => void
  startingLanguageNotes: string
  onStartingLanguageNotesChange: (notes: string) => void
}

export function BuildGuide({
  build, currentStep, onChange, onProgress, onBackToConcept, onPlanSkills,
  startingLanguageNotes, onStartingLanguageNotesChange,
}: BuildGuideProps) {
  const stepIndex = buildSteps.indexOf(currentStep)
  const heading = useRef<HTMLHeadingElement>(null)
  const step = steps[stepIndex]
  const keys = classKeys(build.characterClass)
  const ancestryGuide = buildOptionGuides.ancestry[build.ancestry]

  useEffect(() => {
    heading.current?.focus()
  }, [stepIndex])

  function updateBuild(changes: Partial<Build>) {
    onChange(normalizeBuild({ ...build, ...changes }))
  }

  function advance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (stepIndex === reviewIndex) return
    onProgress(buildSteps[stepIndex + 1])
  }

  return (
    <section aria-labelledby="build-guide-heading" className="flex flex-col gap-4">
      <GuideHeading
        ref={heading}
        id="build-guide-heading"
        eyebrow="Character build"
        title={step.title}
        description={step.description}
        progress={{ label: 'Character build progress', step: stepIndex + 1, total: steps.length }}
      />

      <form onSubmit={advance} className="space-y-4">
        <Card>
          <CardContent className="space-y-4">
            {stepIndex === 0 ? (
              <>
                <BuildOptionPicker kind="ancestry" value={build.ancestry} onChange={(ancestry) => updateBuild({ ancestry })} />
                <label className="flex min-h-11 items-center gap-2">
                  <input type="checkbox" className="accent-primary" checked={build.alternate} onChange={(event) => updateBuild({ alternate: event.currentTarget.checked })} />
                  Take two boosts of your choice instead of the listed ancestry boosts and flaw
                </label>
                {build.ancestry === 'custom' && !build.alternate ? (
                  <div className="space-y-3">
                    <p className="text-muted-foreground">Enter the fixed boosts and flaw from your ancestry’s rules. Leave a slot blank if the ancestry has no fixed choice for it.</p>
                    <BoostSlots label="Fixed boost" slots={[attributeIds, attributeIds]} values={build.customFixed} onChange={(customFixed) => updateBuild({ customFixed })} emptyLabel="None" />
                    <AttributeSelect label="Listed flaw" choices={attributeIds} value={build.customFlaw} onChange={(customFlaw) => updateBuild({ customFlaw })} emptyLabel="None" />
                  </div>
                ) : null}
              </>
            ) : null}

            {stepIndex === 1 ? (
              <>
                <BuildOptionPicker kind="background" value={build.background} onChange={(background) => updateBuild({ background })} />
                <BuildFitSuggestions kind="background" selected={build.background} onSelect={(background) => updateBuild({ background })} />
              </>
            ) : null}

            {stepIndex === 2 ? (
              <>
                <BuildOptionPicker kind="class" value={build.characterClass} onChange={(characterClass) => updateBuild({ characterClass })} />
                {keys.length > 1 ? (
                  <AttributeSelect label="Key attribute" choices={keys} value={build.key} onChange={(key) => updateBuild({ key })} emptyLabel="Decide later" />
                ) : null}
                {keys.length === 1 ? <p>Your class boosts {attributes[keys[0]]} automatically.</p> : null}
                <BuildFitSuggestions kind="class" selected={build.characterClass} onSelect={(characterClass) => updateBuild({ characterClass })} />
              </>
            ) : null}

            {stepIndex === boostsIndex ? (
              <>
                <BuildBoosts build={build} onChange={updateBuild} />
                <AttributeLedger build={build} />
              </>
            ) : null}

            {stepIndex === reviewIndex ? (
              <>
                <BuildSummary build={build} />
                <details className="rounded-md border border-border p-3">
                  <summary className="cursor-pointer font-medium">Starting languages (optional)</summary>
                  <div className="mt-3 space-y-3">
                    <p id="starting-language-guidance" className="text-muted-foreground">
                      Your ancestry lists your starting languages and the extras you can choose. At level 1, a positive Intelligence modifier gives you that many additional languages. Ask your GM about languages outside your available choices.
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      {ancestryGuide ? (
                        <a
                          href={`https://2e.aonprd.com/Ancestries.aspx?ID=${ancestryGuide.rulesId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-primary underline underline-offset-2"
                        >
                          Your ancestry’s rules
                        </a>
                      ) : null}
                      <a
                        href="https://2e.aonprd.com/Languages.aspx"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-primary underline underline-offset-2"
                      >
                        Pathfinder language rules
                      </a>
                    </div>
                    <label className="block space-y-1">
                      <span className="font-medium">Starting language notes</span>
                      <textarea
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                        rows={3}
                        aria-describedby="starting-language-guidance"
                        value={startingLanguageNotes}
                        onChange={(event) => onStartingLanguageNotesChange(event.currentTarget.value)}
                      />
                    </label>
                  </div>
                </details>
                <BuildActions build={build} />
                <div className="space-y-2">
                  <Button type="button" className="min-h-11" disabled={!onPlanSkills} onClick={onPlanSkills}>
                    Plan skill proficiencies
                  </Button>
                  {!onPlanSkills ? <p className="text-muted-foreground">Finish assigning attribute boosts to unlock skill planning.</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {buildSteps.slice(0, reviewIndex).map((label) => (
                    <Button key={label} type="button" variant="outline" className="min-h-11" onClick={() => onProgress(label)}>
                      Edit {label}
                    </Button>
                  ))}
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="min-h-11" onClick={stepIndex === 0 ? onBackToConcept : () => onProgress(buildSteps[stepIndex - 1])}>
            {stepIndex === 0 ? 'Back to character concept' : 'Back'}
          </Button>
          {stepIndex < reviewIndex ? (
            <Button type="submit" className="min-h-11">{stepIndex === boostsIndex ? 'Review build' : 'Continue'}</Button>
          ) : null}
        </div>
      </form>
    </section>
  )
}
