import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import gm from '../api/gm.ts'

test('the GM document and assets require valid credentials on every request', async (t) => {
  const cwd = process.cwd()
  const password = process.env.MASQUE_GM_PASSWORD
  const fixture = mkdtempSync(path.join(tmpdir(), 'masque-gm-test-'))
  t.after(() => {
    process.chdir(cwd)
    if (password === undefined) delete process.env.MASQUE_GM_PASSWORD
    else process.env.MASQUE_GM_PASSWORD = password
    rmSync(fixture, { recursive: true, force: true })
  })
  process.chdir(fixture)
  mkdirSync('dist-gm/assets', { recursive: true })
  writeFileSync('dist-gm/index.html', '<h1>Private GM workspace</h1>')
  writeFileSync('dist-gm/assets/workspace.js', '/* private workspace asset */')
  const request = (url: string, init?: RequestInit) => gm.fetch(new Request(`https://masque.example${url}`, init))
  const basic = (credentials: string) => `Basic ${Buffer.from(credentials).toString('base64')}`
  const valid = { Authorization: basic('gm:test-fixture-password') }

  delete process.env.MASQUE_GM_PASSWORD
  assert.equal((await request('/gm/', { headers: valid })).status, 503)
  process.env.MASQUE_GM_PASSWORD = 'test-fixture-password'

  for (const url of ['/gm', '/gm/', '/gm/assets/workspace.js', '/api/gm', '/api/gm?asset=workspace.js']) {
    const response = await request(url)
    assert.equal(response.status, 401, url)
    assert.match(response.headers.get('www-authenticate') ?? '', /^Basic /)
    assert.match(response.headers.get('cache-control') ?? '', /no-store/)
    assert.doesNotMatch(await response.text(), /private workspace asset|Private GM workspace/)
  }
  for (const credentials of ['gm:wrong', 'wrong:test-fixture-password']) {
    assert.equal((await request('/gm/', { headers: { Authorization: basic(credentials) } })).status, 401)
  }

  const page = await request('/gm/', { headers: valid })
  assert.equal(page.status, 200)
  assert.match(page.headers.get('cache-control') ?? '', /no-store/)
  assert.match(await page.text(), /Private GM workspace/)
  for (const url of ['/gm/assets/workspace.js', '/api/gm?asset=workspace.js']) {
    const asset = await request(url, { headers: valid })
    assert.equal(asset.status, 200)
    assert.match(await asset.text(), /private workspace asset/)
  }
  assert.equal((await request('/api/gm?asset=..%2Findex.html', { headers: valid })).status, 404)
  assert.equal((await request('/gm/assets/missing.js', { headers: valid })).status, 404)
  assert.equal((await request('/gm/', { method: 'POST', headers: valid })).status, 405)
  const head = await request('/gm/', { method: 'HEAD', headers: valid })
  assert.equal(head.status, 200)
  assert.equal(await head.text(), '')
})
