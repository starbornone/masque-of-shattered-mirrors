import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import type { Plugin } from 'vite'

export function playerOffline(): Plugin {
  return {
    name: 'player-offline',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const assets = Object.keys(bundle).filter((name) => name.startsWith('assets/')).sort()
      const html = bundle['index.html']
      if (!html || html.type !== 'asset') this.error('The offline cache needs the player index.html.')
      const worker = readFileSync(new URL('./offline-worker.js', import.meta.url), 'utf8')
      const version = createHash('sha256').update(html.source).update(assets.join('\n')).update(worker).digest('hex').slice(0, 16)
      this.emitFile({
        type: 'asset',
        fileName: 'offline-worker.js',
        source: `const version = ${JSON.stringify(version)}\nconst assets = ${JSON.stringify(assets)}\n${worker}`,
      })
    },
  }
}
