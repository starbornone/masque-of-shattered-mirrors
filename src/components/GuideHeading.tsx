import type { Ref } from 'react'

type GuideHeadingProps = {
  id: string
  ref: Ref<HTMLHeadingElement>
  eyebrow: string
  title: string
  description?: string
  progress?: { label: string; step: number; total: number }
}

export function GuideHeading({ id, ref, eyebrow, title, description, progress }: GuideHeadingProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
        <p className="guide-kicker text-xs font-semibold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
        {progress ? (
          <p className="text-xs font-semibold tracking-wide text-muted-foreground tabular-nums">
            Step {progress.step} of {progress.total}
          </p>
        ) : null}
      </div>
      {progress ? (
        <progress className="guide-progress" aria-label={progress.label} value={progress.step} max={progress.total} />
      ) : null}
      <h2 ref={ref} id={id} tabIndex={-1} className="guide-title">{title}</h2>
      {description ? <p className="max-w-prose text-muted-foreground">{description}</p> : null}
    </div>
  )
}
