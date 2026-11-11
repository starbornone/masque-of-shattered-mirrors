import { ancestryChoiceName, ancestryFeatLevels } from '../ancestry/choices.ts'
import { calculate } from '../attributes/build.ts'
import { buildSelections } from '../attributes/ledger.ts'
import reference from '../content/foundry-reference.json' with { type: 'json' }
import { equipmentTotals, formatCoins } from '../equipment/plan.ts'
import type { EquipmentItem } from '../equipment/plan.ts'
import { selectedFeatRows } from '../feats/choices.ts'
import { evaluateSkillPlan } from '../skills/plan.ts'
import { rankLabel, selectedSpellRows, spellTradition } from '../spells/choices.ts'
import type { CharacterDraft } from './draft.ts'

type CompendiumGroup = keyof typeof reference.links
type ItemSource = {
  _id: string
  name: string
  type: string
  img?: string
  system: Record<string, unknown>
  _stats?: { compendiumSource: string }
}
type EquipmentReference = { uuid: string; system?: undefined } | {
  uuid: string
  name: string
  type: string
  img: string
  units: number
  system: Record<string, unknown> & { bulk: { value: number }; price: { value: Record<string, number>; per?: number } }
}

const itemReferences: Record<string, EquipmentReference> = reference.equipment
const migration = { version: reference.schemaVersion, previous: null }
const ranks = { Untrained: 0, Trained: 1, Expert: 2, Master: 3, Legendary: 4 }
const textEntities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '@': '&#64;&#8203;', '[': '&#91;&#8203;', ']': '&#93;' }

function literal(value: string) {
  // Break inline-roll and document-link syntax even after Foundry parses the HTML entities.
  return value.replace(/[&<>"'@[\]]/g, (character) => textEntities[character]).replace(/\r\n|\n|\r/g, '<br>')
}

function uuidLink(uuid: string | undefined, name: string) {
  return uuid ? `@UUID[${uuid}]{${literal(name)}}` : literal(name)
}

function compendiumLink(group: CompendiumGroup, id: string, name: string) {
  const entries: Record<string, string> = reference.links[group]
  return uuidLink(Object.hasOwn(entries, id) ? entries[id] : undefined, name)
}

function itemId() {
  return crypto.randomUUID().replaceAll('-', '').slice(0, 16)
}

function coinValue(cp: number) {
  return { gp: Math.floor(cp / 100), sp: Math.floor(cp % 100 / 10), cp: cp % 10 }
}

function inventoryItem(item: Omit<EquipmentItem, 'id'>): ItemSource {
  const source = Object.hasOwn(itemReferences, item.name) ? itemReferences[item.name] : undefined
  const equipped = { carryType: item.carried ? 'worn' : 'dropped', inSlot: false, handsHeld: 0 }
  if (source?.system) {
    return {
      _id: itemId(),
      name: source.name,
      type: source.type,
      img: source.img,
      _stats: { compendiumSource: source.uuid },
      system: {
        ...source.system,
        bulk: { ...source.system.bulk, value: item.bulkLight / 10 },
        price: { ...source.system.price, value: coinValue(item.priceCp) },
        quantity: item.quantity * source.units,
        equipped,
      },
    }
  }
  return {
    _id: itemId(),
    name: item.name,
    type: 'equipment',
    system: {
      _migration: migration,
      description: { value: source ? `<p>${uuidLink(source.uuid, item.name)} is recorded as one bundle.</p>` : '' },
      quantity: item.quantity,
      price: { value: coinValue(item.priceCp) },
      bulk: { value: item.bulkLight / 10 },
      equipped,
      rules: [],
    },
  }
}

function list(title: string, rows: string[]) {
  return rows.length ? `<h3>${title}</h3><ul>${rows.map((row) => `<li>${row}</li>`).join('')}</ul>` : ''
}

function setupNotes(draft: CharacterDraft, unfinished: number, balanceCp: number | null) {
  const { build, skills } = draft.buildDraft
  const [ancestry, background, characterClass] = buildSelections(build)
  const foundations = [
    `Ancestry · ${compendiumLink('ancestry', build.ancestry, ancestry.name)}`,
    `Background · ${compendiumLink('background', build.background, background.name)}`,
    `Class · ${compendiumLink('class', build.characterClass, characterClass.name)}`,
  ]
  const heritage = draft.ancestryChoices?.heritage
  if (heritage) {
    foundations.push(`Heritage · ${compendiumLink('heritage', heritage.id, ancestryChoiceName(heritage, 'heritage'))}${heritage.notes ? ` · ${literal(heritage.notes)}` : ''}`)
  }

  const feats = ancestryFeatLevels.filter((level) => level <= build.level).flatMap((level) => {
    const choice = draft.ancestryChoices?.feats[level]
    if (!choice) return []
    return [`Level ${level} ancestry feat · ${compendiumLink('feat', choice.id, ancestryChoiceName(choice, 'feat'))}${choice.notes ? ` · ${literal(choice.notes)}` : ''}`]
  })
  for (const { slot, choice, name } of selectedFeatRows(draft)) {
    const link = compendiumLink('feat', choice.id.replace(/^ancestry:/, ''), name)
    feats.push(`${literal(slot.label)} · ${link}${slot.fixed ? ' (granted)' : ''}${choice.notes ? ` · ${literal(choice.notes)}` : ''}`)
  }
  const spells = selectedSpellRows(draft).map(({ slot, choice, name }) => {
    const extras = [choice.signature ? 'Signature spell' : '', slot.frequency ?? '', choice.notes].filter(Boolean)
    return [literal(slot.label), rankLabel(slot.rank), compendiumLink('spell', choice.id, name), ...extras.map(literal)].join(' · ')
  })
  const tradition = spellTradition(draft)
  const reminders = []
  if (unfinished) reminders.push(`${unfinished} attribute boosts remain in the Masque draft. Check the current modifiers before play.`)
  if (!skills) reminders.push('Assign skill training in Foundry.')
  if (draft.startingLanguageNotes) reminders.push(`Starting languages · ${literal(draft.startingLanguageNotes)}`)
  if (tradition) reminders.push(`Spell tradition · ${literal(tradition)}`)
  if (draft.spellChoices?.notes) reminders.push(`Spellcasting notes · ${literal(draft.spellChoices.notes)}`)
  if (balanceCp !== null && balanceCp < 0) reminders.push(`Equipment is ${formatCoins(-balanceCp)} over the planned budget.`)
  return [
    '<h2>Finish character setup</h2>',
    '<p>Add your ancestry, background, class, and heritage from the compendiums to apply their grants. Check feats already granted before adding more. Set up spellcasting entries, review equipment, and set current Hit Points after adding class and ancestry.</p>',
    '<p>Attribute modifiers are entered in manual mode. Skill ranks and Lore reflect the Masque plan.</p>',
    list('Character foundations', foundations),
    list('Planned feats', feats),
    list('Planned spells', spells),
    list('Review', reminders),
  ].join('')
}

export function createFoundryActor(draft: CharacterDraft, name: string) {
  const { build, skills } = draft.buildDraft
  const ledger = calculate(build)
  const items: ItemSource[] = []
  const skillRanks: Record<string, { rank: number }> = {}

  for (const skill of skills ? evaluateSkillPlan(build, skills).rows : []) {
    const rank = ranks[skill.rank]
    if (skill.id.startsWith('lore:')) {
      items.push({
        _id: itemId(),
        name: skill.name,
        type: 'lore',
        system: { _migration: migration, mod: { value: 0 }, proficient: { value: rank } },
      })
    } else if (rank > 0) {
      skillRanks[skill.id] = { rank }
    }
  }

  const plan = draft.equipmentPlan
  const balanceCp = plan ? equipmentTotals(plan, build).balanceCp : null
  for (const item of plan?.items ?? []) items.push(inventoryItem(item))
  if (balanceCp !== null && balanceCp > 0) {
    const coins = coinValue(balanceCp)
    for (const [name, quantity, priceCp] of [
      ['Gold Pieces', coins.gp, 100],
      ['Silver Pieces', coins.sp, 10],
      ['Copper Pieces', coins.cp, 1],
    ] as const) {
      if (quantity > 0) items.push(inventoryItem({ name, quantity, priceCp, bulkLight: 10, carried: true }))
    }
  }

  // Build a player actor explicitly. Campaign answers, GM notes, and the draft itself are outside this format.
  return {
    name: name.trim().slice(0, 80) || 'Masque Character',
    type: 'character' as const,
    prototypeToken: { actorLink: true },
    system: {
      _migration: migration,
      abilities: Object.fromEntries(ledger.rows.map(({ id, total }) => [id, { mod: total }])),
      details: {
        level: { value: build.level },
        ...(build.key ? { keyability: { value: build.key } } : {}),
        alliance: 'party',
        biography: { campaignNotes: setupNotes(draft, ledger.remaining, balanceCp) },
      },
      skills: skillRanks,
    },
    items,
    effects: [],
    _stats: { systemId: 'pf2e', systemVersion: reference.systemVersion, coreVersion: reference.coreVersion },
  }
}

export function serializeFoundryActor(draft: CharacterDraft, name: string) {
  return JSON.stringify(createFoundryActor(draft, name), null, 2) + '\n'
}
