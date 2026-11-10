import { emptySessionZero, faithChoices } from './types.ts'
import type { FaithChoice, SessionZero, SessionZeroDraft, SessionZeroStep, Stake } from './types.ts'

export const sessionZeroStorageKey = 'masque-session-zero'

function object(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? value as Record<string, unknown> : {}
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function normalizeStake(value: unknown): Stake | null {
  const stake = object(value)
  if (stake.kind === 'self') return { kind: 'self' }
  if (stake.kind === 'person') return { kind: 'person', name: text(stake.name) }
  return null
}

export function parseSessionZero(serialized: string): SessionZeroDraft | null {
  try {
    const data = object(JSON.parse(serialized))
    if (data.format !== sessionZeroStorageKey || data.version !== 1) return null
    const answers = object(data.answers)
    const faith = text(answers.faith)
    const step = text(data.step)
    return {
      answers: {
        invitationReason: text(answers.invitationReason),
        stake: normalizeStake(answers.stake),
        art: text(answers.art),
        faith: Object.hasOwn(faithChoices, faith) ? faith as FaithChoice : null,
        mask: text(answers.mask),
      },
      step: step === 'invitation' || step === 'review' || Object.hasOwn(emptySessionZero, step)
        ? step as SessionZeroStep
        : undefined,
    }
  } catch {
    return null
  }
}

export function serializeSessionZero(answers: SessionZero, step?: SessionZeroStep): string {
  const { invitationReason, stake, art, faith, mask } = answers
  return JSON.stringify({
    format: sessionZeroStorageKey,
    version: 1,
    answers: { invitationReason, stake: normalizeStake(stake), art, faith, mask },
    step,
  }, null, 2) + '\n'
}

export function loadSessionZero(): SessionZeroDraft {
  try {
    return parseSessionZero(localStorage.getItem(sessionZeroStorageKey) ?? '') ?? { answers: emptySessionZero }
  } catch {
    return { answers: emptySessionZero }
  }
}

export function sessionZeroEntries({ invitationReason, stake, art, faith, mask }: SessionZero) {
  return [
    { field: 'invitationReason', label: 'Reason for accepting', value: invitationReason },
    { field: 'stake', label: 'Who matters', value: stake?.kind === 'self' ? 'My character is the one they are watching.' : stake?.name },
    { field: 'art', label: 'Art or craft', value: art },
    { field: 'faith', label: 'Faith', value: faith ? faithChoices[faith] : 'No preference' },
    { field: 'mask', label: 'What the mask says', value: mask },
  ] as const
}

export function sessionZeroMarkdown(answers: SessionZero): string {
  const sections = sessionZeroEntries(answers).map(({ label, value }) => {
    const lines = (value?.trim() || 'Unanswered').split(/\r\n|\r|\n/)
    const quote = lines.map((line) => '> ' + line.replace(/[\\`*_{}[\]()<>#+.!|&~-]/g, '\\$&')).join('\n')
    return `## ${label}\n\n${quote}`
  })
  return ['# House Verathe session zero', ...sections].join('\n\n') + '\n'
}
