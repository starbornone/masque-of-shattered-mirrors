import { ancestryChoiceName, ancestryChoiceWarnings, ancestryFeatLevels } from '@/ancestry/choices'
import type { AncestryChoices } from '@/ancestry/choices'

export function AncestryChoicesSummary({ choices, ancestry, level }: { choices?: AncestryChoices; ancestry: string; level: number }) {
  if (!choices) return null
  const warnings = ancestryChoiceWarnings(choices, ancestry, level)
  return (
    <section className="space-y-2">
      <h3 className="text-xl">Heritage and ancestry feats</h3>
      <dl className="space-y-2">
        <div>
          <dt className="font-medium text-primary">Heritage</dt>
          <dd>{choices.heritage ? ancestryChoiceName(choices.heritage, 'heritage') : 'Undecided'}
            {choices.heritage?.notes ? <p className="whitespace-pre-wrap wrap-anywhere text-muted-foreground">{choices.heritage.notes}</p> : null}
          </dd>
        </div>
        {ancestryFeatLevels.filter((slot) => slot <= level).map((slot) => {
          const choice = choices.feats[slot]
          return (
            <div key={slot}>
              <dt className="font-medium text-primary">Level {slot} ancestry feat</dt>
              <dd>{choice ? ancestryChoiceName(choice, 'feat') : 'Undecided'}
                {choice?.notes ? <p className="whitespace-pre-wrap wrap-anywhere text-muted-foreground">{choice.notes}</p> : null}
              </dd>
            </div>
          )
        })}
      </dl>
      {warnings.length ? <div role="status" className="space-y-1 text-sm text-muted-foreground">{warnings.map((warning) => <p key={warning}>{warning}</p>)}</div> : null}
    </section>
  )
}
