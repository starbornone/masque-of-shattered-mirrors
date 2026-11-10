export const faithChoices = {
  pharasma: 'Pharasma, Lady of Graves',
  nocticula: 'Nocticula',
  'black-butterfly': 'The Black Butterfly',
  none: 'None',
} as const

export type FaithChoice = keyof typeof faithChoices

export type Stake = { kind: 'person'; name: string } | { kind: 'self' }

export interface SessionZero {
  invitationReason: string
  stake: Stake | null
  art: string
  faith: FaithChoice | null
  mask: string
}

export type SessionZeroStep = 'invitation' | keyof SessionZero | 'review'

export type SessionZeroDraft = {
  answers: SessionZero
  step?: SessionZeroStep
}

export const emptySessionZero: SessionZero = {
  invitationReason: '',
  stake: null,
  art: '',
  faith: null,
  mask: '',
}
