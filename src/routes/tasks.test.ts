import { describe, expect, it } from 'vitest'
import app from '../index'
import type { Task } from '../types'

// The task store is a module-level Map shared by every request in this file,
// so all assertions use relative counts captured at the start of the test.

async function createTask(title: string): Promise<Task> {
  const res = await app.request('/tasks', {
    method: 'POST',
    body: JSON.stringify({ title }),
    headers: { 'Content-Type': 'application/json' },
  })
  expect(res.status).toBe(201)
  return (await res.json()) as Task
}

async function listTasks(query?: string): Promise<Task[]> {
  const res = await app.request(query === undefined ? '/tasks' : `/tasks?${query}`)
  expect(res.status).toBe(200)
  return (await res.json()) as Task[]
}

function uniqueTitle(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

describe('GET / health check', () => {
  it('returns api name and status', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ name: 'hono-task-api', status: 'ok' })
  })
})

describe('POST /tasks', () => {
  it('creates a task with trimmed title and defaults', async () => {
    const before = await listTasks()
    const title = uniqueTitle('trim')
    const task = await createTask(`  ${title}  `)

    expect(task.id).toMatch(/^task-\d+$/)
    expect(task.title).toBe(title)
    expect(task.done).toBe(false)
    expect(new Date(task.createdAt)).not.toBeNaN()

    const after = await listTasks()
    expect(after).toHaveLength(before.length + 1)
    expect(after.map((t) => t.id)).toContain(task.id)
  })

  it.each([
    ['missing title', {}],
    ['empty title', { title: '' }],
    ['blank title', { title: '   ' }],
  ])('rejects %s with 400', async (_, body) => {
    const res = await app.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'title is required' })
  })
})

describe('GET /tasks (list)', () => {
  it('returns all tasks in creation order', async () => {
    const before = await listTasks()
    const first = await createTask(uniqueTitle('order'))
    const second = await createTask(uniqueTitle('order'))
    const after = await listTasks()

    expect(after).toHaveLength(before.length + 2)
    const ids = after.map((t) => t.id)
    expect(ids.indexOf(first.id)).toBeLessThan(ids.indexOf(second.id))
    // The pre-existing tasks keep their relative position at the front.
    expect(ids.slice(0, before.length)).toEqual(before.map((t) => t.id))
  })
})

describe('GET /tasks/:id', () => {
  it('fetches a task by id', async () => {
    const created = await createTask(uniqueTitle('by-id'))
    const res = await app.request(`/tasks/${created.id}`)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual(created)
  })

  it('returns 404 for an unknown id', async () => {
    const res = await app.request('/tasks/definitely-missing')
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: 'Task not found' })
  })
})

describe('GET /tasks?limit=N', () => {
  it('returns the first N tasks in creation order', async () => {
    const full = await listTasks()
    const limited = await listTasks('limit=2')

    expect(limited).toHaveLength(Math.min(2, full.length))
    expect(limited).toEqual(full.slice(0, Math.min(2, full.length)))
  })

  it('truncates when the store has more tasks than limit', async () => {
    // Guarantee the store holds at least 3 tasks, then limit must cut it down.
    const full = await listTasks()
    if (full.length < 3) {
      while ((await listTasks()).length < 3) {
        await createTask(uniqueTitle('fill'))
      }
    }
    const allNow = await listTasks()
    const limited = await listTasks('limit=1')
    expect(limited).toHaveLength(1)
    expect(limited[0].id).toBe(allNow[0].id)
    expect(limited[0].id).not.toBe(allNow[2].id)
  })

  it('returns everything when limit exceeds the task count', async () => {
    const full = await listTasks()
    expect(await listTasks('limit=99999')).toEqual(full)
  })

  it('treats an empty limit value as absent', async () => {
    const full = await listTasks()
    expect(await listTasks('limit=')).toEqual(full)
  })

  it.each(['0', '-1', 'abc', '2.5'])(
    'rejects limit=%s with 400',
    async (value) => {
      const res = await app.request(`/tasks?limit=${value}`)
      expect(res.status).toBe(400)
      expect(await res.json()).toEqual({ error: 'limit must be a positive integer' })
    },
  )
})
