import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { createServer, preview } from 'vite'
import { localGm } from '../server/gm-local.ts'

test('local GM routes use server-side auth and block raw private files', async (t) => {
  const cwd = process.cwd()
  const originalPassword = process.env.MASQUE_GM_PASSWORD
  const fixture = realpathSync.native(mkdtempSync(path.join(tmpdir(), 'masque-gm-local-')))
  process.chdir(fixture)
  delete process.env.MASQUE_GM_PASSWORD
  mkdirSync('gm')
  mkdirSync('dist-gm/assets', { recursive: true })
  writeFileSync('index.html', '<h1>Public player guide</h1>')
  writeFileSync('gm/brief.ts', 'const secret = "private campaign source"')
  writeFileSync('dist-gm/index.html', '<h1>Private GM workspace</h1>')
  writeFileSync('dist-gm/assets/workspace.js', '/* private campaign asset */')
  writeFileSync('.envlocal', 'PRIVATE_VALUE=fixture-only')

  const start = async () => {
    const server = await createServer({
      configFile: false,
      root: fixture,
      logLevel: 'silent',
      plugins: [localGm()],
      server: { host: '127.0.0.1', port: 0, watch: null },
    })
    await server.listen()
    return server
  }
  let server = await start()
  t.after(async () => {
    await server.close()
    process.chdir(cwd)
    if (originalPassword === undefined) delete process.env.MASQUE_GM_PASSWORD
    else process.env.MASQUE_GM_PASSWORD = originalPassword
    rmSync(fixture, { recursive: true, force: true })
  })
  const request = (url: string, init?: RequestInit) => {
    const address = server.httpServer!.address()
    assert.ok(address && typeof address !== 'string')
    return fetch(`http://127.0.0.1:${address.port}${url}`, init)
  }
  assert.equal((await request('/gm/')).status, 503)
  await server.close()
  writeFileSync('.env.local', 'MASQUE_GM_PASSWORD=fixture-only-password')
  server = await start()

  const redirect = await request('/gm', { redirect: 'manual' })
  assert.equal(redirect.status, 307)
  assert.equal(redirect.headers.get('location'), '/gm/')
  for (const url of ['/gm/', '/gm/assets/workspace.js', '/gm/brief.ts?raw', '/api/gm']) {
    const response = await request(url)
    assert.equal(response.status, 401, url)
    assert.match(response.headers.get('www-authenticate') ?? '', /^Basic /)
    assert.doesNotMatch(await response.text(), /private campaign|Private GM workspace/)
  }
  const headers = { Authorization: `Basic ${Buffer.from('gm:fixture-only-password').toString('base64')}` }
  assert.match(await (await request('/gm/', { headers })).text(), /Private GM workspace/)
  assert.match(await (await request('/gm/assets/workspace.js', { headers })).text(), /private campaign asset/)
  assert.equal((await request('/gm/', { headers: { Authorization: 'Basic wrong' } })).status, 401)
  for (const url of [
    '/dist-gm/index.html', '/dist-gm/assets/workspace.js', '/.env.local', '/.envlocal',
    `/@fs/${fixture.replaceAll('\\', '/')}/gm/brief.ts?raw`,
  ]) {
    const response = await request(url)
    assert.equal(response.status, 403, url)
    assert.doesNotMatch(await response.text(), /private campaign|fixture-only-password/)
  }
  const player = await request('/')
  const playerHtml = await player.text()
  assert.equal(player.status, 200, playerHtml)
  assert.match(playerHtml, /Public player guide/)

  mkdirSync('dist')
  writeFileSync('dist/index.html', '<h1>Public player preview</h1>')
  const previewServer = await preview({
    configFile: false,
    root: fixture,
    logLevel: 'silent',
    plugins: [localGm()],
    preview: { host: '127.0.0.1', port: 0 },
  })
  t.after(() => new Promise<void>((resolve, reject) => {
    previewServer.httpServer.close((error) => error ? reject(error) : resolve())
  }))
  const address = previewServer.httpServer.address()
  assert.ok(address && typeof address !== 'string')
  const base = `http://127.0.0.1:${address.port}`
  assert.equal((await fetch(`${base}/gm/`)).status, 401)
  assert.match(await (await fetch(`${base}/gm/`, { headers })).text(), /Private GM workspace/)
  assert.match(await (await fetch(base)).text(), /Public player preview/)
})
