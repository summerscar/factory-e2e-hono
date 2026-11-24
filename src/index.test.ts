import { describe, expect, it } from 'vitest'
import app from './index'

describe('GET /probe', () => {
  it('returns 200 with { ok: true }', async () => {
    const res = await app.request('/probe')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
  })
})
