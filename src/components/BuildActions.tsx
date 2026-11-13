import { useId, useState } from 'react'
import { buildShareUrl } from '@/attributes/draft'
import type { Build } from '@/attributes/build'
import { Button } from '@/components/ui/button'

export function BuildActions({ build }: { build: Build }) {
  const [showLink, setShowLink] = useState(false)
  const [message, setMessage] = useState('')
  const linkId = useId()
  const link = showLink ? buildShareUrl(build, window.location.href) : ''

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link)
      setMessage('Link copied.')
    } catch {
      setMessage('Select the link and copy it manually.')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          aria-expanded={showLink}
          aria-controls={linkId}
          onClick={() => {
            setShowLink(!showLink)
            setMessage('')
          }}
        >
          Share attributes
        </Button>
        <Button type="button" variant="outline" className="min-h-11" onClick={() => window.print()}>
          Print attribute ledger
        </Button>
      </div>
      <div id={linkId} hidden={!showLink} className="space-y-2">
        <p className="text-muted-foreground">Anyone with the link can see your level, ancestry, background, class, and attribute choices. For session-zero answers, skill plans, feats, spells, and gear, use the character file.</p>
        <div className="flex flex-wrap items-end gap-2">
          <label className="min-w-0 flex-1 basis-48 space-y-1">
            <span className="block font-medium">Attribute link</span>
            <input
              readOnly
              value={link}
              onFocus={(event) => event.currentTarget.select()}
              className="min-h-11 w-full rounded-md border border-input bg-background px-3"
            />
          </label>
          <Button type="button" className="min-h-11" onClick={copyLink}>Copy link</Button>
        </div>
        <p role="status" className="text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
