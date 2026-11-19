import { describe, expect, it } from 'vitest'
import app from './index'

describe('GET /test/1', () => {
  it('returns 200 with the API path string', async () => {
    const res = await app.request('/test/1')
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('/test/1')
  })

  it('returns 404 for other segments under /test', async () => {
    const res = await app.request('/test/2')
    expect(res.status).toBe(404)
  })
})

describe('existing endpoints (regression)', () => {
  it('health check / still returns 200', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('ok')
  })

  it('tasks / still returns a list', async () => {
    const res = await app.request('/tasks')
    expect(res.status).toBe(200)
    expect(Array.isArray(await res.json())).toBe(true)
  })
})
