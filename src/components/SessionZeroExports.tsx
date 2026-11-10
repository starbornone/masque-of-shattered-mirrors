import { Button } from '@/components/ui/button'
import { downloadFile } from '@/lib/download'
import { serializeSessionZero, sessionZeroMarkdown } from '@/session-zero/draft'
import type { SessionZero } from '@/session-zero/types'

function downloadSessionZero(answers: SessionZero, format: 'json' | 'md') {
  const json = format === 'json'
  const content = json ? serializeSessionZero(answers) : sessionZeroMarkdown(answers)
  downloadFile(`house-verathe-session-zero.${format}`, content, json ? 'application/json' : 'text/markdown;charset=utf-8')
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
