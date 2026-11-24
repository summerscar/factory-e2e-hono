import { describe, expect, it } from 'vitest'
import app from './index'

describe('GET /ready', () => {
  it('returns 200 with { ready: true }', async () => {
    const res = await app.request('/ready')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ready: true })
  })
})
