import { createHash, timingSafeEqual } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const headers = {
  'Cache-Control': 'private, no-store',
  Vary: 'Authorization',
  'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; frame-ancestors 'none'; form-action 'none'; base-uri 'none'",
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow',
}

const assetTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.woff2', 'font/woff2'],
  ['.woff', 'font/woff'],
])

function digest(value: string) {
  return createHash('sha256').update(value).digest()
}

export default {
  async fetch(request: Request): Promise<Response> {
    const password = process.env.MASQUE_GM_PASSWORD
    if (!password?.trim()) {
      return new Response('GM access is unavailable.', { status: 503, headers })
    }

    const credentials = request.headers.get('authorization')?.match(/^Basic +([A-Za-z0-9+/]+={0,2})$/i)?.[1]
    const expected = Buffer.from(`gm:${password}`, 'utf8').toString('base64')
    if (!credentials || !timingSafeEqual(digest(credentials), digest(expected))) {
      return new Response('GM credentials required.', {
        status: 401,
        headers: { ...headers, 'WWW-Authenticate': 'Basic realm="Masque GM", charset="UTF-8"' },
      })
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed.', {
        status: 405,
        headers: { ...headers, Allow: 'GET, HEAD' },
      })
    }

    const { pathname, searchParams } = new URL(request.url)
    const asset = pathname.startsWith('/gm/assets/') ? pathname.slice('/gm/assets/'.length) : searchParams.get('asset')
    const type = asset === null
      ? 'text/html; charset=utf-8'
      : assetTypes.get(path.extname(asset))
    if (!type || (asset !== null && !/^[a-zA-Z0-9_-]+\.[a-z0-9]+$/.test(asset))) {
      return new Response('Not found.', { status: 404, headers })
    }

    try {
      const file = asset === null ? 'index.html' : path.join('assets', asset)
      const body = await readFile(path.join(process.cwd(), 'dist-gm', file))
      return new Response(request.method === 'HEAD' ? null : new Uint8Array(body), {
        headers: { ...headers, 'Content-Type': type },
      })
    } catch (error) {
      if (asset !== null && (error as NodeJS.ErrnoException).code === 'ENOENT') {
        return new Response('Not found.', { status: 404, headers })
      }
      return new Response('GM access is unavailable.', { status: 503, headers })
    }
  },
}
