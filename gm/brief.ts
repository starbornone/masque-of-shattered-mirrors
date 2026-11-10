import { calculate } from '../src/attributes/build.ts'
import { buildSelections } from '../src/attributes/ledger.ts'
import { attributes } from '../src/attributes/options.ts'
import type { CharacterDraft } from '../src/character/draft.ts'
import { faithChoices } from '../src/session-zero/types.ts'
import type { FaithChoice } from '../src/session-zero/types.ts'
import { canAssignSkills, evaluateSkillPlan } from '../src/skills/plan.ts'
import { ancestryChoiceName, ancestryFeatLevels } from '../src/ancestry/choices.ts'
import { selectedFeatRows } from '../src/feats/choices.ts'

const deityHooks: Record<FaithChoice, string[]> = {
  pharasma: [
    'Seed funeral lilies, sudden cold, or a servant who is a disguised psychopomp. Let a prayer reveal a broken mirror with the intended victim’s eyes scratched out.',
    'Prepare The Witness as a way to expose the soul the Closing of the Mouth would destroy. Agree on the cost of any greater intercession before the climax.',
  ],
  nocticula: [
    'Make the Midnight Mask attractive as both an artistic prize and a glimpse of who the intended victim could become.',
    'At the climax, use the mask to offer the victim transformation as an alternative to erasure. Decide what they would lose from their former life.',
  ],
  'black-butterfly': [
    'Seed a quiet refuge or a solitary encounter during the Komos of the Ashes. The black feather can connect that encounter to the final chamber.',
    'Prepare the feather’s darkness as a way to prevent the witnessed sacrifice. Choose any memory cost for an earlier revelation before play.',
  ],
  none: [
    'Build the intervention around testimony, the mirror shard, or the Kantharos of Silence. Keep divine encounters available through NPCs if the player pursues them.',
  ],
}

const skillHooks: Record<string, string> = {
  society: 'Use the Silver Gallery’s missing portrait and family records to expose gaps in the Verathe history.',
  occultism: 'Let the broken mirrors and the Kantharos of Silence reveal how the binding sustains the ritual.',
  religion: 'Use Echo-of-Forgotten-Names or the interrupted passage of souls to explain the Closing of the Mouth.',
  diplomacy: 'Give Lady Cassia room to hesitate, or gather written testimony from the Silent Chorus.',
  deception: 'Offer a chance to maintain a cover story while questioning guests about the procession.',
  intimidation: 'Let pressure on a complicit noble reveal an entrance or a name, with a social complication if appropriate.',
  stealth: 'Make the Servant’s Passages a route to overhear the procession’s plans or approach the well room.',
  thievery: 'Use Marius’s carried list of victims or the Silver Gallery’s loose silver thread as a lead.',
  performance: 'Connect the character’s performance to the competition or Maestro Velys’s distorted music.',
  crafting: 'Let close examination of the Silver Gallery’s repaired mirrors reveal a removable silver strand.',
  medicine: 'Give a chance to recognize the white-dressed victim’s drugged state and help them respond.',
  nature: 'Use the Winter Garden’s unnatural snow and dead roses as evidence that the house is wrong.',
  survival: 'Offer a route through the Servant’s Passages that can reach the well room ahead of the procession.',
  athletics: 'Prepare a physical way to interrupt access to the well or move a ritual component.',
  arcana: 'Offer a magical investigation of the mirrors, alongside testimony that can explain their purpose.',
  acrobatics: 'Provide a precarious route through the crowded hall or behind the gallery displays.',
}

function quoteAnswer(answer: string) {
  return answer.trim().split(/\r\n|\r|\n/)
    .map((line) => '> ' + line.replace(/[\\`*_{}[\]()<>#+.!|&~-]/g, '\\$&'))
    .join('\n')
}

export function tailoringBrief(draft: CharacterDraft): string {
  const { answers } = draft.sessionZero
  const { build, skills } = draft.buildDraft
  const stake = answers.stake
  const target = stake?.kind === 'self' ? 'The player character' : stake?.kind === 'person' ? stake.name : ''
  const complete = canAssignSkills(build)
  const opportunities = complete && skills
    ? evaluateSkillPlan(build, skills).rows
      .filter(({ rank }) => rank !== 'Untrained')
      .sort((a, b) => b.modifier - a.modifier || a.name.localeCompare(b.name))
      .slice(0, 4)
      .map(({ id, name, rank, modifier }) => (
        `${name} · ${rank} (${modifier >= 0 ? '+' : ''}${modifier}). ${skillHooks[id] ?? 'Tie a relevant Lore topic to a guest, an object, or a record in the Library of Echoes.'}`
      ))
    : ['Keep visible clues and NPC testimony available. Add skill-specific opportunities once the player’s attributes and planned training are ready.']

  const sections = [
    {
      title: 'Build snapshot',
      notes: [
        `Level ${build.level} · ${buildSelections(build).map(({ name }) => name).join(' · ')}.`,
        `Attribute modifiers${complete ? '' : ' (unfinished)'} — ${calculate(build).rows.map(({ id, total }) => `${attributes[id]} ${total >= 0 ? '+' : ''}${total}`).join(', ')}.`,
      ],
    },
    {
      title: 'Heritage and ancestry feats',
      answer: draft.ancestryChoices ? [
        draft.ancestryChoices.heritage ? `Heritage: ${ancestryChoiceName(draft.ancestryChoices.heritage, 'heritage')}. ${draft.ancestryChoices.heritage.notes}` : 'Heritage undecided.',
        ...ancestryFeatLevels.filter((slot) => slot <= build.level).map((slot) => {
          const choice = draft.ancestryChoices?.feats[slot]
          return choice ? `Level ${slot}: ${ancestryChoiceName(choice, 'feat')}. ${choice.notes}` : `Level ${slot} ancestry feat undecided.`
        }),
      ].join('\n') : '',
      notes: ['Check any senses, innate spells, or skill benefits from these choices when preparing opportunities. These recorded choices do not automatically change the attribute or skill calculations.'],
    },
    {
      title: 'Class, general, and skill feats',
      answer: selectedFeatRows(draft).map(({ slot, choice, name }) => `${slot.label}: ${name}. ${choice.notes}`).join('\n'),
      notes: ['Check these abilities when preparing opportunities. Recorded feat choices do not automatically apply their bonuses, training, spells, or other benefits.'],
    },
    {
      title: 'Invitation',
      answer: answers.invitationReason,
      notes: answers.invitationReason.trim()
        ? ['Use the stated reason in Cassia’s greeting. Choose which invitation detail suggests the house knows more about the character than it should.']
        : ['The invitation reason is open. Prepare Cassia’s greeting without assigning the character a motive.'],
    },
    {
      title: 'Stake and intended victim',
      answer: target,
      notes: stake?.kind === 'self'
        ? [
          'Use the character as the intended victim of the Rite of the Broken Mirror. Foreshadow this through their own face in a shard and the treatment of an honored guest.',
          'Choose how the white dress and drugging scene should adapt for a player character. Prepare an opportunity to intervene before the Closing of the Mouth.',
        ]
        : [
          stake?.kind === 'person' && stake.name.trim()
            ? 'Use the named person as the intended victim. Establish their connection to the character before revealing the white dress and the threat of erasure.'
            : 'The intended victim is undecided. Choose a connection with the player before fixing the identity in the ritual scenes.',
          'If using the reveal that the victim is Cassia’s daughter, decide how it fits this relationship and whether Cassia already knows. Prepare her hesitation when the truth becomes undeniable.',
        ],
    },
    {
      title: 'Art and Verathe framing',
      answer: answers.art,
      notes: answers.art.trim()
        ? ['Frame the invitation as recognition of this art or craft. Let Marius’s interest echo the house’s original betrayal of artists who were promised refuge.']
        : ['The art or craft is open. Use a general honored-guest welcome until the player supplies a detail.'],
    },
    {
      title: 'Faith and a seeded intervention',
      answer: answers.faith ? faithChoices[answers.faith] : '',
      notes: answers.faith
        ? deityHooks[answers.faith]
        : ['No deity preference was supplied. Prepare testimony and ritual-component clues, and keep any divine encounter optional.'],
    },
    {
      title: 'Mask and Marius’s competition',
      answer: answers.mask,
      notes: answers.mask.trim()
        ? ['Have Marius respond to the mask’s stated lie in the competition. Connect his attention to the Midnight Mask prize and its glimpse of the victim’s possible redemption.']
        : ['The mask is undescribed. Keep Marius’s competition invitation general until the player chooses what the mask expresses.'],
    },
    { title: 'Skill opportunities', notes: opportunities },
    {
      title: 'Starting language notes',
      answer: draft.startingLanguageNotes,
      notes: ['Check any planned language against the character’s rules and the campaign’s established setting.'],
    },
  ]

  return [
    '# GM tailoring brief',
    '',
    'The Masque of Shattered Mirrors',
    '',
    'GM-only preparation suggestions based on the imported character. Resolve open choices before play.',
    ...sections.flatMap(({ title, answer, notes }) => [
      '',
      `## ${title}`,
      '',
      ...(answer?.trim() ? [quoteAnswer(answer), ''] : []),
      ...notes.map((note) => `- ${note}`),
    ]),
    '',
  ].join('\n')
}
