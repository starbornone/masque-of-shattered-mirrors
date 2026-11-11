import { lazy, Suspense, useEffect, useRef } from 'react'
import type { FormEvent } from 'react'
import { classKeys, normalizeBuild } from '@/attributes/build'
import type { Build } from '@/attributes/build'
import { buildSteps } from '@/attributes/draft'
import type { BuildGuideStep } from '@/attributes/draft'
import { attributeIds, attributes } from '@/attributes/options'
import { AttributeLedger, AttributeSelect, BoostSlots, BuildBoosts } from '@/components/BuildBoosts'
import { BuildActions } from '@/components/BuildActions'
import { BuildSummary } from '@/components/BuildSummary'
import { BuildFitSuggestions } from '@/components/BuildFitSuggestions'
import { BuildOptionPicker } from '@/components/BuildOptionPicker'
import { GuideHeading } from '@/components/GuideHeading'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { buildOptionGuides } from '@/content/build-options'
import { AncestryChoicesSummary } from '@/components/AncestryChoicesSummary'
import { emptyAncestryChoices } from '@/ancestry/choices'
import type { AncestryChoices as Choices } from '@/ancestry/choices'
import type { CharacterDraft } from '@/character/draft'
import type { FeatChoices } from '@/feats/choices'
import { FeatChoicesSummary } from '@/components/FeatChoicesSummary'
import { SpellChoicesSummary } from '@/components/SpellChoicesSummary'
import type { SpellChoices } from '@/spells/choices'
import { EquipmentSummary } from '@/components/EquipmentSummary'
import type { EquipmentPlan } from '@/equipment/plan'

const AncestryChoices = lazy(() => import('@/components/AncestryChoices'))
const FeatGuide = lazy(() => import('@/components/FeatGuide'))
const SpellGuide = lazy(() => import('@/components/SpellGuide'))
const EquipmentGuide = lazy(() => import('@/components/EquipmentGuide'))

const steps = [
  { title: 'Choose an ancestry', description: 'Ancestry describes your character’s people. It gives your character some starting traits and helps determine their attribute boosts.' },
  { title: 'Choose heritage and ancestry feats', description: 'These choices add abilities beyond your ancestry’s attribute boosts. Read an option’s rules before selecting it, or leave it undecided for now.' },
  { title: 'Choose a background', description: 'Your background describes your life before adventuring. It determines which attributes you can boost at the background step.' },
  { title: 'Choose a class', description: 'Your class describes how you adventure. Its key attribute is central to how the class works, and your class gives that attribute a boost.' },
  { title: 'Assign attribute boosts', description: 'Attributes are modifiers you use on rolls, such as +2. A boost usually raises the modifier by 1. Choose different attributes within each group. The same attribute can receive boosts from different groups.' },
  { title: 'Choose class, general, and skill feats', description: 'Pick abilities for the slots your class and level provide. You can return after planning skills or leave a choice undecided.' },
  { title: 'Choose spells and cantrips', description: 'Plan the spells your class or other features provide. Read the rules, record granted choices, or return to this step later.' },
  { title: 'Plan starting equipment', description: 'Choose gear and see its cost and Bulk. Set starting wealth when you know it, or continue and come back later.' },
  { title: 'Review your build', description: 'Check your current modifiers. You can revisit any step to change a choice or fill in a gap.' },
] as const

const reviewIndex = steps.length - 1

type BuildGuideProps = {
  character: CharacterDraft
  build: Build
  currentStep: BuildGuideStep
  onChange: (build: Build) => void
  onProgress: (step: BuildGuideStep) => void
  onBackToConcept: () => void
  onPlanSkills?: () => void
  startingLanguageNotes: string
  onStartingLanguageNotesChange: (notes: string) => void
  ancestryChoices?: Choices
  onAncestryChoicesChange: (choices: Choices) => void
  onFeatChoicesChange: (choices: FeatChoices) => void
  onSpellChoicesChange: (choices: SpellChoices) => void
  onEquipmentPlanChange: (plan: EquipmentPlan) => void
}

export function BuildGuide({
  character, build, currentStep, onChange, onProgress, onBackToConcept, onPlanSkills,
  startingLanguageNotes, onStartingLanguageNotesChange,
  ancestryChoices, onAncestryChoicesChange, onFeatChoicesChange, onSpellChoicesChange, onEquipmentPlanChange,
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

            {currentStep === 'heritage' ? (
              <Suspense fallback={<p role="status">Loading heritage and ancestry feat rules…</p>}>
                <AncestryChoices ancestry={build.ancestry} level={build.level}
                  choices={ancestryChoices ?? emptyAncestryChoices} onChange={onAncestryChoicesChange} />
              </Suspense>
            ) : null}

            {currentStep === 'background' ? (
              <>
                <BuildOptionPicker kind="background" value={build.background} onChange={(background) => updateBuild({ background })} />
                <BuildFitSuggestions kind="background" selected={build.background} onSelect={(background) => updateBuild({ background })} />
              </>
            ) : null}

            {currentStep === 'class' ? (
              <>
                <BuildOptionPicker kind="class" value={build.characterClass} onChange={(characterClass) => updateBuild({ characterClass })} />
                {keys.length > 1 ? (
                  <AttributeSelect label="Key attribute" choices={keys} value={build.key} onChange={(key) => updateBuild({ key })} emptyLabel="Decide later" />
                ) : null}
                {keys.length === 1 ? <p>Your class boosts {attributes[keys[0]]} automatically.</p> : null}
                <BuildFitSuggestions kind="class" selected={build.characterClass} onSelect={(characterClass) => updateBuild({ characterClass })} />
              </>
            ) : null}

            {currentStep === 'boosts' ? (
              <>
                <BuildBoosts build={build} onChange={updateBuild} />
                <AttributeLedger build={build} />
              </>
            ) : null}

            {currentStep === 'feats' ? (
              <Suspense fallback={<p role="status">Loading feat choices…</p>}>
                <FeatGuide character={character} onChange={onFeatChoicesChange} />
              </Suspense>
            ) : null}

            {currentStep === 'spells' ? (
              <Suspense fallback={<p role="status">Loading spell choices…</p>}>
                <SpellGuide character={character} onChange={onSpellChoicesChange} />
              </Suspense>
            ) : null}

            {currentStep === 'equipment' ? (
              <Suspense fallback={<p role="status">Loading equipment choices…</p>}>
                <EquipmentGuide plan={character.equipmentPlan} build={build} onChange={onEquipmentPlanChange} />
              </Suspense>
            ) : null}

            {stepIndex === reviewIndex ? (
              <>
                <BuildSummary build={build} />
                <AncestryChoicesSummary choices={ancestryChoices} ancestry={build.ancestry} level={build.level} />
                <FeatChoicesSummary character={character} />
                <SpellChoicesSummary character={character} />
                <EquipmentSummary plan={character.equipmentPlan} build={build} />
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
            <Button type="submit" className="min-h-11">{stepIndex === reviewIndex - 1 ? 'Review build' : 'Continue'}</Button>
          ) : null}
        </div>
      </form>
    </section>
  )
}
