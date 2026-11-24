import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import app from './index'

// Read the live value so the test does not rot when the version bumps.
const pkg = JSON.parse(
  readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf8'),
)

describe('GET /version', () => {
  it('returns 200 with the app name and the package version', async () => {
    const res = await app.request('/version')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ name: pkg.name, version: pkg.version })
  })

  it('keeps GET / unchanged', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ name: 'hono-task-api', status: 'ok' })
  })
})
