/* global version, assets */
const cachePrefix = 'masque-player-'
const cacheName = cachePrefix + version
const scope = new URL(self.registration.scope)
const shell = new URL('index.html', scope).href
const resources = [shell, new URL('favicon.svg', scope).href, ...assets.map((asset) => new URL(asset, scope).href)]
const allowed = new Set(resources)

async function hasResources() {
  if (!(await caches.has(cacheName))) return false
  const cache = await caches.open(cacheName)
  return (await Promise.all(resources.map((url) => cache.match(url)))).every(Boolean)
}

async function cacheResources() {
  const cache = await caches.open(cacheName)
  await cache.addAll(resources.map((url) => new Request(url, {
    cache: 'reload', credentials: 'omit', redirect: 'error',
  })))
}

self.addEventListener('install', (event) => {
  event.waitUntil(cacheResources().then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys()
    await Promise.all(names.filter((name) => name.startsWith(cachePrefix) && name !== cacheName).map((name) => caches.delete(name)))
    await self.clients.claim()
  })())
})

self.addEventListener('message', (event) => {
  const port = event.ports[0]
  if (!port || !['check-offline', 'prepare-offline'].includes(event.data)) return
  event.waitUntil((async () => {
    try {
      if (event.data === 'prepare-offline' && !(await hasResources())) await cacheResources()
      port.postMessage(await hasResources())
    } catch {
      port.postMessage(false)
    }
  })())
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  const playerPage = url.origin === scope.origin &&
    (url.pathname === scope.pathname || url.pathname === new URL(shell).pathname)
  if (request.mode === 'navigate' && playerPage) {
    event.respondWith(fetch(request).catch(async () => {
      const cache = await caches.open(cacheName)
      return await cache.match(shell) ?? Response.error()
    }))
  } else if (allowed.has(url.href)) {
    event.respondWith((async () => {
      const cache = await caches.open(cacheName)
      return await cache.match(url.href) ?? fetch(request)
    })())
  }
})
