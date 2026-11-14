import { useLayoutEffect, useRef, useState } from 'react'
import { isMaskPromptId, maskPromptQuestions } from '@/character/mask-prompt'
import type { MaskPromptId } from '@/character/mask-prompt'
import { Button } from '@/components/ui/button'

export function MaskPrompt({ mask, approved, onApprove, onClose }: {
  mask: string
  approved?: MaskPromptId
  onApprove: (prompt?: MaskPromptId) => void
  onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [choosing, setChoosing] = useState(!approved)
  const [selection, setSelection] = useState<MaskPromptId>(approved ?? 'keep-believing')

  useLayoutEffect(() => {
    const element = dialog.current
    element?.showModal()
    return () => element?.close()
  }, [])

  return (
    <dialog
      ref={dialog}
      aria-labelledby="mask-prompt-heading"
      onCancel={(event) => { event.preventDefault(); onClose() }}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-xl border border-border bg-card p-5 text-foreground shadow-xl backdrop:bg-black/70"
    >
      <div className="space-y-4">
        <h3 id="mask-prompt-heading" className="text-3xl">The mask slips</h3>
        <blockquote className="whitespace-pre-wrap wrap-anywhere border-l-2 border-primary/60 pl-3 text-lg">{mask}</blockquote>
        {choosing ? (
          <form className="space-y-3" onSubmit={(event) => {
            event.preventDefault()
            onApprove(selection)
            onClose()
          }}>
            <label className="block space-y-1">
              <span className="block font-medium">Prompt</span>
              <select
                className="min-h-11 w-full rounded-md border border-input bg-background px-2"
                value={selection}
                onChange={(event) => {
                  const value = event.currentTarget.value
                  if (isMaskPromptId(value)) setSelection(value)
                }}
              >
                {Object.entries(maskPromptQuestions).map(([id, question]) => <option key={id} value={id}>{question}</option>)}
              </select>
            </label>
            <p className="font-medium text-primary">{maskPromptQuestions[selection]}</p>
            <div className="flex flex-wrap gap-2">
              <Button type="submit">Approve prompt</Button>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            </div>
          </form>
        ) : approved ? (
          <>
            <p className="text-xl font-semibold text-primary">{maskPromptQuestions[approved]}</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={onClose}>Close</Button>
              <Button type="button" variant="outline" onClick={() => setChoosing(true)}>Change prompt</Button>
              <Button type="button" variant="ghost" onClick={() => { onApprove(undefined); onClose() }}>Remove approval</Button>
            </div>
          </>
        ) : null}
      </div>
    </dialog>
  )
}
