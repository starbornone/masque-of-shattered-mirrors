import type { Plugin, Connect } from 'vite'
import { loadEnv } from 'vite'
import { serveGm } from '../api/gm.ts'

export function localGm(): Plugin {
  let password: string | undefined
  const middleware: Connect.NextHandleFunction = async (request, response, next) => {
    const url = new URL(request.url ?? '/', 'http://localhost')
    if (url.pathname !== '/gm' && !url.pathname.startsWith('/gm/') && url.pathname !== '/api/gm') {
      next()
      return
    }
    if (url.pathname === '/gm') {
      response.writeHead(307, { Location: '/gm/', 'Cache-Control': 'no-store' })
      response.end()
      return
    }
    try {
      const result = await serveGm(new Request(url, {
        method: request.method,
        headers: request.headers.authorization ? { Authorization: request.headers.authorization } : {},
      }), password)
      response.writeHead(result.status, Object.fromEntries(result.headers))
      response.end(Buffer.from(await result.arrayBuffer()))
    } catch {
      response.writeHead(500, { 'Cache-Control': 'no-store' })
      response.end('GM access is unavailable.')
    }
  }

  return {
    name: 'local-protected-gm',
    config() {
      return {
        server: {
          fs: {
            deny: [
              '.env', '.env.*', '.envlocal', '*.{crt,pem,key,p12,pfx,cer,der}',
              '.npmrc', '.yarnrc.yml', '**/.git/**',
              '**/gm/**', '**/dist-gm/**',
            ],
          },
        },
      }
    },
    configResolved(config) {
      password = loadEnv(config.mode, config.envDir, 'MASQUE_').MASQUE_GM_PASSWORD
    },
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}
