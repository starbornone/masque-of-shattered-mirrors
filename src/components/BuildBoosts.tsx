import { ancestryRule, attributeChoice, backgroundSlots, calculate } from '@/attributes/build'
import type { AttributeChoice, Build } from '@/attributes/build'
import { attributeIds, attributes } from '@/attributes/options'
import type { Attribute, Milestone } from '@/attributes/options'

const selectClass = 'min-h-11 w-full rounded-md border border-input bg-background px-3 text-foreground focus-visible:outline-2 focus-visible:outline-ring'

type AttributeSelectProps = {
  label: string
  choices: readonly Attribute[]
  value: AttributeChoice
  onChange: (value: AttributeChoice) => void
  emptyLabel?: string
}

export function AttributeSelect({ label, choices, value, onChange, emptyLabel = 'Choose an attribute' }: AttributeSelectProps) {
  return (
    <label className="block space-y-1">
      <span className="font-medium">{label}</span>
      <select
        className={selectClass}
        value={value}
        onChange={(event) => onChange(attributeChoice(event.currentTarget.value))}
      >
        <option value="">{emptyLabel}</option>
        {choices.map((id) => <option key={id} value={id}>{attributes[id]}</option>)}
      </select>
    </label>
  )
}

type BoostSlotsProps = {
  label: string
  slots: readonly (readonly Attribute[])[]
  values: readonly AttributeChoice[]
  onChange: (values: AttributeChoice[]) => void
  emptyLabel?: string
}

export function BoostSlots({ label, slots, values, onChange, emptyLabel }: BoostSlotsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {slots.map((allowed, index) => (
        <AttributeSelect
          key={index}
          label={`${label} ${index + 1}`}
          choices={allowed.filter((id) => !values.some((value, slot) => slot !== index && value === id))}
          value={values[index] ?? ''}
          emptyLabel={emptyLabel}
          onChange={(value) => onChange(values.map((previous, slot) => slot === index ? value : previous))}
        />
      ))}
    </div>
  )
}

export function AttributeLedger({ build }: { build: Build }) {
  const { rows, remaining } = calculate(build)
  return (
    <div className="space-y-3">
      <h3 className="text-xl">Level {build.level} attribute ledger</h3>
      <p role="status" className="text-muted-foreground">
        {remaining === 0 ? 'All boosts assigned' : `${remaining} ${remaining === 1 ? 'boost' : 'boosts'} to assign`}
      </p>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {rows.map(({ id, total, partial }) => (
          <div key={id} className="rounded-md bg-secondary px-3 py-2 text-secondary-foreground">
            <dt>{attributes[id]}</dt>
            <dd className="font-medium tabular-nums">
              {total > 0 ? '+' : ''}{total}{partial ? ' · partial' : ''}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

type BuildBoostsProps = {
  build: Build
  onChange: (changes: Partial<Build>) => void
}

export function BuildBoosts({ build, onChange }: BuildBoostsProps) {
  const rule = ancestryRule(build)
  const ancestryChoices = attributeIds.filter((id) => !rule.fixed.includes(id))
  const { activeMilestones } = calculate(build)

  function toggleBoost(level: Milestone, id: Attribute) {
    const selected = build.boosts[level]
    const next = selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id]
    onChange({ boosts: { ...build.boosts, [level]: next } })
  }

  return (
    <div className="space-y-5">
      <label className="block max-w-48 space-y-1">
        <span className="font-medium">Character level</span>
        <select className={selectClass} value={build.level} onChange={(event) => onChange({ level: Number(event.currentTarget.value) })}>
          {Array.from({ length: 20 }, (_, index) => index + 1).map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </label>

      <fieldset className="space-y-2">
        <legend className="mb-2 text-base font-medium">From your ancestry</legend>
        {rule.fixed.length ? <p>Automatic boosts to {rule.fixed.map((id) => attributes[id]).join(' and ')}.</p> : null}
        {rule.flaw ? <p>{attributes[rule.flaw]} starts with a flaw, which lowers it by 1.</p> : null}
        {rule.free ? (
          <BoostSlots
            label="Ancestry boost"
            slots={Array.from({ length: rule.free }, () => ancestryChoices)}
            values={build.ancestryBoosts}
            onChange={(ancestryBoosts) => onChange({ ancestryBoosts })}
          />
        ) : null}
        <details className="rounded-md border border-border p-3">
          <summary className="font-medium">Optional voluntary flaws</summary>
          <p className="my-2 text-muted-foreground">Choose a weakness for your character. Each choice lowers that attribute by 1 and gives no extra boost.</p>
          <div className="grid gap-x-3 sm:grid-cols-2">
            {attributeIds.filter((id) => id !== rule.flaw).map((id) => (
              <label key={id} className="flex min-h-11 items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={build.flaws.includes(id)}
                  onChange={(event) => onChange({
                    flaws: event.currentTarget.checked ? [...build.flaws, id] : build.flaws.filter((value) => value !== id),
                  })}
                />
                {attributes[id]}
              </label>
            ))}
          </div>
        </details>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="mb-2 text-base font-medium">From your background</legend>
        {build.background ? (
          <BoostSlots
            label="Background boost"
            slots={backgroundSlots(build.background)}
            values={build.backgroundBoosts}
            onChange={(backgroundBoosts) => onChange({ backgroundBoosts })}
          />
        ) : (
          <p className="text-muted-foreground">Choose a background to see its boost options.</p>
        )}
      </fieldset>

      {build.key ? (
        <p>Your class already boosts {attributes[build.key]}.</p>
      ) : (
        <p className="text-muted-foreground">Choose a class and its key attribute to apply the class boost.</p>
      )}

      {activeMilestones.length > 1 ? (
        <p className="text-muted-foreground">
          At levels 5, 10, 15, and 20 you get four more boosts. Once an attribute is +4 or higher, the first boost is partial. A second boost at a later milestone increases the modifier.
        </p>
      ) : null}
      {activeMilestones.map((level) => {
        const selected = build.boosts[level]
        return (
          <fieldset key={level} className="space-y-1">
            <legend className="text-base font-medium">Level {level} free boosts</legend>
            <p className="text-muted-foreground">Choose four different attributes. {selected.length} of 4 chosen.</p>
            <div className="grid gap-x-3 sm:grid-cols-2">
              {attributeIds.map((id) => (
                <label key={id} className="flex min-h-11 items-center gap-2 has-disabled:opacity-60">
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={selected.includes(id)}
                    disabled={selected.length === 4 && !selected.includes(id)}
                    onChange={() => toggleBoost(level, id)}
                  />
                  {attributes[id]}
                </label>
              ))}
            </div>
          </fieldset>
        )
      })}
    </div>
  )
}
