import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { CharacterDraft } from '@/character/draft'
import { availableFeats, featOption, featWarnings } from '@/feats/options'
import type { FeatOption } from '@/feats/options'
import { effectiveFeat, emptyFeatChoices, featKinds, featName, featSlots } from '@/feats/choices'
import type { FeatChoices, FeatChoice, FeatSlot } from '@/feats/choices'
import { Button } from '@/components/ui/button'
import { emptySkillPlan, recordedPrerequisiteRanks } from '@/skills/plan'

const field = 'min-h-11 w-full rounded-md border border-input bg-background px-3 text-foreground focus-visible:outline-2 focus-visible:outline-ring'
const kinds = { class: 'Class feat', general: 'General feat', skill: 'Skill feat', ancestry: 'Ancestry feat', dedication: 'Multiclass dedication' }
const levels = Array.from({ length: 20 }, (_, index) => index + 1)
const ruleLoaders = import.meta.glob<{ default: Record<string, string> }>('../content/feat-rules/*.json')

function FeatRules({ option, rankGuidance }: { option: FeatOption; rankGuidance: ReactNode }) {
  const { id, rulesGroup } = option
  const [text, setText] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    const promise = rulesGroup === 'ancestry'
      ? import('@/content/ancestry-descriptions.json').then((module) => module.default.feats as Record<string, string>)
      : ruleLoaders[`../content/feat-rules/${rulesGroup}.json`]().then((module) => module.default)
    promise.then((rules) => {
      const text = rules[id.replace(/^ancestry:/, '')]
      if (!text) throw new Error('Missing feat rules')
      if (active) setText(text)
    }).catch(() => { if (active) setFailed(true) })
    return () => { active = false }
  }, [id, rulesGroup, attempt])
  const paragraphs = text?.split('\n\n') ?? []
  const overview = Math.max(0, paragraphs.findIndex((p) => !/^(Frequency|Trigger|Requirements|Access)\b/.test(p)))
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-primary">{option.source} · level {option.level} · {option.rarity}{option.action !== 'passive' ? ` · ${option.action}` : ''}</p>
      {option.prerequisites ? <p className="text-sm"><strong>Prerequisites</strong> — {option.prerequisites}</p> : null}
      {rankGuidance}
      {text ? <>
        <p className="text-muted-foreground">{paragraphs[overview]}</p>
        {paragraphs.length > 1 ? <details>
          <summary className="font-medium">More rules for {option.name}</summary>
          <p className="whitespace-pre-line text-muted-foreground">{paragraphs.filter((_, index) => index !== overview).join('\n\n')}</p>
        </details> : null}
      </> : failed ? <p role="status" className="text-sm text-muted-foreground">Rules couldn’t be loaded. Use the link below or <button type="button" className="underline" onClick={() => { setFailed(false); setAttempt((count) => count + 1) }}>try again</button>.</p> : <p role="status" className="text-sm text-muted-foreground">Loading feat rules…</p>}
      <a className="inline-block text-sm font-medium text-primary underline underline-offset-2" href={`https://2e.aonprd.com/Search.aspx?q=${encodeURIComponent(option.name)}`} target="_blank" rel="noreferrer">Find {option.name} on Archives of Nethys</a>
    </div>
  )
}

function FeatPicker({ slot, character, archetypes, onChange, onPlanSkills }: {
  slot: FeatSlot
  character: CharacterDraft
  archetypes: boolean
  onChange: (choice: FeatChoice | null) => void
  onPlanSkills?: (returnLabel: string, trigger: HTMLButtonElement) => void
}) {
  const [query, setQuery] = useState('')
  const plan = character.featChoices ?? emptyFeatChoices
  const choice = effectiveFeat(slot, plan)
  const selected = choice ? featOption(choice.id) : undefined
  const { build, skills } = character.buildDraft
  const ranks = onPlanSkills && selected
    ? recordedPrerequisiteRanks(selected.prerequisites, build, skills ?? emptySkillPlan, slot.level)
    : []
  const allowed = availableFeats(slot, character, archetypes)
  const matches = allowed.filter((row) => `${row.name} ${row.traits.join(' ')} ${row.prerequisites}`.toLowerCase().includes(query.trim().toLowerCase()))
  const visible = selected && !matches.some((row) => row.id === selected.id) ? [selected, ...matches] : matches
  return (
    <section className="space-y-3 rounded-lg border border-border p-3 sm:p-4" aria-label={slot.label}>
      <h4 className="font-semibold">{slot.label}</h4>
      <p className="text-sm text-muted-foreground">{slot.source}{slot.fixed ? ' · already granted' : ` · feat level ${slot.maxLevel} or lower`}</p>
      {slot.guidance ? <p className="text-sm text-muted-foreground">{slot.guidance}</p> : null}
      {!slot.fixed ? <label className="block space-y-1">
        <span className="text-sm font-medium">Search {slot.label.toLowerCase()}</span>
        <input type="search" className={field} placeholder="Feat name, trait, or prerequisite" value={query} onChange={(event) => setQuery(event.currentTarget.value)} onKeyDown={(event) => { if (event.key === 'Enter') event.preventDefault() }} />
      </label> : null}
      <label className="block space-y-1">
        <span className="font-medium">{slot.label} choice</span>
        <select className={field} value={choice?.id ?? ''} disabled={Boolean(slot.fixed)} onChange={(event) => onChange(event.currentTarget.value ? { id: event.currentTarget.value, notes: '' } : null)}>
          <option value="">Decide later</option>
          {visible.map((row) => <option key={row.id} value={row.id}>{row.name} · level {row.level}{row.rarity === 'common' ? '' : ` · ${row.rarity}`}</option>)}
          <option value="custom">{slot.fixedName ?? 'Custom / another rules source'}</option>
        </select>
      </label>
      {slot.fixed && choice?.id !== slot.fixed ? <Button type="button" variant="outline" onClick={() => onChange({ id: slot.fixed!, notes: choice?.notes ?? '' })}>Use granted {featName(slot.fixed)}</Button> : null}
      {selected ? <FeatRules key={selected.id} option={selected} rankGuidance={ranks.length ? (
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Recorded at level {slot.level}</strong>{' '}
            {ranks.map(({ name, rank }) => `${name} (${rank})`).join(', ')}. Check the full prerequisite and any training granted by your character options.
          </p>
        ) : null} /> : null}
      {onPlanSkills && (slot.kind === 'skill' || ranks.length > 0 || /\b(?:trained|expert|master|legendary) in\b/i.test(selected?.prerequisites ?? '')) ? (
        <Button type="button" variant="outline" onClick={(event) => onPlanSkills(slot.label.toLowerCase(), event.currentTarget)}>
          Plan skills
        </Button>
      ) : null}
      {slot.fixedName ? <div className="space-y-1 text-sm text-muted-foreground">
        <p>This background references a feat outside the Core catalogs. Follow its rules and record any extra choices below.</p>
        <a className="inline-block font-medium text-primary underline underline-offset-2" href={`https://2e.aonprd.com/Search.aspx?q=${encodeURIComponent(slot.fixedName)}`} target="_blank" rel="noreferrer">Find {slot.fixedName} on Archives of Nethys</a>
      </div> : null}
      {!slot.fixed && !matches.length ? <p role="status" className="text-sm text-muted-foreground">No matching feats. Clear the search, select your class, or record a custom choice.</p> : null}
      {choice ? <label className="block space-y-1">
        <span className="font-medium">{slot.label} {choice.id === 'custom' && !slot.fixedName ? 'name and details' : 'notes (optional)'}</span>
        <textarea className={`${field} py-2`} rows={2} value={choice.notes} placeholder="Record any skill, spell, or other extra choice this feat requires" onChange={(event) => onChange({ ...choice, notes: event.currentTarget.value })} />
      </label> : null}
    </section>
  )
}

export default function FeatGuide({ character, onChange, onPlanSkills }: {
  character: CharacterDraft
  onChange: (plan: FeatChoices) => void
  onPlanSkills?: (returnLabel: string, trigger: HTMLButtonElement) => void
}) {
  const [archetypes, setArchetypes] = useState(false)
  const plan = character.featChoices ?? emptyFeatChoices
  const slots = featSlots(character, plan)
  const warnings = featWarnings(character)
  const active = new Set(slots.map((slot) => slot.id))
  const inactive = Object.entries(plan.choices).filter(([id]) => !active.has(id))
  const groups = [
    { kind: 'class', title: 'Class feats', description: 'These develop your class’s abilities. The slots follow your class table; some classes start at level 1 and others at level 2.' },
    { kind: 'skill', title: 'Skill feats', description: 'These add ways to use skills. Check the training or proficiency rank required at the level you take the feat. Rogues and Investigators have extra slots.' },
    { kind: 'general', title: 'General feats', description: 'These broaden your abilities. A skill feat with the general trait can also fill a general feat slot.' },
    { kind: 'grants', title: 'Granted and extra feats', description: 'These come from your background, class features, heritage, or other feats. They do not use another normal slot. Some need a separate choice.' },
  ]
  function setChoice(id: string, choice: FeatChoice | null) {
    const choices = { ...plan.choices }
    if (choice) choices[id] = choice
    else delete choices[id]
    onChange({ ...plan, choices })
  }
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">A feat is an ability you choose. Use each slot once, choosing a feat of the allowed level or lower. Prerequisites are requirements you must meet when you gain it. You can leave any choice undecided and return after planning skills.</p>
      <p className="text-sm text-muted-foreground">The lists check feat type, class, and level. Check other prerequisites and GM approval for uncommon or rare options. Record additional choices in the notes. Feat benefits are recorded here; add granted training in the skill planner and apply other effects using the rules.</p>
      <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="accent-primary" checked={archetypes} onChange={(event) => setArchetypes(event.currentTarget.checked)} />Show archetype feats where allowed (check dedication prerequisites)</label>
      {groups.map((group) => {
        const rows = slots.filter((slot) => group.kind === 'grants' ? !/^(class|skill|general):\d+$/.test(slot.id) : slot.id.startsWith(`${group.kind}:`))
        const filled = rows.filter((slot) => effectiveFeat(slot, plan)).length
        return <details key={group.kind} open={group.kind === 'class'} className="rounded-lg border border-border p-3">
          <summary className="font-medium">{group.title} · {filled} of {rows.length} recorded</summary>
          <div className="mt-3 space-y-4"><p className="text-sm text-muted-foreground">{group.description}</p>
            {rows.length ? rows.map((slot) => <FeatPicker key={slot.id} slot={slot} character={character} archetypes={archetypes} onChange={(choice) => setChoice(slot.id, choice)} onPlanSkills={onPlanSkills} />) : <p className="text-sm text-muted-foreground">No slots at this level. Select a class for its progression, or add a choice granted by another rule below.</p>}
          </div>
        </details>
      })}
      {warnings.length ? <div role="status" className="space-y-1 rounded-md border border-border p-3 text-sm">{warnings.map((warning) => <p key={warning}>{warning}</p>)}<p>Your selections are kept while you review them.</p></div> : null}
      <details className="space-y-3 rounded-lg border border-border p-3">
        <summary className="font-medium">Additional choices from other rules</summary>
        <p className="mt-3 text-sm text-muted-foreground">For a subclass, custom class, conditional grant, or another rule not covered above, add a slot and record its source. Use the level and limit given by that rule.</p>
        {plan.extra.map((extra) => <div key={extra.id} className="mt-3 space-y-2 border-t border-border pt-3">
          <label className="block space-y-1"><span className="font-medium">Extra feat source</span><input className={field} value={extra.source} onChange={(event) => onChange({ ...plan, extra: plan.extra.map((row) => row.id === extra.id ? { ...row, source: event.currentTarget.value } : row) })} /></label>
          <label className="block space-y-1"><span className="font-medium">Extra feat type</span><select className={field} value={extra.kind} onChange={(event) => onChange({ ...plan, extra: plan.extra.map((row) => row.id === extra.id ? { ...row, kind: event.currentTarget.value as typeof extra.kind } : row) })}>{featKinds.map((kind) => <option key={kind} value={kind}>{kinds[kind]}</option>)}</select></label>
          {(['level', 'maxLevel'] as const).map((key) => <label key={key} className="block space-y-1"><span className="font-medium">{key === 'level' ? 'Level gained' : 'Maximum feat level'}</span><select className={field} value={extra[key]} onChange={(event) => onChange({ ...plan, extra: plan.extra.map((row) => row.id === extra.id ? { ...row, [key]: Number(event.currentTarget.value) } : row) })}>{levels.map((level) => <option key={level} value={level}>{level}</option>)}</select></label>)}
          <Button type="button" variant="outline" onClick={() => onChange({ ...plan, extra: plan.extra.filter((row) => row.id !== extra.id) })}>Remove extra slot</Button>
        </div>)}
        <Button type="button" variant="outline" className="mt-3" disabled={plan.extra.length >= 50} onClick={() => onChange({ ...plan, extra: [...plan.extra, { id: `extra:${crypto.randomUUID()}`, kind: 'class', level: character.buildDraft.build.level, maxLevel: character.buildDraft.build.level, source: 'Additional feat' }] })}>Add extra feat slot</Button>
      </details>
      {inactive.length ? <details className="rounded-lg border border-border p-3"><summary className="font-medium">Saved choices outside the current plan ({inactive.length})</summary><p className="mt-2 text-sm text-muted-foreground">Choices from earlier builds or higher levels stay saved. They are not applied to this build.</p><ul className="mt-2 space-y-2">{inactive.map(([id, choice]) => <li key={id} className="space-y-1"><p>{featName(choice.id)}{choice.notes ? ` — ${choice.notes}` : ''}</p><Button type="button" variant="outline" onClick={() => setChoice(id, null)}>Clear saved {featName(choice.id)}</Button></li>)}</ul></details> : null}
      <a className="inline-block text-sm text-primary underline underline-offset-2" href={`${import.meta.env.BASE_URL}rules-notice.txt`} target="_blank" rel="noreferrer">Rules sources and ORC notice</a>
    </div>
  )
}
