export const maskPromptQuestions = {
  'keep-believing': 'What would you risk to keep them believing it?',
  'see-through': 'Who here would you trust to see through it?',
  'let-slip': 'What truth would you let slip right now?',
} as const

export type MaskPromptId = keyof typeof maskPromptQuestions

export function isMaskPromptId(value: unknown): value is MaskPromptId {
  return typeof value === 'string' && Object.hasOwn(maskPromptQuestions, value)
}
