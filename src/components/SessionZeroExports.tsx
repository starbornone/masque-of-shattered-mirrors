import { Button } from '@/components/ui/button'
import { serializeSessionZero, sessionZeroMarkdown } from '@/session-zero/draft'
import type { SessionZero } from '@/session-zero/types'

function downloadSessionZero(answers: SessionZero, format: 'json' | 'md') {
  const json = format === 'json'
  const content = json ? serializeSessionZero(answers) : sessionZeroMarkdown(answers)
  const url = URL.createObjectURL(new Blob([content], {
    type: json ? 'application/json' : 'text/markdown;charset=utf-8',
  }))
  const link = document.createElement('a')
  link.href = url
  link.download = `house-verathe-session-zero.${format}`
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
}

export function SessionZeroExports({ answers }: { answers: SessionZero }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" className="min-h-11" onClick={() => downloadSessionZero(answers, 'json')}>
        Download JSON
      </Button>
      <Button type="button" variant="outline" className="min-h-11" onClick={() => downloadSessionZero(answers, 'md')}>
        Download Markdown
      </Button>
    </div>
  )
}
