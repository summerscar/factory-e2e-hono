import { Hono } from 'hono'
import type { CreateTaskInput, Task } from '../types'

/** In-memory task store for this example app. */
const tasks = new Map<string, Task>()

let seq = 0
function nextId(): string {
  seq += 1
  return `task-${seq}`
}

export const tasksRoute = new Hono()

// List tasks, optionally limited to the first N in creation order.
tasksRoute.get('/', (c) => {
  const items = [...tasks.values()]
  const rawLimit = c.req.query('limit')
  if (rawLimit !== undefined && rawLimit.trim() !== '') {
    const limit = Number(rawLimit)
    if (!Number.isInteger(limit) || limit <= 0) {
      return c.json({ error: 'limit must be a positive integer' }, 400)
    }
    return c.json(items.slice(0, limit))
  }
  return c.json(items)
})

// Fetch a single task by id.
tasksRoute.get('/:id', (c) => {
  const task = tasks.get(c.req.param('id'))
  if (!task) return c.json({ error: 'Task not found' }, 404)
  return c.json(task)
})

// Create a new task.
tasksRoute.post('/', async (c) => {
  const body = await c.req.json<CreateTaskInput>()
  if (typeof body.title !== 'string' || body.title.trim() === '') {
    return c.json({ error: 'title is required' }, 400)
  }
  const task: Task = {
    id: nextId(),
    title: body.title.trim(),
    done: false,
    createdAt: new Date().toISOString(),
  }
  tasks.set(task.id, task)
  return c.json(task, 201)
})
