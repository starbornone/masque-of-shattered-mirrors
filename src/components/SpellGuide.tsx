import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { CharacterDraft } from '@/character/draft'
import { castingProfiles, dailySlots, effectiveSpell, emptySpellChoices, extraSpellKinds, newSpellChoice, rankLabel, spellName, spellSlots, spellTradition, traditions } from '@/spells/choices'
import type { ExtraSpell, SpellChoice, SpellChoices, SpellSlot } from '@/spells/choices'
import { availableSpells, inactiveSpellRows, spellOption, spellWarnings } from '@/spells/options'
import type { SpellOption } from '@/spells/options'
import { Button } from '@/components/ui/button'

const field = 'min-h-11 w-full rounded-md border border-input bg-background px-3 text-foreground focus-visible:outline-2 focus-visible:outline-ring'
const ruleLoaders = import.meta.glob<{ default: Record<string, string> }>('../content/spell-rules/*.json')
const kindNames = { innate: 'Innate spell', focus: 'Focus spell / focus cantrip', learned: 'Additional learned spell', prepared: 'Additional preparation', repertoire: 'Additional repertoire spell', access: 'Added to your spell list' }

function SpellGroup({ title, defaultOpen, children }: { title: string; defaultOpen: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)} className="rounded-lg border border-border p-3 sm:p-4">
    <summary className="min-h-11 cursor-pointer py-2 font-semibold">{title}</summary>
    {open ? <div className="mt-3 space-y-3">{children}</div> : null}
  </details>
}

function SpellRules({ option }: { option: SpellOption }) {
  const { id, rulesGroup } = option
  const [text, setText] = useState('')
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    ruleLoaders[`../content/spell-rules/${rulesGroup}.json`]().then((m) => {
      if (!m.default[id]) throw new Error('Missing spell rules')
      if (active) setText(m.default[id])
    }).catch(() => { if (active) setFailed(true) })
    return () => { active = false }
  }, [id, rulesGroup, attempt])
  const actions = /^[123]$/.test(option.actions) ? `${option.actions} action${option.actions === '1' ? '' : 's'}` : option.actions
  return <div className="space-y-2 text-sm">
    <p className="font-medium text-primary">{option.source} · {option.cantrip ? 'Cantrip' : `Base rank ${option.rank}`} · {option.rarity} · {actions}</p>
    <p className="text-muted-foreground">{[option.range && `Range: ${option.range}`, option.target && `Targets: ${option.target}`, option.duration && `Duration: ${option.duration}`, option.sustained && 'Sustained', option.defense?.save?.statistic && `${option.defense.save.basic ? 'Basic ' : ''}${option.defense.save.statistic} save`].filter(Boolean).join(' · ')}</p>
    <p className="text-muted-foreground">{option.traits.join(' · ')}</p>
    {text ? <><p className="text-muted-foreground">{text.split('\n\n')[0]}</p><details>
      <summary className="min-h-11 cursor-pointer py-2 font-medium">Full rules and heightening for {option.name}</summary>
      <p className="whitespace-pre-line text-muted-foreground">{text}</p>
    </details></> : failed ? <p role="status">Rules couldn’t be loaded. <button type="button" className="underline" onClick={() => { setFailed(false); setAttempt((n) => n + 1) }}>Try again</button> or use the reference link.</p> : <p role="status">Loading spell rules…</p>}
    <a className="inline-block font-medium text-primary underline underline-offset-2" href={`https://2e.aonprd.com/Search.aspx?q=${encodeURIComponent(option.name)}`} target="_blank" rel="noreferrer">Find {option.name} on Archives of Nethys</a>
  </div>
}

function SpellPicker({ slot, choice, onChange, signature }: { slot: SpellSlot; choice?: SpellChoice; onChange: (choice?: SpellChoice) => void; signature: boolean }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [offList, setOffList] = useState(choice?.grantedAccess ?? false)
  const selected = choice && spellOption(choice.id)
  const allowed = availableSpells(slot, { ...newSpellChoice(''), grantedAccess: offList })
  const matches = allowed.filter((s) => `${s.name} ${s.traits.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase()))
  const visible = selected && !matches.some((s) => s.id === selected.id) ? [selected, ...matches] : matches
  return <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)} className="rounded-md border border-border p-3">
    <summary className="min-h-11 cursor-pointer py-2 font-medium">{slot.label}: <span className="text-primary">{choice ? spellName(choice.id) : 'Decide later'}</span>{choice?.signature ? ' · signature' : ''}</summary>
    {open ? <div className="space-y-3 pt-2">
      <p className="text-sm text-muted-foreground">{slot.source} · {rankLabel(slot.rank)}{slot.rank === 0 ? ' (automatically heightens)' : slot.kind === 'focus' ? ' (automatically heightens)' : ' or a lower-rank spell'}{slot.granted ? ' · follow the granting rule’s choices' : slot.tradition ? ` · ${slot.tradition}` : ' · choose your tradition above'}</p>
      {!slot.fixed ? <>
        <label className="block space-y-1"><span>Search {slot.label.toLowerCase()}</span><input type="search" className={field} placeholder="Spell name or trait" value={query} onChange={(e) => setQuery(e.currentTarget.value)} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault() }} /></label>
        {!slot.granted ? <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={offList} onChange={(e) => { setOffList(e.currentTarget.checked); if (choice) onChange({ ...choice, grantedAccess: e.currentTarget.checked }) }} />Include off-list spells granted by another rule</label> : null}
        <label className="block space-y-1"><span>{slot.label} choice</span><select className={field} value={choice?.id ?? ''} onChange={(e) => onChange(e.currentTarget.value ? { ...newSpellChoice(e.currentTarget.value), grantedAccess: offList } : undefined)}>
          <option value="">Decide later</option>{visible.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.cantrip ? 'cantrip' : `base rank ${s.rank}`}{s.rarity === 'common' ? '' : ` · ${s.rarity}`}</option>)}<option value="custom">Custom / another rules source</option>
        </select></label>
        {!matches.length ? <p role="status" className="text-sm text-muted-foreground">No matching spells. Clear the search, choose your tradition, or record a custom spell.</p> : null}
      </> : null}
      {selected ? <SpellRules key={selected.id} option={selected} /> : null}
      {choice ? <>
        {signature ? <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={choice.signature} onChange={(e) => onChange({ ...choice, signature: e.currentTarget.checked })} />{slot.label} is a signature spell</label> : null}
        <label className="block space-y-1"><span>{slot.label} {choice.id === 'custom' ? 'name and rules' : 'notes (optional)'}</span><textarea className={`${field} py-2`} rows={2} value={choice.notes} placeholder="Record any granted access, choices, or casting details" onChange={(e) => onChange({ ...choice, notes: e.currentTarget.value })} /></label>
      </> : null}
    </div> : null}
  </details>
}

export default function SpellGuide({ character, onChange }: { character: CharacterDraft; onChange: (choices: SpellChoices) => void }) {
  const plan = character.spellChoices ?? emptySpellChoices
  const { characterClass: id, level } = character.buildDraft.build
  const profile = castingProfiles[id]
  const tradition = spellTradition(character)
  const slots = spellSlots(character)
  const inactive = inactiveSpellRows(character)
  const warnings = spellWarnings(character)
  function choose(slot: SpellSlot, choice?: SpellChoice) {
    const choices = { ...plan.choices }
    if (choice) choices[slot.id] = choice
    else delete choices[slot.id]
    onChange({ ...plan, choices })
  }
  function editExtra(extra: ExtraSpell, patch: Partial<ExtraSpell>) { onChange({ ...plan, extra: plan.extra.map((e) => e.id === extra.id ? { ...e, ...patch } : e) }) }
  function picker(slot: SpellSlot) { return <SpellPicker key={slot.id} slot={slot} choice={effectiveSpell(slot, plan)} onChange={(choice) => choose(slot, choice)} signature={slot.kind === 'repertoire' && slot.rank > 0 && slot.rank < 10 && level >= 3} /> }
  const groups = [
    { title: 'Cantrips', slots: slots.filter((s) => s.kind === 'cantrip'), open: true },
    ...Array.from({ length: 10 }, (_, n) => n + 1).map((rank) => ({ title: `Rank ${rank} · ${profile?.mode === 'prepared' ? 'daily preparations' : 'spells in your repertoire'}${profile ? ` · ${dailySlots(id, level, rank)} normal slots per day` : ''}`, slots: slots.filter((s) => !s.id.startsWith('extra:') && s.rank === rank && (s.kind === 'prepared' || s.kind === 'repertoire')), open: rank === 1 })),
    { title: id === 'witch' ? 'Spells your familiar has learned' : 'Spells learned in your spellbook', slots: slots.filter((s) => s.kind === 'learned' && !s.id.startsWith('extra:')), open: false },
    { title: 'Granted focus spells and focus cantrips', slots: slots.filter((s) => s.kind === 'focus' && !s.id.startsWith('extra:')), open: false },
  ]
  return <div className="space-y-4">
    <div className="space-y-2 text-muted-foreground">
      <p>A spell’s <strong className="text-foreground">rank</strong> measures its power, separately from character level. Full spellcasting classes reach rank {Math.ceil(level / 2)} at level {level}. A spell slot pays for one ranked casting; it returns at daily preparations.</p>
      <p><strong className="text-foreground">Cantrips</strong> use no slots and can be cast repeatedly. They automatically heighten to rank {Math.ceil(level / 2)} at your level. Read the Heightened entry for stronger effects; the rules below show the base version.</p>
      {profile ? <>
        <p>{profile.mode === 'prepared' ? 'You prepare spells each day. Choose a spell for each slot; preparing it twice lets you cast it twice. You can prepare a lower-rank spell in a higher-rank slot to heighten it.' : 'Your repertoire is the set of spells you know. Each casting spends a slot of that rank; you do not assign spells to individual slots. To heighten a spell, normally learn it at that rank as well.'}</p>
        {profile.mode === 'repertoire' && level >= 3 ? <p>Signature spells can be heightened without learning each rank separately. Normally mark one known spell per rank. Rank 10 uses its own class restrictions.</p> : null}
        <p>Your tradition is {tradition || 'determined by your patron or bloodline'}. Arcane covers broad magical effects; divine draws on spiritual power; occult uses hidden connections and the mind; primal draws on nature.</p>
        <a href={`https://2e.aonprd.com/Classes.aspx?ID=${profile.rulesId}`} target="_blank" rel="noreferrer" className="inline-block font-medium text-primary underline underline-offset-2">Check your class’s spellcasting rules</a>
      </> : <p>Your selected class has no normal ranked spell slots. Add spells below only when an ancestry, feat, or other feature grants them.</p>}
      <p>Selections are a plan. The guide does not spend slots, calculate spell DCs, or apply spell effects. Uncommon and rare choices need access. You can leave choices undecided and continue.</p>
    </div>
    {id === 'witch' || id === 'sorcerer' ? <label className="block space-y-1"><span>{id === 'witch' ? 'Patron' : 'Bloodline'} tradition</span><select className={field} value={plan.traditions[id]} onChange={(e) => onChange({ ...plan, traditions: { ...plan.traditions, [id]: e.currentTarget.value } })}><option value="">Decide later</option>{traditions.map((t) => <option key={t}>{t}</option>)}</select></label> : null}
    {id === 'wizard' ? <><label className="block space-y-1"><span>Wizard school preparation</span><select className={field} value={plan.wizardSchool} onChange={(e) => onChange({ ...plan, wizardSchool: e.currentTarget.value as SpellChoices['wizardSchool'] })}><option value="">Decide later</option><option value="curriculum">A school with a curriculum</option><option value="unified">School of Unified Magical Theory</option></select></label><p className="text-sm text-muted-foreground">A curriculum adds a restricted daily cantrip, a restricted slot at each rank, and learned curriculum spells. Choose from your school’s list for those rows. Unified Magical Theory uses the normal rows and its own Drain Bonded Item rule.</p></> : null}
    {id === 'cleric' ? <><label className="block space-y-1"><span>Divine font</span><select className={field} value={plan.font} onChange={(e) => onChange({ ...plan, font: e.currentTarget.value as SpellChoices['font'] })}><option value="">Decide later</option><option value="heal">Healing font</option><option value="harm">Harmful font</option></select></label><p className="text-sm text-muted-foreground">Your deity determines the available font. These extra preparations are separate from your normal slots. Deity-granted spells can expand your list; record their source and enable off-list access when selecting one.</p></> : null}
    {id === 'wizard' || id === 'witch' ? <p className="text-sm text-muted-foreground">Your {id === 'wizard' ? 'spellbook' : 'familiar'} starts with 10 cantrips and 5 rank 1 spells, plus the school or patron grants shown below. Each later level adds two spells of a rank you could cast then. Record additional Learn a Spell gains below. Daily preparations must come from spells you have learned.</p> : null}
    {['bard', 'oracle', 'sorcerer', 'witch', 'druid'].includes(id) ? <p className="text-sm text-muted-foreground">Use the granted rows for your muse, mystery, bloodline, patron, or order’s specified spells. They are separate from normal choices except sorcerer bloodline spells, which are included in the normal repertoire count. Add later mystery gifts and feat-granted spells below; subclass and feat effects are not automatically resolved.</p> : null}
    <label className="block space-y-1"><span>Spellcasting source notes (optional)</span><textarea className={`${field} py-2`} rows={2} value={plan.notes} placeholder="School, patron, mystery, bloodline, deity, or access details" onChange={(e) => onChange({ ...plan, notes: e.currentTarget.value })} /></label>
    {warnings.length ? <aside className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm"><p className="font-medium">Check these spell choices</p><ul className="mt-2 list-disc space-y-1 pl-5">{warnings.map((w) => <li key={w}>{w}</li>)}</ul></aside> : null}
    {groups.filter((g) => g.slots.length).map((group) => <SpellGroup key={group.title} defaultOpen={group.open} title={`${group.title} · ${group.slots.filter((s) => effectiveSpell(s, plan)).length}/${group.slots.length} chosen`}>{group.slots.map(picker)}</SpellGroup>)}
    <details className="rounded-lg border border-border p-3 sm:p-4" open={plan.extra.length > 0}>
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">Additional spells and granted access · {plan.extra.length}</summary>
      <div className="space-y-3 pt-3">
        <p className="text-sm text-muted-foreground">Add a row only when a rule grants it. Innate spells use their own frequency and granted rank, not class slots; innate cantrips still heighten. Focus spells normally cost 1 Focus Point and heighten automatically; a focus cantrip costs none. Refocus for 10 minutes to regain 1 Focus Point. Follow your source for pool size and any additional requirements.</p>
        <p className="text-sm text-muted-foreground">“Added to your spell list” records access only; it does not grant a known spell, preparation, or slot. Add separate rows if a feature grants those too. For focus cantrips choose Cantrip; for other focus spells the guide uses your current half-level rank.</p>
        {plan.extra.map((extra) => <section key={extra.id} className="space-y-3 rounded-md border border-border p-3" aria-label="Additional spell source">
          <label className="block space-y-1"><span>Spell source {extra.id.slice(-6)}</span><input className={field} value={extra.source} placeholder="For example: Otherworldly Magic" onChange={(e) => editExtra(extra, { source: e.currentTarget.value })} /></label>
          <div className="grid gap-3 sm:grid-cols-2"><label className="block space-y-1"><span>Spell grant type {extra.id.slice(-6)}</span><select className={field} value={extra.kind} onChange={(e) => editExtra(extra, { kind: e.currentTarget.value as ExtraSpell['kind'] })}>{extraSpellKinds.map((kind) => <option key={kind} value={kind}>{kindNames[kind]}</option>)}</select></label>
            <label className="block space-y-1"><span>Granted rank {extra.id.slice(-6)}</span><select className={field} value={extra.rank} onChange={(e) => editExtra(extra, { rank: Number(e.currentTarget.value) })}>{Array.from({ length: 11 }, (_, rank) => <option key={rank} value={rank}>{rankLabel(rank)}</option>)}</select></label>
            <label className="block space-y-1"><span>Gained at level {extra.id.slice(-6)}</span><input type="number" min={1} max={20} className={field} value={extra.level} onChange={(e) => { const n = Number(e.currentTarget.value); if (Number.isInteger(n) && n >= 1 && n <= 20) editExtra(extra, { level: n }) }} /></label>
            <label className="block space-y-1"><span>Frequency / slot details {extra.id.slice(-6)}</span><input className={field} value={extra.frequency} placeholder="For example: once per day" onChange={(e) => editExtra(extra, { frequency: e.currentTarget.value })} /></label></div>
          {slots.find((s) => s.id === extra.id) ? picker(slots.find((s) => s.id === extra.id)!) : <p className="text-sm text-muted-foreground">Saved for level {extra.level}; not active at this level.</p>}
          <Button type="button" variant="outline" onClick={() => { const choices = { ...plan.choices }; delete choices[extra.id]; onChange({ ...plan, choices, extra: plan.extra.filter((e) => e.id !== extra.id) }) }}>Remove {extra.source || 'additional spell'}</Button>
        </section>)}
        <Button type="button" variant="outline" disabled={plan.extra.length >= 100} onClick={() => onChange({ ...plan, extra: [...plan.extra, { id: `extra:${crypto.randomUUID()}`, kind: 'innate', rank: 0, level, source: '', frequency: '' }] })}>Add a granted or learned spell</Button>
      </div>
    </details>
    {inactive.length ? <details className="rounded-md border border-border p-3"><summary className="min-h-11 cursor-pointer py-2 font-medium">Earlier selections · {inactive.length}</summary><ul className="space-y-2">{inactive.map(({ id, name, choice }) => <li key={id} className="wrap-anywhere">{name} · {id}{choice.notes ? ` · ${choice.notes}` : ''}</li>)}</ul></details> : null}
    <a href="/rules-notice.txt" target="_blank" rel="noreferrer" className="inline-block text-sm text-primary underline underline-offset-2">Rules sources and ORC attribution</a>
  </div>
}
