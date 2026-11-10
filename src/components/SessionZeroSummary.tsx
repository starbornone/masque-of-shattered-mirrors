import { Button } from '@/components/ui/button'
import { sessionZeroEntries } from '@/session-zero/draft'
import type { SessionZero } from '@/session-zero/types'

type SessionZeroSummaryProps = {
  answers: SessionZero
  onEdit?: (field: keyof SessionZero) => void
}

export function SessionZeroSummary({ answers, onEdit }: SessionZeroSummaryProps) {
  return (
    <dl className="divide-y divide-border">
      {sessionZeroEntries(answers).map(({ field, label, value }) => (
        <div key={field} className="space-y-1 py-3">
          <dt className="font-medium text-primary">{label}</dt>
          <dd className="flex items-start justify-between gap-3">
            <span className="min-w-0 whitespace-pre-wrap wrap-anywhere">
              {value?.trim() || 'Unanswered'}
            </span>
            {onEdit ? (
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                aria-label={`Edit ${label.toLowerCase()}`}
                onClick={() => onEdit(field)}
              >
                Edit
              </Button>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  )
}
